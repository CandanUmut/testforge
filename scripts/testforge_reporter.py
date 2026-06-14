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
import logging
import os
import sys
import time
import xml.etree.ElementTree as ET
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional


def _now_iso() -> str:
    """Current UTC time as an ISO 8601 string."""
    return datetime.now(timezone.utc).isoformat()

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
    """Client for the TestForge ingestion gateway.

    All writes go through a single authenticated endpoint
    (``/functions/v1/ingest``). The gateway validates the ``tf_`` API key,
    resolves the organization server-side, and maps this friendly payload onto
    the internal schema — so clients never deal with table columns, foreign
    keys, or organization IDs directly.
    """

    def __init__(self, base_url: str, api_key: str, org_id: Optional[str] = None):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.org_id = org_id  # retained for backwards compatibility; resolved from the key
        self.ingest_url = f"{self.base_url}/functions/v1/ingest"
        self.session = requests.Session()
        self.session.headers.update({
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        })

    def ingest(self, payload: Dict[str, Any], *, retries: int = 3) -> Dict[str, Any]:
        """POST a batch payload to the ingestion gateway, with retry/backoff."""
        last_exc: Optional[Exception] = None
        for attempt in range(1, retries + 1):
            try:
                resp = self.session.post(self.ingest_url, json=payload, timeout=30)
                if resp.status_code in (200, 201):
                    return resp.json()
                # Client/auth errors are not retryable.
                if resp.status_code in (400, 401, 403):
                    logger.error("Ingest rejected (%d): %s", resp.status_code, resp.text)
                    resp.raise_for_status()
                logger.warning("Ingest attempt %d/%d failed (%d): %s",
                               attempt, retries, resp.status_code, resp.text)
                last_exc = requests.HTTPError(f"{resp.status_code}: {resp.text}")
            except requests.RequestException as exc:
                logger.warning("Ingest attempt %d/%d error: %s", attempt, retries, exc)
                last_exc = exc
            if attempt < retries:
                time.sleep(2 ** attempt)  # 2s, 4s, ...
        if last_exc:
            raise last_exc
        return {}

    # -- Devices / Heartbeat ---------------------------------------------

    def upsert_device_heartbeat(
        self,
        device_name: str,
        firmware_version: str = "",
        battery_level: Optional[int] = None,
        status: str = "online",
    ) -> Dict[str, Any]:
        device: Dict[str, Any] = {
            "name": device_name,
            "status": status,
            "last_heartbeat": _now_iso(),
        }
        if firmware_version:
            device["firmware_version"] = firmware_version
        if battery_level is not None:
            device["battery_level"] = battery_level
        result = self.ingest({"device": device})
        logger.info("Device heartbeat sent: %s -> %s", device_name, status)
        return result


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
    now = _now_iso()

    # Build test results and auto-detect crashes from failure messages.
    results: List[Dict[str, Any]] = []
    crashes: List[Dict[str, Any]] = []
    for tc in suite.test_cases:
        error_msg = tc.failure_message or tc.error_message or ""
        error_trace = tc.failure_text or tc.error_text or ""

        results.append({
            "name": tc.name,
            "classname": tc.classname,
            "status": tc.status,
            "duration_ms": round(tc.time_seconds * 1000, 1),
            "error_message": error_msg or None,
            "stack_trace": error_trace or None,
        })

        if tc.status in ("failed", "error") and looks_like_crash(error_msg, error_trace):
            crashes.append({
                "device_name": device_name,
                "error_message": error_msg,
                "stack_trace": error_trace,
                "fingerprint": fingerprint_crash(error_msg),
                "test_name": f"{tc.classname}.{tc.name}" if tc.classname else tc.name,
                "firmware_version": firmware_version,
                "detected_at": now,
            })

    payload: Dict[str, Any] = {
        "run": {
            "name": f"{suite_name} - {device_name} - {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M')}",
            "suite_name": suite_name,
            "status": run_status,
            "total_tests": suite.tests,
            "passed": passed,
            "failed": suite.failures + suite.errors,
            "skipped": suite.skipped,
            "duration": round(suite.time_seconds, 2),
            "device_name": device_name or None,
            "firmware_version": firmware_version or None,
            "started_at": now,
            "completed_at": now,
        },
        "results": results,
        "crashes": crashes,
    }
    if device_name:
        payload["device"] = {
            "name": device_name,
            "status": "online",
            "firmware_version": firmware_version or None,
            "last_heartbeat": now,
        }

    resp = api.ingest(payload)
    run_id = resp.get("run_id") if isinstance(resp, dict) else None
    logger.info(
        "Done: %d results pushed, %d crashes detected (run %s)",
        len(results),
        len(crashes),
        run_id or "?",
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
        return

    # -- Nothing to do ---------------------------------------------------
    parser.print_help()
    print("\nError: Provide --junit-xml or --heartbeat.", file=sys.stderr)
    sys.exit(1)


if __name__ == "__main__":
    main()
