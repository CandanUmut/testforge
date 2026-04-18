import { useState, useMemo } from 'react';
import { demoLogs, demoDevices } from '../utils/seedData';
import { LOG_LEVEL_COLORS } from '../utils/constants';
import { formatDateTime } from '../utils/formatters';
import { Search, Filter } from 'lucide-react';
import type { LogLevel } from '../lib/types';

const ALL_LEVELS: LogLevel[] = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];

const levelBg: Record<LogLevel, string> = {
  trace: 'bg-gray-100 border-gray-200',
  debug: 'bg-gray-100 border-gray-200',
  info: 'bg-blue-50 border-blue-200',
  warn: 'bg-amber-50 border-amber-200',
  error: 'bg-red-50 border-red-200',
  fatal: 'bg-red-100 border-red-300',
};

export function LogExplorer() {
  const [search, setSearch] = useState('');
  const [levelFilters, setLevelFilters] = useState<Set<LogLevel>>(new Set(['info', 'warn', 'error', 'fatal']));
  const [deviceFilter, setDeviceFilter] = useState<string>('all');

  function toggleLevel(level: LogLevel) {
    setLevelFilters(prev => {
      const next = new Set(prev);
      if (next.has(level)) next.delete(level);
      else next.add(level);
      return next;
    });
  }

  const filtered = useMemo(() => {
    return demoLogs.filter(log => {
      if (!levelFilters.has(log.level)) return false;
      if (deviceFilter !== 'all' && log.device_id !== deviceFilter) return false;
      if (search && !log.message.toLowerCase().includes(search.toLowerCase()) && !(log.source?.toLowerCase().includes(search.toLowerCase()))) return false;
      return true;
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [search, levelFilters, deviceFilter]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0 space-y-4 bg-white">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Log Explorer</h1>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} log entries</p>
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search messages, sources..."
              className="input-field pl-10 font-mono text-sm"
            />
          </div>
          <select
            value={deviceFilter}
            onChange={e => setDeviceFilter(e.target.value)}
            className="input-field w-auto min-w-[180px] text-sm"
          >
            <option value="all">All devices</option>
            {demoDevices.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        {/* Level filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <Filter className="w-3.5 h-3.5 text-gray-400" />
          {ALL_LEVELS.map(level => (
            <button
              key={level}
              onClick={() => toggleLevel(level)}
              className={`px-2.5 py-0.5 rounded-full text-xs font-medium border transition-all font-mono ${
                levelFilters.has(level)
                  ? `${levelBg[level]} ${LOG_LEVEL_COLORS[level]}`
                  : 'bg-gray-50 border-gray-200 text-gray-400'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Log output */}
      <div className="flex-1 overflow-y-auto bg-gray-50 font-mono">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
            No logs match current filters
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map(log => {
              const device = demoDevices.find(d => d.id === log.device_id);
              return (
                <div key={log.id} className="flex gap-3 px-4 py-2 bg-white hover:bg-gray-50 transition-colors group text-xs border-b border-gray-50">
                  {/* Timestamp */}
                  <span className="text-gray-400 flex-shrink-0 w-28 truncate">
                    {new Date(log.timestamp).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>

                  {/* Level */}
                  <span className={`w-9 text-center flex-shrink-0 font-bold uppercase ${LOG_LEVEL_COLORS[log.level]}`}>
                    {log.level === 'fatal' ? 'FATL' : log.level.toUpperCase().slice(0, 4)}
                  </span>

                  {/* Source */}
                  {log.source && (
                    <span className="text-indigo-500 flex-shrink-0 w-24 truncate">[{log.source}]</span>
                  )}

                  {/* Device */}
                  {device && (
                    <span className="text-gray-400 flex-shrink-0 w-24 truncate hidden md:block">{device.serial_number}</span>
                  )}

                  {/* Message */}
                  <span className={`flex-1 ${LOG_LEVEL_COLORS[log.level]} ${log.level === 'debug' || log.level === 'trace' ? 'opacity-60' : ''}`}>
                    {log.message}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
