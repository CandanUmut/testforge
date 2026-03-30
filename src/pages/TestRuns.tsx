import { useState } from 'react';
import { useTestRuns } from '../hooks/useTestRuns';
import { StatusBadge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { formatRelativeTime, formatDuration, formatPassRate } from '../utils/formatters';
import { PlayCircle, Filter, Cpu, GitBranch } from 'lucide-react';
import type { RunStatus } from '../lib/types';

const statusOptions: (RunStatus | 'all')[] = ['all', 'passed', 'failed', 'error', 'running', 'timeout'];

export function TestRuns() {
  const [statusFilter, setStatusFilter] = useState<RunStatus | 'all'>('all');
  const { runs, loading } = useTestRuns();

  const filtered = statusFilter === 'all'
    ? runs
    : runs.filter(r => r.status === statusFilter);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Test Runs</h1>
          <p className="text-sm text-gray-400 mt-1">{runs.length} total runs</p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex flex-wrap items-center gap-3">
        <Filter className="w-4 h-4 text-gray-500" />
        <div className="flex flex-wrap gap-2">
          {statusOptions.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                statusFilter === s
                  ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/20'
              }`}
            >
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs text-gray-500">{filtered.length} results</span>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<PlayCircle className="w-8 h-8" />}
            title="No test runs found"
            description="Adjust your filters or push your first test results via the API."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="table-header">Test Suite</th>
                  <th className="table-header hidden md:table-cell">Device</th>
                  <th className="table-header hidden sm:table-cell">Branch</th>
                  <th className="table-header hidden lg:table-cell">Build</th>
                  <th className="table-header">Pass Rate</th>
                  <th className="table-header">Status</th>
                  <th className="table-header hidden lg:table-cell">Duration</th>
                  <th className="table-header">Time</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(run => (
                  <tr key={run.id} className="table-row cursor-pointer">
                    <td className="table-cell">
                      <div>
                        <p className="text-sm text-white font-medium">{run.name}</p>
                        <p className="text-xs text-gray-600 mt-0.5 capitalize">{run.trigger_type.replace('_', ' ')}</p>
                      </div>
                    </td>
                    <td className="table-cell hidden md:table-cell">
                      <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                        <Cpu className="w-3 h-3" />
                        <span className="truncate max-w-[100px]">{run.device?.name || '—'}</span>
                      </div>
                    </td>
                    <td className="table-cell hidden sm:table-cell">
                      <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                        <GitBranch className="w-3 h-3" />
                        <span className="truncate max-w-[80px]">{run.branch || 'main'}</span>
                      </div>
                    </td>
                    <td className="table-cell hidden lg:table-cell text-gray-500 text-xs font-mono">
                      {run.build_number || '—'}
                    </td>
                    <td className="table-cell">
                      <div>
                        <p className="text-sm text-white">{formatPassRate(run.passed, run.total_tests)}</p>
                        <p className="text-xs text-gray-600">{run.passed}/{run.total_tests}</p>
                      </div>
                    </td>
                    <td className="table-cell">
                      <StatusBadge status={run.status} />
                    </td>
                    <td className="table-cell hidden lg:table-cell text-gray-400 text-xs">
                      {formatDuration(run.duration_ms)}
                    </td>
                    <td className="table-cell text-gray-500 text-xs">
                      {formatRelativeTime(run.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
