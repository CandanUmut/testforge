import { useMemo } from 'react';
import { useDataContext } from '../contexts/DataContext';
import type { Severity, CrashStatus } from '../lib/types';

interface UseCrashesOptions {
  severity?: Severity;
  status?: CrashStatus | 'open' | 'fixed' | 'all';
}

export function useCrashes(options: UseCrashesOptions = {}) {
  const { crashes, dataLoading } = useDataContext();

  const filtered = useMemo(() => {
    let result = [...crashes];

    if (options.severity) {
      result = result.filter(c => c.severity === options.severity);
    }

    if (options.status && options.status !== 'all') {
      if (options.status === 'open') {
        result = result.filter(c => !['fixed', 'wont_fix', 'duplicate'].includes(c.status));
      } else if (options.status === 'fixed') {
        result = result.filter(c => ['fixed', 'wont_fix', 'duplicate'].includes(c.status));
      } else {
        result = result.filter(c => c.status === options.status);
      }
    }

    // Sort by severity (critical first) then occurrence count
    const sevOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    result.sort((a, b) => {
      const sevDiff = (sevOrder[a.severity] ?? 4) - (sevOrder[b.severity] ?? 4);
      if (sevDiff !== 0) return sevDiff;
      return b.occurrence_count - a.occurrence_count;
    });

    return result;
  }, [crashes, options.severity, options.status]);

  return { crashes: filtered, loading: dataLoading };
}
