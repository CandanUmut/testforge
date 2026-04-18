import { Bot, Boxes, ClipboardList, Siren } from 'lucide-react';

const painPoints = [
  {
    title: 'AI ships code. Who tests it?',
    copy: 'AI-assisted development means more PRs, more builds, and more features shipped faster than your test team can validate. Every untested build compounds risk.',
    icon: Bot,
  },
  {
    title: 'Tracking devices in a spreadsheet',
    copy: 'You have 200 devices in the lab. Half are in drawers, some are flashed with old firmware, and nobody knows which ones are available right now.',
    icon: Boxes,
  },
  {
    title: 'Manual crash triage every Monday',
    copy: 'Someone spends half the week reading crash logs, deduplicating failures, and filing Jira tickets by hand. Every week. For every build.',
    icon: ClipboardList,
  },
  {
    title: 'No visibility until it is too late',
    copy: 'You find out a device has been offline for 3 days when a test run fails. You discover a regression after 50 builds have shipped.',
    icon: Siren,
  },
];

export function PainPoints() {
  return (
    <section id="pain-points" className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">Sound familiar?</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-slate-950">
            The lab still runs on spreadsheets, Slack messages, and tribal knowledge.
          </h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {painPoints.map(({ copy, icon: Icon, title }) => (
            <div key={title} className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-6 text-2xl font-semibold tracking-[-0.03em] text-slate-950">{title}</h3>
              <p className="mt-4 text-sm leading-7 text-slate-600">{copy}</p>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-10 max-w-3xl text-center text-sm leading-7 text-slate-500">
          TestForge was built by a test automation engineer who lived these problems for 6 years.
          It exists because none of the existing tools solved them cleanly.
        </p>
      </div>
    </section>
  );
}
