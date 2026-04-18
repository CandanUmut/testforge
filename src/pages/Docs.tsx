import { useState } from 'react';
import {
  Code2, Copy, Check, ChevronRight, Terminal, Key, Zap,
  UploadCloud, Search, AlertTriangle, Cpu, BarChart2, Lock,
  ExternalLink,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Param {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

interface CodeExample {
  lang: string;
  label: string;
  code: string;
}

interface Endpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  summary: string;
  description: string;
  params?: Param[];
  bodyParams?: Param[];
  examples: CodeExample[];
  response: string;
}

interface Category {
  id: string;
  label: string;
  icon: React.ElementType;
  endpoints: Endpoint[];
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const BASE_URL = 'https://api.testforge.io/v1';

const CATEGORIES: Category[] = [
  {
    id: 'auth',
    label: 'Authentication',
    icon: Key,
    endpoints: [
      {
        id: 'auth-token',
        method: 'POST',
        path: '/auth/token',
        summary: 'Create an API token',
        description: 'Exchange your API key for a short-lived bearer token. Tokens are valid for 1 hour.',
        bodyParams: [
          { name: 'api_key', type: 'string', required: true, description: 'Your TestForge API key from Settings → API Keys.' },
        ],
        examples: [
          {
            lang: 'bash',
            label: 'cURL',
            code: `curl -X POST ${BASE_URL}/auth/token \\
  -H "Content-Type: application/json" \\
  -d '{"api_key": "tf_live_xxxxxxxxxxxxxxxx"}'`,
          },
          {
            lang: 'python',
            label: 'Python',
            code: `import requests

resp = requests.post(
    "${BASE_URL}/auth/token",
    json={"api_key": "tf_live_xxxxxxxxxxxxxxxx"},
)
token = resp.json()["access_token"]`,
          },
        ],
        response: `{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600
}`,
      },
    ],
  },
  {
    id: 'runs',
    label: 'Test Runs',
    icon: Zap,
    endpoints: [
      {
        id: 'runs-list',
        method: 'GET',
        path: '/runs',
        summary: 'List test runs',
        description: 'Returns a paginated list of test runs for your organization, sorted by created_at descending.',
        params: [
          { name: 'limit', type: 'integer', required: false, description: 'Number of runs to return (default 20, max 100).' },
          { name: 'offset', type: 'integer', required: false, description: 'Pagination offset (default 0).' },
          { name: 'status', type: 'string', required: false, description: 'Filter by status: passed | failed | running | queued.' },
          { name: 'device_id', type: 'string', required: false, description: 'Filter by device UUID.' },
        ],
        examples: [
          {
            lang: 'bash',
            label: 'cURL',
            code: `curl "${BASE_URL}/runs?limit=10&status=failed" \\
  -H "Authorization: Bearer <token>"`,
          },
          {
            lang: 'python',
            label: 'Python',
            code: `runs = requests.get(
    "${BASE_URL}/runs",
    params={"limit": 10, "status": "failed"},
    headers={"Authorization": f"Bearer {token}"},
).json()`,
          },
        ],
        response: `{
  "data": [
    {
      "id": "run_abc123",
      "status": "failed",
      "suite": "regression",
      "device_id": "dev_xyz",
      "pass_rate": 0.84,
      "total_tests": 312,
      "passed": 262,
      "failed": 50,
      "duration_ms": 184320,
      "created_at": "2026-03-31T08:14:22Z"
    }
  ],
  "total": 1847,
  "limit": 10,
  "offset": 0
}`,
      },
      {
        id: 'runs-create',
        method: 'POST',
        path: '/runs',
        summary: 'Create a test run',
        description: 'Start a new test run and receive a run ID to stream results into.',
        bodyParams: [
          { name: 'device_id', type: 'string', required: true, description: 'UUID of the target device.' },
          { name: 'suite', type: 'string', required: true, description: 'Test suite name: smoke | regression | power | firmware | integration | performance.' },
          { name: 'firmware_version', type: 'string', required: false, description: 'Firmware version under test (semver).' },
          { name: 'tags', type: 'string[]', required: false, description: 'Arbitrary labels attached to this run.' },
          { name: 'metadata', type: 'object', required: false, description: 'Key-value map of custom metadata.' },
        ],
        examples: [
          {
            lang: 'bash',
            label: 'cURL',
            code: `curl -X POST ${BASE_URL}/runs \\
  -H "Authorization: Bearer <token>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "device_id": "dev_xyz",
    "suite": "regression",
    "firmware_version": "2.4.1",
    "tags": ["nightly", "ci"]
  }'`,
          },
        ],
        response: `{
  "id": "run_abc123",
  "status": "running",
  "suite": "regression",
  "device_id": "dev_xyz",
  "firmware_version": "2.4.1",
  "created_at": "2026-03-31T08:14:22Z",
  "stream_url": "wss://stream.testforge.io/runs/run_abc123"
}`,
      },
      {
        id: 'runs-results',
        method: 'POST',
        path: '/runs/{run_id}/results',
        summary: 'Push test results',
        description: 'Append individual test case results to a running test run. Call this once per test case as results become available.',
        params: [
          { name: 'run_id', type: 'string', required: true, description: 'The run ID returned by POST /runs.' },
        ],
        bodyParams: [
          { name: 'results', type: 'TestResult[]', required: true, description: 'Array of test result objects.' },
        ],
        examples: [
          {
            lang: 'bash',
            label: 'cURL',
            code: `curl -X POST ${BASE_URL}/runs/run_abc123/results \\
  -H "Authorization: Bearer <token>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "results": [
      {
        "test_name": "device_boot_sequence",
        "category": "smoke",
        "status": "passed",
        "duration_ms": 1240
      },
      {
        "test_name": "usb_enumeration_check",
        "category": "smoke",
        "status": "failed",
        "duration_ms": 320,
        "error_message": "USB descriptor mismatch: expected 0x0483, got 0x0000"
      }
    ]
  }'`,
          },
        ],
        response: `{
  "accepted": 2,
  "rejected": 0
}`,
      },
    ],
  },
  {
    id: 'upload',
    label: 'Artifacts',
    icon: UploadCloud,
    endpoints: [
      {
        id: 'upload-log',
        method: 'POST',
        path: '/runs/{run_id}/logs',
        summary: 'Upload log bundle',
        description: 'Upload a newline-delimited JSON log bundle (NDJSON) for a run. Max 50 MB per request.',
        params: [
          { name: 'run_id', type: 'string', required: true, description: 'Target run ID.' },
        ],
        bodyParams: [
          { name: 'file', type: 'binary', required: true, description: 'NDJSON file. Each line: {"ts":"ISO8601","level":"info|warn|error","msg":"...","module":"..."}' },
        ],
        examples: [
          {
            lang: 'bash',
            label: 'cURL',
            code: `curl -X POST ${BASE_URL}/runs/run_abc123/logs \\
  -H "Authorization: Bearer <token>" \\
  -H "Content-Type: application/octet-stream" \\
  --data-binary @device_run.ndjson`,
          },
        ],
        response: `{
  "lines_ingested": 14820,
  "bytes": 2193408,
  "log_url": "https://app.testforge.io/logs?run=run_abc123"
}`,
      },
      {
        id: 'upload-crash',
        method: 'POST',
        path: '/crashes',
        summary: 'Report a crash',
        description: 'Submit a crash report with stack trace for automatic deduplication and AI-assisted root-cause triage.',
        bodyParams: [
          { name: 'run_id', type: 'string', required: true, description: 'The run during which the crash occurred.' },
          { name: 'device_id', type: 'string', required: true, description: 'Device UUID.' },
          { name: 'error_type', type: 'string', required: true, description: 'Exception class or fault type.' },
          { name: 'message', type: 'string', required: true, description: 'One-line crash message.' },
          { name: 'stack_trace', type: 'string', required: true, description: 'Full stack trace as a single string.' },
          { name: 'severity', type: 'string', required: false, description: 'critical | high | medium | low (default: high).' },
          { name: 'metadata', type: 'object', required: false, description: 'Freeform key-value pairs (e.g. firmware_version, build_id).' },
        ],
        examples: [
          {
            lang: 'bash',
            label: 'cURL',
            code: `curl -X POST ${BASE_URL}/crashes \\
  -H "Authorization: Bearer <token>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "run_id": "run_abc123",
    "device_id": "dev_xyz",
    "error_type": "HardFault",
    "message": "PC at 0x0800A4F2 — stack overflow in wifi_tx_task",
    "stack_trace": "HardFault_Handler\\nwifi_tx_task+0x84\\n...",
    "severity": "critical"
  }'`,
          },
        ],
        response: `{
  "id": "crash_x9k2m",
  "fingerprint": "a3f8c2d1",
  "is_duplicate": false,
  "triage_url": "https://app.testforge.io/triage/crash_x9k2m"
}`,
      },
    ],
  },
  {
    id: 'search',
    label: 'Search & Query',
    icon: Search,
    endpoints: [
      {
        id: 'search-logs',
        method: 'GET',
        path: '/logs/search',
        summary: 'Search log entries',
        description: 'Full-text search across all log entries for your organization. Supports field filters and time ranges.',
        params: [
          { name: 'q', type: 'string', required: true, description: 'Search query (supports field:value syntax, e.g. level:error module:wifi).' },
          { name: 'run_id', type: 'string', required: false, description: 'Scope search to a specific run.' },
          { name: 'from', type: 'ISO8601', required: false, description: 'Start of time range.' },
          { name: 'to', type: 'ISO8601', required: false, description: 'End of time range.' },
          { name: 'limit', type: 'integer', required: false, description: 'Max entries to return (default 100, max 1000).' },
        ],
        examples: [
          {
            lang: 'bash',
            label: 'cURL',
            code: `curl "${BASE_URL}/logs/search?q=level:error+module:wifi&limit=50" \\
  -H "Authorization: Bearer <token>"`,
          },
        ],
        response: `{
  "hits": [
    {
      "id": "log_abc",
      "run_id": "run_abc123",
      "ts": "2026-03-31T08:15:01.234Z",
      "level": "error",
      "module": "wifi",
      "message": "TX queue overflow — dropping 14 packets"
    }
  ],
  "total": 142
}`,
      },
    ],
  },
  {
    id: 'devices',
    label: 'Devices',
    icon: Cpu,
    endpoints: [
      {
        id: 'devices-list',
        method: 'GET',
        path: '/devices',
        summary: 'List devices',
        description: 'Returns all registered devices for the organization.',
        params: [
          { name: 'status', type: 'string', required: false, description: 'Filter: online | offline | flashing | maintenance.' },
          { name: 'platform', type: 'string', required: false, description: 'Filter by hardware platform slug.' },
        ],
        examples: [
          {
            lang: 'bash',
            label: 'cURL',
            code: `curl "${BASE_URL}/devices?status=online" \\
  -H "Authorization: Bearer <token>"`,
          },
        ],
        response: `{
  "data": [
    {
      "id": "dev_xyz",
      "name": "Lab Device 03",
      "platform": "STM32H7B3I-DK",
      "status": "online",
      "firmware_version": "2.4.1",
      "last_seen": "2026-03-31T08:20:00Z"
    }
  ],
  "total": 12
}`,
      },
      {
        id: 'devices-register',
        method: 'POST',
        path: '/devices',
        summary: 'Register a device',
        description: 'Register a new hardware device with TestForge. Returns the device ID and agent installation command.',
        bodyParams: [
          { name: 'name', type: 'string', required: true, description: 'Human-readable device label.' },
          { name: 'platform', type: 'string', required: true, description: 'Hardware platform slug (e.g. stm32h7, nrf52840, esp32s3).' },
          { name: 'serial_number', type: 'string', required: false, description: 'Physical device serial number for inventory.' },
        ],
        examples: [
          {
            lang: 'bash',
            label: 'cURL',
            code: `curl -X POST ${BASE_URL}/devices \\
  -H "Authorization: Bearer <token>" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "Lab Device 04", "platform": "nrf52840", "serial_number": "SN-20260001"}'`,
          },
        ],
        response: `{
  "id": "dev_newXYZ",
  "name": "Lab Device 04",
  "platform": "nrf52840",
  "agent_install_cmd": "curl -fsSL https://install.testforge.io | sh -s -- --device-id dev_newXYZ --api-key tf_live_xxx"
}`,
      },
    ],
  },
  {
    id: 'webhooks',
    label: 'Webhooks',
    icon: AlertTriangle,
    endpoints: [
      {
        id: 'webhooks-events',
        method: 'GET',
        path: '/webhooks/events',
        summary: 'Webhook event types',
        description: 'Lists all supported webhook event types. Configure delivery endpoints in Settings → Webhooks.',
        examples: [
          {
            lang: 'bash',
            label: 'cURL',
            code: `curl "${BASE_URL}/webhooks/events" \\
  -H "Authorization: Bearer <token>"`,
          },
        ],
        response: `{
  "events": [
    "run.completed",
    "run.failed",
    "crash.detected",
    "crash.resolved",
    "device.offline",
    "device.online",
    "alert.triggered"
  ]
}`,
      },
    ],
  },
  {
    id: 'metrics',
    label: 'Metrics',
    icon: BarChart2,
    endpoints: [
      {
        id: 'metrics-summary',
        method: 'GET',
        path: '/metrics/summary',
        summary: 'Get metrics summary',
        description: 'Returns aggregated quality metrics across all runs in the requested time window.',
        params: [
          { name: 'window', type: 'string', required: false, description: 'Time window: 7d | 14d | 30d | 90d (default 14d).' },
          { name: 'device_id', type: 'string', required: false, description: 'Scope to a single device.' },
        ],
        examples: [
          {
            lang: 'bash',
            label: 'cURL',
            code: `curl "${BASE_URL}/metrics/summary?window=30d" \\
  -H "Authorization: Bearer <token>"`,
          },
        ],
        response: `{
  "window": "30d",
  "total_runs": 248,
  "avg_pass_rate": 0.921,
  "total_crashes": 14,
  "flaky_tests": 7,
  "health_score": 74,
  "trend": "improving"
}`,
      },
    ],
  },
];

// ─── Helper components ─────────────────────────────────────────────────────────

const METHOD_COLORS: Record<string, string> = {
  GET: 'text-emerald-700 bg-emerald-50',
  POST: 'text-blue-700 bg-blue-50',
  PUT: 'text-amber-700 bg-amber-50',
  PATCH: 'text-indigo-700 bg-indigo-50',
  DELETE: 'text-red-700 bg-red-50',
};

function MethodBadge({ method }: { method: string }) {
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded font-mono ${METHOD_COLORS[method] ?? 'text-gray-400 bg-gray-400/10'}`}>
      {method}
    </span>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors"
    >
      {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

function CodeBlock({ code, lang }: { code: string; lang: string }) {
  return (
    <div className="relative">
      <pre className={`text-xs font-mono text-gray-700 overflow-x-auto whitespace-pre language-${lang}`}>
        {code}
      </pre>
    </div>
  );
}

function ParamTable({ params, title }: { params: Param[]; title: string }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{title}</p>
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-3 py-2 text-gray-400 font-medium">Name</th>
              <th className="text-left px-3 py-2 text-gray-400 font-medium">Type</th>
              <th className="text-left px-3 py-2 text-gray-400 font-medium">Req.</th>
              <th className="text-left px-3 py-2 text-gray-400 font-medium">Description</th>
            </tr>
          </thead>
          <tbody>
            {params.map((p, i) => (
              <tr key={p.name} className={i % 2 === 0 ? '' : 'bg-gray-50/50'}>
                <td className="px-3 py-2 font-mono text-blue-600">{p.name}</td>
                <td className="px-3 py-2 font-mono text-indigo-600">{p.type}</td>
                <td className="px-3 py-2">
                  {p.required
                    ? <span className="text-red-400 font-semibold">yes</span>
                    : <span className="text-gray-500">no</span>}
                </td>
                <td className="px-3 py-2 text-gray-400">{p.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EndpointCard({ endpoint }: { endpoint: Endpoint }) {
  const [activeTab, setActiveTab] = useState(0);
  const example = endpoint.examples[activeTab];

  return (
    <div id={endpoint.id} className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-2">
          <MethodBadge method={endpoint.method} />
          <code className="text-sm font-mono text-gray-900">{endpoint.path}</code>
        </div>
        <p className="text-sm font-semibold text-gray-900">{endpoint.summary}</p>
        <p className="text-xs text-gray-400 mt-1">{endpoint.description}</p>
      </div>

      <div className="p-5 space-y-5">
        {/* Params */}
        {endpoint.params && endpoint.params.length > 0 && (
          <ParamTable params={endpoint.params} title="Query Parameters" />
        )}
        {endpoint.bodyParams && endpoint.bodyParams.length > 0 && (
          <ParamTable params={endpoint.bodyParams} title="Request Body" />
        )}

        {/* Code examples */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Request</p>
          {endpoint.examples.length > 1 && (
            <div className="flex gap-2 mb-3">
              {endpoint.examples.map((ex, i) => (
                <button
                  key={ex.lang}
                  onClick={() => setActiveTab(i)}
                  className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                    i === activeTab
                      ? 'bg-indigo-50 border-indigo-200 text-blue-600'
                      : 'border-gray-200 text-gray-400 hover:text-gray-700'
                  }`}
                >
                  {ex.label}
                </button>
              ))}
            </div>
          )}
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">{example.label}</span>
              <CopyButton text={example.code} />
            </div>
            <CodeBlock code={example.code} lang={example.lang} />
          </div>
        </div>

        {/* Response */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Response</p>
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-emerald-400">200 OK</span>
              <CopyButton text={endpoint.response} />
            </div>
            <CodeBlock code={endpoint.response} lang="json" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export function Docs() {
  const [activeCategory, setActiveCategory] = useState('runs');

  const category = CATEGORIES.find(c => c.id === activeCategory) ?? CATEGORIES[0];

  return (
    <div className="flex h-full min-h-0">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-56 shrink-0 border-r border-gray-200 overflow-y-auto">
        {/* API info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-1">
            <Code2 size={14} className="text-blue-400" />
            <span className="text-xs font-semibold text-gray-900">REST API v1</span>
          </div>
          <p className="text-xs text-gray-500 font-mono">{BASE_URL}</p>
        </div>

        {/* Auth note */}
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-start gap-2">
            <Lock size={12} className="text-amber-400 mt-0.5 shrink-0" />
            <p className="text-xs text-gray-400">All endpoints require <code className="text-amber-700">Authorization: Bearer &lt;token&gt;</code></p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-2">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const active = cat.id === activeCategory;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors ${
                  active
                    ? 'bg-indigo-50 text-blue-600'
                    : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon size={14} />
                {cat.label}
                {active && <ChevronRight size={12} className="ml-auto" />}
              </button>
            );
          })}
        </nav>

        {/* Footer links */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <a
            href="https://testforge.io/changelog"
            className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            <Terminal size={12} />
            Changelog
            <ExternalLink size={10} className="ml-auto" />
          </a>
          <a
            href="https://status.testforge.io"
            className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            <Zap size={12} />
            Status page
            <ExternalLink size={10} className="ml-auto" />
          </a>
        </div>
      </aside>

      {/* Mobile category selector */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-gray-200 flex overflow-x-auto">
        {CATEGORIES.map(cat => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex flex-col items-center gap-1 px-4 py-2 text-xs shrink-0 transition-colors ${
                cat.id === activeCategory ? 'text-blue-400' : 'text-gray-500'
              }`}
            >
              <Icon size={16} />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6 pb-20 lg:pb-6">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">API Documentation</h1>
          <p className="text-sm text-gray-400 mt-1">
            Integrate TestForge into your CI/CD pipeline, scripts, and custom tooling.
          </p>
        </div>

        {/* Category header */}
        <div className="flex items-center gap-3 mb-5">
          {(() => { const Icon = category.icon; return <Icon size={18} className="text-blue-400" />; })()}
          <div>
            <h2 className="text-base font-semibold text-gray-900">{category.label}</h2>
            <p className="text-xs text-gray-500">{category.endpoints.length} endpoint{category.endpoints.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Endpoint cards */}
        <div className="space-y-6">
          {category.endpoints.map(ep => (
            <EndpointCard key={ep.id} endpoint={ep} />
          ))}
        </div>
      </main>
    </div>
  );
}
