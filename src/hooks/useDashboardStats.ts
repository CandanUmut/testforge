import { useDataContext } from '../contexts/DataContext';
import type { DashboardStats, PassFailDataPoint, FailureCategoryDataPoint } from '../lib/types';

export function useDashboardStats() {
  const { dashboardStats, passFailTrend, failureCategories, dataLoading } = useDataContext();

  return {
    stats: dashboardStats,
    passFailTrend,
    failureCategories,
    loading: dataLoading,
  };
}
