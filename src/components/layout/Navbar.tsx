import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Zap } from 'lucide-react';
import { PUBLIC_ROUTES, getAppPath } from '../../lib/routes';

const sectionLinks = [
  { label: 'Features', id: 'features' },
  { label: 'Architecture', id: 'architecture' },
  { label: 'Pricing', id: 'pricing' },
];

interface NavbarProps {
  onSelectSection: (id: string) => void;
}

export function Navbar({ onSelectSection }: NavbarProps) {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-gray-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to={PUBLIC_ROUTES.landing} className="flex items-center gap-3 font-semibold tracking-[-0.03em] text-lg text-slate-950">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
            <Zap className="h-4 w-4 text-indigo-600" />
          </div>
          <span>Test<span className="text-indigo-600">Forge</span></span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {sectionLinks.map(link => (
            <button
              key={link.id}
              type="button"
              onClick={() => onSelectSection(link.id)}
              className="text-sm font-medium text-slate-500 transition-colors duration-200 hover:text-slate-950"
            >
              {link.label}
            </button>
          ))}
          <Link
            to={PUBLIC_ROUTES.setupGuide}
            className="text-sm font-medium text-slate-500 transition-colors duration-200 hover:text-slate-950"
          >
            Setup Guide
          </Link>
          <Link
            to={PUBLIC_ROUTES.apiDocs}
            className="text-sm font-medium text-slate-500 transition-colors duration-200 hover:text-slate-950"
          >
            API Docs
          </Link>
        </div>

        {/* Auth buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link to={PUBLIC_ROUTES.login} className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-950">
            Sign in
          </Link>
          <Link
            to={getAppPath('demo')}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
          >
            See Live Demo
          </Link>
          <Link
            to={PUBLIC_ROUTES.signup}
            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
          >
            Start Free Trial
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-slate-500 hover:text-slate-950"
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-gray-200 bg-white px-4 py-5 md:hidden">
          <div className="flex flex-col gap-2">
            {sectionLinks.map(link => (
              <button
                key={link.id}
                type="button"
                className="rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-950"
                onClick={() => {
                  setOpen(false);
                  onSelectSection(link.id);
                }}
              >
                {link.label}
              </button>
            ))}
          </div>
          <div className="mt-4 flex flex-col gap-2 border-t border-slate-200 pt-4">
            <Link to={PUBLIC_ROUTES.setupGuide} className="rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-white hover:text-slate-950" onClick={() => setOpen(false)}>
              Setup Guide
            </Link>
            <Link to={PUBLIC_ROUTES.apiDocs} className="rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-white hover:text-slate-950" onClick={() => setOpen(false)}>
              API Docs
            </Link>
            <Link to={PUBLIC_ROUTES.login} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-center text-sm font-medium text-slate-700" onClick={() => setOpen(false)}>
              Sign in
            </Link>
            <Link to={getAppPath('demo')} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-center text-sm font-medium text-slate-700" onClick={() => setOpen(false)}>
              See Live Demo
            </Link>
            <Link to={PUBLIC_ROUTES.signup} className="rounded-xl bg-indigo-600 px-3 py-2 text-center text-sm font-medium text-white" onClick={() => setOpen(false)}>
              Start Free Trial
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
