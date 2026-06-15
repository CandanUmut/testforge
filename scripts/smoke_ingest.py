#!/usr/bin/env python3
"""
Post-deploy smoke test for the TestForge ingestion gateway.

Sends a tiny run (with one passing test and one crash) to a live project and
prints the gateway's response. Use it to verify a fresh deployment end-to-end.

    export TESTFORGE_URL=https://your-project.supabase.co
    export TESTFORGE_API_KEY=tf_xxxxxxxxxxxx
    python3 scripts/smoke_ingest.py

Exit code 0 on success, non-zero on failure. Requires: requests.
"""

import os
import sys
from datetime import datetime, timezone

try:
    import requests
except ImportError:
    sys.exit("ERROR: pip install requests")

url = os.environ.get("TESTFORGE_URL", "").rstrip("/")
key = os.environ.get("TESTFORGE_API_KEY", "")
if not url or not key:
    sys.exit("ERROR: set TESTFORGE_URL and TESTFORGE_API_KEY")

now = datetime.now(timezone.utc).isoformat()
payload = {
    "device": {"name": "smoke-device", "status": "online", "firmware_version": "smoke"},
    "run": {
        "name": f"smoke-test {now}",
        "suite_name": "smoke",
        "status": "failed",
        "total_tests": 2, "passed": 1, "failed": 1,
        "device_name": "smoke-device", "firmware_version": "smoke",
    },
    "results": [
        {"name": "test_pass", "status": "passed", "duration_ms": 10},
        {"name": "test_crash", "status": "failed", "error_message": "Kernel panic at smoke.c:1"},
    ],
    "crashes": [
        {"device_name": "smoke-device", "error_message": "Kernel panic at smoke.c:1"},
    ],
}

resp = requests.post(
    f"{url}/functions/v1/ingest",
    headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
    json=payload,
    timeout=30,
)

print(f"HTTP {resp.status_code}")
print(resp.text)

if resp.status_code not in (200, 201):
    sys.exit("SMOKE TEST FAILED")

data = resp.json()
if not data.get("ok") or not data.get("run_id"):
    sys.exit("SMOKE TEST FAILED: unexpected response")

print(f"\nOK — run {data['run_id']} created "
      f"({data.get('results')} results, {data.get('crashes')} crashes). "
      f"Check the dashboard to confirm it appears.")
