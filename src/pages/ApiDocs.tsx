import { useState, useRef } from 'react';
import {
  ClipboardCopy,
  KeyRound,
  Play,
  Server,
  Smartphone,
  AlertTriangle,
  Bell,
  Lock,
  ChevronRight,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Reusable code block with copy button                              */
/* ------------------------------------------------------------------ */

function CodeBlock({
  title,
  children,
}: {
  title?: string;
  children: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(children.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative rounded-xl border border-slate-200 bg-[#f8fafc] overflow-hidden">
      {title && (
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2">
          <span className="text-xs font-medium text-slate-500">{title}</span>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <ClipboardCopy className="h-3.5 w-3.5" />
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      )}
      {!title && (
        <button
          onClick={handleCopy}
          className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-lg bg-white/80 px-2 py-1 text-xs text-slate-500 hover:bg-white hover:text-slate-700 shadow-sm transition-colors"
        >
          <ClipboardCopy className="h-3.5 w-3.5" />
          {copied ? 'Copied!' : 'Copy'}
        </button>
      )}
      <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed">
        <code className="font-mono text-slate-800">{children.trim()}</code>
      </pre>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Method badge                                                      */
/* ------------------------------------------------------------------ */

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    POST: 'bg-blue-50 text-blue-700 border-blue-200',
    PATCH: 'bg-amber-50 text-amber-700 border-amber-200',
    DELETE: 'bg-red-50 text-red-700 border-red-200',
  };
  return (
    <span
      className={`inline-block rounded-md border px-2 py-0.5 text-xs font-bold uppercase ${colors[method] || 'bg-slate-50 text-slate-700 border-slate-200'}`}
    >
      {method}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Sidebar nav sections                                              */
/* ------------------------------------------------------------------ */

interface NavItem {
  id: string;
  label: string;
  icon: typeof KeyRound;
}

const navItems: NavItem[] = [
  { id: 'authentication', label: 'Authentication', icon: KeyRound },
  { id: 'test-runs', label: 'Test Runs', icon: Play },
  { id: 'test-results', label: 'Test Results', icon: Server },
  { id: 'devices', label: 'Devices', icon: Smartphone },
  { id: 'crashes', label: 'Crashes', icon: AlertTriangle },
  { id: 'alerts', label: 'Alerts', icon: Bell },
  { id: 'api-keys', label: 'API Keys', icon: Lock },
];

/* ------------------------------------------------------------------ */
/*  Field table                                                       */
/* ------------------------------------------------------------------ */

function FieldTable({
  fields,
}: {
  fields: { name: string; type: string; required?: boolean; description: string }[];
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="px-4 py-2 text-left font-medium text-slate-500">Field</th>
            <th className="px-4 py-2 text-left font-medium text-slate-500">Type</th>
            <th className="px-4 py-2 text-left font-medium text-slate-500">Description</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((f) => (
            <tr key={f.name} className="border-b border-slate-100 last:border-0">
              <td className="px-4 py-2.5">
                <code className="font-mono text-xs text-slate-800">{f.name}</code>
                {f.required && (
                  <span className="ml-1.5 text-[10px] font-semibold uppercase text-red-500">
                    required
                  </span>
                )}
              </td>
              <td className="px-4 py-2.5 text-xs text-slate-500">{f.type}</td>
              <td className="px-4 py-2.5 text-slate-600">{f.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                    */
/* ------------------------------------------------------------------ */

export function ApiDocs() {
  const [activeSection, setActiveSection] = useState('authentication');
  const mainRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)]">
          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
                API Reference
              </p>
              <h1 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                REST API
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Supabase PostgREST endpoints for TestForge.
              </p>

              <nav className="mt-8 space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                      activeSection === item.id
                        ? 'bg-indigo-50 font-medium text-indigo-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <item.icon className="h-4 w-4 flex-none" />
                    {item.label}
                  </button>
                ))}
              </nav>

              <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-500">Base URL</p>
                <p className="mt-1 break-all font-mono text-xs text-slate-700">
                  https://your-project.supabase.co
                </p>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main ref={mainRef} className="min-w-0 space-y-16">
            {/* ── Authentication ─────────────────────────── */}
            <section id="authentication">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                Authentication
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Every request to the TestForge API requires two headers: the Supabase anon key
                (or your project API key) in the <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs">apikey</code> header,
                and a Bearer token in the <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs">Authorization</code> header.
                You can use either a user JWT (from Supabase Auth) or a TestForge API key.
              </p>

              <div className="mt-6">
                <h3 className="text-sm font-semibold text-slate-700">Required Headers</h3>
                <div className="mt-3">
                  <FieldTable
                    fields={[
                      { name: 'apikey', type: 'string', required: true, description: 'Your Supabase anon key or TestForge project API key.' },
                      { name: 'Authorization', type: 'string', required: true, description: 'Bearer token: either a user JWT or a TestForge API key (tf_xxx).' },
                      { name: 'Content-Type', type: 'string', required: true, description: 'Must be application/json for POST and PATCH requests.' },
                      { name: 'Prefer', type: 'string', required: false, description: 'Set to return=representation to get the created/updated row in the response.' },
                    ]}
                  />
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <CodeBlock title="cURL">{`curl -X GET "https://your-project.supabase.co/rest/v1/test_runs?limit=5" \\
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \\
  -H "Authorization: Bearer tf_xxxxxxxxxxxx"`}</CodeBlock>

                <CodeBlock title="Python (requests)">{`import requests

BASE_URL = "https://your-project.supabase.co"
HEADERS = {
    "apikey": "YOUR_SUPABASE_ANON_KEY",
    "Authorization": "Bearer tf_xxxxxxxxxxxx",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}

resp = requests.get(
    f"{BASE_URL}/rest/v1/test_runs",
    headers=HEADERS,
    params={"limit": 5},
)
print(resp.json())`}</CodeBlock>
              </div>
            </section>

            {/* ── Test Runs ──────────────────────────────── */}
            <section id="test-runs">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                Test Runs
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                A test run represents a single execution of a test suite. Create a run before pushing
                individual results, then update its status when all results are in.
              </p>

              {/* Create test run */}
              <div className="mt-8 rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-3">
                  <MethodBadge method="POST" />
                  <code className="font-mono text-sm text-slate-800">/rest/v1/test_runs</code>
                </div>
                <p className="mt-3 text-sm text-slate-600">Create a new test run.</p>

                <div className="mt-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Request Body</h4>
                  <div className="mt-2">
                    <FieldTable
                      fields={[
                        { name: 'organization_id', type: 'uuid', required: true, description: 'Your organisation UUID.' },
                        { name: 'name', type: 'string', required: true, description: 'Human-readable name for the run.' },
                        { name: 'suite_name', type: 'string', required: true, description: 'Test suite identifier (e.g. post-flash-smoke).' },
                        { name: 'status', type: 'string', required: true, description: 'One of: running, passed, failed.' },
                        { name: 'total_tests', type: 'integer', required: false, description: 'Total number of test cases.' },
                        { name: 'passed', type: 'integer', required: false, description: 'Number of passing tests.' },
                        { name: 'failed', type: 'integer', required: false, description: 'Number of failing tests.' },
                        { name: 'skipped', type: 'integer', required: false, description: 'Number of skipped tests.' },
                        { name: 'duration', type: 'float', required: false, description: 'Total duration in seconds.' },
                        { name: 'device_name', type: 'string', required: false, description: 'Device that ran the tests.' },
                        { name: 'firmware_version', type: 'string', required: false, description: 'Firmware or build version.' },
                        { name: 'started_at', type: 'timestamptz', required: false, description: 'ISO 8601 start time.' },
                      ]}
                    />
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <CodeBlock title="cURL">{`curl -X POST "https://your-project.supabase.co/rest/v1/test_runs" \\
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \\
  -H "Authorization: Bearer tf_xxxxxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -H "Prefer: return=representation" \\
  -d '{
    "organization_id": "ORG_UUID",
    "name": "Nightly firmware validation",
    "suite_name": "post-flash-smoke",
    "status": "running",
    "total_tests": 42,
    "device_name": "DUT-A001",
    "firmware_version": "v3.2.1",
    "started_at": "2026-04-17T08:00:00Z"
  }'`}</CodeBlock>

                  <CodeBlock title="Python (requests)">{`resp = requests.post(
    f"{BASE_URL}/rest/v1/test_runs",
    headers=HEADERS,
    json={
        "organization_id": "ORG_UUID",
        "name": "Nightly firmware validation",
        "suite_name": "post-flash-smoke",
        "status": "running",
        "total_tests": 42,
        "device_name": "DUT-A001",
        "firmware_version": "v3.2.1",
        "started_at": "2026-04-17T08:00:00Z",
    },
)
run = resp.json()[0]
print(f"Created run: {run['id']}")`}</CodeBlock>

                  <CodeBlock title="Response (201)">{`[
  {
    "id": "a1b2c3d4-...",
    "organization_id": "ORG_UUID",
    "name": "Nightly firmware validation",
    "suite_name": "post-flash-smoke",
    "status": "running",
    "total_tests": 42,
    "passed": 0,
    "failed": 0,
    "skipped": 0,
    "duration": null,
    "device_name": "DUT-A001",
    "firmware_version": "v3.2.1",
    "started_at": "2026-04-17T08:00:00Z",
    "completed_at": null,
    "created_at": "2026-04-17T08:00:01Z"
  }
]`}</CodeBlock>
                </div>
              </div>

              {/* Update test run */}
              <div className="mt-6 rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-3">
                  <MethodBadge method="PATCH" />
                  <code className="font-mono text-sm text-slate-800">/rest/v1/test_runs?id=eq.{'<id>'}</code>
                </div>
                <p className="mt-3 text-sm text-slate-600">
                  Update a test run (e.g. mark it as completed with final counts).
                </p>

                <div className="mt-6 space-y-4">
                  <CodeBlock title="cURL">{`curl -X PATCH "https://your-project.supabase.co/rest/v1/test_runs?id=eq.RUN_UUID" \\
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \\
  -H "Authorization: Bearer tf_xxxxxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -H "Prefer: return=representation" \\
  -d '{
    "status": "passed",
    "passed": 40,
    "failed": 2,
    "skipped": 0,
    "duration": 127.5,
    "completed_at": "2026-04-17T08:02:07Z"
  }'`}</CodeBlock>

                  <CodeBlock title="Python (requests)">{`resp = requests.patch(
    f"{BASE_URL}/rest/v1/test_runs?id=eq.{run_id}",
    headers=HEADERS,
    json={
        "status": "passed",
        "passed": 40,
        "failed": 2,
        "duration": 127.5,
        "completed_at": "2026-04-17T08:02:07Z",
    },
)
print(resp.json())`}</CodeBlock>
                </div>
              </div>

              {/* List test runs */}
              <div className="mt-6 rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-3">
                  <MethodBadge method="GET" />
                  <code className="font-mono text-sm text-slate-800">/rest/v1/test_runs?order=started_at.desc&limit=50</code>
                </div>
                <p className="mt-3 text-sm text-slate-600">
                  List recent test runs, ordered by start time descending.
                </p>

                <div className="mt-6 space-y-4">
                  <CodeBlock title="cURL">{`curl "https://your-project.supabase.co/rest/v1/test_runs?order=started_at.desc&limit=50" \\
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \\
  -H "Authorization: Bearer tf_xxxxxxxxxxxx"`}</CodeBlock>

                  <CodeBlock title="Python (requests)">{`resp = requests.get(
    f"{BASE_URL}/rest/v1/test_runs",
    headers=HEADERS,
    params={
        "order": "started_at.desc",
        "limit": 50,
    },
)
runs = resp.json()
for run in runs:
    print(f"{run['name']}: {run['status']} ({run['passed']}/{run['total_tests']})")`}</CodeBlock>
                </div>
              </div>
            </section>

            {/* ── Test Results ───────────────────────────── */}
            <section id="test-results">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                Test Results
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Individual test case results are linked to a test run. Push one result per test case
                with its status, duration, and any error message.
              </p>

              <div className="mt-8 rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-3">
                  <MethodBadge method="POST" />
                  <code className="font-mono text-sm text-slate-800">/rest/v1/test_results</code>
                </div>
                <p className="mt-3 text-sm text-slate-600">Push a single test result.</p>

                <div className="mt-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Request Body</h4>
                  <div className="mt-2">
                    <FieldTable
                      fields={[
                        { name: 'test_run_id', type: 'uuid', required: true, description: 'The parent test run ID.' },
                        { name: 'name', type: 'string', required: true, description: 'Test case name.' },
                        { name: 'status', type: 'string', required: true, description: 'One of: passed, failed, skipped, error.' },
                        { name: 'duration_ms', type: 'float', required: false, description: 'Test duration in milliseconds.' },
                        { name: 'error_message', type: 'string', required: false, description: 'Error/failure message (max 4000 chars).' },
                        { name: 'classname', type: 'string', required: false, description: 'Test class or module name.' },
                      ]}
                    />
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <CodeBlock title="cURL">{`curl -X POST "https://your-project.supabase.co/rest/v1/test_results" \\
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \\
  -H "Authorization: Bearer tf_xxxxxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -H "Prefer: return=representation" \\
  -d '{
    "test_run_id": "RUN_UUID",
    "name": "test_device_boot",
    "status": "passed",
    "duration_ms": 3420.5,
    "classname": "tests.firmware.test_boot"
  }'`}</CodeBlock>

                  <CodeBlock title="Python (requests)">{`resp = requests.post(
    f"{BASE_URL}/rest/v1/test_results",
    headers=HEADERS,
    json={
        "test_run_id": run_id,
        "name": "test_device_boot",
        "status": "passed",
        "duration_ms": 3420.5,
        "classname": "tests.firmware.test_boot",
    },
)
print(resp.json())`}</CodeBlock>

                  <CodeBlock title="Response (201)">{`[
  {
    "id": "e5f6g7h8-...",
    "test_run_id": "RUN_UUID",
    "name": "test_device_boot",
    "status": "passed",
    "duration_ms": 3420.5,
    "error_message": null,
    "classname": "tests.firmware.test_boot",
    "created_at": "2026-04-17T08:00:05Z"
  }
]`}</CodeBlock>
                </div>
              </div>

              {/* List results for a run */}
              <div className="mt-6 rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-3">
                  <MethodBadge method="GET" />
                  <code className="font-mono text-sm text-slate-800">/rest/v1/test_results?test_run_id=eq.{'<id>'}</code>
                </div>
                <p className="mt-3 text-sm text-slate-600">List all results for a specific test run.</p>

                <div className="mt-6 space-y-4">
                  <CodeBlock title="cURL">{`curl "https://your-project.supabase.co/rest/v1/test_results?test_run_id=eq.RUN_UUID&order=created_at.asc" \\
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \\
  -H "Authorization: Bearer tf_xxxxxxxxxxxx"`}</CodeBlock>

                  <CodeBlock title="Python (requests)">{`resp = requests.get(
    f"{BASE_URL}/rest/v1/test_results",
    headers=HEADERS,
    params={
        "test_run_id": f"eq.{run_id}",
        "order": "created_at.asc",
    },
)
results = resp.json()
for r in results:
    print(f"  {r['status']:>7s}  {r['name']}  ({r['duration_ms']}ms)")`}</CodeBlock>
                </div>
              </div>
            </section>

            {/* ── Devices ────────────────────────────────── */}
            <section id="devices">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                Devices
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Register devices and send periodic heartbeats to track their health, firmware version,
                and battery level.
              </p>

              {/* Register / upsert device */}
              <div className="mt-8 rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-3">
                  <MethodBadge method="POST" />
                  <code className="font-mono text-sm text-slate-800">/rest/v1/devices</code>
                </div>
                <p className="mt-3 text-sm text-slate-600">
                  Register a new device or update an existing one (use <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs">Prefer: resolution=merge-duplicates</code> for upsert).
                </p>

                <div className="mt-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Request Body</h4>
                  <div className="mt-2">
                    <FieldTable
                      fields={[
                        { name: 'organization_id', type: 'uuid', required: true, description: 'Your organisation UUID.' },
                        { name: 'name', type: 'string', required: true, description: 'Unique device identifier.' },
                        { name: 'status', type: 'string', required: false, description: 'One of: online, offline, error (default: online).' },
                        { name: 'firmware_version', type: 'string', required: false, description: 'Current firmware version.' },
                        { name: 'battery_level', type: 'integer', required: false, description: 'Battery level 0-100.' },
                        { name: 'last_heartbeat', type: 'timestamptz', required: false, description: 'ISO 8601 timestamp of this heartbeat.' },
                      ]}
                    />
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <CodeBlock title="cURL — register device">{`curl -X POST "https://your-project.supabase.co/rest/v1/devices" \\
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \\
  -H "Authorization: Bearer tf_xxxxxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -H "Prefer: return=representation" \\
  -d '{
    "organization_id": "ORG_UUID",
    "name": "DUT-A001",
    "status": "online",
    "firmware_version": "v3.2.1",
    "battery_level": 87,
    "last_heartbeat": "2026-04-17T08:00:00Z"
  }'`}</CodeBlock>

                  <CodeBlock title="Python (requests) — heartbeat upsert">{`resp = requests.post(
    f"{BASE_URL}/rest/v1/devices",
    headers={
        **HEADERS,
        "Prefer": "resolution=merge-duplicates,return=representation",
    },
    json={
        "organization_id": "ORG_UUID",
        "name": "DUT-A001",
        "status": "online",
        "firmware_version": "v3.2.1",
        "battery_level": 87,
        "last_heartbeat": "2026-04-17T08:00:00Z",
    },
)
device = resp.json()[0]
print(f"Device {device['name']}: {device['status']}")`}</CodeBlock>
                </div>
              </div>

              {/* Update device */}
              <div className="mt-6 rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-3">
                  <MethodBadge method="PATCH" />
                  <code className="font-mono text-sm text-slate-800">/rest/v1/devices?id=eq.{'<id>'}</code>
                </div>
                <p className="mt-3 text-sm text-slate-600">Update a specific device by ID.</p>

                <div className="mt-6 space-y-4">
                  <CodeBlock title="cURL">{`curl -X PATCH "https://your-project.supabase.co/rest/v1/devices?id=eq.DEVICE_UUID" \\
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \\
  -H "Authorization: Bearer tf_xxxxxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "status": "offline",
    "last_heartbeat": "2026-04-17T09:00:00Z"
  }'`}</CodeBlock>

                  <CodeBlock title="Python (requests)">{`resp = requests.patch(
    f"{BASE_URL}/rest/v1/devices?id=eq.{device_id}",
    headers=HEADERS,
    json={
        "status": "offline",
        "last_heartbeat": "2026-04-17T09:00:00Z",
    },
)
print(resp.status_code)`}</CodeBlock>
                </div>
              </div>

              {/* List devices */}
              <div className="mt-6 rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-3">
                  <MethodBadge method="GET" />
                  <code className="font-mono text-sm text-slate-800">/rest/v1/devices?order=last_heartbeat.desc</code>
                </div>
                <p className="mt-3 text-sm text-slate-600">List all devices, most recently active first.</p>

                <div className="mt-6">
                  <CodeBlock title="cURL">{`curl "https://your-project.supabase.co/rest/v1/devices?order=last_heartbeat.desc" \\
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \\
  -H "Authorization: Bearer tf_xxxxxxxxxxxx"`}</CodeBlock>
                </div>
              </div>
            </section>

            {/* ── Crashes ────────────────────────────────── */}
            <section id="crashes">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                Crashes
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Report crashes with stack traces for automatic fingerprinting and grouping. The reporter
                script detects crash patterns automatically, but you can also report them directly.
              </p>

              <div className="mt-8 rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-3">
                  <MethodBadge method="POST" />
                  <code className="font-mono text-sm text-slate-800">/rest/v1/crashes</code>
                </div>
                <p className="mt-3 text-sm text-slate-600">Report a crash event.</p>

                <div className="mt-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Request Body</h4>
                  <div className="mt-2">
                    <FieldTable
                      fields={[
                        { name: 'organization_id', type: 'uuid', required: true, description: 'Your organisation UUID.' },
                        { name: 'device_name', type: 'string', required: true, description: 'Device that experienced the crash.' },
                        { name: 'error_message', type: 'string', required: true, description: 'Primary error message (max 2000 chars).' },
                        { name: 'stack_trace', type: 'string', required: false, description: 'Full stack trace or assert log (max 8000 chars).' },
                        { name: 'fingerprint', type: 'string', required: false, description: 'Hash for deduplication (auto-generated if omitted).' },
                        { name: 'test_name', type: 'string', required: false, description: 'Test that triggered the crash.' },
                        { name: 'firmware_version', type: 'string', required: false, description: 'Firmware version at time of crash.' },
                        { name: 'detected_at', type: 'timestamptz', required: false, description: 'ISO 8601 timestamp of detection.' },
                      ]}
                    />
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <CodeBlock title="cURL">{`curl -X POST "https://your-project.supabase.co/rest/v1/crashes" \\
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \\
  -H "Authorization: Bearer tf_xxxxxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -H "Prefer: return=representation" \\
  -d '{
    "organization_id": "ORG_UUID",
    "device_name": "DUT-A001",
    "error_message": "SIGSEGV in librender.so at 0x7f3a",
    "stack_trace": "#0 0x7f3a librender.so!RenderFrame\\n#1 0x4012 main!run_loop",
    "fingerprint": "a1b2c3d4e5f67890",
    "test_name": "test_render_frame",
    "firmware_version": "v3.2.1",
    "detected_at": "2026-04-17T08:01:30Z"
  }'`}</CodeBlock>

                  <CodeBlock title="Python (requests)">{`resp = requests.post(
    f"{BASE_URL}/rest/v1/crashes",
    headers=HEADERS,
    json={
        "organization_id": "ORG_UUID",
        "device_name": "DUT-A001",
        "error_message": "SIGSEGV in librender.so at 0x7f3a",
        "stack_trace": "#0 0x7f3a librender.so!RenderFrame\\n#1 0x4012 main!run_loop",
        "fingerprint": "a1b2c3d4e5f67890",
        "test_name": "test_render_frame",
        "firmware_version": "v3.2.1",
        "detected_at": "2026-04-17T08:01:30Z",
    },
)
crash = resp.json()[0]
print(f"Crash reported: {crash['id']}")`}</CodeBlock>

                  <CodeBlock title="Response (201)">{`[
  {
    "id": "c9d0e1f2-...",
    "organization_id": "ORG_UUID",
    "device_name": "DUT-A001",
    "error_message": "SIGSEGV in librender.so at 0x7f3a",
    "stack_trace": "#0 0x7f3a librender.so!RenderFrame\\n#1 0x4012 main!run_loop",
    "fingerprint": "a1b2c3d4e5f67890",
    "test_name": "test_render_frame",
    "firmware_version": "v3.2.1",
    "detected_at": "2026-04-17T08:01:30Z",
    "created_at": "2026-04-17T08:01:31Z"
  }
]`}</CodeBlock>
                </div>
              </div>

              {/* List crashes */}
              <div className="mt-6 rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-3">
                  <MethodBadge method="GET" />
                  <code className="font-mono text-sm text-slate-800">/rest/v1/crashes?order=detected_at.desc&limit=100</code>
                </div>
                <p className="mt-3 text-sm text-slate-600">List recent crash events.</p>

                <div className="mt-6">
                  <CodeBlock title="Python (requests)">{`resp = requests.get(
    f"{BASE_URL}/rest/v1/crashes",
    headers=HEADERS,
    params={
        "order": "detected_at.desc",
        "limit": 100,
        "device_name": "eq.DUT-A001",  # optional filter
    },
)
crashes = resp.json()
for c in crashes:
    print(f"[{c['detected_at']}] {c['device_name']}: {c['error_message'][:60]}")`}</CodeBlock>
                </div>
              </div>
            </section>

            {/* ── Alerts ─────────────────────────────────── */}
            <section id="alerts">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                Alerts
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Configure alert rules to get notified when test pass rates drop, devices go offline,
                or new crash types appear. Alerts are managed through the dashboard UI, but you can
                also query them via the API.
              </p>

              <div className="mt-8 rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-3">
                  <MethodBadge method="GET" />
                  <code className="font-mono text-sm text-slate-800">/rest/v1/alert_rules?order=created_at.desc</code>
                </div>
                <p className="mt-3 text-sm text-slate-600">List all configured alert rules.</p>

                <div className="mt-6 space-y-4">
                  <CodeBlock title="cURL">{`curl "https://your-project.supabase.co/rest/v1/alert_rules?order=created_at.desc" \\
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \\
  -H "Authorization: Bearer tf_xxxxxxxxxxxx"`}</CodeBlock>

                  <CodeBlock title="Python (requests)">{`resp = requests.get(
    f"{BASE_URL}/rest/v1/alert_rules",
    headers=HEADERS,
    params={"order": "created_at.desc"},
)
rules = resp.json()
for rule in rules:
    print(f"{rule['name']}: {rule['condition']} -> {rule['action']}")`}</CodeBlock>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-3">
                  <MethodBadge method="POST" />
                  <code className="font-mono text-sm text-slate-800">/rest/v1/alert_rules</code>
                </div>
                <p className="mt-3 text-sm text-slate-600">Create a new alert rule.</p>

                <div className="mt-6 space-y-4">
                  <CodeBlock title="cURL">{`curl -X POST "https://your-project.supabase.co/rest/v1/alert_rules" \\
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \\
  -H "Authorization: Bearer tf_xxxxxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -H "Prefer: return=representation" \\
  -d '{
    "organization_id": "ORG_UUID",
    "name": "Low pass rate",
    "condition": "pass_rate < 80",
    "action": "email",
    "enabled": true
  }'`}</CodeBlock>

                  <CodeBlock title="Python (requests)">{`resp = requests.post(
    f"{BASE_URL}/rest/v1/alert_rules",
    headers=HEADERS,
    json={
        "organization_id": "ORG_UUID",
        "name": "Low pass rate",
        "condition": "pass_rate < 80",
        "action": "email",
        "enabled": True,
    },
)
print(resp.json())`}</CodeBlock>
                </div>
              </div>
            </section>

            {/* ── API Keys ───────────────────────────────── */}
            <section id="api-keys">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                API Keys
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                API keys are scoped to an organisation. Create one key per CI system or lab agent
                so activity is traceable. Keys are prefixed with <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs">tf_</code> and
                can be revoked at any time from the Settings page.
              </p>

              <div className="mt-8 rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-3">
                  <MethodBadge method="GET" />
                  <code className="font-mono text-sm text-slate-800">/rest/v1/api_keys?order=created_at.desc</code>
                </div>
                <p className="mt-3 text-sm text-slate-600">List API keys for your organisation.</p>

                <div className="mt-6 space-y-4">
                  <CodeBlock title="cURL">{`curl "https://your-project.supabase.co/rest/v1/api_keys?order=created_at.desc" \\
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \\
  -H "Authorization: Bearer YOUR_USER_JWT"`}</CodeBlock>

                  <CodeBlock title="Python (requests)">{`resp = requests.get(
    f"{BASE_URL}/rest/v1/api_keys",
    headers={
        "apikey": "YOUR_SUPABASE_ANON_KEY",
        "Authorization": "Bearer YOUR_USER_JWT",
    },
    params={"order": "created_at.desc"},
)
keys = resp.json()
for k in keys:
    print(f"{k['name']}: {k['key_prefix']}... (created {k['created_at']})")`}</CodeBlock>

                  <CodeBlock title="Response (200)">{`[
  {
    "id": "k1l2m3n4-...",
    "organization_id": "ORG_UUID",
    "name": "Jenkins CI",
    "key_prefix": "tf_a1b2c3",
    "created_at": "2026-04-10T12:00:00Z",
    "last_used_at": "2026-04-17T07:55:00Z"
  }
]`}</CodeBlock>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-3">
                  <MethodBadge method="POST" />
                  <code className="font-mono text-sm text-slate-800">/rest/v1/api_keys</code>
                </div>
                <p className="mt-3 text-sm text-slate-600">
                  Create a new API key. The full key is only returned once in the response.
                </p>

                <div className="mt-6 space-y-4">
                  <CodeBlock title="cURL">{`curl -X POST "https://your-project.supabase.co/rest/v1/api_keys" \\
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \\
  -H "Authorization: Bearer YOUR_USER_JWT" \\
  -H "Content-Type: application/json" \\
  -H "Prefer: return=representation" \\
  -d '{
    "organization_id": "ORG_UUID",
    "name": "GitHub Actions"
  }'`}</CodeBlock>

                  <CodeBlock title="Python (requests)">{`resp = requests.post(
    f"{BASE_URL}/rest/v1/api_keys",
    headers={
        "apikey": "YOUR_SUPABASE_ANON_KEY",
        "Authorization": "Bearer YOUR_USER_JWT",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    },
    json={
        "organization_id": "ORG_UUID",
        "name": "GitHub Actions",
    },
)
key = resp.json()[0]
print(f"Save this key — it won't be shown again: {key['key']}")`}</CodeBlock>
                </div>
              </div>

              {/* Rate limits and best practices */}
              <div className="mt-8 rounded-xl border border-indigo-100 bg-indigo-50/50 p-6">
                <h3 className="text-sm font-semibold text-indigo-900">Best Practices</h3>
                <ul className="mt-3 space-y-2 text-sm leading-7 text-indigo-800">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="mt-1.5 h-3.5 w-3.5 flex-none" />
                    Use one API key per CI system or lab agent so activity is traceable.
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="mt-1.5 h-3.5 w-3.5 flex-none" />
                    Send device heartbeats on a fixed interval (every 5 minutes is recommended) to keep health monitoring accurate.
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="mt-1.5 h-3.5 w-3.5 flex-none" />
                    Include stack traces and assert logs with crash reports for accurate deduplication.
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="mt-1.5 h-3.5 w-3.5 flex-none" />
                    Always pass firmware_version so you can pinpoint which build introduced a regression.
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="mt-1.5 h-3.5 w-3.5 flex-none" />
                    Rotate API keys periodically and revoke unused keys from the Settings page.
                  </li>
                </ul>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
