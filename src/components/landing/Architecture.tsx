import { ChevronDown } from 'lucide-react';

interface Layer {
  title: string;
  subtitle: string;
  color: string;
  border: string;
  dot: string;
  items: string[];
}

const layers: Layer[] = [
  {
    title: 'Your Devices & CI/CD',
    subtitle: 'Where tests originate',
    color: 'bg-blue-500/8',
    border: 'border-blue-500/25',
    dot: 'bg-blue-400',
    items: [
      'Physical devices — Android, iOS, embedded, IoT',
      'CI/CD pipelines — GitHub Actions, Jenkins, GitLab CI',
      'Connected via ADB, UART, SSH, USB, or Wi-Fi',
      'Any test framework that produces results',
    ],
  },
  {
    title: 'TestForge Agent / API',
    subtitle: 'Lightweight data collection layer',
    color: 'bg-purple-500/8',
    border: 'border-purple-500/25',
    dot: 'bg-purple-400',
    items: [
      'Lightweight agent installed once per test server',
      'REST API for direct result submission',
      'JUnit XML importer for any test framework',
      'Secure multi-tenant authentication',
    ],
  },
  {
    title: 'Processing Pipeline',
    subtitle: 'Intelligence layer',
    color: 'bg-amber-500/8',
    border: 'border-amber-500/25',
    dot: 'bg-amber-400',
    items: [
      'Log ingestion & pattern matching',
      'Crash deduplication by stack fingerprint',
      'AI-assisted root-cause analysis',
      'Flaky test detection across runs',
    ],
  },
  {
    title: 'Dashboard · Alerts · Reports',
    subtitle: 'Where your team gets answers',
    color: 'bg-emerald-500/8',
    border: 'border-emerald-500/25',
    dot: 'bg-emerald-400',
    items: [
      'Real-time pass/fail dashboard per device & build',
      'Slack, email, and PagerDuty alerts on regressions',
      'Weekly quality reports delivered automatically',
      'Jira ticket creation for critical crashes',
    ],
  },
];

export function Architecture() {
  return (
    <section id="architecture" className="py-24 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-blue-400 uppercase tracking-widest mb-4">
            Under the hood
          </p>
          <h2 className="section-title mb-4">
            Purpose-built architecture for{' '}
            <span className="text-gradient-blue">hardware test at scale.</span>
          </h2>
          <p className="section-subtitle">
            Every piece is designed for reliability, not complexity. Drop in TestForge wherever your tests run — nothing to rebuild.
          </p>
        </div>

        {/* Vertical pipeline */}
        <div className="flex flex-col items-center gap-0">
          {layers.map((layer, i) => (
            <div key={layer.title} className="w-full max-w-2xl flex flex-col items-center">
              {/* Card */}
              <div className={`w-full rounded-2xl border ${layer.border} ${layer.color} p-6`}>
                <div className="flex items-start gap-3 mb-4">
                  <div className={`w-2.5 h-2.5 rounded-full ${layer.dot} mt-1.5 shrink-0`} />
                  <div>
                    <h3 className="text-base font-bold text-white">{layer.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{layer.subtitle}</p>
                  </div>
                </div>
                <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2 pl-5">
                  {layer.items.map(item => (
                    <li key={item} className="text-sm text-gray-400 flex items-start gap-2">
                      <span className="text-gray-600 mt-1">·</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Arrow connector (not after last item) */}
              {i < layers.length - 1 && (
                <div className="flex flex-col items-center py-2">
                  <div className="w-px h-4 bg-white/10" />
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
