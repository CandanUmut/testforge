import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, PlayCircle, Bug, FileText, Cpu,
  BarChart3, Settings, Zap, ChevronLeft, ChevronRight, Bell, LogOut, User,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { demoAlerts } from '../../utils/seedData';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Test Runs', path: '/test-runs', icon: PlayCircle },
  { label: 'Crash Triage', path: '/crash-triage', icon: Bug },
  { label: 'Log Explorer', path: '/logs', icon: FileText },
  { label: 'Devices', path: '/devices', icon: Cpu },
  { label: 'Reports', path: '/reports', icon: BarChart3 },
  { label: 'Settings', path: '/settings', icon: Settings },
];

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { pathname } = useLocation();
  const { organization, profile, signOut, isDemoMode } = useAuth();

  const unreadAlerts = demoAlerts.filter(a => !a.is_read).length;

  return (
    <aside className={`flex flex-col bg-[#0D0D1A] border-r border-white/5 transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'} h-full`}>
      {/* Logo */}
      <div className={`h-16 flex items-center border-b border-white/5 ${collapsed ? 'justify-center px-3' : 'px-4 justify-between'}`}>
        {!collapsed && (
          <Link to="/" className="flex items-center gap-2 font-bold">
            <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
              <Zap className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <span className="text-white text-sm">Test<span className="text-blue-400">Forge</span></span>
          </Link>
        )}
        {collapsed && (
          <Link to="/">
            <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-blue-400" />
            </div>
          </Link>
        )}
        <button
          onClick={() => { setCollapsed(!collapsed); onClose?.(); }}
          className="hidden lg:flex text-gray-600 hover:text-gray-400 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Demo mode banner */}
      {isDemoMode && !collapsed && (
        <div className="mx-3 mt-3 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <p className="text-amber-400 text-xs font-medium">Demo Mode</p>
          <p className="text-amber-400/70 text-[10px] mt-0.5">Connect Supabase for real data</p>
        </div>
      )}

      {/* Org info */}
      {!collapsed && organization && (
        <div className="px-4 py-3 border-b border-white/5">
          <p className="text-xs text-gray-500 mb-1">Organization</p>
          <p className="text-sm font-medium text-white truncate">{organization.name}</p>
          <span className="text-xs text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded mt-1 inline-block capitalize">
            {organization.plan}
          </span>
        </div>
      )}

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const active = pathname === item.path || pathname.startsWith(item.path + '/');

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              title={collapsed ? item.label : undefined}
              className={`${active ? 'sidebar-link-active' : 'sidebar-link'} ${collapsed ? 'justify-center' : ''}`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
              {!collapsed && item.path === '/crash-triage' && unreadAlerts > 0 && (
                <span className="ml-auto w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
                  {unreadAlerts}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-white/5 p-3">
        {!collapsed ? (
          <div className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-white/5 group">
            <div className="w-7 h-7 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
              <User className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">{profile?.full_name || 'User'}</p>
              <p className="text-[10px] text-gray-500 truncate">{profile?.email}</p>
            </div>
            <button
              onClick={signOut}
              className="text-gray-600 hover:text-red-400 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={signOut}
            className="w-full flex items-center justify-center text-gray-600 hover:text-red-400 transition-colors py-2"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
}
