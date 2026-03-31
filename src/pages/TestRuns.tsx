import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTestRuns } from '../hooks/useTestRuns';
import { StatusBadge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { formatRelativeTime, formatDuration, formatPassRate } from '../utils/formatters';
import { PlayCircle, Filter, Cpu, GitBranch, ArrowRight, GitCompare } from 'lucide-react';
import type { RunStatus } from '../lib/types';

const statusOptions: (RunStatus | 'all')[] = ['all', 'passed', 'failed', 'error', 'running', 'timeout'];

export function TestRuns() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<RunStatus | 'all'>('all');
  const [selected, setSelected] = useState<string[]>([]);
  const { runs, loading } = useTestRuns();

  const filtered = statusFilter === 'all'
    ? runs
    : runs.filter(r => r.status === statusFilter);

  function handleCheck(id: string, checked: boolean) {
    setSelected(prev => {
      if (checked) {
        // Max 2: if already 2, drop the first (oldest selection) and add new
        const next = prev.includes(id) ? prev : [...prev, id];
        return next.length > 2 ? [next[1], next[2]] : next;
      }
      return prev.filter(x => x !== id);
    });
  }

  function handleRowClick(id: string) {
    navigate(`/test-runs/${id}`);
  }

  function handleCompare() {
    if (selected.length === 2) {
      navigate(`/test-runs/compare?a=${selected[0]}&b=${selected[1]}`);
    }
  }

  const canCompare = selected.length === 2;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Test Runs</h1>
          <p className="text-sm text-gray-400 mt-1">{runs.length} total runs</p>
        </div>

        {/* Compare button — only shows when runs are selected */}
        {selected.length > 0 && (
          <button
            onClick={handleCompare}
            disabled={!canCompare}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
              canCompare
                ? 'bg-blue-500/15 border-blue-500/30 text-blue-400 hover:bg-blue-500/25 hover:border-blue-500/50 cursor-pointer'
                : 'bg-white/5 border-white/10 text-gray-500 cursor-not-allowed'
            }`}
          >
            <GitCompare className="w-4 h-4" />
            {canCompare ? 'Compare 2 runs' : `Select ${2 - selected.length} more`}
          </button>
        )}
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

      {/* Selected hint */}
      {selected.length === 1 && (
        <div className="text-xs text-gray-500 px-1">
          1 run selected — select one more to enable comparison
        </div>
      )}

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
                  {/* Checkbox column */}
                  <th className="table-header w-10" />
                  <th className="table-header">Test Suite</th>
                  <th className="table-header hidden md:table-cell">Device</th>
                  <th className="table-header hidden sm:table-cell">Branch</th>
                  <th className="table-header hidden lg:table-cell">Build</th>
                  <th className="table-header">Pass Rate</th>
                  <th className="table-header">Status</th>
                  <th className="table-header hidden lg:table-cell">Duration</th>
                  <th className="table-header">Time</th>
                  {/* Detail link column */}
                  <th className="table-header w-10" />
                </tr>
              </thead>
              <tbody>
                {filtered.map(run => {
                  const isChecked = selected.includes(run.id);
                  return (
                    <tr
                      key={run.id}
                      className={`table-row ${isChecked ? 'bg-blue-500/5' : ''}`}
                    >
                      {/* Checkbox */}
                      <td
                        className="table-cell w-10"
                        onClick={e => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={e => handleCheck(run.id, e.target.checked)}
                          className="w-4 h-4 rounded border border-white/20 bg-white/5 accent-blue-500 cursor-pointer"
                          aria-label={`Select run ${run.id}`}
                        />
                      </td>

                      {/* Test Suite — click to navigate */}
                      <td
                        className="table-cell cursor-pointer"
                        onClick={() => handleRowClick(run.id)}
                      >
                        <div>
                          <p className="text-sm text-white font-medium">{run.name}</p>
                          <p className="text-xs text-gray-600 mt-0.5 capitalize">
                            {run.trigger_type.replace('_', ' ')}
                          </p>
                        </div>
                      </td>

                      <td
                        className="table-cell hidden md:table-cell cursor-pointer"
                        onClick={() => handleRowClick(run.id)}
                      >
                        <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                          <Cpu className="w-3 h-3" />
                          <span className="truncate max-w-[100px]">{run.device?.name || '—'}</span>
                        </div>
                      </td>

                      <td
                        className="table-cell hidden sm:table-cell cursor-pointer"
                        onClick={() => handleRowClick(run.id)}
                      >
                        <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                          <GitBranch className="w-3 h-3" />
                          <span className="truncate max-w-[80px]">{run.branch || 'main'}</span>
                        </div>
                      </td>

                      <td
                        className="table-cell hidden lg:table-cell text-gray-500 text-xs font-mono cursor-pointer"
                        onClick={() => handleRowClick(run.id)}
                      >
                        {run.build_number || '—'}
                      </td>

                      <td
                        className="table-cell cursor-pointer"
                        onClick={() => handleRowClick(run.id)}
                      >
                        <div>
                          <p className="text-sm text-white">{formatPassRate(run.passed, run.total_tests)}</p>
                          <p className="text-xs text-gray-600">{run.passed}/{run.total_tests}</p>
                        </div>
                      </td>

                      <td
                        className="table-cell cursor-pointer"
                        onClick={() => handleRowClick(run.id)}
                      >
                        <StatusBadge status={run.status} />
                      </td>

                      <td
                        className="table-cell hidden lg:table-cell text-gray-400 text-xs cursor-pointer"
                        onClick={() => handleRowClick(run.id)}
                      >
                        {formatDuration(run.duration_ms)}
                      </td>

                      <td
                        className="table-cell text-gray-500 text-xs cursor-pointer"
                        onClick={() => handleRowClick(run.id)}
                      >
                        {formatRelativeTime(run.created_at)}
                      </td>

                      {/* Detail arrow button */}
                      <td
                        className="table-cell w-10"
                        onClick={e => e.stopPropagation()}
                      >
                        <button
                          onClick={() => handleRowClick(run.id)}
                          className="p-1.5 rounded-md text-gray-600 hover:text-blue-400 hover:bg-blue-400/10 transition-all"
                          aria-label={`View details for ${run.name}`}
                          title="View details"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
