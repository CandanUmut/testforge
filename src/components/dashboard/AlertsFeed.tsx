import { Link } from 'react-router-dom';
import { ArrowRight, AlertTriangle, Bug, Cpu, Activity, Zap, Info } from 'lucide-react';
import type { Alert } from '../../lib/types';
import { formatRelativeTime } from '../../utils/formatters';
import { useDataContext } from '../../contexts/DataContext';

const alertIcons = {
  crash_detected: Bug,
  test_failure: AlertTriangle,
  device_offline: Cpu,
  threshold_breach: Activity,
  build_failed: Zap,
  flaky_test: AlertTriangle,
  system: Info,
};

const alertColors = {
  critical: 'text-red-600 bg-red-50',
  warning: 'text-amber-600 bg-amber-50',
  info: 'text-blue-600 bg-blue-50',
};

export function AlertsFeed() {
  const { getScopedPath, alerts } = useDataContext();

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Recent Alerts</h3>
          <p className="text-xs text-gray-500 mt-0.5">{alerts.filter(a => !a.is_read).length} unread</p>
        </div>
        <Link to={getScopedPath('crash-triage')} className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors">
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="divide-y divide-gray-100">
        {alerts.map(alert => {
          const Icon = alertIcons[alert.type] || Info;
          const colorClass = alertColors[alert.severity];

          return (
            <div
              key={alert.id}
              className={`flex gap-3 px-6 py-4 hover:bg-gray-50 transition-colors ${alert.is_read ? 'opacity-60' : 'bg-indigo-50/30'}`}
            >
              <div className={`w-7 h-7 rounded-lg ${colorClass} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm text-gray-900 font-medium leading-tight">{alert.title}</p>
                  {!alert.is_read && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0 mt-1.5" />
                  )}
                </div>
                {alert.message && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{alert.message}</p>
                )}
                <p className="text-xs text-gray-600 mt-1.5">{formatRelativeTime(alert.created_at)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
