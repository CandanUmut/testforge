import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PUBLIC_ROUTES, getAppPath } from '../../lib/routes';

export function CTA() {
  const [email, setEmail] = useState('');

  return (
    <section id="cta" className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl rounded-3xl bg-gradient-to-br from-indigo-600 to-indigo-700 px-8 py-16 text-center shadow-card-lg sm:px-14">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Ready to stop firefighting and start shipping?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-indigo-100">
          Start with the live demo, then wire your first reporter integration.
          Make test and task automation visible, efficient, and usable.
        </p>

        <div className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 rounded-lg border border-indigo-400/30 bg-white/10 px-4 py-3 text-sm text-white placeholder-indigo-200 backdrop-blur-sm focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-white/20"
          />
          <Link
            to={PUBLIC_ROUTES.signup}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50 hover:scale-[1.02]"
          >
            Start Free Trial
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <p className="mt-4 text-sm text-indigo-200">
          14-day free trial on Professional plan. No credit card required.
        </p>

        <div className="mt-6">
          <Link
            to={getAppPath('demo')}
            className="text-sm font-medium text-white/80 underline underline-offset-4 transition hover:text-white"
          >
            Or explore the live demo first
          </Link>
        </div>
      </div>
    </section>
  );
}
