import type { Crash } from '../../lib/types';
import { StatusBadge, SeverityBadge } from '../common/Badge';
import { formatRelativeTime } from '../../utils/formatters';
import { CRASH_TYPE_LABELS } from '../../utils/constants';
import { Brain, Cpu, RefreshCw } from 'lucide-react';

interface CrashListProps {
  crashes: Crash[];
  selectedId: string | null;
  onSelect: (crash: Crash) => void;
}

export function CrashList({ crashes, selectedId, onSelect }: CrashListProps) {
  return (
    <div className="bg-white overflow-hidden h-full flex flex-col">
      <div className="px-4 py-4 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900">Crash Reports</h3>
        <p className="text-xs text-gray-500 mt-0.5">{crashes.length} total · {crashes.filter(c => c.status === 'new').length} new</p>
      </div>
      <div className="overflow-y-auto flex-1 divide-y divide-gray-100">
        {crashes.map(crash => (
          <button
            key={crash.id}
            onClick={() => onSelect(crash)}
            className={`w-full text-left px-4 py-4 hover:bg-gray-50 transition-colors ${selectedId === crash.id ? 'bg-indigo-50 border-r-2 border-indigo-500' : ''}`}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <p className="text-sm text-gray-900 font-medium leading-tight line-clamp-2">{crash.title}</p>
              {!['fixed', 'wont_fix', 'duplicate'].includes(crash.status) && (
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0 mt-1.5" />
              )}
            </div>

            <div className="flex flex-wrap gap-1.5 mb-2">
              <SeverityBadge severity={crash.severity} />
              <span className="badge text-gray-500 bg-gray-100 border-gray-200">
                {CRASH_TYPE_LABELS[crash.crash_type] || crash.crash_type}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-3 h-3" />
                <span>{crash.occurrence_count}x</span>
                {crash.device && (
                  <>
                    <Cpu className="w-3 h-3 ml-1" />
                    <span className="truncate max-w-[80px]">{crash.device.name}</span>
                  </>
                )}
              </div>
              <span>{formatRelativeTime(crash.last_seen_at)}</span>
            </div>

            {crash.ai_analysis && (
              <div className="flex items-center gap-1 mt-2">
                <Brain className="w-3 h-3 text-indigo-500" />
                <span className="text-[10px] text-indigo-500">AI analysis available</span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
