import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  Database,
  Server,
  KeyRound,
  EyeOff,
  Activity,
  FileCheck2,
  ArrowRight,
  Mail,
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { PUBLIC_ROUTES, getAppPath } from '../lib/routes';

const pillars = [
  {
    title: 'You own your data',
    icon: Database,
    copy: 'Test results, device inventory, crash logs, and firmware metadata belong to you. We never sell data, never train external models on it, and you can export or delete it at any time.',
  },
  {
    title: 'Tenant isolation by default',
    icon: Lock,
    copy: 'Every organization is isolated at the database layer with PostgreSQL Row Level Security. A row is only ever readable by the tenant that owns it — enforced in the data layer, not just the app.',
  },
  {
    title: 'Authentication & access control',
    icon: KeyRound,
    copy: 'Auth is handled by Supabase with role-based access inside each organization. API access uses scoped keys, and read-only keys are available for CI and reporting integrations.',
  },
  {
    title: 'Built for NDAs & pre-release hardware',
    icon: EyeOff,
    copy: 'TestForge was built in a lab full of unreleased devices. It is designed for teams under NDA: minimal data collection, no public exposure of device or build identifiers, and private-by-default projects.',
  },
  {
    title: 'Cloud or on-premise',
    icon: Server,
    copy: 'Run on our managed cloud, or deploy fully on-premise on the Enterprise tier so test data and device telemetry never leave your network. The agent and reporter run inside your lab.',
  },
  {
    title: 'Reliability & visibility',
    icon: Activity,
    copy: 'Device heartbeats, run history, and alerts give you an auditable operational record. Weekly reports and exportable history mean nothing depends on a single person’s memory.',
  },
];

const faqs = [
  {
    q: 'Where is my test data stored?',
    a: 'On the managed plans, data is stored in our Supabase-backed cloud. On the Enterprise tier you can deploy entirely on-premise, keeping all test and device data inside your own network.',
  },
  {
    q: 'Do you train AI models on my data?',
    a: 'No. Crash fingerprinting and triage run on your data to serve you. We do not use customer test data, logs, or device information to train external or shared models.',
  },
  {
    q: 'Can I export or delete everything?',
    a: 'Yes. Your data is exportable through the API at any time, and on request we will permanently delete your organization’s data.',
  },
  {
    q: 'How do I report a security issue?',
    a: 'Email security@testforge.dev with details. We practice responsible disclosure and will acknowledge reports promptly and work with you on a fix.',
  },
];

export function Trust() {
  const navigate = useNavigate();

  // Section links in the shared nav/footer point at landing-page anchors.
  function goToSection(sectionId: string) {
    navigate(PUBLIC_ROUTES.landing);
    window.setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <Navbar onSelectSection={goToSection} />

      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-16 pt-32 sm:px-6 lg:px-8">
        <div className="absolute inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.10),_transparent_40%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.07),_transparent_32%)]" />
        <div className="mx-auto max-w-4xl text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
            <ShieldCheck className="h-6 w-6 text-indigo-600" />
          </div>
          <p className="mt-8 text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">Trust &amp; Security</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-6xl">
            Your devices. Your data. Your lab.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Hardware and firmware teams work on things the world has not seen yet. TestForge is built
            for that reality — private by default, isolated by design, and deployable inside your own
            network.
          </p>
        </div>
      </section>

      {/* Pillars */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {pillars.map(({ copy, icon: Icon, title }) => (
              <div key={title} className="rounded-2xl border border-gray-200 bg-white p-8 shadow-card">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-6 text-xl font-semibold tracking-tight text-slate-950">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance roadmap */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[28px] border border-slate-200 bg-gray-50 p-8 shadow-card sm:p-10">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <FileCheck2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-slate-950">Compliance roadmap</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
                We believe in being honest about where we are. TestForge already enforces tenant
                isolation, role-based access, and encrypted transport. <span className="font-semibold text-slate-900">SOC 2 Type II</span> and a
                formal data processing agreement are on our roadmap as we onboard our first enterprise
                customers. If you have a specific compliance requirement, talk to us early — we will
                tell you plainly what we can support today.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950">Security questions, answered</h2>
          <div className="mt-8 space-y-4">
            {faqs.map(faq => (
              <div key={faq.q} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-card">
                <h3 className="text-base font-semibold text-slate-950">{faq.q}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">{faq.a}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-card sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-indigo-600" />
              <p className="text-sm text-slate-600">
                Security questions or disclosures: <span className="font-semibold text-slate-900">security@testforge.dev</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to={getAppPath('demo')}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
              >
                See Live Demo
              </Link>
              <Link
                to={PUBLIC_ROUTES.signup}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
              >
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer onSelectSection={goToSection} />
    </div>
  );
}
