import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { PassFailDataPoint } from '../../lib/types';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface PassFailChartProps {
  data: PassFailDataPoint[];
  loading: boolean;
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  const passed = payload.find(p => p.name === 'passed')?.value ?? 0;
  const failed = payload.find(p => p.name === 'failed')?.value ?? 0;
  const total = passed + failed;
  const rate = total > 0 ? Math.round((passed / total) * 100) : 0;

  return (
    <div className="glass-card px-3 py-2 text-xs">
      <p className="text-gray-400 mb-1.5">{label}</p>
      <p className="text-emerald-400">Passed: {passed.toLocaleString()}</p>
      <p className="text-red-400">Failed: {failed.toLocaleString()}</p>
      <p className="text-gray-400 mt-1 pt-1 border-t border-white/10">Pass rate: {rate}%</p>
    </div>
  );
}

export function PassFailChart({ data, loading }: PassFailChartProps) {
  // Show last 14 data points to avoid crowding
  const chartData = data.slice(-14);

  return (
    <div className="glass-card p-6 h-80">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-semibold text-white">Pass/Fail Trend</h3>
          <p className="text-xs text-gray-500 mt-0.5">Last 14 days</p>
        </div>
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
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <LoadingSpinner />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="passGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="failGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: '#6B7280' }}
              tickLine={false}
              axisLine={false}
              interval={2}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#6B7280' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="passed"
              name="passed"
              stroke="#10B981"
              strokeWidth={2}
              fill="url(#passGradient)"
            />
            <Area
              type="monotone"
              dataKey="failed"
              name="failed"
              stroke="#EF4444"
              strokeWidth={2}
              fill="url(#failGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
