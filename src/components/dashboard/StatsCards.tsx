import { PlayCircle, CheckCircle, Cpu, Bug, TrendingUp, TrendingDown } from 'lucide-react';
import type { DashboardStats } from '../../lib/types';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface StatsCardsProps {
  stats: DashboardStats | null;
  loading: boolean;
}

function TrendIndicator({ value }: { value: number }) {
  if (value > 0) {
    return (
      <span className="flex items-center gap-1 text-emerald-400 text-xs">
        <TrendingUp className="w-3 h-3" />+{value}%
      </span>
    );
  }
  if (value < 0) {
    return (
      <span className="flex items-center gap-1 text-red-400 text-xs">
        <TrendingDown className="w-3 h-3" />{value}%
      </span>
    );
  }
  return null;
}

export function StatsCards({ stats, loading }: StatsCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-card p-6 flex items-center justify-center h-32">
            <LoadingSpinner />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      icon: PlayCircle,
      label: 'Test Runs (7d)',
      value: stats?.totalRunsThisWeek ?? 0,
      trend: stats?.runsTrend,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10 border-blue-400/20',
    },
    {
      icon: CheckCircle,
      label: 'Pass Rate',
      value: `${stats?.passRate ?? 0}%`,
      trend: stats?.passRateTrend,
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10 border-emerald-400/20',
    },
    {
      icon: Cpu,
      label: 'Active Devices',
      value: stats?.activeDevices ?? 0,
      color: 'text-purple-400',
      bg: 'bg-purple-400/10 border-purple-400/20',
    },
    {
      icon: Bug,
      label: 'Open Crashes',
      value: stats?.openCrashes ?? 0,
      color: stats?.openCrashes ? 'text-red-400' : 'text-gray-400',
      bg: stats?.openCrashes ? 'bg-red-400/10 border-red-400/20' : 'bg-gray-400/10 border-gray-400/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div key={i} className="glass-card p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-gray-400">{card.label}</p>
              <div className={`w-8 h-8 rounded-lg border ${card.bg} flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold text-white">{card.value}</span>
              {card.trend !== undefined && <TrendIndicator value={card.trend} />}
            </div>
          </div>
        );
      })}
    </div>
  );
}
