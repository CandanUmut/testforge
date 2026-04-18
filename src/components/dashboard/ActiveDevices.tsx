import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { Device } from '../../lib/types';
import { StatusDot } from '../common/StatusDot';
import { formatRelativeTime } from '../../utils/formatters';
import { useDataContext } from '../../contexts/DataContext';

export function ActiveDevices() {
  const { getScopedPath, devices } = useDataContext();

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Device Status</h3>
          <p className="text-xs text-gray-500 mt-0.5">{devices.filter(d => d.status === 'online' || d.status === 'testing').length} of {devices.length} active</p>
        </div>
        <Link to={getScopedPath('devices')} className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors">
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="divide-y divide-gray-100">
        {devices.map(device => (
          <DeviceRow key={device.id} device={device} />
        ))}
      </div>
    </div>
  );
}

function DeviceRow({ device }: { device: Device }) {
  const statusLabel: Record<string, string> = {
    online: 'Online',
    offline: 'Offline',
    testing: 'Running test',
    error: 'Error',
    maintenance: 'Maintenance',
  };

  return (
    <div className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition-colors">
      <StatusDot status={device.status} />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900 font-medium truncate">{device.name}</p>
        <p className="text-xs text-gray-500">{device.firmware_version} · {device.connection_type?.toUpperCase()}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-xs text-gray-400">{statusLabel[device.status]}</p>
        {device.last_seen_at && (
          <p className="text-xs text-gray-600">{formatRelativeTime(device.last_seen_at)}</p>
        )}
      </div>
    </div>
  );
}
