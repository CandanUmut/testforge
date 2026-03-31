import { PlayCircle, CheckCircle, Cpu, Bug, TrendingUp, TrendingDown } from 'lucide-react';
import type { DashboardStats } from '../../lib/types';
import { SkeletonCard } from '../common/Skeleton';
import { getSparklineData, type SparklinePoint } from '../../utils/seedData';

interface StatsCardsProps {
  stats: DashboardStats | null;
  loading: boolean;
}

function TrendBadge({ value }: { value: number }) {
  if (value > 0) {
    return (
      <span className="flex items-center gap-1 text-emerald-400 text-xs font-medium bg-emerald-400/10 border border-emerald-400/20 rounded-full px-2 py-0.5">
        <TrendingUp className="w-3 h-3" />+{value}%
      </span>
    );
  }
  if (value < 0) {
    return (
      <span className="flex items-center gap-1 text-red-400 text-xs font-medium bg-red-400/10 border border-red-400/20 rounded-full px-2 py-0.5">
        <TrendingDown className="w-3 h-3" />{value}%
      </span>
    );
  }
  return (
    <span className="text-gray-500 text-xs font-medium bg-white/5 border border-white/10 rounded-full px-2 py-0.5">
      —
    </span>
  );
}

interface SparklineProps {
  data: SparklinePoint[];
  color: string; // hex stroke color
}

function Sparkline({ data, color }: SparklineProps) {
  if (data.length < 2) return null;

  const width = 100;
  const height = 32;
  const padding = 2;

  const values = data.map(d => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const toX = (i: number) =>
    padding + (i / (data.length - 1)) * (width - padding * 2);
  const toY = (v: number) =>
    height - padding - ((v - min) / range) * (height - padding * 2);

  const points = data
    .map((d, i) => `${toX(i)},${toY(d.value)}`)
    .join(' ');

  const firstY = toY(values[0]);
  const lastY = toY(values[values.length - 1]);
  const trending = lastY < firstY; // SVG y is inverted so lower = higher value

  const strokeColor = trending ? '#10B981' : color === '#EF4444' ? '#EF4444' : '#6B7280';

  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <polyline
        points={points}
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />
      {/* Last point dot */}
      <circle
        cx={toX(data.length - 1)}
        cy={toY(values[values.length - 1])}
        r="2"
        fill={strokeColor}
      />
    </svg>
  );
}

export function StatsCards({ stats, loading }: StatsCardsProps) {
  const sparkRuns     = getSparklineData('runs');
  const sparkPass     = getSparklineData('passRate');
  const sparkDevices  = getSparklineData('devices');
  const sparkCrashes  = getSparklineData('crashes');

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
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
      iconBg: 'bg-blue-400/10 border-blue-400/20',
      sparkColor: '#3B82F6',
      sparkData: sparkRuns,
    },
    {
      icon: CheckCircle,
      label: 'Pass Rate',
      value: `${stats?.passRate ?? 0}%`,
      trend: stats?.passRateTrend,
      color: 'text-emerald-400',
      iconBg: 'bg-emerald-400/10 border-emerald-400/20',
      sparkColor: '#10B981',
      sparkData: sparkPass,
    },
    {
      icon: Cpu,
      label: 'Active Devices',
      value: stats?.activeDevices ?? 0,
      trend: undefined,
      color: 'text-purple-400',
      iconBg: 'bg-purple-400/10 border-purple-400/20',
      sparkColor: '#8B5CF6',
      sparkData: sparkDevices,
    },
    {
      icon: Bug,
      label: 'Open Crashes',
      value: stats?.openCrashes ?? 0,
      trend: undefined,
      color: stats?.openCrashes ? 'text-red-400' : 'text-gray-400',
      iconBg: stats?.openCrashes
        ? 'bg-red-400/10 border-red-400/20'
        : 'bg-gray-400/10 border-gray-400/20',
      sparkColor: '#EF4444',
      sparkData: sparkCrashes,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div key={i} className="glass-card p-5 flex flex-col gap-3">
            {/* Header: label + icon */}
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-gray-400">{card.label}</p>
              <div
                className={`w-8 h-8 rounded-lg border ${card.iconBg} flex items-center justify-center`}
              >
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </div>

            {/* Value + trend badge */}
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold text-white">{card.value}</span>
              {card.trend !== undefined ? (
                <TrendBadge value={card.trend} />
              ) : null}
            </div>

            {/* 7-point sparkline */}
            <div className="mt-1 opacity-80">
              <Sparkline data={card.sparkData} color={card.sparkColor} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
