import { ActivitySquare, AlertTriangle, BarChart3, Boxes, Cpu, Workflow } from 'lucide-react';

const features = [
  {
    title: 'Real-Time Test Dashboard',
    description: 'Watch test results stream in as they execute. Pass rates, failure categories, and device-level breakdowns stay current while the run is still active.',
    icon: ActivitySquare,
  },
  {
    title: 'Automated Crash Triage',
    description: 'Crashes are fingerprinted, categorized, and grouped automatically. Jira tickets can be created with context instead of copied by hand.',
    icon: AlertTriangle,
  },
  {
    title: 'Device Health and Inventory',
    description: 'See every device in the lab with status, firmware version, heartbeat freshness, and connection type before you start a run.',
    icon: Cpu,
  },
  {
    title: 'Operations Management',
    description: 'Track flashing queues, device allocation, maintenance windows, and nightly schedules without a separate spreadsheet layer.',
    icon: Workflow,
  },
  {
    title: 'Trend Analytics',
    description: 'Compare pass rate over time by suite, device, and firmware build. Spot regressions before they spread across the lab.',
    icon: BarChart3,
  },
  {
    title: 'Integrations',
    description: 'Use the REST API, reporter script, or CI jobs to push results from any framework and connect the outcome to Slack or Jira.',
    icon: Boxes,
  },
];

export function Features() {
  return (
    <section id="features" className="bg-white px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">Features</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-slate-950">
            One system for lab operations, not just a place to dump test results.
          </h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {features.map(({ description, icon: Icon, title }) => (
            <div key={title} className="rounded-2xl border border-gray-200 bg-white p-8 shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-6 text-2xl font-semibold tracking-[-0.03em] text-slate-950">{title}</h3>
              <p className="mt-4 text-sm leading-7 text-slate-600">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
