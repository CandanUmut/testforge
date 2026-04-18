import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Minus } from 'lucide-react';
import { PUBLIC_ROUTES } from '../../lib/routes';

const features = [
  { name: 'Devices', starter: 'Up to 10', pro: 'Up to 50', enterprise: 'Unlimited' },
  { name: 'Users', starter: '5', pro: '15', enterprise: 'Unlimited' },
  { name: 'Test results', starter: '10,000/mo', pro: 'Unlimited', enterprise: 'Unlimited' },
  { name: 'Dashboard', starter: true, pro: true, enterprise: true },
  { name: 'Device health', starter: true, pro: true, enterprise: true },
  { name: 'Crash triage', starter: 'Basic', pro: 'AI-powered', enterprise: 'AI-powered' },
  { name: 'Jira integration', starter: false, pro: true, enterprise: true },
  { name: 'Slack alerts', starter: false, pro: true, enterprise: true },
  { name: 'API access', starter: 'Read only', pro: 'Full', enterprise: 'Full' },
  { name: 'Reports', starter: 'Weekly', pro: 'Custom + PDF', enterprise: 'Custom + PDF + API' },
  { name: 'Support', starter: 'Email', pro: 'Priority', enterprise: 'Dedicated engineer' },
  { name: 'On-premise', starter: false, pro: false, enterprise: true },
];

function FeatureValue({ value }: { value: boolean | string }) {
  if (value === true) return <Check className="h-4 w-4 text-emerald-500" />;
  if (value === false) return <Minus className="h-4 w-4 text-gray-300" />;
  return <span className="text-sm text-gray-700">{value}</span>;
}

export function Pricing() {
  const [annual, setAnnual] = useState(false);

  const starterPrice = annual ? '$159' : '$199';
  const proPrice = annual ? '$399' : '$499';

  return (
    <section id="pricing" className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">Pricing</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-slate-950">
            Simple pricing that scales with your lab.
          </h2>
        </div>

        {/* Toggle */}
        <div className="mt-10 flex items-center justify-center gap-3">
          <span className={`text-sm font-medium ${!annual ? 'text-slate-950' : 'text-slate-500'}`}>Monthly</span>
          <button
            type="button"
            onClick={() => setAnnual(!annual)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${annual ? 'bg-indigo-600' : 'bg-gray-300'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${annual ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
          <span className={`text-sm font-medium ${annual ? 'text-slate-950' : 'text-slate-500'}`}>
            Annual <span className="text-emerald-600 font-semibold">(Save 20%)</span>
          </span>
        </div>

        {/* Cards */}
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {/* Starter */}
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-card">
            <h3 className="text-xl font-semibold text-slate-950">Starter</h3>
            <p className="mt-4">
              <span className="text-4xl font-bold tracking-tight text-slate-950">{starterPrice}</span>
              <span className="text-sm text-gray-500">/month</span>
            </p>
            <p className="mt-2 text-sm text-gray-500">Up to 10 devices, 5 users</p>
            <Link
              to={PUBLIC_ROUTES.signup}
              className="mt-6 block rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-center text-sm font-medium text-slate-700 transition hover:bg-gray-50 hover:scale-[1.02]"
            >
              Start Free Trial
            </Link>
          </div>

          {/* Professional - Highlighted */}
          <div className="relative rounded-2xl border-2 border-indigo-600 bg-white p-8 shadow-card-lg">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">
              Most Popular
            </div>
            <h3 className="text-xl font-semibold text-slate-950">Professional</h3>
            <p className="mt-4">
              <span className="text-4xl font-bold tracking-tight text-slate-950">{proPrice}</span>
              <span className="text-sm text-gray-500">/month</span>
            </p>
            <p className="mt-2 text-sm text-gray-500">Up to 50 devices, 15 users, AI triage</p>
            <Link
              to={PUBLIC_ROUTES.signup}
              className="mt-6 block rounded-lg bg-indigo-600 px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-indigo-700 hover:scale-[1.02]"
            >
              Start Free Trial
            </Link>
          </div>

          {/* Enterprise */}
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-card">
            <h3 className="text-xl font-semibold text-slate-950">Enterprise</h3>
            <p className="mt-4">
              <span className="text-4xl font-bold tracking-tight text-slate-950">Custom</span>
            </p>
            <p className="mt-2 text-sm text-gray-500">Unlimited devices, on-prem, dedicated support</p>
            <Link
              to={PUBLIC_ROUTES.signup}
              className="mt-6 block rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-center text-sm font-medium text-slate-700 transition hover:bg-gray-50 hover:scale-[1.02]"
            >
              Contact Us
            </Link>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="mt-12 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-card">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-6 py-4 text-sm font-semibold text-gray-900">Feature</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Starter</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-indigo-600">Professional</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Enterprise</th>
              </tr>
            </thead>
            <tbody>
              {features.map((f, i) => (
                <tr key={f.name} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                  <td className="px-6 py-3 text-sm font-medium text-gray-700">{f.name}</td>
                  <td className="px-6 py-3 text-center"><FeatureValue value={f.starter} /></td>
                  <td className="px-6 py-3 text-center"><FeatureValue value={f.pro} /></td>
                  <td className="px-6 py-3 text-center"><FeatureValue value={f.enterprise} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pipeline callout */}
        <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-8 shadow-card">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">TestForge Pipeline</p>
          <h3 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
            Need the full pipeline?
          </h3>
          <p className="mt-3 text-sm leading-7 text-gray-600">
            We build and maintain your end-to-end test automation infrastructure — firmware flashing, orchestration, validation, and reporting.
            Setup fee scoped per engagement (typically $5K-$25K). Monthly maintenance $2K-$10K depending on device count and complexity.
          </p>
          <Link to={PUBLIC_ROUTES.signup} className="mt-4 inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-700">
            Talk to us &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
