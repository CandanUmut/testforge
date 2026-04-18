#!/usr/bin/env python3
"""
TestForge Reporter — push JUnit XML results, crashes, and device heartbeats
to the TestForge platform via its Supabase-backed REST API.

Dependencies: requests  (pip install requests)
Everything else uses the Python standard library.

Usage examples
--------------
# Push JUnit XML results
python testforge_reporter.py \
    --url https://your-project.supabase.co \
    --api-key tf_xxxxxxxxxxxx \
    --junit-xml results.xml \
    --device-name PX8P-001 \
    --suite-name post-flash-smoke \
    --firmware-version v3.2.1

# Update device heartbeat only
python testforge_reporter.py \
    --url https://your-project.supabase.co \
    --api-key tf_xxxxxxxxxxxx \
    --heartbeat \
    --device-name PX8P-001 \
    --firmware-version v3.2.1 \
    --battery-level 87
"""

from __future__ import annotations

import argparse
import json
import logging
import os
import sys
import uuid
import xml.etree.ElementTree as ET
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

try:
    import requests
except ImportError:
    print(
        "ERROR: The 'requests' module is required.\n"
        "Install it with:  pip install requests",
        file=sys.stderr,
    )
    sys.exit(1)

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
LOG_FORMAT = "%(asctime)s [%(levelname)s] %(message)s"
logging.basicConfig(format=LOG_FORMAT, level=logging.INFO)
logger = logging.getLogger("testforge_reporter")

# ---------------------------------------------------------------------------
# Data classes for parsed JUnit results
# ---------------------------------------------------------------------------

@dataclass
class TestCase:
    """One <testcase> element from a JUnit XML file."""
    classname: str
    name: str
    time_seconds: float = 0.0
    status: str = "passed"          # passed | failed | skipped | error
    failure_message: str = ""
    failure_text: str = ""
    error_message: str = ""
    error_text: str = ""


@dataclass
class TestSuite:
    """One <testsuite> element (or the aggregated root)."""
    name: str = ""
    tests: int = 0
    failures: int = 0
    errors: int = 0
    skipped: int = 0
    time_seconds: float = 0.0
    test_cases: List[TestCase] = field(default_factory=list)


# ---------------------------------------------------------------------------
# JUnit XML parser
# ---------------------------------------------------------------------------

def parse_junit_xml(path: str) -> TestSuite:
    """Parse a JUnit XML file and return a TestSuite with all test cases.

    Handles both single-<testsuite> files and <testsuites> wrapper files
    produced by pytest, Maven Surefire, Gradle, Robot Framework, etc.
    """
    tree = ET.parse(path)
    root = tree.getroot()

    suite = TestSuite()

    # Collect all <testsuite> elements -----------------------------------
    if root.tag == "testsuites":
        suites = root.findall("testsuite")
        suite.name = root.attrib.get("name", Path(path).stem)
    elif root.tag == "testsuite":
        suites = [root]
        suite.name = root.attrib.get("name", Path(path).stem)
    else:
        raise ValueError(f"Unexpected root element <{root.tag}> in {path}")

    # Walk each <testsuite> and its <testcase> children ------------------
    for ts in suites:
        suite.tests += int(ts.attrib.get("tests", 0))
        suite.failures += int(ts.attrib.get("failures", 0))
        suite.errors += int(ts.attrib.get("errors", 0))
        suite.skipped += int(ts.attrib.get("skipped", ts.attrib.get("skip", 0)))
        suite.time_seconds += float(ts.attrib.get("time", 0))

        for tc_el in ts.findall("testcase"):
            tc = TestCase(
                classname=tc_el.attrib.get("classname", ""),
                name=tc_el.attrib.get("name", "unknown"),
                time_seconds=float(tc_el.attrib.get("time", 0)),
            )

            # Check for failure child elements
            failure = tc_el.find("failure")
            if failure is not None:
                tc.status = "failed"
                tc.failure_message = failure.attrib.get("message", "")
                tc.failure_text = failure.text or ""

            # Check for error child elements
            error = tc_el.find("error")
            if error is not None:
                tc.status = "error"
                tc.error_message = error.attrib.get("message", "")
                tc.error_text = error.text or ""

            # Check for skipped child element
            if tc_el.find("skipped") is not None:
                tc.status = "skipped"

            suite.test_cases.append(tc)

    logger.info(
        "Parsed %s: %d tests, %d passed, %d failed, %d errors, %d skipped (%.2fs)",
        path,
        suite.tests,
        suite.tests - suite.failures - suite.errors - suite.skipped,
        suite.failures,
        suite.errors,
        suite.skipped,
        suite.time_seconds,
    )
    return suite


