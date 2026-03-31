import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Zap } from 'lucide-react';

interface NavLink {
  label: string;
  sectionId?: string;   // scroll to this section id on landing page
  route?: string;        // navigate to this route
}

const links: NavLink[] = [
  { label: 'Features',     sectionId: 'features' },
  { label: 'Architecture', sectionId: 'architecture' },
  { label: 'Pricing',      sectionId: 'pricing' },
  { label: 'Docs',         route: '/docs' },
];

function scrollTo(sectionId: string) {
  const el = document.getElementById(sectionId);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isLanding = location.pathname === '/';

  function handleLink(link: NavLink) {
    setOpen(false);
    if (link.route) {
      navigate(link.route);
    } else if (link.sectionId) {
      if (isLanding) {
        scrollTo(link.sectionId);
      } else {
        // Navigate home first, then scroll
        navigate('/');
        setTimeout(() => scrollTo(link.sectionId!), 200);
      }
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0A0A0F]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
            <Zap className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-white">Test<span className="text-blue-400">Forge</span></span>
        </Link>

        {/* Desktop links */}
        {isLanding && (
          <div className="hidden md:flex items-center gap-6">
            {links.map(link => (
              <button
                key={link.label}
                onClick={() => handleLink(link)}
                className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
              >
                {link.label}
              </button>
            ))}
          </div>
        )}

        {/* Auth buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/login" className="text-sm text-gray-400 hover:text-white transition-colors">
            Sign in
          </Link>
          <Link to="/signup" className="btn-primary text-sm py-2 px-4">
            Start Free Trial
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-gray-400 hover:text-white"
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-white/5 bg-[#0A0A0F] px-4 py-4 flex flex-col gap-3">
          {isLanding && links.map(link => (
            <button
              key={link.label}
              onClick={() => handleLink(link)}
              className="text-gray-400 hover:text-white text-sm py-2 text-left"
            >
              {link.label}
            </button>
          ))}
          <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
            <Link to="/login" className="btn-secondary text-center text-sm" onClick={() => setOpen(false)}>Sign in</Link>
            <Link to="/signup" className="btn-primary text-center text-sm" onClick={() => setOpen(false)}>Start Free Trial</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
