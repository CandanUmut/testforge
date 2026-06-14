import { Cloud, Server, FileSpreadsheet, Check } from 'lucide-react';

const alternatives = [
  {
    title: 'Cloud device farms',
    examples: 'BrowserStack, Sauce Labs, AWS Device Farm',
    copy: 'Rent their browsers and phones in the cloud for web and mobile apps. They never touch your custom hardware, firmware, or pre-release silicon.',
    icon: Cloud,
  },
  {
    title: 'Heavy HIL test rigs',
    examples: 'NI, dSPACE, Vector',
    copy: 'Powerful real-time simulation for automotive and aerospace, but expensive, integrator-led, and a rip-and-replace of how your lab already works.',
    icon: Server,
  },
  {
    title: 'Spreadsheets & scripts',
    examples: 'The status quo',
    copy: 'Device inventory in a sheet, results in Slack, triage by hand every Monday. Free to start, impossible to scale, and invisible until something breaks.',
    icon: FileSpreadsheet,
  },
];

const advantages = [
  'Manages your own physical lab — custom hardware, firmware, embedded and IoT',
  'A lightweight software control plane, not a rip-and-replace rig',
  'Connects to the framework you already run — JUnit XML, pytest, Robot, custom',
  'Real-time device health, orchestration, and agentic crash triage in one place',
  'Your devices, your data — built for NDAs and pre-release hardware',
  'Built by a hardware test engineer, not a web shop or a large integrator',
];

export function WhereWeFit() {
  return (
    <section id="why-testforge" className="bg-gray-50 px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">Where TestForge Fits</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-slate-950">
            Not a cloud device farm. Not a six-figure HIL rig. Mission control for the lab you already have.
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            Most testing tools were built for someone else&apos;s problem. TestForge sits in the gap they
            all leave open: the operations and observability layer for an in-house hardware and firmware lab.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {alternatives.map(({ copy, examples, icon: Icon, title }) => (
            <div key={title} className="rounded-2xl border border-gray-200 bg-white p-8 shadow-card">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-6 text-xl font-semibold tracking-tight text-slate-950">{title}</h3>
              <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">{examples}</p>
              <p className="mt-4 text-sm leading-7 text-slate-600">{copy}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-[28px] border-2 border-indigo-600 bg-white p-8 shadow-card-lg sm:p-10">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">TestForge</span>
            <h3 className="text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              The operations layer for your physical test lab
            </h3>
          </div>
          <div className="mt-8 grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {advantages.map(point => (
              <div key={point} className="flex items-start gap-3">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                <p className="text-sm leading-7 text-slate-700">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
