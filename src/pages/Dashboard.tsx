import { StatsCards } from '../components/dashboard/StatsCards';
import { PassFailChart } from '../components/dashboard/PassFailChart';
import { FailureCategoryPie } from '../components/dashboard/FailureCategoryPie';
import { RecentRuns } from '../components/dashboard/RecentRuns';
import { ActiveDevices } from '../components/dashboard/ActiveDevices';
import { AlertsFeed } from '../components/dashboard/AlertsFeed';
import { HealthScore } from '../components/dashboard/HealthScore';
import { ActivityTimeline } from '../components/dashboard/ActivityTimeline';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { useTestRuns } from '../hooks/useTestRuns';
import { useOrganization } from '../hooks/useOrganization';

export function Dashboard() {
  const { organization } = useOrganization();
  const { stats, passFailTrend, failureCategories, loading: statsLoading } = useDashboardStats();
  const { runs, loading: runsLoading } = useTestRuns({ limit: 10 });

  return (
    <div className="p-5 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Page header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-slate-900">Overview</h2>
          <p className="text-sm text-slate-500 mt-1">
            {organization?.name || 'TestForge'} · lab health at a glance
          </p>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500 shadow-card-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Live
        </span>
      </div>

      {/* KPI cards */}
      <StatsCards stats={stats} loading={statsLoading} />

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <PassFailChart data={passFailTrend} loading={statsLoading} />
        </div>
        <div className="space-y-4">
          <HealthScore />
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
          <ActivityTimeline />
        </div>
      </div>

      {/* Alerts */}
      <AlertsFeed />
    </div>
  );
}
