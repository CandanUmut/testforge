import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Copy, Check, Terminal, Cpu, UploadCloud, Zap,
  GitBranch, ChevronRight, Code2, ArrowRight,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
    >
      {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

function CodeBlock({ code, lang = 'bash' }: { code: string; lang?: string }) {
  return (
    <div className="bg-gray-950 rounded-xl border border-white/8 p-4 overflow-x-auto">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-600 font-mono">{lang}</span>
        <CopyBtn text={code} />
      </div>
      <pre className="text-xs font-mono text-gray-300 whitespace-pre">{code}</pre>
    </div>
  );
}

function SectionHead({ step, label, desc }: { step: number; label: string; desc: string }) {
  return (
    <div className="flex items-start gap-4 mb-6">
      <div className="w-8 h-8 rounded-full bg-blue-500/15 border border-blue-500/30 flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-sm font-bold text-blue-400">{step}</span>
      </div>
      <div>
        <h2 className="text-lg font-bold text-white">{label}</h2>
        <p className="text-sm text-gray-400 mt-0.5">{desc}</p>
      </div>
    </div>
  );
}

// ─── Integration type tabs ────────────────────────────────────────────────────

const INTEGRATION_TABS = [
  { id: 'android', label: 'Android / Mobile' },
  { id: 'embedded', label: 'Embedded / Firmware' },
  { id: 'cicd', label: 'CI/CD Pipeline' },
  { id: 'web', label: 'Web / API' },
];

const INTEGRATION_CONTENT: Record<string, { flow: string; notes: string[]; code: string }> = {
  android: {
    flow: 'ADB-connected device  →  Espresso / UIAutomator / XCTest  →  JUnit XML  →  testforge_reporter.py  →  Dashboard',
    notes: [
      'Already using Android CTS/VTS? Export results as XML and push to TestForge.',
      'Using pytest + ADB for custom device tests? Add 3 lines to your conftest.py.',
      'Supports Android 8+ and iOS 14+ via physical devices or emulators.',
    ],
    code: `# Run your Android tests and export JUnit XML
./gradlew connectedAndroidTest

# Find the XML output
find . -name "TEST-*.xml" | head -5

# Push to TestForge
python testforge_reporter.py \\
  --junit-xml app/build/outputs/androidTest-results/TEST-debug.xml \\
  --name "Android smoke tests" \\
  --suite smoke`,
  },
  embedded: {
    flow: 'Embedded device (UART/SSH/JTAG)  →  Robot Framework / pytest / custom  →  results  →  testforge_reporter.py  →  Dashboard',
    notes: [
      'Running tests over UART? Capture output, parse pass/fail, push results.',
      'Using Robot Framework? Export results as XML using our reporter.',
      'Works with any device that your test host can communicate with.',
    ],
    code: `# Robot Framework example
robot --outputdir results/ test_suite.robot
python testforge_reporter.py \\
  --junit-xml results/output.xml \\
  --name "Firmware regression" \\
  --suite regression

# Custom UART test harness
import testforge_reporter as tf
run = tf.create_run(suite="smoke")
run.push_result("boot_time_check", "passed", duration_ms=1240)
run.push_result("uart_echo_test", "failed", error="Timeout after 5s")
run.complete()`,
  },
  cicd: {
    flow: 'Git push  →  CI/CD (GitHub Actions / Jenkins / GitLab CI)  →  builds firmware  →  runs tests  →  testforge_reporter.py  →  Dashboard + Slack alerts',
    notes: [
      'Block PR merges when pass rate drops below your threshold.',
      'Post test result summaries as PR comments automatically.',
      'Supports GitHub Actions, Jenkins, GitLab CI, CircleCI, and more.',
    ],
    code: `# .github/workflows/test.yml
name: Firmware Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Build firmware
        run: make build
      
      - name: Run test suite
        run: pytest tests/ --junitxml=results.xml
      
      - name: Report to TestForge
        if: always()   # run even on test failure
        run: |
          pip install supabase
          python testforge_reporter.py \\
            --junit-xml results.xml \\
            --name "CI test run - \${{ github.ref_name }}"
        env:
          TESTFORGE_SUPABASE_URL: \${{ secrets.TESTFORGE_URL }}
          TESTFORGE_SUPABASE_KEY: \${{ secrets.TESTFORGE_KEY }}
          TESTFORGE_ORG_ID: \${{ secrets.TESTFORGE_ORG_ID }}`,
  },
  web: {
    flow: 'Playwright / Cypress / Jest / Selenium  →  JUnit XML or JSON  →  testforge_reporter.py  →  Dashboard',
    notes: [
      'Playwright: use --reporter=junit to export results.',
      'Cypress: use cypress-junit-reporter plugin.',
      'Jest: use jest-junit package for JUnit output.',
    ],
    code: `# Playwright
npx playwright test --reporter=junit > results.xml
python testforge_reporter.py --junit-xml results.xml

# Cypress
cypress run --reporter junit \\
  --reporter-options "mochaFile=results.xml"
python testforge_reporter.py --junit-xml results.xml

# Jest
jest --reporters=default --reporters=jest-junit
python testforge_reporter.py --junit-xml junit.xml`,
  },
};

const REPORTER_SCRIPT = `#!/usr/bin/env python3
"""
testforge_reporter.py — Push test results to TestForge.

Usage:
  python testforge_reporter.py --junit-xml results.xml --name "Nightly smoke"

Environment variables:
  TESTFORGE_SUPABASE_URL   — Your Supabase project URL
  TESTFORGE_SUPABASE_KEY   — Your Supabase anon key
  TESTFORGE_ORG_ID         — Your organization ID (from Settings)
  TESTFORGE_DEVICE_ID      — Device ID (optional)
"""

import os, sys, json, argparse, xml.etree.ElementTree as ET
from datetime import datetime, timezone

SUPABASE_URL = os.environ.get('TESTFORGE_SUPABASE_URL', '')
SUPABASE_KEY = os.environ.get('TESTFORGE_SUPABASE_KEY', '')
ORG_ID       = os.environ.get('TESTFORGE_ORG_ID', '')
DEVICE_ID    = os.environ.get('TESTFORGE_DEVICE_ID', None)

def parse_junit(path):
    tree = ET.parse(path); root = tree.getroot()
    suites = root.findall('.//testsuite') if root.tag == 'testsuites' else [root]
    results, total, passed, failed, skipped = [], 0, 0, 0, 0
    for suite in suites:
        for tc in suite.findall('testcase'):
            total += 1
            name = tc.get('name','unknown')
            time_ms = int(float(tc.get('time','0')) * 1000)
            failure = tc.find('failure'); error = tc.find('error'); skip = tc.find('skipped')
            if failure is not None:   status='failed';  failed+=1;  msg=failure.get('message',''); stack=failure.text or ''
            elif error is not None:   status='error';   failed+=1;  msg=error.get('message','');   stack=error.text or ''
            elif skip is not None:    status='skipped'; skipped+=1; msg=None; stack=None
            else:                     status='passed';  passed+=1;  msg=None; stack=None
            results.append({'test_name':name,'status':status,'duration_ms':time_ms,
                           'error_message':msg,'stack_trace':stack,'organization_id':ORG_ID})
    return {'total':total,'passed':passed,'failed':failed,'skipped':skipped,'results':results}

def push(parsed, name, suite):
    from supabase import create_client
    client = create_client(SUPABASE_URL, SUPABASE_KEY)
    run_data = {'organization_id':ORG_ID,'name':name,'suite_name':suite or name,
                'trigger_type':'ci_cd','total_tests':parsed['total'],
                'passed':parsed['passed'],'failed':parsed['failed'],'skipped':parsed['skipped'],
                'status':'passed' if parsed['failed']==0 else 'failed',
                'started_at':datetime.now(timezone.utc).isoformat(),
                'completed_at':datetime.now(timezone.utc).isoformat()}
    if DEVICE_ID: run_data['device_id'] = DEVICE_ID
    run = client.table('test_runs').insert(run_data).execute()
    run_id = run.data[0]['id']
    for result in parsed['results']: result['test_run_id'] = run_id
    for i in range(0, len(parsed['results']), 50):
        client.table('test_results').insert(parsed['results'][i:i+50]).execute()
    print(f"✓ Run {run_id}: {parsed['passed']} passed, {parsed['failed']} failed")

if __name__ == '__main__':
    p = argparse.ArgumentParser()
    p.add_argument('--junit-xml', required=True)
    p.add_argument('--name', default='CI Test Run')
    p.add_argument('--suite', default=None)
    args = p.parse_args()
    push(parse_junit(args.junit_xml), args.name, args.suite)`;

const CURL_EXAMPLES = {
  device: `curl -X POST 'https://YOUR_PROJECT.supabase.co/rest/v1/devices' \\
  -H "apikey: YOUR_ANON_KEY" \\
  -H "Authorization: Bearer YOUR_ANON_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "organization_id": "YOUR_ORG_ID",
    "name": "Lab Device 01",
    "device_type": "embedded",
    "serial_number": "DEV-001",
    "firmware_version": "1.0.0",
    "status": "online",
    "connection_type": "uart"
  }'`,
  run: `curl -X POST 'https://YOUR_PROJECT.supabase.co/rest/v1/test_runs' \\
  -H "apikey: YOUR_ANON_KEY" \\
  -H "Authorization: Bearer YOUR_ANON_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "organization_id": "YOUR_ORG_ID",
    "device_id": "DEVICE_UUID_FROM_STEP_ABOVE",
    "name": "Smoke Test Suite",
    "suite_name": "smoke",
    "trigger_type": "manual",
    "status": "passed",
    "total_tests": 25,
    "passed": 23,
    "failed": 2,
    "skipped": 0,
    "duration_ms": 145000,
    "firmware_version": "1.0.0"
  }'`,
  results: `curl -X POST 'https://YOUR_PROJECT.supabase.co/rest/v1/test_results' \\
  -H "apikey: YOUR_ANON_KEY" \\
  -H "Authorization: Bearer YOUR_ANON_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "test_run_id": "TEST_RUN_UUID",
    "organization_id": "YOUR_ORG_ID",
    "test_name": "boot_time_under_30s",
    "test_category": "smoke",
    "status": "passed",
    "duration_ms": 1200
  }'`,
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export function Setup() {
  const [activeTab, setActiveTab] = useState('android');

  return (
    <div className="min-h-screen bg-gray-950 py-24 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">

        {/* Page header */}
        <div className="mb-12">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 mb-6 transition-colors">
            ← Back to home
          </Link>
          <h1 className="text-3xl font-bold text-white mb-3">Setup Guide</h1>
          <p className="text-gray-400 leading-relaxed">
            How to integrate TestForge into any hardware, firmware, or software test setup.
            Three steps from zero to results in your dashboard.
          </p>
        </div>

        {/* Step 1 */}
        <div className="mb-14">
          <SectionHead
            step={1}
            label="Create your account & organization"
            desc="Sign up, name your organization, and get your API credentials."
          />
          <div className="space-y-4 pl-12">
            <ol className="space-y-3">
              {[
                <>Go to <Link to="/signup" className="text-blue-400 hover:underline">testforge.io/signup</Link> and create an account.</>,
                'Name your organization (e.g. "Acme Firmware Team").',
                'Go to Settings → API Keys and create your first API key.',
                'Copy your Supabase project URL and anon key from the settings page.',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                  <span className="text-gray-600 font-mono mt-0.5">{i + 1}.</span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
            <div className="flex gap-4 mt-4">
              <Link
                to="/signup"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                Create Account
                <ArrowRight size={14} />
              </Link>
              <Link
                to="/dashboard"
                className="flex items-center gap-2 border border-white/10 hover:border-white/20 text-gray-300 text-sm px-4 py-2 rounded-lg transition-colors"
              >
                Explore Demo
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="mb-14">
          <SectionHead
            step={2}
            label="Register your device"
            desc="Each device under test gets registered so TestForge can track results per device."
          />
          <div className="pl-12 space-y-4">
            <p className="text-sm text-gray-400">
              Device types: <code className="text-blue-300">android</code>, <code className="text-blue-300">ios</code>,{' '}
              <code className="text-blue-300">embedded</code>, <code className="text-blue-300">iot</code>,{' '}
              <code className="text-blue-300">web</code>, <code className="text-blue-300">custom</code>.
            </p>
            <p className="text-sm text-gray-400">
              Connection types: <code className="text-purple-300">usb</code>, <code className="text-purple-300">adb</code>,{' '}
              <code className="text-purple-300">uart</code>, <code className="text-purple-300">ssh</code>,{' '}
              <code className="text-purple-300">wifi</code>, <code className="text-purple-300">api</code>.
            </p>
            <CodeBlock code={CURL_EXAMPLES.device} lang="bash" />
          </div>
        </div>

        {/* Step 3 */}
        <div className="mb-14">
          <SectionHead
            step={3}
            label="Push your test results"
            desc="After your tests run, push results via the REST API, Python SDK, or JUnit XML reporter."
          />
          <div className="pl-12 space-y-6">
            {/* Method A */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Terminal size={14} className="text-blue-400" />
                <p className="text-sm font-semibold text-white">Method A — cURL (direct REST API)</p>
              </div>
              <div className="space-y-3">
                <p className="text-xs text-gray-500">Create a run:</p>
                <CodeBlock code={CURL_EXAMPLES.run} lang="bash" />
                <p className="text-xs text-gray-500">Push individual results:</p>
                <CodeBlock code={CURL_EXAMPLES.results} lang="bash" />
              </div>
            </div>

            {/* Method B */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Code2 size={14} className="text-purple-400" />
                <p className="text-sm font-semibold text-white">Method B — JUnit XML reporter (recommended)</p>
              </div>
              <p className="text-sm text-gray-400 mb-3">
                Drop <code className="text-blue-300">testforge_reporter.py</code> into your repo and run it after any test suite.
                Works with pytest, Robot Framework, Android instrumentation, Playwright, Jest, and more.
              </p>
              <CodeBlock code={`pip install supabase\n\npython testforge_reporter.py \\\n  --junit-xml results.xml \\\n  --name "Nightly smoke tests"`} lang="bash" />
            </div>

            {/* Method C */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <GitBranch size={14} className="text-emerald-400" />
                <p className="text-sm font-semibold text-white">Method C — GitHub Actions</p>
              </div>
              <CodeBlock code={INTEGRATION_CONTENT.cicd.code} lang="yaml" />
            </div>
          </div>
        </div>

        {/* Integration examples by setup type */}
        <div className="mb-14">
          <h2 className="text-lg font-bold text-white mb-2">Integration Examples by Setup Type</h2>
          <p className="text-sm text-gray-400 mb-6">Select your hardware/software category:</p>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {INTEGRATION_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                    : 'border-white/10 text-gray-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {(() => {
            const content = INTEGRATION_CONTENT[activeTab];
            return (
              <div className="space-y-4">
                {/* Flow diagram */}
                <div className="bg-white/4 rounded-xl border border-white/8 p-4">
                  <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Data flow</p>
                  <p className="text-sm font-mono text-gray-300 leading-relaxed">{content.flow}</p>
                </div>
                {/* Notes */}
                <ul className="space-y-2">
                  {content.notes.map((note, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                      <span className="text-blue-400 mt-0.5">·</span>
                      {note}
                    </li>
                  ))}
                </ul>
                {/* Code */}
                <CodeBlock code={content.code} lang="bash" />
              </div>
            );
          })()}
        </div>

        {/* What TestForge does with your data */}
        <div className="mb-14">
          <h2 className="text-lg font-bold text-white mb-6">What TestForge does with your data</h2>
          <div className="space-y-3">
            {[
              { icon: Zap, label: 'Aggregates', desc: 'Combines results across devices, builds, and branches into a single timeline.' },
              { icon: Cpu, label: 'Categorizes failures', desc: 'Groups by error type: crash, timeout, flaky, assertion, infrastructure.' },
              { icon: Cpu, label: 'Detects flaky tests', desc: 'Identifies tests that pass/fail intermittently across runs.' },
              { icon: Cpu, label: 'Triages crashes', desc: 'Deduplicates by stack trace fingerprint and AI-analyzes root cause.' },
              { icon: UploadCloud, label: 'Tracks trends', desc: 'Shows pass rate over time per suite, device, and branch.' },
              { icon: Zap, label: 'Alerts', desc: 'Sends Slack/email notifications when pass rate drops or new crashes appear.' },
              { icon: Code2, label: 'Reports', desc: 'Generates weekly summary reports with key findings.' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/3 border border-white/6">
                  <Icon size={14} className="text-blue-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-sm font-medium text-white">{item.label} — </span>
                    <span className="text-sm text-gray-400">{item.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reporter script */}
        <div className="mb-14">
          <h2 className="text-lg font-bold text-white mb-2">Full Reporter Script</h2>
          <p className="text-sm text-gray-400 mb-4">
            Download and place <code className="text-blue-300">testforge_reporter.py</code> in your repo root.
          </p>
          <CodeBlock code={REPORTER_SCRIPT} lang="python" />
        </div>

        {/* Advanced: Agent preview */}
        <div className="mb-14">
          <h2 className="text-lg font-bold text-white mb-3">Advanced: Device Agent <span className="text-xs text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded ml-2">Coming Q3 2026</span></h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            For teams that want deeper integration — device health monitoring, live log streaming,
            automatic firmware flashing, heartbeat tracking — we're building a persistent agent that
            runs alongside your devices. The agent eliminates the need for manual push scripts and
            provides real-time data to the dashboard.
          </p>
          <p className="text-sm text-gray-500 mt-3">
            For now, use the REST API / JUnit reporter approach above. It works well in all CI/CD systems.
          </p>
        </div>

        {/* CTA */}
        <div className="bg-blue-500/8 border border-blue-500/20 rounded-2xl p-8 text-center">
          <h3 className="text-lg font-bold text-white mb-2">Ready to get started?</h3>
          <p className="text-sm text-gray-400 mb-6">Create an account and push your first test results in under 10 minutes.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/signup" className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors">
              Start 14-Day Trial
              <ArrowRight size={14} />
            </Link>
            <Link to="/docs" className="flex items-center justify-center gap-2 border border-white/10 hover:border-white/20 text-gray-300 text-sm px-6 py-2.5 rounded-lg transition-colors">
              API Reference
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
