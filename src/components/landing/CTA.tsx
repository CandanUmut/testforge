import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Mail } from 'lucide-react';

export function CTA() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (email) setSubmitted(true);
  }

  return (
    <section className="py-24 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <div className="glass-card p-10 sm:p-16 text-center relative overflow-hidden glow-blue">
          {/* Background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to stop firefighting and{' '}
              <span className="text-gradient-blue">start shipping?</span>
            </h2>
            <p className="text-gray-400 mb-10 text-lg">
              Join hardware teams already using TestForge to ship with confidence.
            </p>

            {!submitted ? (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-6">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="input-field pl-10"
                    required
                  />
                </div>
                <button type="submit" className="btn-primary flex items-center justify-center gap-2 whitespace-nowrap">
                  Start Free Trial
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <div className="flex flex-col items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-emerald-400" />
                </div>
                <p className="text-emerald-400 font-medium">Check your email — we'll be in touch shortly.</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup" className="btn-primary flex items-center gap-2">
                Create Free Account
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/dashboard" className="btn-secondary flex items-center gap-2">
                Explore Demo Dashboard
              </Link>
            </div>

            <p className="text-gray-600 text-sm mt-6">
              No credit card required. 14-day free trial on Professional plan.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
