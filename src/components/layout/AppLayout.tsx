import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu, Bell, X, Search } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { useDataContext } from '../../contexts/DataContext';
import {
  CommandPalette,
  CommandPaletteProvider,
  useCommandPalette,
} from '../common/CommandPalette';
import {
  NotificationCenter,
  NotificationProvider,
  useNotifications,
} from '../common/NotificationCenter';

// ─── Inner layout (needs access to the context hooks) ────────────────────────

function AppLayoutInner() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isDemoMode } = useDataContext();
  const location = useLocation();
  const { setOpen: openPalette } = useCommandPalette();
  const { unreadCount, setOpen: openNotifications } = useNotifications();

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Always-present overlays (hidden until triggered) */}
      <CommandPalette />
      <NotificationCenter />

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative flex flex-col w-60 flex-shrink-0 z-50">
            <Sidebar onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Demo banner */}
        {isDemoMode && (
          <div className="bg-indigo-50 border-b border-indigo-200 px-4 py-2 flex items-center justify-between">
            <p className="text-indigo-700 text-xs">
              <span className="font-semibold">Demo Mode</span> — You&apos;re viewing sample data.
              Connect Supabase credentials for real multi-tenant auth and data persistence.
            </p>
          </div>
        )}

        {/* Top bar */}
        <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-4 flex-shrink-0">
          {/* Mobile hamburger */}
          <button
            className="lg:hidden text-gray-500 hover:text-gray-900"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Spacer on mobile; ⌘K hint on desktop */}
          <div className="flex-1 flex items-center lg:justify-end">
            {/* ⌘K hint button — hidden on mobile */}
            <button
              onClick={() => openPalette(true)}
              className="
                hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg
                bg-gray-50 hover:bg-gray-100 border border-gray-200
                text-gray-500 hover:text-gray-700
                text-xs transition-colors
                mr-2
              "
              aria-label="Open command palette"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search</span>
              <kbd className="ml-1 font-mono tracking-tight text-[10px] text-gray-400">⌘K</kbd>
            </button>
          </div>

          {/* Right-side actions */}
          <div className="flex items-center gap-3">
            {/* Bell / notification toggle */}
            <button
              onClick={() => openNotifications(true)}
              className="relative text-gray-500 hover:text-gray-900 transition-colors"
              aria-label="Open notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Page content — keyed by pathname for transition */}
        <main className="flex-1 overflow-auto">
          <div key={location.pathname} className="animate-fade-in h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

// ─── Public export — wraps with both providers ────────────────────────────────

export function AppLayout() {
  return (
    <CommandPaletteProvider>
      <NotificationProvider>
        <AppLayoutInner />
      </NotificationProvider>
    </CommandPaletteProvider>
  );
}
