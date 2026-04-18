import { Github, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GITHUB_URL, AUTHOR_GITHUB } from '../../utils/constants';
import { PUBLIC_ROUTES, getAppPath } from '../../lib/routes';

interface FooterProps {
  onSelectSection: (id: string) => void;
}

export function Footer({ onSelectSection }: FooterProps) {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-[1.6fr_repeat(3,minmax(0,1fr))]">
          <div>
            <div className="flex items-center gap-3 text-lg font-semibold tracking-[-0.03em] text-slate-950">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
                <Zap className="h-4 w-4 text-indigo-600" />
              </div>
              <span>Test<span className="text-indigo-600">Forge</span></span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-7 text-slate-600">
              Device health, test orchestration, crash triage, and lab operations in one platform for
              hardware, firmware, and software teams.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-950">Product</p>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <button type="button" onClick={() => onSelectSection('features')} className="block transition hover:text-slate-950">Features</button>
              <button type="button" onClick={() => onSelectSection('architecture')} className="block transition hover:text-slate-950">Architecture</button>
              <button type="button" onClick={() => onSelectSection('pricing')} className="block transition hover:text-slate-950">Pricing</button>
              <Link to={getAppPath('demo')} className="block transition hover:text-slate-950">Demo</Link>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-950">Resources</p>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <Link to={PUBLIC_ROUTES.setupGuide} className="block transition hover:text-slate-950">Setup Guide</Link>
              <Link to={PUBLIC_ROUTES.apiDocs} className="block transition hover:text-slate-950">API Docs</Link>
              <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="block transition hover:text-slate-950">GitHub</a>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-950">Company</p>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <Link to={PUBLIC_ROUTES.login} className="block transition hover:text-slate-950">Sign in</Link>
              <Link to={PUBLIC_ROUTES.signup} className="block transition hover:text-slate-950">Start Free Trial</Link>
              <a href="#" className="block transition hover:text-slate-950">Privacy Policy</a>
              <a href="#" className="block transition hover:text-slate-950">Terms of Service</a>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-slate-200 pt-8 text-sm text-slate-500 md:flex-row md:items-center">
          <p>
            © 2026 TestForge. Built by{' '}
            <a href={AUTHOR_GITHUB} className="text-slate-700 transition hover:text-slate-950" target="_blank" rel="noreferrer">
              Umut Candan
            </a>
          </p>
          <div className="flex items-center gap-4">
            <Link to={PUBLIC_ROUTES.setupGuide} className="transition hover:text-slate-950">Setup Guide</Link>
            <Link to={PUBLIC_ROUTES.apiDocs} className="transition hover:text-slate-950">API Docs</Link>
            <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="text-slate-500 transition hover:text-slate-950">
              <Github className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
