import { useState, useCallback } from 'react';
import { CrashList } from '../components/triage/CrashList';
import { CrashDetail } from '../components/triage/CrashDetail';
import { TriageActions } from '../components/triage/TriageActions';
import { EmptyState } from '../components/common/EmptyState';
import { useCrashes } from '../hooks/useCrashes';
import type { Crash, CrashStatus } from '../lib/types';
import { Bug } from 'lucide-react';

type SeverityFilter = 'all' | 'critical' | 'high' | 'medium' | 'low';
type StatusFilter = 'all' | 'open' | 'fixed';

export function CrashTriage() {
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('open');

  const { crashes } = useCrashes({
    severity: severityFilter === 'all' ? undefined : severityFilter,
    status: statusFilter,
  });

  const [selected, setSelected] = useState<Crash | null>(crashes[0] || null);

  // Handle status change for crash triage actions (local state update)
  const handleStatusChange = useCallback((newStatus: CrashStatus) => {
    if (selected) {
      setSelected({ ...selected, status: newStatus });
    }
  }, [selected]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Crash Triage</h1>
            <p className="text-sm text-gray-500 mt-0.5">{crashes.length} crashes &middot; AI analysis enabled</p>
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
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                    : 'bg-white border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                    : 'bg-white border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
            <div className="lg:col-span-4 border-r border-gray-200 overflow-y-auto">
              <CrashList
                crashes={crashes}
                selectedId={selected?.id || null}
                onSelect={crash => setSelected(crash)}
              />
            </div>

            {/* Detail + actions */}
            {selected ? (
              <>
                <div className="lg:col-span-5 overflow-y-auto p-4 border-r border-gray-200">
                  <CrashDetail crash={selected} />
                </div>
                <div className="lg:col-span-3 overflow-y-auto p-4">
                  <TriageActions crash={selected} onStatusChange={handleStatusChange} />
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
