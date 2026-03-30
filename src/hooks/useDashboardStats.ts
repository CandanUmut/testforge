import { useState, useEffect } from 'react';
import { isDemoMode } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { DashboardStats, PassFailDataPoint, FailureCategoryDataPoint } from '../lib/types';
import { getDashboardStats, getPassFailTrend, getFailureCategories } from '../utils/seedData';

export function useDashboardStats() {
  const { organization } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [passFailTrend, setPassFailTrend] = useState<PassFailDataPoint[]>([]);
  const [failureCategories, setFailureCategories] = useState<FailureCategoryDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isDemoMode || !organization) {
      setStats(getDashboardStats());
      setPassFailTrend(getPassFailTrend());
      setFailureCategories(getFailureCategories());
      setLoading(false);
    }
    // In real mode, fetch from Supabase with aggregation queries
  }, [organization?.id]);

  return { stats, passFailTrend, failureCategories, loading };
}
