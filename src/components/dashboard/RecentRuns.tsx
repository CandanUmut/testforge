import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Cpu } from 'lucide-react';
import type { TestRun } from '../../lib/types';
import { StatusBadge } from '../common/Badge';
import { formatRelativeTime, formatDuration, formatPassRate } from '../../utils/formatters';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useDataContext } from '../../contexts/DataContext';

interface RecentRunsProps {
  runs: TestRun[];
  loading: boolean;
}

export function RecentRuns({ runs, loading }: RecentRunsProps) {
  const { getScopedPath, basePath } = useDataContext();
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Recent Test Runs</h3>
          <p className="text-xs text-gray-500 mt-0.5">Latest 10 runs</p>
        </div>
        <Link to={getScopedPath('test-runs')} className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors">
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <LoadingSpinner />
        </div>
      ) : runs.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-gray-500 text-sm">No test runs yet</p>
          <p className="text-gray-600 text-xs mt-1">Connect a device or push results via API to get started</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="table-header">Test Suite</th>
                <th className="table-header hidden md:table-cell">Device</th>
                <th className="table-header hidden sm:table-cell">Pass Rate</th>
                <th className="table-header">Status</th>
                <th className="table-header hidden lg:table-cell">Duration</th>
                <th className="table-header">When</th>
              </tr>
            </thead>
            <tbody>
              {runs.slice(0, 10).map(run => (
                <tr key={run.id} className="table-row cursor-pointer" onClick={() => navigate(`${basePath}/test-runs/${run.id}`)}>
                  <td className="table-cell">
                    <div>
                      <p className="text-sm text-gray-900 font-medium truncate max-w-[140px]">{run.name}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{run.branch || 'main'}</p>
                    </div>
                  </td>
                  <td className="table-cell hidden md:table-cell">
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <Cpu className="w-3 h-3" />
                      <span className="text-xs truncate max-w-[100px]">{run.device?.name || '—'}</span>
                    </div>
                  </td>
                  <td className="table-cell hidden sm:table-cell">
                    <div>
                      <p className="text-sm text-gray-900">{formatPassRate(run.passed, run.total_tests)}</p>
                      <p className="text-xs text-gray-600">{run.passed}/{run.total_tests}</p>
                    </div>
                  </td>
                  <td className="table-cell">
                    <StatusBadge status={run.status} />
                  </td>
                  <td className="table-cell hidden lg:table-cell text-gray-400 text-sm">
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
  );
}
