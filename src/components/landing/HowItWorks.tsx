const steps = [
  {
    step: '01',
    title: 'Connect your existing output',
    copy: 'Use the reporter script or REST API to send JUnit XML, device heartbeats, and crash events from the tools you already run.',
  },
  {
    step: '02',
    title: 'Let TestForge normalize the lab',
    copy: 'Runs, devices, alerts, and crashes land in one schema so teams stop chasing context across files, tickets, and chat threads.',
  },
  {
    step: '03',
    title: 'Act from one operational view',
    copy: 'The dashboard, reports, and triage pages become the shared control plane for the lab instead of a retrospective report after the fact.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">How It Works</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-slate-950">
            Keep the framework. Replace the operational chaos around it.
          </h2>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {steps.map(step => (
            <div key={step.step} className="rounded-2xl border border-gray-200 bg-white p-8 shadow-card">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">{step.step}</p>
              <h3 className="mt-6 text-2xl font-semibold tracking-[-0.03em] text-slate-950">{step.title}</h3>
              <p className="mt-4 text-sm leading-7 text-slate-600">{step.copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
