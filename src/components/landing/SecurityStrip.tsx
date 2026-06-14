import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, KeyRound, FileCheck2, ServerOff, ArrowRight } from 'lucide-react';
import { PUBLIC_ROUTES } from '../../lib/routes';

const controls = [
  { label: 'Tenant isolation (RLS)', icon: Lock },
  { label: 'Hashed, revocable keys', icon: KeyRound },
  { label: 'Audit trail', icon: FileCheck2 },
  { label: 'On-prem option', icon: ServerOff },
];

export function SecurityStrip() {
  return (
    <section id="security" className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[32px] border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 px-8 py-12 shadow-[0_24px_60px_rgba(15,23,42,0.06)] sm:px-12">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-indigo-600" />
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">
                Enterprise-grade data protection
              </p>
            </div>
            <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">
              Built for unreleased hardware. Your devices, your data.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-slate-600">
              TestForge isolates every organization at the database layer, never exposes API key
              hashes, keeps a tamper-evident audit trail, and can run fully on-premise. We don&apos;t
              sell your data or train external models on it.
            </p>
            <Link
              to={PUBLIC_ROUTES.trust}
              className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-indigo-700"
            >
              Read about Trust &amp; Security
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {controls.map(({ label, icon: Icon }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-[0_12px_28px_rgba(15,23,42,0.05)]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium text-slate-900">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
