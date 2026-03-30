import { useState } from 'react';
import { CrashList } from '../components/triage/CrashList';
import { CrashDetail } from '../components/triage/CrashDetail';
import { TriageActions } from '../components/triage/TriageActions';
import { EmptyState } from '../components/common/EmptyState';
import { demoCrashes } from '../utils/seedData';
import type { Crash } from '../lib/types';
import { Bug, Filter } from 'lucide-react';

type SeverityFilter = 'all' | 'critical' | 'high' | 'medium' | 'low';
type StatusFilter = 'all' | 'open' | 'fixed';

export function CrashTriage() {
  const [selected, setSelected] = useState<Crash | null>(demoCrashes[0] || null);
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('open');

  const crashes = demoCrashes.filter(crash => {
    if (severityFilter !== 'all' && crash.severity !== severityFilter) return false;
    if (statusFilter === 'open' && ['fixed', 'wont_fix', 'duplicate'].includes(crash.status)) return false;
    if (statusFilter === 'fixed' && !['fixed', 'wont_fix', 'duplicate'].includes(crash.status)) return false;
    return true;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/5 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-white">Crash Triage</h1>
            <p className="text-sm text-gray-400 mt-0.5">{crashes.length} crashes · AI analysis enabled</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500">Status:</span>
            {(['all', 'open', 'fixed'] as StatusFilter[]).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                  statusFilter === s
                    ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500">Severity:</span>
            {(['all', 'critical', 'high', 'medium', 'low'] as SeverityFilter[]).map(s => (
              <button
                key={s}
                onClick={() => setSeverityFilter(s)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                  severityFilter === s
                    ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {crashes.length === 0 ? (
          <EmptyState
            icon={<Bug className="w-8 h-8" />}
            title="No crashes found"
            description="No crashes match the current filters."
          />
        ) : (
          <div className="grid lg:grid-cols-12 h-full">
            {/* Crash list */}
            <div className="lg:col-span-4 border-r border-white/5 overflow-y-auto">
              <CrashList
                crashes={crashes}
                selectedId={selected?.id || null}
                onSelect={crash => setSelected(crash)}
              />
            </div>

            {/* Detail + actions */}
            {selected ? (
              <>
                <div className="lg:col-span-5 overflow-y-auto p-4 border-r border-white/5">
                  <CrashDetail crash={selected} />
                </div>
                <div className="lg:col-span-3 overflow-y-auto p-4">
                  <TriageActions crash={selected} />
                </div>
              </>
            ) : (
              <div className="lg:col-span-8 flex items-center justify-center text-gray-500 text-sm">
                Select a crash to view details
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
