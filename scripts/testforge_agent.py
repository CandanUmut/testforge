#!/usr/bin/env python3
"""
TestForge Agent — background daemon that sends device heartbeats and
watches a directory for new JUnit XML files to auto-push to TestForge.

Can be run as a systemd service (see install.sh) or in the foreground.

Configuration
-------------
The agent reads settings from (in order of priority):
  1. Environment variables (TESTFORGE_URL, TESTFORGE_API_KEY, etc.)
  2. Config file at /opt/testforge/config/agent.conf

Config file format (INI-style):
    [testforge]
    url = https://your-project.supabase.co
    api_key = tf_xxxxxxxxxxxx
    org_id = <optional>
    device_name = PX8P-001
    firmware_version = v3.2.1
    suite_name = nightly-validation
    heartbeat_interval = 300
    watch_dir = /opt/testforge/results
    log_file = /opt/testforge/logs/agent.log
    adb_monitor = false

Usage:
    python testforge_agent.py                   # use config file
    python testforge_agent.py --config /path    # custom config
    python testforge_agent.py --foreground      # no log file, stdout only
"""

from __future__ import annotations

import argparse
import configparser
import logging
import os
import signal
import subprocess
import sys
import threading
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional, Set

# Import the reporter module (same directory)
SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR))

from testforge_reporter import TestForgeAPI, push_junit_results  # noqa: E402

# ---------------------------------------------------------------------------
# Defaults
# ---------------------------------------------------------------------------
DEFAULT_CONFIG_PATH = "/opt/testforge/config/agent.conf"
DEFAULT_HEARTBEAT_INTERVAL = 300       # 5 minutes
DEFAULT_WATCH_DIR = "/opt/testforge/results"
DEFAULT_LOG_FILE = "/opt/testforge/logs/agent.log"
DEFAULT_SUITE_NAME = "auto-detected"

LOG_FORMAT = "%(asctime)s [%(levelname)s] %(name)s: %(message)s"
logger = logging.getLogger("testforge_agent")

# ---------------------------------------------------------------------------
# Configuration loader
# ---------------------------------------------------------------------------

class AgentConfig:
    """Reads config from file and env vars, env vars take precedence."""

    def __init__(self, config_path: str = DEFAULT_CONFIG_PATH):
        self.url: str = ""
        self.api_key: str = ""
        self.org_id: str = ""
        self.device_name: str = ""
        self.firmware_version: str = ""
        self.suite_name: str = DEFAULT_SUITE_NAME
        self.heartbeat_interval: int = DEFAULT_HEARTBEAT_INTERVAL
        self.watch_dir: str = DEFAULT_WATCH_DIR
        self.log_file: str = DEFAULT_LOG_FILE
        self.adb_monitor: bool = False

        # Load from config file if it exists
        if Path(config_path).is_file():
            self._load_file(config_path)
            logger.info("Loaded config from %s", config_path)
        else:
            logger.debug("Config file not found at %s, using env vars only", config_path)

        # Environment overrides
        self.url = os.environ.get("TESTFORGE_URL", self.url)
        self.api_key = os.environ.get("TESTFORGE_API_KEY", self.api_key)
        self.org_id = os.environ.get("TESTFORGE_ORG_ID", self.org_id)
        self.device_name = os.environ.get("TESTFORGE_DEVICE_NAME", self.device_name)
        self.firmware_version = os.environ.get("TESTFORGE_FIRMWARE_VERSION", self.firmware_version)
        self.suite_name = os.environ.get("TESTFORGE_SUITE_NAME", self.suite_name)

        if os.environ.get("TESTFORGE_HEARTBEAT_INTERVAL"):
            self.heartbeat_interval = int(os.environ["TESTFORGE_HEARTBEAT_INTERVAL"])
        if os.environ.get("TESTFORGE_WATCH_DIR"):
            self.watch_dir = os.environ["TESTFORGE_WATCH_DIR"]
        if os.environ.get("TESTFORGE_LOG_FILE"):
            self.log_file = os.environ["TESTFORGE_LOG_FILE"]

    def _load_file(self, path: str) -> None:
        cp = configparser.ConfigParser()
        cp.read(path)
        if not cp.has_section("testforge"):
            return
        s = cp["testforge"]
        self.url = s.get("url", self.url)
        self.api_key = s.get("api_key", self.api_key)
        self.org_id = s.get("org_id", self.org_id)
        self.device_name = s.get("device_name", self.device_name)
        self.firmware_version = s.get("firmware_version", self.firmware_version)
        self.suite_name = s.get("suite_name", self.suite_name)
        self.heartbeat_interval = int(s.get("heartbeat_interval", str(self.heartbeat_interval)))
        self.watch_dir = s.get("watch_dir", self.watch_dir)
        self.log_file = s.get("log_file", self.log_file)
        self.adb_monitor = s.get("adb_monitor", "false").lower() in ("true", "1", "yes")

    def validate(self) -> None:
        errors = []
        if not self.url:
            errors.append("TestForge URL is not set (TESTFORGE_URL or config url)")
        if not self.api_key:
            errors.append("API key is not set (TESTFORGE_API_KEY or config api_key)")
        if not self.device_name:
            errors.append("Device name is not set (TESTFORGE_DEVICE_NAME or config device_name)")
        if errors:
            for e in errors:
                logger.error(e)
            sys.exit(1)


