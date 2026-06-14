import { useState, useRef } from 'react';
import {
  ClipboardCopy,
  KeyRound,
  UploadCloud,
  Server,
  Smartphone,
  AlertTriangle,
  Lock,
  ChevronRight,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Reusable code block with copy button                              */
/* ------------------------------------------------------------------ */

function CodeBlock({ title, children }: { title?: string; children: string }) {
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

interface NavItem {
  id: string;
  label: string;
  icon: typeof KeyRound;
}

const navItems: NavItem[] = [
  { id: 'authentication', label: 'Authentication', icon: KeyRound },
  { id: 'ingestion', label: 'Ingestion API', icon: UploadCloud },
  { id: 'querying', label: 'Querying Data', icon: Server },
  { id: 'devices', label: 'Devices', icon: Smartphone },
  { id: 'crashes', label: 'Crashes', icon: AlertTriangle },
  { id: 'api-keys', label: 'API Keys', icon: Lock },
];

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
                  <span className="ml-1.5 text-[10px] font-semibold uppercase text-red-500">required</span>
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
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)]">
          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">API Reference</p>
              <h1 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">TestForge API</h1>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                One authenticated endpoint to push results, plus a read API for queries.
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
                <p className="text-xs font-medium text-slate-500">Ingestion endpoint</p>
                <p className="mt-1 break-all font-mono text-xs text-slate-700">
                  https://your-project.supabase.co/functions/v1/ingest
                </p>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main ref={mainRef} className="min-w-0 space-y-16">
            {/* Two planes callout */}
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-6">
              <h2 className="text-sm font-semibold text-indigo-900">Two ways to talk to TestForge</h2>
              <ul className="mt-3 space-y-2 text-sm leading-7 text-indigo-800">
                <li className="flex items-start gap-2">
                  <ChevronRight className="mt-1.5 h-3.5 w-3.5 flex-none" />
                  <span>
                    <strong>Ingestion API</strong> — the write path for CI jobs, the reporter, and the lab
                    agent. Authenticated with a <code className="font-mono">tf_</code> API key. This is what
                    you use to push runs, results, crashes, and heartbeats.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="mt-1.5 h-3.5 w-3.5 flex-none" />
                  <span>
                    <strong>Query API</strong> — read-only access to your data over Supabase PostgREST,
                    authenticated with a Supabase user session (JWT). The dashboard uses this, and so can
                    your own reporting scripts.
                  </span>
                </li>
              </ul>
            </div>

            {/* ── Authentication ─────────────────────────── */}
            <section id="authentication">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Authentication</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Writes are authenticated with a TestForge API key. Create one from{' '}
                <strong>Settings → API Keys</strong> (or via the RPC below); it is shown once and starts
                with <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs">tf_</code>. Send
                it as a Bearer token to the ingestion endpoint — the server resolves your organization from
                the key, so you never pass an organization ID by hand.
              </p>

              <div className="mt-6">
                <h3 className="text-sm font-semibold text-slate-700">Ingestion headers</h3>
                <div className="mt-3">
                  <FieldTable
                    fields={[
                      { name: 'Authorization', type: 'string', required: true, description: 'Bearer tf_xxx — your TestForge API key.' },
                      { name: 'Content-Type', type: 'string', required: true, description: 'application/json' },
                    ]}
                  />
                </div>
              </div>

              <div className="mt-6">
                <CodeBlock title="cURL — verify your key">{`curl -X POST "https://your-project.supabase.co/functions/v1/ingest" \\
  -H "Authorization: Bearer tf_xxxxxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{"device": {"name": "DUT-A001", "status": "online"}}'

# -> { "ok": true, "organization_id": "...", "device": true, ... }`}</CodeBlock>
              </div>

              <p className="mt-6 text-sm leading-7 text-slate-600">
                For the <strong>Query API</strong>, pass the Supabase anon key in the{' '}
                <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs">apikey</code> header
                and a user JWT in the{' '}
                <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs">Authorization</code>{' '}
                header. Row Level Security scopes every response to the caller's organization automatically.
              </p>
            </section>

            {/* ── Ingestion API ──────────────────────────── */}
            <section id="ingestion">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Ingestion API</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                A single endpoint accepts a batch describing a test run. Every section is optional, so the
                same endpoint handles a full run upload, a standalone crash report, or just a device
                heartbeat. The server maps your payload onto the internal schema and deduplicates crashes by
                fingerprint.
              </p>

              <div className="mt-8 rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-3">
                  <MethodBadge method="POST" />
                  <code className="font-mono text-sm text-slate-800">/functions/v1/ingest</code>
                </div>

                <div className="mt-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Top-level body</h4>
                  <div className="mt-2">
                    <FieldTable
                      fields={[
                        { name: 'device', type: 'object', description: 'A device heartbeat (name, status, firmware_version, battery_level).' },
                        { name: 'run', type: 'object', description: 'The test run summary. Required if you send results.' },
                        { name: 'results', type: 'object[]', description: 'Individual test case results, attached to the run.' },
                        { name: 'crashes', type: 'object[]', description: 'Crash reports, fingerprinted and deduplicated server-side.' },
                      ]}
                    />
                  </div>
                </div>

                <div className="mt-5">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">run fields</h4>
                  <div className="mt-2">
                    <FieldTable
                      fields={[
                        { name: 'name', type: 'string', required: true, description: 'Human-readable name for the run.' },
                        { name: 'suite_name', type: 'string', description: 'Suite identifier (e.g. post-flash-smoke).' },
                        { name: 'status', type: 'string', description: 'running | passed | failed (normalized server-side).' },
                        { name: 'total_tests / passed / failed / skipped', type: 'integer', description: 'Run counts.' },
                        { name: 'duration', type: 'float', description: 'Total duration in seconds (converted to ms).' },
                        { name: 'device_name', type: 'string', description: 'Device under test (auto-linked / created).' },
                        { name: 'firmware_version', type: 'string', description: 'Firmware or build version.' },
                        { name: 'started_at / completed_at', type: 'timestamptz', description: 'ISO 8601 timestamps (default: now).' },
                      ]}
                    />
                  </div>
                </div>

                <div className="mt-5">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">results[] fields</h4>
                  <div className="mt-2">
                    <FieldTable
                      fields={[
                        { name: 'name', type: 'string', required: true, description: 'Test case name.' },
                        { name: 'status', type: 'string', required: true, description: 'passed | failed | error | skipped | flaky | timeout.' },
                        { name: 'duration_ms', type: 'float', description: 'Test duration in milliseconds.' },
                        { name: 'classname', type: 'string', description: 'Test class or module.' },
                        { name: 'error_message', type: 'string', description: 'Failure message (max 4000 chars).' },
                        { name: 'stack_trace', type: 'string', description: 'Full trace (max 8000 chars).' },
                      ]}
                    />
                  </div>
                </div>

                <div className="mt-5">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">crashes[] fields</h4>
                  <div className="mt-2">
                    <FieldTable
                      fields={[
                        { name: 'error_message', type: 'string', required: true, description: 'Primary error/title. crash_type is inferred from it.' },
                        { name: 'device_name', type: 'string', description: 'Device that crashed (auto-linked).' },
                        { name: 'stack_trace', type: 'string', description: 'Full stack trace or assert log.' },
                        { name: 'fingerprint', type: 'string', description: 'Dedup hash (auto-generated if omitted).' },
                        { name: 'crash_type / severity', type: 'string', description: 'Optional overrides; otherwise inferred.' },
                        { name: 'detected_at', type: 'timestamptz', description: 'ISO 8601 time of detection (default: now).' },
                      ]}
                    />
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <CodeBlock title="cURL — full run upload">{`curl -X POST "https://your-project.supabase.co/functions/v1/ingest" \\
  -H "Authorization: Bearer tf_xxxxxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "device": { "name": "DUT-A001", "status": "online", "firmware_version": "v3.2.1" },
    "run": {
      "name": "Nightly firmware validation",
      "suite_name": "post-flash-smoke",
      "status": "failed",
      "total_tests": 42, "passed": 40, "failed": 2,
      "duration": 127.5, "device_name": "DUT-A001", "firmware_version": "v3.2.1"
    },
    "results": [
      { "name": "test_device_boot", "status": "passed", "duration_ms": 3420.5, "classname": "tests.firmware.test_boot" },
      { "name": "test_suspend_resume", "status": "failed", "error_message": "Kernel panic at power.c:847" }
    ],
    "crashes": [
      { "device_name": "DUT-A001", "error_message": "Kernel panic at power.c:847", "test_name": "test_suspend_resume", "firmware_version": "v3.2.1" }
    ]
  }'`}</CodeBlock>

                  <CodeBlock title="Response (200)">{`{
  "ok": true,
  "organization_id": "a1b2c3d4-...",
  "device": true,
  "run_id": "e5f6g7h8-...",
  "results": 2,
  "crashes": 1
}`}</CodeBlock>

                  <CodeBlock title="Python (requests)">{`import requests

resp = requests.post(
    "https://your-project.supabase.co/functions/v1/ingest",
    headers={"Authorization": "Bearer tf_xxxxxxxxxxxx"},
    json={
        "device": {"name": "DUT-A001", "status": "online"},
        "run": {"name": "Smoke", "suite_name": "post-flash-smoke",
                "status": "passed", "total_tests": 24, "passed": 24},
    },
    timeout=30,
)
resp.raise_for_status()
print(resp.json())`}</CodeBlock>

                  <CodeBlock title="Easiest: the reporter script (parses JUnit XML for you)">{`python3 testforge_reporter.py \\
  --url https://your-project.supabase.co \\
  --api-key tf_xxxxxxxxxxxx \\
  --junit-xml results.xml \\
  --device-name DUT-A001 \\
  --suite-name post-flash-smoke \\
  --firmware-version v3.2.1`}</CodeBlock>
                </div>
              </div>
            </section>

            {/* ── Querying Data ──────────────────────────── */}
            <section id="querying">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Querying Data</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Read your data over PostgREST. These calls use the Supabase anon key plus a user JWT; Row
                Level Security restricts every response to your organization. Base URL:{' '}
                <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs">
                  https://your-project.supabase.co/rest/v1
                </code>
                .
              </p>

              <div className="mt-8 rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-3">
                  <MethodBadge method="GET" />
                  <code className="font-mono text-sm text-slate-800">/test_runs?order=created_at.desc&limit=50</code>
                </div>
                <p className="mt-3 text-sm text-slate-600">List recent test runs.</p>
                <div className="mt-6">
                  <CodeBlock title="Python (requests)">{`import requests

BASE_URL = "https://your-project.supabase.co"
HEADERS = {
    "apikey": "YOUR_SUPABASE_ANON_KEY",
    "Authorization": "Bearer YOUR_USER_JWT",
}

resp = requests.get(
    f"{BASE_URL}/rest/v1/test_runs",
    headers=HEADERS,
    params={"order": "created_at.desc", "limit": 50},
)
for run in resp.json():
    print(f"{run['name']}: {run['status']} ({run['passed']}/{run['total_tests']})")`}</CodeBlock>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-3">
                  <MethodBadge method="GET" />
                  <code className="font-mono text-sm text-slate-800">/test_results?test_run_id=eq.{'<id>'}</code>
                </div>
                <p className="mt-3 text-sm text-slate-600">
                  List results for a run. Key columns:{' '}
                  <code className="font-mono text-xs">test_name</code>,{' '}
                  <code className="font-mono text-xs">test_class</code>,{' '}
                  <code className="font-mono text-xs">status</code>,{' '}
                  <code className="font-mono text-xs">duration_ms</code>,{' '}
                  <code className="font-mono text-xs">error_message</code>.
                </p>
                <div className="mt-6">
                  <CodeBlock title="cURL">{`curl "https://your-project.supabase.co/rest/v1/test_results?test_run_id=eq.RUN_UUID&order=created_at.asc" \\
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \\
  -H "Authorization: Bearer YOUR_USER_JWT"`}</CodeBlock>
                </div>
              </div>
            </section>

            {/* ── Devices ────────────────────────────────── */}
            <section id="devices">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Devices</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Devices are created and kept fresh automatically when you send a heartbeat or a run through
                the Ingestion API — no manual registration needed. Query them over the read API.
              </p>

              <div className="mt-6">
                <h3 className="text-sm font-semibold text-slate-700">Device columns</h3>
                <div className="mt-3">
                  <FieldTable
                    fields={[
                      { name: 'name', type: 'string', description: 'Device identifier (unique within your org).' },
                      { name: 'status', type: 'string', description: 'online | offline | testing | error | maintenance.' },
                      { name: 'device_type', type: 'string', description: 'android | ios | embedded | iot | web | desktop | custom.' },
                      { name: 'firmware_version', type: 'string', description: 'Current firmware/build version.' },
                      { name: 'connection_type', type: 'string', description: 'usb | adb | uart | ssh | wifi | api | agent.' },
                      { name: 'last_seen_at', type: 'timestamptz', description: 'Time of the most recent heartbeat.' },
                      { name: 'metadata', type: 'jsonb', description: 'Extra fields (e.g. battery_level) sent on heartbeat.' },
                    ]}
                  />
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-3">
                  <MethodBadge method="GET" />
                  <code className="font-mono text-sm text-slate-800">/devices?order=last_seen_at.desc</code>
                </div>
                <p className="mt-3 text-sm text-slate-600">List all devices, most recently active first.</p>
                <div className="mt-6">
                  <CodeBlock title="cURL">{`curl "https://your-project.supabase.co/rest/v1/devices?order=last_seen_at.desc" \\
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \\
  -H "Authorization: Bearer YOUR_USER_JWT"`}</CodeBlock>
                </div>
                <p className="mt-4 text-sm text-slate-600">Send a heartbeat through the Ingestion API:</p>
                <div className="mt-3">
                  <CodeBlock title="cURL — heartbeat">{`curl -X POST "https://your-project.supabase.co/functions/v1/ingest" \\
  -H "Authorization: Bearer tf_xxxxxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{ "device": { "name": "DUT-A001", "status": "online", "firmware_version": "v3.2.1", "battery_level": 87 } }'`}</CodeBlock>
                </div>
              </div>
            </section>

            {/* ── Crashes ────────────────────────────────── */}
            <section id="crashes">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Crashes</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Report crashes through the Ingestion API; they are fingerprinted and deduplicated
                automatically (repeat occurrences increment a counter instead of creating noise). Query the
                grouped crashes over the read API. Key columns:{' '}
                <code className="font-mono text-xs">title</code>,{' '}
                <code className="font-mono text-xs">crash_type</code>,{' '}
                <code className="font-mono text-xs">severity</code>,{' '}
                <code className="font-mono text-xs">occurrence_count</code>,{' '}
                <code className="font-mono text-xs">fingerprint</code>.
              </p>

              <div className="mt-8 rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-3">
                  <MethodBadge method="POST" />
                  <code className="font-mono text-sm text-slate-800">/functions/v1/ingest</code>
                </div>
                <p className="mt-3 text-sm text-slate-600">Report a standalone crash.</p>
                <div className="mt-6">
                  <CodeBlock title="cURL">{`curl -X POST "https://your-project.supabase.co/functions/v1/ingest" \\
  -H "Authorization: Bearer tf_xxxxxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "crashes": [{
      "device_name": "DUT-A001",
      "error_message": "SIGSEGV in librender.so at 0x7f3a",
      "stack_trace": "#0 0x7f3a librender.so!RenderFrame\\n#1 0x4012 main!run_loop",
      "test_name": "test_render_frame",
      "firmware_version": "v3.2.1"
    }]
  }'`}</CodeBlock>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-3">
                  <MethodBadge method="GET" />
                  <code className="font-mono text-sm text-slate-800">/crashes?order=last_seen_at.desc&limit=100</code>
                </div>
                <p className="mt-3 text-sm text-slate-600">List recent crash groups.</p>
                <div className="mt-6">
                  <CodeBlock title="Python (requests)">{`resp = requests.get(
    f"{BASE_URL}/rest/v1/crashes",
    headers=HEADERS,
    params={"order": "last_seen_at.desc", "limit": 100},
)
for c in resp.json():
    print(f"[{c['severity']}] x{c['occurrence_count']}  {c['title']}")`}</CodeBlock>
                </div>
              </div>
            </section>

            {/* ── API Keys ───────────────────────────────── */}
            <section id="api-keys">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">API Keys</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                API keys are scoped to an organization and prefixed with{' '}
                <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs">tf_</code>. Only a
                SHA-256 hash is stored — the full key is returned exactly once at creation. Create one per CI
                system or lab agent so activity stays traceable, and revoke unused keys anytime. The fastest
                path is <strong>Settings → API Keys</strong> in the dashboard; the same operations are
                available as RPCs.
              </p>

              <div className="mt-8 rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-3">
                  <MethodBadge method="POST" />
                  <code className="font-mono text-sm text-slate-800">/rest/v1/rpc/create_api_key</code>
                </div>
                <p className="mt-3 text-sm text-slate-600">
                  Create a key (requires a signed-in user session). The plaintext{' '}
                  <code className="font-mono text-xs">api_key</code> is only returned here.
                </p>
                <div className="mt-6 space-y-4">
                  <CodeBlock title="cURL">{`curl -X POST "https://your-project.supabase.co/rest/v1/rpc/create_api_key" \\
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \\
  -H "Authorization: Bearer YOUR_USER_JWT" \\
  -H "Content-Type: application/json" \\
  -d '{ "p_org_id": "ORG_UUID", "p_name": "GitHub Actions" }'`}</CodeBlock>

                  <CodeBlock title="Response (200)">{`[
  {
    "id": "k1l2m3n4-...",
    "name": "GitHub Actions",
    "api_key": "tf_9f8e7d6c5b4a...",   // shown once — store it now
    "key_prefix": "tf_9f8e7d"
  }
]`}</CodeBlock>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-3">
                  <MethodBadge method="POST" />
                  <code className="font-mono text-sm text-slate-800">/rest/v1/rpc/revoke_api_key</code>
                </div>
                <p className="mt-3 text-sm text-slate-600">Revoke a key by its ID (owner/admin only).</p>
                <div className="mt-6">
                  <CodeBlock title="cURL">{`curl -X POST "https://your-project.supabase.co/rest/v1/rpc/revoke_api_key" \\
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \\
  -H "Authorization: Bearer YOUR_USER_JWT" \\
  -H "Content-Type: application/json" \\
  -d '{ "p_key_id": "KEY_UUID" }'`}</CodeBlock>
                </div>
              </div>

              {/* Best practices */}
              <div className="mt-8 rounded-xl border border-indigo-100 bg-indigo-50/50 p-6">
                <h3 className="text-sm font-semibold text-indigo-900">Best Practices</h3>
                <ul className="mt-3 space-y-2 text-sm leading-7 text-indigo-800">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="mt-1.5 h-3.5 w-3.5 flex-none" />
                    Use one API key per CI system or lab agent so activity is traceable and revocable.
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="mt-1.5 h-3.5 w-3.5 flex-none" />
                    Store keys as CI secrets or in the agent config file (chmod 600) — never in source control.
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="mt-1.5 h-3.5 w-3.5 flex-none" />
                    Send device heartbeats on a fixed interval (every 5 minutes) to keep health monitoring accurate.
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="mt-1.5 h-3.5 w-3.5 flex-none" />
                    Include stack traces and assert logs with crashes for accurate fingerprinting and dedup.
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="mt-1.5 h-3.5 w-3.5 flex-none" />
                    Always pass firmware_version so you can pinpoint which build introduced a regression.
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
