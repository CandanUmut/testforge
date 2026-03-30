import { useState, useEffect } from 'react';
import { supabase, isDemoMode } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { TestRun } from '../lib/types';
import { demoTestRuns } from '../utils/seedData';

interface UseTestRunsOptions {
  limit?: number;
  status?: string;
}

export function useTestRuns(options: UseTestRunsOptions = {}) {
  const { organization } = useAuth();
  const [runs, setRuns] = useState<TestRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isDemoMode || !organization) {
      let filtered = [...demoTestRuns];
      if (options.status) {
        filtered = filtered.filter(r => r.status === options.status);
      }
      if (options.limit) {
        filtered = filtered.slice(0, options.limit);
      }
      setRuns(filtered);
      setLoading(false);
      return;
    }

    setLoading(true);
    let query = supabase
      .from('test_runs')
      .select('*, device:devices(*)')
      .eq('organization_id', organization.id)
      .order('created_at', { ascending: false });

    if (options.status) {
      query = query.eq('status', options.status);
    }
    if (options.limit) {
      query = query.limit(options.limit);
    }

    query.then(({ data, error: err }) => {
      if (err) setError(err.message);
      else setRuns(data || []);
      setLoading(false);
    });
  }, [organization?.id, options.limit, options.status]);

  return { runs, loading, error };
}