# ---------------------------------------------------------------------------
# ADB device monitor
# ---------------------------------------------------------------------------

def get_adb_devices() -> list[dict]:
    """Run 'adb devices -l' and return a list of connected devices."""
    try:
        result = subprocess.run(
            ["adb", "devices", "-l"],
            capture_output=True,
            text=True,
            timeout=10,
        )
        devices = []
        for line in result.stdout.strip().splitlines()[1:]:  # skip header
            line = line.strip()
            if not line or "offline" in line:
                continue
            parts = line.split()
            serial = parts[0]
            status = parts[1] if len(parts) > 1 else "unknown"
            model = ""
            for p in parts[2:]:
                if p.startswith("model:"):
                    model = p.split(":", 1)[1]
            devices.append({"serial": serial, "status": status, "model": model})
        return devices
    except FileNotFoundError:
        logger.warning("adb not found in PATH — ADB monitoring disabled")
        return []
    except subprocess.TimeoutExpired:
        logger.warning("adb devices timed out")
        return []
    except Exception as exc:
        logger.warning("adb devices error: %s", exc)
        return []


# ---------------------------------------------------------------------------
# Directory watcher
# ---------------------------------------------------------------------------

class ResultsWatcher:
    """Watches a directory for new .xml files and pushes them to TestForge."""

    def __init__(self, api: TestForgeAPI, config: AgentConfig):
        self.api = api
        self.config = config
        self.seen_files: Set[str] = set()
        self._scan_existing()

    def _scan_existing(self) -> None:
        """Mark existing files so we only process new arrivals."""
        watch = Path(self.config.watch_dir)
        if watch.is_dir():
            for f in watch.glob("*.xml"):
                self.seen_files.add(str(f))
            logger.info(
                "Watch dir %s: %d existing XML files (will be skipped)",
                self.config.watch_dir,
                len(self.seen_files),
            )

    def check_for_new_files(self) -> None:
        """Scan the watch directory for new XML files and process them."""
        watch = Path(self.config.watch_dir)
        if not watch.is_dir():
            return

        for f in sorted(watch.glob("*.xml")):
            fpath = str(f)
            if fpath in self.seen_files:
                continue

            # Wait a moment for the file to finish being written
            time.sleep(1)

            logger.info("New XML file detected: %s", f.name)
            try:
                push_junit_results(
                    api=self.api,
                    junit_path=fpath,
                    device_name=self.config.device_name,
                    suite_name=self.config.suite_name,
                    firmware_version=self.config.firmware_version,
                )
                logger.info("Successfully pushed %s", f.name)
            except Exception as exc:
                logger.error("Failed to push %s: %s", f.name, exc)
            finally:
                self.seen_files.add(fpath)


