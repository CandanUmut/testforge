import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
  useRef,
} from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bug,
  XCircle,
  WifiOff,
  AlertTriangle,
  Shuffle,
  GitBranch,
  Bell,
  Check,
  X,
  CheckCheck,
} from 'lucide-react';
import { demoAlerts } from '../../lib/demo-data';
import type { Alert, AlertType } from '../../lib/types';
import { useDataContext } from '../../contexts/DataContext';

// ─── Alert type → icon / colour config ───────────────────────────────────────

interface AlertConfig {
  icon: React.ReactNode;
  bgClass: string;
  textClass: string;
}

function getAlertConfig(type: AlertType): AlertConfig {
  switch (type) {
    case 'crash_detected':
      return { icon: <Bug className="w-4 h-4" />, bgClass: 'bg-red-500/15', textClass: 'text-red-400' };
    case 'test_failure':
      return { icon: <XCircle className="w-4 h-4" />, bgClass: 'bg-amber-500/15', textClass: 'text-amber-400' };
    case 'device_offline':
      return { icon: <WifiOff className="w-4 h-4" />, bgClass: 'bg-gray-500/15', textClass: 'text-gray-400' };
    case 'threshold_breach':
      return { icon: <AlertTriangle className="w-4 h-4" />, bgClass: 'bg-amber-500/15', textClass: 'text-amber-400' };
    case 'flaky_test':
      return { icon: <Shuffle className="w-4 h-4" />, bgClass: 'bg-blue-500/15', textClass: 'text-blue-400' };
    case 'build_failed':
      return { icon: <GitBranch className="w-4 h-4" />, bgClass: 'bg-red-500/15', textClass: 'text-red-400' };
    case 'system':
    default:
      return { icon: <Bell className="w-4 h-4" />, bgClass: 'bg-blue-500/15', textClass: 'text-blue-400' };
  }
}

// ─── Route mapping ─────────────────────────────────────────────────────────────

function alertPath(type: AlertType, getScopedPath: (section?: 'dashboard' | 'test-runs' | 'devices' | 'crash-triage' | 'logs' | 'reports' | 'settings') => string): string {
  switch (type) {
    case 'crash_detected':   return getScopedPath('crash-triage');
    case 'test_failure':     return getScopedPath('test-runs');
    case 'device_offline':   return getScopedPath('devices');
    case 'threshold_breach': return getScopedPath('reports');
    case 'flaky_test':       return getScopedPath('test-runs');
    case 'build_failed':     return getScopedPath('test-runs');
    case 'system':           return getScopedPath('dashboard');
    default:                 return getScopedPath('dashboard');
  }
}

// ─── Relative time helper ─────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'yesterday';
  return `${days}d ago`;
}

// ─── Time-bucket grouping ─────────────────────────────────────────────────────

type TimeBucket = 'Today' | 'Yesterday' | 'This Week' | 'Older';

function timeBucket(iso: string): TimeBucket {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = diff / 3600000;
  if (hours < 24) return 'Today';
  if (hours < 48) return 'Yesterday';
  if (hours < 168) return 'This Week';
  return 'Older';
}

const BUCKET_ORDER: TimeBucket[] = ['Today', 'Yesterday', 'This Week', 'Older'];

// ─── Context / hook ───────────────────────────────────────────────────────────

interface NotificationState {
  unreadCount: number;
  notifications: Alert[];
  markAllRead: () => void;
  markRead: (id: string) => void;
  open: boolean;
  setOpen: (v: boolean) => void;
}

const NotificationContext = createContext<NotificationState>({
  unreadCount: 0,
  notifications: [],
  markAllRead: () => {},
  markRead: () => {},
  open: false,
  setOpen: () => {},
});

export function useNotifications() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Alert[]>(() =>
    [...demoAlerts].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
  );
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, is_read: true } : n)),
    );
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  }, []);

  return (
    <NotificationContext.Provider value={{ unreadCount, notifications, markAllRead, markRead, open, setOpen }}>
      {children}
    </NotificationContext.Provider>
  );
}

// ─── Panel UI ─────────────────────────────────────────────────────────────────

export function NotificationCenter() {
  const { open, setOpen, notifications, unreadCount, markAllRead, markRead } = useNotifications();
  const navigate = useNavigate();
  const { getScopedPath } = useDataContext();
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, setOpen]);

  const handleNotificationClick = (n: Alert) => {
    markRead(n.id);
    setOpen(false);
    navigate(alertPath(n.type, getScopedPath));
  };

  // Group notifications by time bucket
  const grouped = BUCKET_ORDER.reduce<{ bucket: TimeBucket; items: Alert[] }[]>(
    (acc, bucket) => {
      const items = notifications.filter(n => timeBucket(n.created_at) === bucket);
      if (items.length > 0) acc.push({ bucket, items });
      return acc;
    },
    [],
  );

  if (!open) return null;

  return (
    <>
      {/* Backdrop (mobile only) */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm sm:hidden"
        onClick={() => setOpen(false)}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="
          fixed top-0 right-0 h-full z-50
          w-full sm:w-96
          bg-white border-l border-gray-200
          flex flex-col
          shadow-2xl
          animate-slide-in-right
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-gray-900 font-semibold text-base">Notifications</h2>
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 text-white text-[10px] font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
            <button
              onClick={() => setOpen(false)}
              className="ml-1 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-500 py-16">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <Check className="w-6 h-6 text-emerald-400" />
              </div>
              <p className="text-sm font-medium text-gray-700">All caught up!</p>
              <p className="text-xs text-gray-500">No notifications to show</p>
            </div>
          ) : (
            grouped.map(({ bucket, items }) => (
              <div key={bucket}>
                {/* Bucket header */}
                <p className="px-5 pt-4 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-600">
                  {bucket}
                </p>

                {items.map(n => {
                  const cfg = getAlertConfig(n.type);
                  return (
                    <button
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`
                        w-full flex items-start gap-3 px-5 py-3.5 text-left
                        transition-colors border-b border-gray-100
                        ${n.is_read ? 'hover:bg-gray-50' : 'bg-indigo-50/50 hover:bg-indigo-50'}
                      `}
                    >
                      {/* Icon */}
                      <span className={`flex-shrink-0 mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center ${cfg.bgClass} ${cfg.textClass}`}>
                        {cfg.icon}
                      </span>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm font-medium leading-snug truncate ${n.is_read ? 'text-gray-500' : 'text-gray-900'}`}>
                            {n.title}
                          </p>
                          {/* Unread dot */}
                          {!n.is_read && (
                            <span className="flex-shrink-0 mt-1.5 w-2 h-2 rounded-full bg-blue-400" />
                          )}
                        </div>
                        {n.message && (
                          <p className="mt-0.5 text-xs text-gray-500 line-clamp-2 leading-relaxed">
                            {n.message}
                          </p>
                        )}
                        <p className="mt-1 text-[11px] text-gray-600">
                          {relativeTime(n.created_at)}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
