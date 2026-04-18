import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTestRuns } from '../hooks/useTestRuns';
import { StatusBadge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { formatRelativeTime, formatDuration, formatPassRate } from '../utils/formatters';
import { PlayCircle, Filter, Cpu, GitBranch, ArrowRight, GitCompare } from 'lucide-react';
import type { RunStatus } from '../lib/types';
import { useDataContext } from '../contexts/DataContext';

const statusOptions: (RunStatus | 'all')[] = ['all', 'passed', 'failed', 'error', 'running', 'timeout'];

export function TestRuns() {
  const navigate = useNavigate();
  const { basePath } = useDataContext();
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
    navigate(`${basePath}/test-runs/${id}`);
  }

  function handleCompare() {
    if (selected.length === 2) {
      navigate(`${basePath}/test-runs/compare?a=${selected[0]}&b=${selected[1]}`);
    }
  }

  const canCompare = selected.length === 2;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Test Runs</h1>
          <p className="text-sm text-gray-500 mt-1">{runs.length} total runs</p>
        </div>

        {/* Compare button */}
        {selected.length > 0 && (
          <button
            onClick={handleCompare}
            disabled={!canCompare}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
              canCompare
                ? 'bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100 cursor-pointer'
                : 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <GitCompare className="w-4 h-4" />
            {canCompare ? 'Compare 2 runs' : `Select ${2 - selected.length} more`}
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-wrap items-center gap-3">
        <Filter className="w-4 h-4 text-gray-400" />
        <div className="flex flex-wrap gap-2">
          {statusOptions.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                statusFilter === s
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                  : 'bg-white border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
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
                <tr className="border-b border-gray-200">
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
                      className={`table-row ${isChecked ? 'bg-indigo-50/50' : ''}`}
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
                          className="w-4 h-4 rounded border border-gray-300 bg-white accent-indigo-600 cursor-pointer"
                          aria-label={`Select run ${run.id}`}
                        />
                      </td>

                      {/* Test Suite */}
                      <td
                        className="table-cell cursor-pointer"
                        onClick={() => handleRowClick(run.id)}
                      >
                        <div>
                          <p className="text-sm text-gray-900 font-medium">{run.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5 capitalize">
                            {run.trigger_type.replace('_', ' ')}
                          </p>
                        </div>
                      </td>

                      <td
                        className="table-cell hidden md:table-cell cursor-pointer"
                        onClick={() => handleRowClick(run.id)}
                      >
                        <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                          <Cpu className="w-3 h-3" />
                          <span className="truncate max-w-[100px]">{run.device?.name || '—'}</span>
                        </div>
                      </td>

                      <td
                        className="table-cell hidden sm:table-cell cursor-pointer"
                        onClick={() => handleRowClick(run.id)}
                      >
                        <div className="flex items-center gap-1.5 text-gray-500 text-xs">
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
                          <p className="text-sm text-gray-900">{formatPassRate(run.passed, run.total_tests)}</p>
                          <p className="text-xs text-gray-500">{run.passed}/{run.total_tests}</p>
                        </div>
                      </td>

                      <td
                        className="table-cell cursor-pointer"
                        onClick={() => handleRowClick(run.id)}
                      >
                        <StatusBadge status={run.status} />
                      </td>

                      <td
                        className="table-cell hidden lg:table-cell text-gray-500 text-xs cursor-pointer"
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
                          className="p-1.5 rounded-md text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
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
