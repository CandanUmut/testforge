import type { ReactNode } from 'react';

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

// Base pulsing shimmer skeleton
export function Skeleton({ className = '', style }: SkeletonProps) {
  return (
    <div
      className={`bg-gray-200 animate-pulse rounded ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}

// Matches a KPI card: icon placeholder, value placeholder, label, sparkline strip
export function SkeletonCard({ children }: { children?: ReactNode }) {
  return (
    <div className="glass-card p-5 flex flex-col gap-4" aria-hidden="true">
      {children ?? (
        <>
          {/* Header row: label + icon placeholder */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="w-8 h-8 rounded-lg" />
          </div>
          {/* Value + trend badge */}
          <div className="flex items-end justify-between">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-4 w-12 rounded-full" />
          </div>
          {/* Sparkline strip */}
          <Skeleton className="h-8 w-full rounded-md" />
        </>
      )}
    </div>
  );
}

// 5 alternating-height table rows
export function SkeletonTable() {
  const heights = ['h-4', 'h-3', 'h-4', 'h-3', 'h-4'];
  return (
    <div className="space-y-0" aria-hidden="true">
      {heights.map((h, i) => (
        <div
          key={i}
          className="flex items-center gap-3 px-4 py-3 border-b border-gray-100"
        >
          <Skeleton className={`${h} w-32`} />
          <Skeleton className={`${h} w-20 ml-auto`} />
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className={`${h} w-16`} />
        </div>
      ))}
    </div>
  );
}

// Multi-line text block skeleton
export function SkeletonText({ lines = 3 }: { lines?: number }) {
  const widths = ['w-full', 'w-5/6', 'w-4/6', 'w-3/4', 'w-2/3'];
  return (
    <div className="space-y-2" aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-3 ${widths[i % widths.length]}`}
        />
      ))}
    </div>
  );
}

// Chart area skeleton with bar columns
export function SkeletonChart() {
  const barHeights = [45, 60, 38, 72, 55, 80, 48, 65, 42, 70, 58, 75, 50, 63];
  return (
    <div className="glass-card p-6 h-80 flex flex-col" aria-hidden="true">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-7 w-36 rounded-full" />
      </div>
      <div className="flex-1 flex items-end gap-1.5 pb-4">
        {barHeights.map((pct, i) => (
          <div key={i} className="flex-1 flex flex-col justify-end">
            <Skeleton
              className="w-full rounded-sm"
              style={{ height: `${pct}%` }}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-2">
        <Skeleton className="h-3 w-16 rounded-full" />
        <Skeleton className="h-3 w-16 rounded-full" />
      </div>
    </div>
  );
}

// Legacy / convenience exports
export function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100" aria-hidden="true">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-24 ml-auto" />
      <Skeleton className="h-5 w-14 rounded-full" />
      <Skeleton className="h-4 w-16" />
    </div>
  );
}

export function SkeletonStatsCards() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
