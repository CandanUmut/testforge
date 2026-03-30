import {
  Cpu, Brain, GitBranch, LayoutDashboard, Search, Zap,
  Shuffle, GitMerge, FileBarChart, Users, Code2, BatteryCharging,
} from 'lucide-react';

const features = [
  {
    icon: Cpu,
    title: 'Universal Device Support',
    description: 'Android, iOS, embedded, IoT, web. Connect any device type through USB, ADB, UART, SSH, or API.',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10 border-blue-400/20',
  },
  {
    icon: Brain,
    title: 'Automated Crash Triage',
    description: 'AI-powered root cause analysis. TestForge groups crashes by fingerprint, identifies patterns, and suggests fixes.',
    color: 'text-purple-400',
    bg: 'bg-purple-400/10 border-purple-400/20',
  },
  {
    icon: GitBranch,
    title: 'Parallel Test Orchestration',
    description: 'Run tests across multiple devices simultaneously. Manage flashing, power cycling, and execution in parallel.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10 border-emerald-400/20',
  },
  {
    icon: LayoutDashboard,
    title: 'Live Dashboard',
    description: 'Real-time test results, pass/fail trends, device status, and failure categories. Shareable with your whole team.',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10 border-blue-400/20',
  },
  {
    icon: Search,
    title: 'Smart Log Analysis',
    description: 'Search, filter, and correlate logs across devices and test runs. Automatic error pattern detection.',
    color: 'text-amber-400',
    bg: 'bg-amber-400/10 border-amber-400/20',
  },
  {
    icon: Zap,
    title: 'Firmware Validation Pipeline',
    description: 'Automated flash → test → report cycle. Validate every build before it ships.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10 border-emerald-400/20',
  },
  {
    icon: Shuffle,
    title: 'Flaky Test Detection',
    description: 'Automatically identifies intermittently failing tests and separates real bugs from environment issues.',
    color: 'text-pink-400',
    bg: 'bg-pink-400/10 border-pink-400/20',
  },
  {
    icon: GitMerge,
    title: 'CI/CD Integration',
    description: 'GitHub Actions, Jenkins, GitLab CI, CircleCI. Webhook API for custom integrations.',
    color: 'text-gray-300',
    bg: 'bg-gray-300/10 border-gray-300/20',
  },
  {
    icon: FileBarChart,
    title: 'Automated Reports',
    description: 'Weekly and monthly quality reports delivered to your inbox. PDF exports, Slack digests, Jira integration.',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10 border-blue-400/20',
  },
  {
    icon: Users,
    title: 'Multi-Tenant Portal',
    description: 'Each client gets their own isolated dashboard with role-based access. White-label ready.',
    color: 'text-purple-400',
    bg: 'bg-purple-400/10 border-purple-400/20',
  },
  {
    icon: Code2,
    title: 'API-First Architecture',
    description: 'Everything available via REST API. Build custom workflows, integrations, and automation on top.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10 border-emerald-400/20',
  },
  {
    icon: BatteryCharging,
    title: 'Power State Validation',
    description: 'Automated suspend/resume, deep sleep, and wake source testing. Catch power management regressions early.',
    color: 'text-amber-400',
    bg: 'bg-amber-400/10 border-amber-400/20',
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-blue-400 uppercase tracking-widest mb-4">
            Platform capabilities
          </p>
          <h2 className="section-title mb-4">
            Everything your test team needs,{' '}
            <span className="text-gradient-blue">nothing they don't.</span>
          </h2>
          <p className="section-subtitle">
            Built by engineers who've spent years fighting the same problems at scale. Every feature solves a real pain point.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div key={i} className="glass-card-hover p-6 group">
                <div className={`w-10 h-10 rounded-xl border ${feature.bg} flex items-center justify-center mb-4`}>
                  <Icon className={`w-5 h-5 ${feature.color}`} />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
