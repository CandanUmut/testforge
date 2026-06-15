#!/usr/bin/env python3
"""
Unit tests for testforge_reporter.

These run with the standard library only (no network, no extra deps):

    python3 -m unittest scripts/test_reporter.py -v
    # or
    cd scripts && python3 test_reporter.py
"""

import os
import sys
import tempfile
import unittest

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import testforge_reporter as r  # noqa: E402


SINGLE_SUITE = """<?xml version="1.0"?>
<testsuite name="smoke" tests="4" failures="2" errors="0" skipped="1" time="2.5">
  <testcase classname="t.boot" name="test_ok" time="0.4"/>
  <testcase classname="t.boot" name="test_assert" time="0.2">
    <failure message="AssertionError: values differ">x != y</failure>
  </testcase>
  <testcase classname="t.power" name="test_suspend" time="0.9">
    <failure message="Kernel panic at power.c:847">backtrace...</failure>
  </testcase>
  <testcase classname="t.net" name="test_skip" time="0.0">
    <skipped/>
  </testcase>
</testsuite>
"""

WRAPPED_SUITES = """<?xml version="1.0"?>
<testsuites name="all">
  <testsuite name="a" tests="1" failures="0" errors="0" skipped="0" time="1.0">
    <testcase classname="a" name="t1" time="1.0"/>
  </testsuite>
  <testsuite name="b" tests="1" failures="0" errors="1" skipped="0" time="0.5">
    <testcase classname="b" name="t2" time="0.5">
      <error message="SIGSEGV in librender.so">#0 RenderFrame</error>
    </testcase>
  </testsuite>
</testsuites>
"""


def write_temp(xml: str) -> str:
    fd, path = tempfile.mkstemp(suffix=".xml")
    with os.fdopen(fd, "w") as f:
        f.write(xml)
    return path


class StubAPI:
    """Captures the batch payload instead of sending it."""

    def __init__(self):
        self.payloads = []

    def ingest(self, payload, **kwargs):
        self.payloads.append(payload)
        return {"ok": True, "run_id": "RUN123",
                "results": len(payload.get("results", [])),
                "crashes": len(payload.get("crashes", []))}


class ParseJunitTests(unittest.TestCase):
    def test_single_suite_counts(self):
        suite = r.parse_junit_xml(write_temp(SINGLE_SUITE))
        self.assertEqual(suite.tests, 4)
        self.assertEqual(suite.failures, 2)
        self.assertEqual(suite.skipped, 1)
        self.assertEqual(len(suite.test_cases), 4)

    def test_wrapped_suites_aggregate(self):
        suite = r.parse_junit_xml(write_temp(WRAPPED_SUITES))
        self.assertEqual(suite.tests, 2)
        self.assertEqual(suite.errors, 1)
        statuses = sorted(tc.status for tc in suite.test_cases)
        self.assertEqual(statuses, ["error", "passed"])


class CrashHeuristicsTests(unittest.TestCase):
    def test_detects_crash_keywords(self):
        self.assertTrue(r.looks_like_crash("Kernel panic at power.c:847", ""))
        self.assertTrue(r.looks_like_crash("", "SIGSEGV in librender.so"))
        self.assertTrue(r.looks_like_crash("watchdog reset", ""))

    def test_ignores_plain_assertions(self):
        self.assertFalse(r.looks_like_crash("AssertionError: values differ", "x != y"))
        self.assertFalse(r.looks_like_crash("expected 200 got 404", ""))

    def test_fingerprint_is_stable_and_short(self):
        a = r.fingerprint_crash("Kernel panic at power.c:847")
        b = r.fingerprint_crash("Kernel panic at power.c:847")
        self.assertEqual(a, b)
        self.assertEqual(len(a), 16)
        self.assertNotEqual(a, r.fingerprint_crash("different message"))


class PushJunitResultsTests(unittest.TestCase):
    def test_builds_single_batch_with_crash_detection(self):
        api = StubAPI()
        r.push_junit_results(
            api,
            write_temp(SINGLE_SUITE),
            device_name="DUT-A001",
            suite_name="post-flash-smoke",
            firmware_version="v3.2.1",
        )
        self.assertEqual(len(api.payloads), 1, "should send exactly one batch")
        p = api.payloads[0]

        # Run summary
        self.assertEqual(p["run"]["status"], "failed")
        self.assertEqual(p["run"]["total_tests"], 4)
        self.assertEqual(p["run"]["failed"], 2)   # failures + errors
        self.assertEqual(p["run"]["skipped"], 1)
        self.assertEqual(p["run"]["device_name"], "DUT-A001")
        self.assertEqual(p["run"]["firmware_version"], "v3.2.1")

        # Results: one row per test case
        self.assertEqual(len(p["results"]), 4)

        # Only the kernel panic is a crash — the plain assertion is not
        self.assertEqual(len(p["crashes"]), 1)
        self.assertIn("Kernel panic", p["crashes"][0]["error_message"])

        # Device heartbeat included
        self.assertEqual(p["device"]["name"], "DUT-A001")

    def test_all_pass_marks_run_passed(self):
        api = StubAPI()
        r.push_junit_results(
            api,
            write_temp('<testsuite name="s" tests="1" failures="0" errors="0" skipped="0" time="0.1">'
                       '<testcase classname="c" name="t" time="0.1"/></testsuite>'),
            device_name="dev",
            suite_name="s",
        )
        p = api.payloads[0]
        self.assertEqual(p["run"]["status"], "passed")
        self.assertEqual(p["crashes"], [])


if __name__ == "__main__":
    unittest.main(verbosity=2)
