import { Link } from 'react-router-dom';
import { ArrowRight, Monitor, Workflow } from 'lucide-react';
import { PUBLIC_ROUTES } from '../../lib/routes';

const tiers = [
  {
    title: 'TestForge Dashboard',
    summary: 'Connect your existing test framework. Get instant visibility.',
    icon: Monitor,
    accent: 'bg-blue-50 text-indigo-600',
    points: [
      'Push results through a standard API',
      'Works with JUnit XML, Robot Framework, pytest, and custom scripts',
      'Real-time dashboards, crash triage, and device health monitoring',
      'Automated Jira and Slack workflows',
    ],
    ctaLabel: 'Start Free Trial',
    ctaTo: PUBLIC_ROUTES.signup,
    price: 'Starting at $199/month',
  },
  {
    title: 'TestForge Pipeline',
    summary: 'We build and maintain your entire test automation pipeline.',
    icon: Workflow,
    accent: 'bg-emerald-50 text-emerald-700',
    points: [
      'Custom firmware flashing -> testing -> reporting pipeline',
      'Parallel multi-device orchestration and nightly automation',
      'Device provisioning, recovery, and maintenance workflows',
      'Ongoing support from the team that designed the system',
    ],
    ctaLabel: 'Contact Us',
    ctaTo: PUBLIC_ROUTES.signup,
    price: 'Custom scoping — talk to us',
  },
];

export function PlatformOverview() {
  return (
    <section id="platform" className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">Two Service Tiers</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-slate-950">
            Start with visibility. Expand into a managed pipeline when you need it.
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            TestForge is built to fit teams at two stages: teams that already have a framework and
            need operational visibility, and teams that want the entire flashing-to-reporting pipeline handled.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {tiers.map(({ accent, ctaLabel, ctaTo, icon: Icon, points, price, summary, title }) => (
            <div key={title} className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_20px_48px_rgba(15,23,42,0.06)]">
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${accent}`}>
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-8 text-2xl font-semibold tracking-[-0.03em] text-slate-950">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{summary}</p>
              <ul className="mt-6 space-y-3 text-sm leading-7 text-slate-700">
                {points.map(point => (
                  <li key={point}>• {point}</li>
                ))}
              </ul>
              <div className="mt-8 flex items-center justify-between gap-4 border-t border-slate-200 pt-6">
                <p className="text-sm font-medium text-slate-950">{price}</p>
                <Link to={ctaTo} className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 transition hover:text-blue-800">
                  {ctaLabel}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
