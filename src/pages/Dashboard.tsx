import { StatsCards } from '../components/dashboard/StatsCards';
import { PassFailChart } from '../components/dashboard/PassFailChart';
import { FailureCategoryPie } from '../components/dashboard/FailureCategoryPie';
import { RecentRuns } from '../components/dashboard/RecentRuns';
import { ActiveDevices } from '../components/dashboard/ActiveDevices';
import { AlertsFeed } from '../components/dashboard/AlertsFeed';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { useTestRuns } from '../hooks/useTestRuns';
import { useAuth } from '../contexts/AuthContext';

export function Dashboard() {
  const { organization } = useAuth();
  const { stats, passFailTrend, failureCategories, loading: statsLoading } = useDashboardStats();
  const { runs, loading: runsLoading } = useTestRuns({ limit: 10 });

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">
          {organization?.name || 'TestForge'} — Overview
        </p>
      </div>

      {/* KPI cards */}
      <StatsCards stats={stats} loading={statsLoading} />

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <PassFailChart data={passFailTrend} loading={statsLoading} />
        </div>
        <div>
          <FailureCategoryPie data={failureCategories} loading={statsLoading} />
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RecentRuns runs={runs} loading={runsLoading} />
        </div>
        <div className="space-y-4">
          <ActiveDevices />
        </div>
      </div>

      {/* Alerts */}
      <AlertsFeed />
    </div>
  );
}
