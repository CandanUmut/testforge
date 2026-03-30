import { Quote } from 'lucide-react';

const testimonials = [
  {
    quote: 'TestForge cut our triage time from hours to minutes. When a kernel panic hits at 2am, we know exactly what failed and why before we\'ve even had coffee.',
    name: 'Senior Firmware Engineer',
    company: 'Series B IoT company (stealth)',
    initials: 'FE',
    color: 'text-blue-400 bg-blue-400/10',
  },
  {
    quote: 'We were maintaining three separate test frameworks for different device families. TestForge unified everything. Our CI now catches regressions before they hit QA.',
    name: 'Lead QA Engineer',
    company: 'Embedded systems startup',
    initials: 'QA',
    color: 'text-emerald-400 bg-emerald-400/10',
  },
  {
    quote: 'The flaky test detection alone saved us weeks. We had tests that were "probably fine" for 18 months. TestForge found 12 real intermittent failures hiding in there.',
    name: 'Engineering Manager',
    company: 'Hardware startup, Series A',
    initials: 'EM',
    color: 'text-purple-400 bg-purple-400/10',
  },
];

export function Testimonials() {
  return (
    <section className="py-24 px-4 sm:px-6 bg-gradient-to-b from-transparent to-white/[0.02]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-blue-400 uppercase tracking-widest mb-4">
            Early feedback
          </p>
          <h2 className="section-title mb-4">
            Engineers who've{' '}
            <span className="text-gradient-blue">been in the trenches.</span>
          </h2>
          <p className="text-gray-500 text-sm italic mt-2">
            Names anonymized — we're early. Ask us for references.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="glass-card p-6 flex flex-col">
              <Quote className="w-8 h-8 text-gray-700 mb-4" />
              <p className="text-gray-300 leading-relaxed flex-1 mb-6">"{t.quote}"</p>
              <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                <div className={`w-9 h-9 rounded-full ${t.color} flex items-center justify-center text-xs font-bold`}>
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
