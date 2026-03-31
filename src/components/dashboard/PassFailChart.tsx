import { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import type { PassFailDataPoint } from '../../lib/types';
import { LoadingSpinner } from '../common/LoadingSpinner';

// ─── Types ────────────────────────────────────────────────────────────────────

type TimeRange = '7d' | '14d' | '30d' | '90d';

const TIME_RANGE_OPTIONS: { label: string; value: TimeRange; days: number }[] = [
  { label: '7d',  value: '7d',  days: 7  },
  { label: '14d', value: '14d', days: 14 },
  { label: '30d', value: '30d', days: 30 },
  { label: '90d', value: '90d', days: 90 },
];

// ─── Custom tooltip ───────────────────────────────────────────────────────────

interface TooltipPayloadEntry {
  value: number;
  name: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const passed = payload.find(p => p.name === 'passed')?.value ?? 0;
  const failed = payload.find(p => p.name === 'failed')?.value ?? 0;
  const total  = passed + failed;
  const rate   = total > 0 ? Math.round((passed / total) * 100) : 0;

  return (
    <div className="glass-card px-3 py-2.5 text-xs shadow-xl border border-white/10 min-w-[140px]">
      <p className="text-gray-400 font-medium mb-2">{label}</p>
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            Passed
          </span>
          <span className="text-white tabular-nums font-semibold">{passed.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-red-400">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
            Failed
          </span>
          <span className="text-white tabular-nums font-semibold">{failed.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between gap-4 pt-1.5 mt-1 border-t border-white/10">
          <span className="text-gray-400">Pass rate</span>
          <span
            className={`tabular-nums font-bold ${
              rate >= 95 ? 'text-emerald-400' : rate >= 80 ? 'text-amber-400' : 'text-red-400'
            }`}
          >
            {rate}%
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface PassFailChartProps {
  data: PassFailDataPoint[];
  loading: boolean;
}

export function PassFailChart({ data, loading }: PassFailChartProps) {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('14d');

  const rangeDays = TIME_RANGE_OPTIONS.find(r => r.value === selectedRange)?.days ?? 14;
  const chartData = data.slice(-rangeDays);

  // Decide x-axis tick interval so labels don't crowd
  const tickInterval =
    rangeDays <= 7  ? 0 :
    rangeDays <= 14 ? 1 :
    rangeDays <= 30 ? 3 : 6;

  const rangeLabel = `Last ${rangeDays} days`;

  return (
    <div className="glass-card p-6 h-80">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-white">Pass/Fail Trend</h3>
          <p className="text-xs text-gray-500 mt-0.5">{rangeLabel}</p>
        </div>

        {/* Right side: legend + range pills */}
        <div className="flex flex-col items-end gap-2">
          {/* Legend */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-gray-400">Passed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-gray-400">Failed</span>
            </div>
          </div>

          {/* Time range selector pills */}
          <div className="flex items-center gap-1 bg-white/5 border border-white/8 rounded-lg p-0.5">
            {TIME_RANGE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSelectedRange(opt.value)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                  selectedRange === opt.value
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-44">
          <LoadingSpinner />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="passGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#10B981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0}   />
              </linearGradient>
              <linearGradient id="failGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#EF4444" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0}   />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />

            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: '#6B7280' }}
              tickLine={false}
              axisLine={false}
              interval={tickInterval}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#6B7280' }}
              tickLine={false}
              axisLine={false}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Target line at 95% pass count — dashed amber */}
            <ReferenceLine
              y={95}
              stroke="#F59E0B"
              strokeDasharray="4 3"
              strokeWidth={1.2}
              strokeOpacity={0.7}
              label={{
                value: 'Target',
                position: 'insideTopRight',
                fill: '#F59E0B',
                fontSize: 9,
                dy: -4,
              }}
            />

            <Area
              type="monotone"
              dataKey="passed"
              name="passed"
              stroke="#10B981"
              strokeWidth={2}
              fill="url(#passGradient)"
              dot={false}
              activeDot={{ r: 4, fill: '#10B981', strokeWidth: 0 }}
            />
            <Area
              type="monotone"
              dataKey="failed"
              name="failed"
              stroke="#EF4444"
              strokeWidth={2}
              fill="url(#failGradient)"
              dot={false}
              activeDot={{ r: 4, fill: '#EF4444', strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
