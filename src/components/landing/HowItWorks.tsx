import { Plug, Cpu, Rocket } from 'lucide-react';

const steps = [
  {
    icon: Plug,
    number: '01',
    title: 'Connect',
    description: 'Push test results via our API, webhook, or install our lightweight agent. Works with any CI/CD pipeline, any device type.',
    code: `# Install TestForge agent
pip install testforge-agent

# Or push results via API
curl -X POST https://api.testforge.dev/v1/runs \\
  -H "Authorization: Bearer tf_live_..." \\
  -d '{"suite": "smoke", "device": "pixel-8-pro"}'`,
    colorClass: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  },
  {
    icon: Cpu,
    number: '02',
    title: 'Automate',
    description: 'TestForge automatically categorizes failures, detects flaky tests, triages crashes with AI, and monitors device health in real time.',
    code: `[TRIAGE] Crash fingerprint matched: "kernel-panic-dpm-suspend"
[AI] Root cause: race condition in power management driver
[AI] Suggested fix: Add mutex lock at dpm_suspend+0x234
[FLAKY] ble_connection_stability: 4/10 failures detected
[ALERT] Threshold breach: failure rate > 20% on feature/ble-v2`,
    colorClass: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  },
  {
    icon: Rocket,
    number: '03',
    title: 'Ship',
    description: 'Get real-time dashboards, automated weekly reports, and instant alerts. Know exactly what\'s broken before your customers do.',
    code: `📊 Weekly Report — March 17-23
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Test runs:     47  (+8 vs last week)
Pass rate:     82% (+4.2%)
Active devices: 5
New crashes:   3  (1 critical)
Resolved:      2
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[VIEW REPORT] testforge.dev/reports/2024-w12`,
    colorClass: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 px-4 sm:px-6 bg-gradient-to-b from-transparent to-white/[0.02]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-blue-400 uppercase tracking-widest mb-4">
            How it works
          </p>
          <h2 className="section-title mb-4">
            From chaos to clarity{' '}
            <span className="text-gradient-green">in three steps.</span>
          </h2>
          <p className="section-subtitle">
            TestForge is designed to plug into your existing workflow. No rip-and-replace, no week-long integration projects.
          </p>
        </div>

        <div className="space-y-8">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className={`glass-card p-0 overflow-hidden ${i % 2 === 0 ? '' : ''}`}>
                <div className={`grid lg:grid-cols-2 ${i % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}>
                  {/* Text side */}
                  <div className={`p-8 flex flex-col justify-center ${i % 2 !== 0 ? 'lg:order-2' : ''}`}>
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${step.colorClass} text-xs font-mono font-semibold w-fit mb-6`}>
                      Step {step.number}
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${step.colorClass}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-2xl font-bold text-white">{step.title}</h3>
                    </div>
                    <p className="text-gray-400 leading-relaxed">{step.description}</p>
                  </div>

                  {/* Code side */}
                  <div className={`bg-[#060609] border-l border-white/5 p-6 ${i % 2 !== 0 ? 'lg:order-1 lg:border-l-0 lg:border-r border-r-white/5' : ''}`}>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 rounded-full bg-red-500/60" />
                      <div className="w-2 h-2 rounded-full bg-amber-500/60" />
                      <div className="w-2 h-2 rounded-full bg-emerald-500/60" />
                      <span className="ml-2 text-xs text-gray-600 font-mono">terminal</span>
                    </div>
                    <pre className="font-mono text-xs text-gray-400 whitespace-pre-wrap leading-relaxed overflow-x-auto">
                      {step.code}
                    </pre>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
