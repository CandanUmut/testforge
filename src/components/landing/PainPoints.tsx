import { AlertTriangle, CheckCircle } from 'lucide-react';

const painPoints = [
  {
    pain: 'Your test infrastructure was built by whoever had time, and now nobody understands it.',
    fix: 'TestForge gives you a clean, documented platform that any engineer can operate.',
  },
  {
    pain: 'Crash logs sit in a shared drive. Triage happens in someone\'s head.',
    fix: 'AI-powered crash triage groups failures by fingerprint and suggests root causes automatically.',
  },
  {
    pain: 'You find out about regressions when QA emails you on Friday afternoon.',
    fix: 'Real-time alerts and automated reporting surface failures the moment they happen.',
  },
  {
    pain: 'Every new device type means rebuilding your test pipeline from scratch.',
    fix: 'Universal device support. Connect any device — Android, IoT, embedded, web — through a single platform.',
  },
];

export function PainPoints() {
  return (
    <section className="py-24 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-blue-400 uppercase tracking-widest mb-4">
            Sound familiar?
          </p>
          <h2 className="section-title mb-4">
            The test automation tax is{' '}
            <span className="text-gradient-blue">real.</span>
          </h2>
          <p className="section-subtitle">
            Hardware teams spend 30–50% of engineering time maintaining test infrastructure instead of building products. We built TestForge to fix that.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {painPoints.map((item, i) => (
            <div key={i} className="glass-card p-6 group hover:border-white/15 transition-all duration-300">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center mt-0.5">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                </div>
                <div>
                  <p className="text-gray-300 leading-relaxed mb-4">
                    "{item.pain}"
                  </p>
                  <div className="flex items-start gap-2 pt-4 border-t border-white/5">
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <p className="text-emerald-400 text-sm leading-relaxed">
                      {item.fix}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