# ---------------------------------------------------------------------------
# Main agent loop
# ---------------------------------------------------------------------------

class TestForgeAgent:
    """Main agent that coordinates heartbeats, file watching, and ADB monitoring."""

    def __init__(self, config: AgentConfig):
        self.config = config
        self.api = TestForgeAPI(
            base_url=config.url,
            api_key=config.api_key,
            org_id=config.org_id or None,
        )
        self.watcher = ResultsWatcher(self.api, config)
        self._running = True

    def _send_heartbeat(self) -> None:
        """Send a heartbeat for the primary device."""
        try:
            self.api.upsert_device_heartbeat(
                device_name=self.config.device_name,
                firmware_version=self.config.firmware_version,
            )
        except Exception as exc:
            logger.error("Heartbeat failed: %s", exc)

    def _monitor_adb_devices(self) -> None:
        """Report heartbeats for all ADB-connected devices."""
        if not self.config.adb_monitor:
            return
        try:
            devices = get_adb_devices()
            for dev in devices:
                name = dev["model"] or dev["serial"]
                self.api.upsert_device_heartbeat(
                    device_name=name,
                    firmware_version=self.config.firmware_version,
                    status="online" if dev["status"] == "device" else "offline",
                )
        except Exception as exc:
            logger.error("ADB monitor error: %s", exc)

    def stop(self, signum=None, frame=None) -> None:
        logger.info("Received shutdown signal, stopping...")
        self._running = False

    def run(self) -> None:
        """Start the main loop. Blocks until SIGINT/SIGTERM."""
        signal.signal(signal.SIGINT, self.stop)
        signal.signal(signal.SIGTERM, self.stop)

        logger.info("TestForge Agent started")
        logger.info("  Device:     %s", self.config.device_name)
        logger.info("  Watch dir:  %s", self.config.watch_dir)
        logger.info("  Heartbeat:  every %ds", self.config.heartbeat_interval)
        logger.info("  ADB:        %s", "enabled" if self.config.adb_monitor else "disabled")

        last_heartbeat = 0.0

        while self._running:
            now = time.time()

            # Heartbeat check
            if now - last_heartbeat >= self.config.heartbeat_interval:
                self._send_heartbeat()
                self._monitor_adb_devices()
                last_heartbeat = now

            # File watcher check
            self.watcher.check_for_new_files()

            # Sleep in small increments so we can respond to signals quickly
            for _ in range(10):
                if not self._running:
                    break
                time.sleep(1)

        logger.info("TestForge Agent stopped")


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def setup_logging(config: AgentConfig, foreground: bool) -> None:
    """Configure logging to stdout and optionally a log file."""
    root = logging.getLogger()
    root.setLevel(logging.INFO)

    # Always log to stdout
    stdout_handler = logging.StreamHandler(sys.stdout)
    stdout_handler.setFormatter(logging.Formatter(LOG_FORMAT))
    root.addHandler(stdout_handler)

    # Log to file unless running in foreground-only mode
    if not foreground and config.log_file:
        log_dir = Path(config.log_file).parent
        log_dir.mkdir(parents=True, exist_ok=True)
        file_handler = logging.FileHandler(config.log_file)
        file_handler.setFormatter(logging.Formatter(LOG_FORMAT))
        root.addHandler(file_handler)


def main() -> None:
    parser = argparse.ArgumentParser(
        prog="testforge_agent",
        description="TestForge background agent — heartbeats, file watching, and device monitoring.",
    )
    parser.add_argument(
        "--config", "-c",
        default=DEFAULT_CONFIG_PATH,
        help=f"Path to agent config file (default: {DEFAULT_CONFIG_PATH})",
    )
    parser.add_argument(
        "--foreground", "-f",
        action="store_true",
        help="Run in foreground (log to stdout only, no log file)",
    )
    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Enable debug logging",
    )
    args = parser.parse_args()

    config = AgentConfig(config_path=args.config)
    setup_logging(config, foreground=args.foreground)

    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    config.validate()

    agent = TestForgeAgent(config)
    agent.run()


if __name__ == "__main__":
    main()
