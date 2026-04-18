import { useState } from 'react';
import { useDevices } from '../hooks/useDevices';
import { StatusDot } from '../components/common/StatusDot';
import { formatRelativeTime } from '../utils/formatters';
import { ComingSoonBadge } from '../components/common/Badge';
import { Cpu, Plus, Usb, Wifi, Terminal, Server, Radio, Search, Battery, Signal } from 'lucide-react';
import type { DeviceStatus } from '../lib/types';

const connectionIcons: Record<string, typeof Cpu> = {
  adb: Terminal,
  uart: Radio,
  ssh: Server,
  usb: Usb,
  wifi: Wifi,
  api: Server,
  agent: Server,
};

const deviceTypeColors: Record<string, string> = {
  android: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  ios: 'text-blue-600 bg-blue-50 border-blue-200',
  embedded: 'text-amber-600 bg-amber-50 border-amber-200',
  iot: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  web: 'text-cyan-600 bg-cyan-50 border-cyan-200',
  desktop: 'text-gray-600 bg-gray-100 border-gray-200',
  custom: 'text-pink-600 bg-pink-50 border-pink-200',
};

const statusColors: Record<string, string> = {
  online: 'text-emerald-600',
  offline: 'text-gray-500',
  testing: 'text-blue-600',
  maintenance: 'text-amber-600',
  flashing: 'text-blue-500',
  error: 'text-red-500',
};

type StatusFilterType = DeviceStatus | 'all';

export function Devices() {
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('all');
  const [search, setSearch] = useState('');
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);

  const { devices, loading } = useDevices({
    status: statusFilter === 'all' ? undefined : statusFilter,
    search: search || undefined,
  });

  // Get all devices for counts (unfiltered)
  const { devices: allDevices } = useDevices();

  const online = allDevices.filter(d => ['online', 'testing'].includes(d.status)).length;

  const statusCounts = [
    { label: 'Online', status: 'online' as const, count: allDevices.filter(d => d.status === 'online').length, color: 'text-emerald-600' },
    { label: 'Testing', status: 'testing' as const, count: allDevices.filter(d => d.status === 'testing').length, color: 'text-blue-600' },
    { label: 'Offline', status: 'offline' as const, count: allDevices.filter(d => d.status === 'offline').length, color: 'text-gray-500' },
    { label: 'Maintenance', status: 'maintenance' as const, count: allDevices.filter(d => d.status === 'maintenance').length, color: 'text-amber-600' },
    { label: 'Flashing', status: 'flashing' as const, count: allDevices.filter(d => d.status === 'flashing').length, color: 'text-blue-500' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Devices</h1>
          <p className="text-sm text-gray-500 mt-1">
            {online} active &middot; {allDevices.length} total
          </p>
        </div>
        <button className="btn-primary flex items-center gap-2 text-sm py-2 px-4">
          <Plus className="w-4 h-4" />
          Add Device
        </button>
      </div>

      {/* Search and filter */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search devices..."
            className="input-field pl-10 py-2 text-sm w-full"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500">Status:</span>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
              statusFilter === 'all'
                ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                : 'bg-white border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            All
          </button>
          {statusCounts.filter(s => s.count > 0).map(s => (
            <button
              key={s.status}
              onClick={() => setStatusFilter(s.status)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                statusFilter === s.status
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                  : 'bg-white border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {s.label} ({s.count})
            </button>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {statusCounts.map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center justify-between">
            <span className="text-xs text-gray-500">{s.label}</span>
            <span className={`text-xl font-bold ${s.color}`}>{s.count}</span>
          </div>
        ))}
      </div>

      {/* Device grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {devices.map(device => {
          const ConnIcon = connectionIcons[device.connection_type || ''] || Cpu;
          const isSelected = selectedDevice === device.id;
          return (
            <div
              key={device.id}
              onClick={() => setSelectedDevice(isSelected ? null : device.id)}
              className={`bg-white rounded-xl border shadow-sm p-5 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md ${
                isSelected ? 'border-indigo-300 ring-2 ring-indigo-100' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <StatusDot status={device.status} />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{device.name}</p>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">{device.serial_number}</p>
                  </div>
                </div>
                <span className={`badge text-xs ${deviceTypeColors[device.device_type] || deviceTypeColors.custom}`}>
                  {device.device_type}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className={`font-medium capitalize ${statusColors[device.status] || 'text-gray-700'}`}>
                    {device.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Firmware</span>
                  <span className="text-gray-700 font-mono">{device.firmware_version || '\u2014'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Connection</span>
                  <div className="flex items-center gap-1 text-gray-700">
                    <ConnIcon className="w-3 h-3" />
                    <span className="uppercase">{device.connection_type}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Last seen</span>
                  <span className="text-gray-700">
                    {device.last_seen_at ? formatRelativeTime(device.last_seen_at) : '\u2014'}
                  </span>
                </div>
                {device.battery_level != null && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 flex items-center gap-1">
                      <Battery className="w-3 h-3" /> Battery
                    </span>
                    <span className={`font-medium ${
                      device.battery_level > 50 ? 'text-emerald-600' :
                      device.battery_level > 20 ? 'text-amber-600' : 'text-red-500'
                    }`}>
                      {device.battery_level}%
                    </span>
                  </div>
                )}
                {device.carrier && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 flex items-center gap-1">
                      <Signal className="w-3 h-3" /> Carrier
                    </span>
                    <span className="text-gray-700">{device.carrier}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                <button className="flex-1 btn-secondary text-xs py-1.5">
                  View Logs
                </button>
                <button className="flex-1 btn-secondary text-xs py-1.5 flex items-center justify-center gap-1">
                  Run Test
                  <ComingSoonBadge />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
