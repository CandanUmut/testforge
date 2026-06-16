const tools = [
  'pytest',
  'Robot Framework',
  'JUnit XML',
  'Playwright',
  'Jest',
  'GitHub Actions',
  'Jenkins',
  'GitLab CI',
  'Jira',
  'Slack',
];

export function Integrations() {
  return (
    <section className="border-y border-slate-200 bg-slate-50/60 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
          Works with the stack you already run
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-3">
          {tools.map(tool => (
            <span
              key={tool}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-card-sm"
            >
              {tool}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