# ---------------------------------------------------------------------------
# Crash detection heuristics
# ---------------------------------------------------------------------------

# Keywords that indicate a crash rather than a simple assertion failure
CRASH_KEYWORDS = [
    "segfault", "segmentation fault", "sigsegv", "sigabrt", "sigbus",
    "null pointer", "nullptr", "nullptr dereference",
    "panic", "kernel panic", "fatal error", "abort",
    "oom", "out of memory", "stack overflow",
    "anr", "application not responding",
    "tombstone", "native crash", "java.lang.RuntimeException",
    "uncaught exception", "unhandled exception",
    "assert failed", "assertion failed",
    "watchdog", "hard fault", "bus error",
]


def looks_like_crash(message: str, trace: str) -> bool:
    """Return True if the failure text looks like a crash/abort."""
    combined = (message + " " + trace).lower()
    return any(kw in combined for kw in CRASH_KEYWORDS)


def fingerprint_crash(message: str) -> str:
    """Create a simple fingerprint for crash deduplication."""
    # Take the first meaningful line, strip numbers and whitespace
    first_line = message.strip().split("\n")[0][:200]
    import hashlib
    return hashlib.sha256(first_line.encode()).hexdigest()[:16]


# ---------------------------------------------------------------------------
# API client
# ---------------------------------------------------------------------------

