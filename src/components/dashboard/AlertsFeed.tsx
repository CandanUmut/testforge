import { Link } from 'react-router-dom';
import { ArrowRight, AlertTriangle, Bug, Cpu, Activity, Zap, Info } from 'lucide-react';
import type { Alert } from '../../lib/types';
import { formatRelativeTime } from '../../utils/formatters';
import { demoAlerts } from '../../utils/seedData';

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
  critical: 'text-red-400 bg-red-400/10',
  warning: 'text-amber-400 bg-amber-400/10',
  info: 'text-blue-400 bg-blue-400/10',
};

export function AlertsFeed() {
  const alerts = demoAlerts;

  return (
    <div className="glass-card overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div>
          <h3 className="text-sm font-semibold text-white">Recent Alerts</h3>
          <p className="text-xs text-gray-500 mt-0.5">{alerts.filter(a => !a.is_read).length} unread</p>
        </div>
        <Link to="/crash-triage" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="divide-y divide-white/5">
        {alerts.map(alert => {
          const Icon = alertIcons[alert.type] || Info;
          const colorClass = alertColors[alert.severity];

          return (
            <div
              key={alert.id}
              className={`flex gap-3 px-6 py-4 hover:bg-white/3 transition-colors ${alert.is_read ? 'opacity-60' : ''}`}
            >
              <div className={`w-7 h-7 rounded-lg ${colorClass} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm text-white font-medium leading-tight">{alert.title}</p>
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
