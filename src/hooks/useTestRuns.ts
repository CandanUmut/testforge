import { useMemo } from 'react';
import { useDataContext } from '../contexts/DataContext';
import type { TestRun } from '../lib/types';

interface UseTestRunsOptions {
  limit?: number;
  status?: string;
  suite?: string;
  device?: string;
  branch?: string;
  dateFrom?: string;
  dateTo?: string;
}

export function useTestRuns(options: UseTestRunsOptions = {}) {
  const { testRuns, dataLoading } = useDataContext();

  const filtered = useMemo(() => {
    let result = [...testRuns];

    if (options.status) {
      result = result.filter(r => r.status === options.status);
    }
    if (options.suite) {
      result = result.filter(r => r.suite_name === options.suite);
    }
    if (options.device) {
      result = result.filter(r => r.device_id === options.device);
    }
    if (options.branch) {
      result = result.filter(r => r.branch === options.branch);
    }
    if (options.dateFrom) {
      const from = new Date(options.dateFrom).getTime();
      result = result.filter(r => new Date(r.created_at).getTime() >= from);
    }
    if (options.dateTo) {
      const to = new Date(options.dateTo).getTime();
      result = result.filter(r => new Date(r.created_at).getTime() <= to);
    }
    if (options.limit) {
      result = result.slice(0, options.limit);
    }

    return result;
  }, [testRuns, options.limit, options.status, options.suite, options.device, options.branch, options.dateFrom, options.dateTo]);

  return { runs: filtered, loading: dataLoading, error: null as string | null };
}