class TestForgeAPI:
    """Thin wrapper around the TestForge Supabase REST API."""

    def __init__(self, base_url: str, api_key: str, org_id: Optional[str] = None):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.org_id = org_id
        self.session = requests.Session()
        self.session.headers.update({
            "apikey": api_key,
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation",
        })

    def _post(self, table: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        url = f"{self.base_url}/rest/v1/{table}"
        resp = self.session.post(url, json=payload)
        if resp.status_code not in (200, 201):
            logger.error("POST %s failed (%d): %s", url, resp.status_code, resp.text)
            resp.raise_for_status()
        data = resp.json()
        return data[0] if isinstance(data, list) and data else data

    def _patch(self, table: str, query: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        url = f"{self.base_url}/rest/v1/{table}?{query}"
        resp = self.session.patch(url, json=payload)
        if resp.status_code not in (200, 204):
            logger.error("PATCH %s failed (%d): %s", url, resp.status_code, resp.text)
            resp.raise_for_status()
        try:
            data = resp.json()
            return data[0] if isinstance(data, list) and data else data
        except Exception:
            return {}

    # -- Test Runs -------------------------------------------------------

    def create_test_run(
        self,
        name: str,
        suite_name: str,
        device_name: str = "",
        firmware_version: str = "",
        total: int = 0,
        passed: int = 0,
        failed: int = 0,
        skipped: int = 0,
        duration_seconds: float = 0.0,
        status: str = "running",
    ) -> Dict[str, Any]:
        payload: Dict[str, Any] = {
            "name": name,
            "suite_name": suite_name,
            "status": status,
            "total_tests": total,
            "passed": passed,
            "failed": failed,
            "skipped": skipped,
            "duration": round(duration_seconds, 2),
            "started_at": datetime.now(timezone.utc).isoformat(),
        }
        if self.org_id:
            payload["organization_id"] = self.org_id
        if device_name:
            payload["device_name"] = device_name
        if firmware_version:
            payload["firmware_version"] = firmware_version
        run = self._post("test_runs", payload)
        logger.info("Created test run: %s (id=%s)", name, run.get("id", "?"))
        return run

    def finish_test_run(self, run_id: str, status: str = "completed") -> Dict[str, Any]:
        return self._patch(
            "test_runs",
            f"id=eq.{run_id}",
            {
                "status": status,
                "completed_at": datetime.now(timezone.utc).isoformat(),
            },
        )

    # -- Test Results ----------------------------------------------------

    def push_test_result(
        self,
        run_id: str,
        name: str,
        status: str,
        duration_ms: float = 0.0,
        error_message: str = "",
        classname: str = "",
    ) -> Dict[str, Any]:
        payload: Dict[str, Any] = {
            "test_run_id": run_id,
            "name": name,
            "status": status,
            "duration_ms": round(duration_ms, 1),
        }
        if error_message:
            payload["error_message"] = error_message[:4000]
        if classname:
            payload["classname"] = classname
        return self._post("test_results", payload)

    # -- Crashes ---------------------------------------------------------

    def report_crash(
        self,
        device_name: str,
        error_message: str,
        stack_trace: str = "",
        test_name: str = "",
        firmware_version: str = "",
    ) -> Dict[str, Any]:
        payload: Dict[str, Any] = {
            "device_name": device_name,
            "error_message": error_message[:2000],
            "stack_trace": stack_trace[:8000],
            "fingerprint": fingerprint_crash(error_message),
            "detected_at": datetime.now(timezone.utc).isoformat(),
        }
        if self.org_id:
            payload["organization_id"] = self.org_id
        if test_name:
            payload["test_name"] = test_name
        if firmware_version:
            payload["firmware_version"] = firmware_version
        crash = self._post("crashes", payload)
        logger.info("Reported crash: %s", error_message[:80])
        return crash

    # -- Devices / Heartbeat ---------------------------------------------

    def upsert_device_heartbeat(
        self,
        device_name: str,
        firmware_version: str = "",
        battery_level: Optional[int] = None,
        status: str = "online",
    ) -> Dict[str, Any]:
        payload: Dict[str, Any] = {
            "name": device_name,
            "status": status,
            "last_heartbeat": datetime.now(timezone.utc).isoformat(),
        }
        if self.org_id:
            payload["organization_id"] = self.org_id
        if firmware_version:
            payload["firmware_version"] = firmware_version
        if battery_level is not None:
            payload["battery_level"] = battery_level

        # Try POST with on-conflict upsert via Prefer header
        url = f"{self.base_url}/rest/v1/devices"
        headers = {**self.session.headers, "Prefer": "resolution=merge-duplicates,return=representation"}
        resp = self.session.post(url, json=payload, headers=headers)
        if resp.status_code in (200, 201):
            data = resp.json()
            logger.info("Device heartbeat updated: %s -> %s", device_name, status)
            return data[0] if isinstance(data, list) and data else data

        # Fallback: PATCH by name
        logger.debug("Upsert fallback: PATCHing device by name")
        return self._patch("devices", f"name=eq.{device_name}", payload)


# ---------------------------------------------------------------------------
# Main workflow: push JUnit XML
# ---------------------------------------------------------------------------

def push_junit_results(
    api: TestForgeAPI,
    junit_path: str,
    device_name: str,
    suite_name: str,
    firmware_version: str = "",
) -> None:
    """Parse a JUnit XML file and push all results to TestForge."""

    suite = parse_junit_xml(junit_path)

    passed = suite.tests - suite.failures - suite.errors - suite.skipped
    run_status = "passed" if (suite.failures + suite.errors) == 0 else "failed"

    # 1. Create the test run
    run = api.create_test_run(
        name=f"{suite_name} - {device_name} - {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M')}",
        suite_name=suite_name,
        device_name=device_name,
        firmware_version=firmware_version,
        total=suite.tests,
        passed=passed,
        failed=suite.failures + suite.errors,
        skipped=suite.skipped,
        duration_seconds=suite.time_seconds,
        status=run_status,
    )
    run_id = run.get("id")
    if not run_id:
        logger.error("Could not obtain run id — aborting result push")
        return

    # 2. Push each test result
    crash_count = 0
    for tc in suite.test_cases:
        error_msg = tc.failure_message or tc.error_message or ""
        error_trace = tc.failure_text or tc.error_text or ""

        api.push_test_result(
            run_id=run_id,
            name=tc.name,
            status=tc.status,
            duration_ms=tc.time_seconds * 1000,
            error_message=error_msg,
            classname=tc.classname,
        )

        # 3. Auto-detect crashes from failure messages
        if tc.status in ("failed", "error") and looks_like_crash(error_msg, error_trace):
            api.report_crash(
                device_name=device_name,
                error_message=error_msg,
                stack_trace=error_trace,
                test_name=f"{tc.classname}.{tc.name}" if tc.classname else tc.name,
                firmware_version=firmware_version,
            )
            crash_count += 1

    # 4. Mark the run as completed
    api.finish_test_run(run_id, status=run_status)

    logger.info(
        "Done: %d results pushed, %d crashes detected (run %s)",
        len(suite.test_cases),
        crash_count,
        run_id,
    )


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="testforge_reporter",
        description="Push test results, crashes, and device heartbeats to TestForge.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""\
examples:
  # Push JUnit XML results
  %(prog)s --url https://xyz.supabase.co --api-key tf_xxx \\
      --junit-xml results.xml --device-name PX8P-001 \\
      --suite-name post-flash-smoke --firmware-version v3.2.1

  # Send a device heartbeat
  %(prog)s --url https://xyz.supabase.co --api-key tf_xxx \\
      --heartbeat --device-name PX8P-001 \\
      --firmware-version v3.2.1 --battery-level 87

environment variables (override flags):
  TESTFORGE_URL        API base URL
  TESTFORGE_API_KEY    API key
  TESTFORGE_ORG_ID     Organisation UUID
""",
    )

    # Connection
    parser.add_argument("--url", default=os.environ.get("TESTFORGE_URL", ""),
                        help="TestForge / Supabase project URL")
    parser.add_argument("--api-key", default=os.environ.get("TESTFORGE_API_KEY", ""),
                        help="API key (tf_xxx or Supabase anon key)")
    parser.add_argument("--org-id", default=os.environ.get("TESTFORGE_ORG_ID", ""),
                        help="Organisation UUID (optional)")

    # JUnit XML mode
    parser.add_argument("--junit-xml", metavar="FILE",
                        help="Path to JUnit XML results file")
    parser.add_argument("--suite-name", default="default",
                        help="Test suite name (default: 'default')")

    # Heartbeat mode
    parser.add_argument("--heartbeat", action="store_true",
                        help="Send a device heartbeat instead of test results")
    parser.add_argument("--battery-level", type=int, default=None,
                        help="Battery level 0-100 (heartbeat mode)")

    # Shared
    parser.add_argument("--device-name", default="",
                        help="Device identifier (e.g. PX8P-001)")
    parser.add_argument("--firmware-version", default="",
                        help="Firmware / build version string")

    # Misc
    parser.add_argument("--verbose", "-v", action="store_true",
                        help="Enable debug logging")

    return parser


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()

    if args.verbose:
        logger.setLevel(logging.DEBUG)

    # Validate required connection params
    if not args.url:
        parser.error("--url is required (or set TESTFORGE_URL)")
    if not args.api_key:
        parser.error("--api-key is required (or set TESTFORGE_API_KEY)")

    api = TestForgeAPI(
        base_url=args.url,
        api_key=args.api_key,
        org_id=args.org_id or None,
    )

    # -- Heartbeat mode --------------------------------------------------
    if args.heartbeat:
        if not args.device_name:
            parser.error("--device-name is required for --heartbeat")
        api.upsert_device_heartbeat(
            device_name=args.device_name,
            firmware_version=args.firmware_version,
            battery_level=args.battery_level,
        )
        return

    # -- JUnit XML mode --------------------------------------------------
    if args.junit_xml:
        if not Path(args.junit_xml).is_file():
            parser.error(f"File not found: {args.junit_xml}")
        push_junit_results(
            api=api,
            junit_path=args.junit_xml,
            device_name=args.device_name,
            suite_name=args.suite_name,
            firmware_version=args.firmware_version,
        )
        # Also send a heartbeat if a device name was provided
        if args.device_name:
            api.upsert_device_heartbeat(
                device_name=args.device_name,
                firmware_version=args.firmware_version,
            )
        return

    # -- Nothing to do ---------------------------------------------------
    parser.print_help()
    print("\nError: Provide --junit-xml or --heartbeat.", file=sys.stderr)
    sys.exit(1)


if __name__ == "__main__":
    main()
