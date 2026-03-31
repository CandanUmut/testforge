import { Zap, Github } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { GITHUB_URL, AUTHOR_GITHUB } from '../../utils/constants';

function scrollTo(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function Footer() {
  const navigate = useNavigate();

  function scrollOrNavigate(id: string) {
    if (window.location.hash === '#/') {
      scrollTo(id);
    } else {
      navigate('/');
      setTimeout(() => scrollTo(id), 200);
    }
  }

  return (
    <footer className="border-t border-white/5 bg-[#0A0A0F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 font-bold text-lg mb-4">
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <span className="text-white">Test<span className="text-blue-400">Forge</span></span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              Test infrastructure that runs itself. Built for hardware teams who ship real products.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-300 mb-4">Product</p>
            <ul className="space-y-3">
              <li><button onClick={() => scrollOrNavigate('features')} className="text-gray-500 hover:text-gray-300 text-sm transition-colors text-left">Features</button></li>
              <li><button onClick={() => scrollOrNavigate('pricing')} className="text-gray-500 hover:text-gray-300 text-sm transition-colors text-left">Pricing</button></li>
              <li><button onClick={() => scrollOrNavigate('architecture')} className="text-gray-500 hover:text-gray-300 text-sm transition-colors text-left">Architecture</button></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-300 mb-4">Resources</p>
            <ul className="space-y-3">
              <li><Link to="/docs" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">API Reference</Link></li>
              <li><Link to="/setup" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">Setup Guide</Link></li>
              <li><a href={GITHUB_URL} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">GitHub</a></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-300 mb-4">Account</p>
            <ul className="space-y-3">
              <li><Link to="/login" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">Sign in</Link></li>
              <li><Link to="/signup" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">Start free trial</Link></li>
              <li><a href="mailto:hello@testforge.io" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">Contact us</a></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-white/5">
          <p className="text-gray-600 text-sm">
            © 2026 TestForge. All rights reserved.{' '}
            Built by{' '}
            <a href={AUTHOR_GITHUB} className="text-gray-400 hover:text-white transition-colors" target="_blank" rel="noreferrer">
              Umut Candan
            </a>
            .
          </p>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">Sign in</Link>
            <Link to="/signup" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">Sign up</Link>
            <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-white transition-colors">
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
