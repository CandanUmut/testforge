const testimonials = [
  {
    quote: 'We went from spending 2 days a week on crash triage to 2 hours. The automated stack trace deduplication alone paid for itself.',
    role: 'Test Lead, Mobile Device Lab',
  },
  {
    quote: 'Setting up firmware validation used to take a new engineer 3 months to learn. With a proper pipeline, we were running automated nightly tests in the first week.',
    role: 'Engineering Manager, Embedded Systems',
  },
  {
    quote: 'We test across 30 device variants nightly now instead of 5 manually. That is the difference between catching a regression before release and after.',
    role: 'QA Director, Consumer Electronics',
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="bg-white px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">What Teams Say</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-slate-950">
            Based on real problems solved during 6 years of test automation engineering.
          </h2>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {testimonials.map(item => (
            <blockquote key={item.role} className="rounded-2xl border border-gray-200 bg-white p-8 shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover">
              <div className="mb-4 text-indigo-400 text-3xl leading-none">"</div>
              <p className="text-base leading-7 text-gray-700">{item.quote}</p>
              <footer className="mt-6 text-sm font-medium text-gray-500 border-t border-gray-100 pt-4">{item.role}</footer>
            </blockquote>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-gray-400 italic">
          These are representative quotes based on real problems — not customer testimonials.
        </p>
      </div>
    </section>
  );
}
