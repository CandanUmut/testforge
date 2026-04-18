import { CheckCircle, AlertTriangle, Wifi, WifiOff, FileText, Bell } from 'lucide-react';
import { getActivityTimeline, type ActivityEventType, type ActivityEvent } from '../../utils/seedData';

// --- Colour / icon config per event type ---

interface EventConfig {
  dot: string;           // Tailwind bg class for the coloured dot
  iconColor: string;     // Tailwind text class for the icon
  Icon: React.ElementType;
}

const EVENT_CONFIG: Record<ActivityEventType, EventConfig> = {
  test_complete:    { dot: 'bg-blue-500',   iconColor: 'text-blue-500',    Icon: CheckCircle  },
  crash_detected:   { dot: 'bg-red-500',    iconColor: 'text-red-500',     Icon: AlertTriangle },
  device_online:    { dot: 'bg-emerald-500',iconColor: 'text-emerald-500', Icon: Wifi         },
  device_offline:   { dot: 'bg-gray-400',   iconColor: 'text-gray-400',    Icon: WifiOff      },
  report_generated: { dot: 'bg-indigo-500', iconColor: 'text-indigo-500',  Icon: FileText     },
  alert_created:    { dot: 'bg-amber-500',  iconColor: 'text-amber-500',   Icon: Bell         },
};

// --- Relative-time formatter ---

function relativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// --- Single event row ---

function EventRow({ event }: { event: ActivityEvent }) {
  const cfg = EVENT_CONFIG[event.type];
  const Icon = cfg.Icon;

  return (
    <div className="flex gap-3 py-3 border-b border-gray-100 last:border-0 group">
      {/* Icon + dot indicator */}
      <div className="relative flex-shrink-0 mt-0.5">
        <div className="w-7 h-7 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center">
          <Icon className={`w-3.5 h-3.5 ${cfg.iconColor}`} />
        </div>
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border-2 border-white ${cfg.dot}`}
        />
      </div>

      {/* Text content */}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-gray-900 leading-tight truncate group-hover:text-gray-700">
          {event.title}
        </p>
        <p className="text-xs text-gray-500 leading-snug mt-0.5 truncate">
          {event.description}
        </p>
      </div>

      {/* Timestamp */}
      <span className="flex-shrink-0 text-xs text-gray-400 tabular-nums mt-0.5">
        {relativeTime(event.timestamp)}
      </span>
    </div>
  );
}

// --- Main component ---

export function ActivityTimeline() {
  const events = getActivityTimeline();

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
        <span className="text-xs text-gray-400">{events.length} events</span>
      </div>

      {/* Event list */}
      <div className="flex-1 overflow-y-auto min-h-0 -mr-1 pr-1">
        {events.map(event => (
          <EventRow key={event.id} event={event} />
        ))}
      </div>

      {/* Footer */}
      <div className="pt-3 mt-1 border-t border-gray-100">
        <button
          type="button"
          className="text-xs text-indigo-600 hover:text-indigo-700 transition-colors font-medium"
        >
          View all activity →
        </button>
      </div>
    </div>
  );
}
