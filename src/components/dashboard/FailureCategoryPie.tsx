import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { FailureCategoryDataPoint } from '../../lib/types';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface FailureCategoryPieProps {
  data: FailureCategoryDataPoint[];
  loading: boolean;
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: FailureCategoryDataPoint }> }) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-lg px-3 py-2 text-xs">
      <p className="text-gray-900 font-medium">{item.name}</p>
      <p className="text-gray-500 mt-1">{item.value.toLocaleString()} failures</p>
    </div>
  );
}

export function FailureCategoryPie({ data, loading }: FailureCategoryPieProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 h-80">
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900">Failure Categories</h3>
        <p className="text-xs text-gray-500 mt-0.5">Distribution by test suite</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <LoadingSpinner />
        </div>
      ) : data.length === 0 ? (
        <div className="flex items-center justify-center h-48">
          <p className="text-gray-500 text-sm">No failure data</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              innerRadius="45%"
              outerRadius="65%"
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              iconSize={6}
              formatter={(value: string) => (
                <span style={{ color: '#6b7280', fontSize: '11px' }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
