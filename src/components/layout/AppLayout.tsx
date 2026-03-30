import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, Bell, X } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { demoAlerts } from '../../utils/seedData';

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isDemoMode } = useAuth();
  const unread = demoAlerts.filter(a => !a.is_read).length;

  return (
    <div className="flex h-screen bg-[#0A0A0F] overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative flex flex-col w-60 flex-shrink-0 z-50">
            <Sidebar onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Demo banner */}
        {isDemoMode && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-between">
            <p className="text-amber-400 text-xs">
              <span className="font-semibold">Demo Mode</span> — You're viewing sample data. Connect Supabase credentials for real multi-tenant auth and data persistence.
            </p>
          </div>
        )}

        {/* Top bar */}
        <header className="h-14 border-b border-white/5 bg-[#0A0A0F] flex items-center justify-between px-4 flex-shrink-0">
          <button
            className="lg:hidden text-gray-400 hover:text-white"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1 lg:flex-none" />
          <div className="flex items-center gap-3">
            <button className="relative text-gray-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold">
                  {unread}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
