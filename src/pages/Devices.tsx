import { demoDevices } from '../utils/seedData';
import { StatusDot } from '../components/common/StatusDot';
import { formatRelativeTime } from '../utils/formatters';
import { ComingSoonBadge } from '../components/common/Badge';
import { Cpu, Plus, Usb, Wifi, Terminal, Server, Radio } from 'lucide-react';

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
  android: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  ios: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  embedded: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  iot: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  web: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
  desktop: 'text-gray-400 bg-gray-400/10 border-gray-400/20',
  custom: 'text-pink-400 bg-pink-400/10 border-pink-400/20',
};

export function Devices() {
  const devices = demoDevices;
  const online = devices.filter(d => ['online', 'testing'].includes(d.status)).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Devices</h1>
          <p className="text-sm text-gray-400 mt-1">
            {online} active · {devices.length} total
          </p>
        </div>
        <button className="btn-secondary flex items-center gap-2 text-sm py-2 px-4">
          <Plus className="w-4 h-4" />
          Add Device
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Online', count: devices.filter(d => d.status === 'online').length, color: 'text-emerald-400' },
          { label: 'Testing', count: devices.filter(d => d.status === 'testing').length, color: 'text-blue-400' },
          { label: 'Offline', count: devices.filter(d => d.status === 'offline').length, color: 'text-gray-500' },
          { label: 'Maintenance', count: devices.filter(d => d.status === 'maintenance').length, color: 'text-amber-400' },
        ].map(s => (
          <div key={s.label} className="glass-card p-4 flex items-center justify-between">
            <span className="text-xs text-gray-400">{s.label}</span>
            <span className={`text-xl font-bold ${s.color}`}>{s.count}</span>
          </div>
        ))}
      </div>

      {/* Device grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {devices.map(device => {
          const ConnIcon = connectionIcons[device.connection_type || ''] || Cpu;
          return (
            <div key={device.id} className="glass-card-hover p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <StatusDot status={device.status} />
                  <div>
                    <p className="text-sm font-semibold text-white">{device.name}</p>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">{device.serial_number}</p>
                  </div>
                </div>
                <span className={`badge text-xs ${deviceTypeColors[device.device_type] || deviceTypeColors.custom}`}>
                  {device.device_type}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Firmware</span>
                  <span className="text-gray-300 font-mono">{device.firmware_version || '—'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Connection</span>
                  <div className="flex items-center gap-1 text-gray-300">
                    <ConnIcon className="w-3 h-3" />
                    <span className="uppercase">{device.connection_type}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Last seen</span>
                  <span className="text-gray-300">
                    {device.last_seen_at ? formatRelativeTime(device.last_seen_at) : '—'}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/5 flex gap-2">
                <button className="flex-1 btn-secondary text-xs py-1.5">
                  View Logs
                </button>
                <button className="flex-1 btn-secondary text-xs py-1.5">
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
