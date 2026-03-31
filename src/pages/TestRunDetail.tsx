import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, RotateCcw, CheckCircle2, XCircle, MinusCircle,
  ChevronDown, ChevronRight, Cpu, GitBranch, GitCommit,
  Package, Layers, Clock, Zap, Terminal, ExternalLink,
  AlertTriangle, Timer, Hash,
} from 'lucide-react';
import { demoTestRuns, demoLogs } from '../utils/seedData';
import { StatusBadge } from '../components/common/Badge';
import { formatDuration, formatDateTime, formatPassRate } from '../utils/formatters';
import { LOG_LEVEL_COLORS } from '../utils/constants';
import type { TestStatus, TestCategory } from '../lib/types';

// ─── Mock result generation ────────────────────────────────────────────────────

interface MockTestResult {
  id: string;
  test_name: string;
  test_category: TestCategory;
  status: TestStatus;
  duration_ms: number;
  error_message?: string;
}

const TEST_NAMES_BY_SUITE: Record<string, { category: TestCategory; names: string[] }[]> = {
  smoke: [
    {
      category: 'smoke',
      names: [
        'device_boot_sequence', 'usb_enumeration_check', 'firmware_version_verify',
        'basic_connectivity_ping', 'agent_handshake', 'log_stream_alive',
        'watchdog_timer_active', 'flash_readback_crc',
      ],
    },
  ],
  regression: [
    {
      category: 'regression',
      names: [
        'suspend_resume_cycle', 'deep_sleep_entry', 'wake_on_modem',
        'battery_drain_idle', 'cpu_freq_scaling', 'thermal_throttle_recovery',
      ],
    },
    {
      category: 'integration',
      names: [
        'network_reconnect_after_sleep', 'file_system_integrity_check',
        'uart_baud_switch', 'gpio_interrupt_latency',
      ],
    },
  ],
  power: [
    {
      category: 'power',
      names: [
        'idle_current_draw_uA', 'active_current_draw_mA', 'sleep_mode_enter_exit',
        'wakeup_source_rtc', 'wakeup_source_gpio', 'power_rail_sequencing',
        'brown_out_detect', 'battery_voltage_adc',
      ],
    },
  ],
  firmware: [
    {
      category: 'firmware',
      names: [
        'ota_update_stage1', 'ota_update_stage2', 'rollback_on_crc_fail',
        'flash_write_erase_cycle', 'bootloader_handoff', 'signature_verify',
      ],
    },
    {
      category: 'hardware',
      names: [
        'spi_loopback_test', 'i2c_scan_expected_devices', 'adc_reference_voltage',
        'pwm_frequency_accuracy',
      ],
    },
  ],
  connectivity: [
    {
      category: 'integration',
      names: [
        'ble_scan_start_stop', 'ble_advertise_connectable', 'ble_pairing_bonding',
        'ble_throughput_1m_phy', 'ble_connection_stability', 'gatt_service_discovery',
      ],
    },
    {
      category: 'stress',
      names: [
        'ble_rapid_connect_disconnect', 'ble_max_connections', 'ble_channel_hop_stress',
      ],
    },
  ],
  stress: [
    {
      category: 'stress',
      names: [
        'cpu_load_100pct_60min', 'memory_alloc_exhaust', 'flash_write_endurance',
        'thermal_extreme_cycle', 'network_flood_receive', 'interrupt_storm_handling',
        'watchdog_recovery_loop', 'stack_overflow_guard',
      ],
    },
  ],
};

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function generateMockResults(
  runId: string,
  suiteName: string,
  total: number,
  passed: number,
  failed: number,
  skipped: number,
): MockTestResult[] {
  const rng = seededRandom(runId.split('').reduce((a, c) => a + c.charCodeAt(0), 0));
  const suite = TEST_NAMES_BY_SUITE[suiteName] ?? TEST_NAMES_BY_SUITE['smoke'];

  // Flatten all names across categories, tag each with its category
  const pool: { name: string; category: TestCategory }[] = suite.flatMap(g =>
    g.names.map(n => ({ name: n, category: g.category }))
  );

  // Repeat pool until we have enough entries
  const expanded: { name: string; category: TestCategory }[] = [];
  while (expanded.length < total) {
    for (const item of pool) {
      if (expanded.length >= total) break;
      expanded.push(item);
    }
  }

  // Assign statuses deterministically
  const failedIndices = new Set<number>();
  const skippedIndices = new Set<number>();

  while (failedIndices.size < failed) {
    failedIndices.add(Math.floor(rng() * total));
  }
  while (skippedIndices.size < skipped) {
    const idx = Math.floor(rng() * total);
    if (!failedIndices.has(idx)) skippedIndices.add(idx);
  }

  return expanded.slice(0, total).map((item, i) => {
    let status: TestStatus = 'passed';
    if (failedIndices.has(i)) status = 'failed';
    else if (skippedIndices.has(i)) status = 'skipped';

    const durationMs = Math.floor(rng() * 8000) + 200;

    return {
      id: `mock-${runId}-${i}`,
      test_name: item.name,
      test_category: item.category,
      status,
      duration_ms: durationMs,
      error_message:
        status === 'failed'
          ? `AssertionError: expected condition not met in ${item.name} (exit code 1)`
          : undefined,
    };
  });
}

// ─── Donut chart ───────────────────────────────────────────────────────────────

function PassRateDonut({ passed, total }: { passed: number; total: number }) {
  const pct = total > 0 ? passed / total : 0;
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct;
  const gap = circ - dash;

  const color = pct >= 0.9 ? '#10B981' : pct >= 0.7 ? '#F59E0B' : '#EF4444';

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="96" height="96" className="-rotate-90">
        <circle cx="48" cy="48" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <circle
          cx="48"
          cy="48"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={`${dash} ${gap}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="text-center -mt-1">
        <p className="text-2xl font-bold text-white">{Math.round(pct * 100)}%</p>
        <p className="text-xs text-gray-500">pass rate</p>
      </div>
    </div>
  );
}

// ─── Category group ────────────────────────────────────────────────────────────

interface CategoryGroupProps {
  category: TestCategory;
  results: MockTestResult[];
}

function CategoryGroup({ category, results }: CategoryGroupProps) {
  const [expanded, setExpanded] = useState(true);

  const sorted = [...results].sort((a, b) => {
    const order: Record<TestStatus, number> = {
      failed: 0, error: 1, timeout: 2, flaky: 3, skipped: 4, passed: 5,
    };
    return (order[a.status] ?? 9) - (order[b.status] ?? 9);
  });

  const passCount = results.filter(r => r.status === 'passed').length;
  const failCount = results.filter(r => ['failed', 'error', 'timeout'].includes(r.status)).length;
  const skipCount = results.filter(r => r.status === 'skipped').length;

  return (
    <div className="border border-white/8 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-white/[0.03] hover:bg-white/[0.05] transition-colors text-left"
      >
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
        )}
        <span className="text-sm font-medium text-white capitalize flex-1">{category}</span>
        <div className="flex items-center gap-3 text-xs">
          {failCount > 0 && (
            <span className="text-red-400">{failCount} failed</span>
          )}
          {skipCount > 0 && (
            <span className="text-gray-500">{skipCount} skipped</span>
          )}
          <span className="text-gray-600">{passCount}/{results.length}</span>
        </div>
      </button>

      {expanded && (
        <div className="divide-y divide-white/[0.04]">
          {sorted.map(result => (
            <div
              key={result.id}
              className="flex items-start gap-3 px-4 py-2.5 hover:bg-white/[0.02] transition-colors"
            >
              <div className="mt-0.5 flex-shrink-0">
                {result.status === 'passed' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : result.status === 'skipped' ? (
                  <MinusCircle className="w-4 h-4 text-gray-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-300 font-mono truncate">{result.test_name}</p>
                {result.error_message && (
                  <p className="text-xs text-red-400/70 mt-0.5 truncate">{result.error_message}</p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <StatusBadge status={result.status} />
                <span className="text-xs text-gray-600 font-mono w-14 text-right">
                  {formatDuration(result.duration_ms)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export function TestRunDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [rerunTooltip, setRerunTooltip] = useState(false);

  const run = useMemo(
    () => demoTestRuns.find(r => r.id === id),
    [id]
  );

  const deviceLogs = useMemo(() => {
    if (!run?.device_id) return [];
    return demoLogs
      .filter(l => l.device_id === run.device_id)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);
  }, [run?.device_id]);

  const mockResults = useMemo(() => {
    if (!run) return [];
    return generateMockResults(
      run.id,
      run.suite_name ?? 'smoke',
      run.total_tests,
      run.passed,
      Math.min(run.failed, run.total_tests - run.passed - run.skipped),
      run.skipped,
    );
  }, [run]);

  const groupedResults = useMemo(() => {
    const map = new Map<TestCategory, MockTestResult[]>();
    for (const r of mockResults) {
      const cat = r.test_category;
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(r);
    }
    return map;
  }, [mockResults]);

  if (!run) {
    return (
      <div className="p-6">
        <button
          onClick={() => navigate('/test-runs')}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Test Runs
        </button>
        <div className="glass-card p-12 flex flex-col items-center justify-center gap-4 text-center">
          <Zap className="w-10 h-10 text-gray-600" />
          <p className="text-lg font-semibold text-white">Run not found</p>
          <p className="text-sm text-gray-500">No test run with ID <span className="font-mono text-gray-400">{id}</span> exists.</p>
          <button onClick={() => navigate('/test-runs')} className="btn-secondary mt-2">
            Back to Test Runs
          </button>
        </div>
      </div>
    );
  }

  const passRate = run.total_tests > 0
    ? Math.round((run.passed / run.total_tests) * 100)
    : 0;

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">

      {/* Back + Re-run */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/test-runs')}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Test Runs
        </button>

        <div className="relative">
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-400 cursor-not-allowed opacity-60"
            onMouseEnter={() => setRerunTooltip(true)}
            onMouseLeave={() => setRerunTooltip(false)}
            disabled
          >
            <RotateCcw className="w-4 h-4" />
            Re-run
          </button>
          {rerunTooltip && (
            <div className="absolute right-0 top-full mt-2 z-10 bg-[#1a1a2e] border border-white/10 text-xs text-gray-300 rounded-lg px-3 py-2 whitespace-nowrap shadow-xl">
              Coming soon — triggers new run via API
            </div>
          )}
        </div>
      </div>

      {/* Header */}
      <div className="glass-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
          <div>
            <h1 className="text-xl font-bold text-white">{run.name}</h1>
            <p className="text-sm text-gray-500 mt-1 font-mono">{run.id}</p>
          </div>
          <StatusBadge status={run.status} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <MetaChip icon={<Clock className="w-3.5 h-3.5" />} label="Duration" value={formatDuration(run.duration_ms)} />
          <MetaChip icon={<Zap className="w-3.5 h-3.5" />} label="Trigger" value={run.trigger_type.replace('_', ' ')} capitalize />
          <MetaChip icon={<Cpu className="w-3.5 h-3.5" />} label="Device" value={run.device?.name ?? '—'} />
          <MetaChip icon={<GitBranch className="w-3.5 h-3.5" />} label="Branch" value={run.branch ?? '—'} mono />
          <MetaChip icon={<Package className="w-3.5 h-3.5" />} label="Build" value={run.build_number ?? '—'} mono />
          <MetaChip icon={<Layers className="w-3.5 h-3.5" />} label="Firmware" value={run.firmware_version ?? '—'} mono />
        </div>

        <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap gap-4 text-xs text-gray-500">
          <span>
            <span className="text-gray-600">Environment: </span>
            <span className="text-gray-300 capitalize">{run.environment}</span>
          </span>
          {run.started_at && (
            <span>
              <span className="text-gray-600">Started: </span>
              <span className="text-gray-300">{formatDateTime(run.started_at)}</span>
            </span>
          )}
          {run.completed_at && (
            <span>
              <span className="text-gray-600">Completed: </span>
              <span className="text-gray-300">{formatDateTime(run.completed_at)}</span>
            </span>
          )}
        </div>
      </div>

      {/* Two-column main content */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Left: test results tree (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Test Results</h2>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {run.passed} passed
              </span>
              {run.failed > 0 && (
                <span className="flex items-center gap-1 text-red-400">
                  <XCircle className="w-3.5 h-3.5" />
                  {run.failed} failed
                </span>
              )}
              {run.skipped > 0 && (
                <span className="flex items-center gap-1 text-gray-500">
                  <MinusCircle className="w-3.5 h-3.5" />
                  {run.skipped} skipped
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            {Array.from(groupedResults.entries()).map(([cat, results]) => (
              <CategoryGroup key={cat} category={cat} results={results} />
            ))}
          </div>
        </div>

        {/* Right: summary + device + CI info (2 cols) */}
        <div className="lg:col-span-2 space-y-4">

          {/* Pass rate donut */}
          <div className="glass-card p-5">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Run Summary
            </h3>
            <div className="flex items-center justify-between gap-4">
              <PassRateDonut passed={run.passed} total={run.total_tests} />
              <div className="space-y-2.5 flex-1">
                <SummaryRow label="Total" value={run.total_tests.toString()} />
                <SummaryRow label="Passed" value={run.passed.toString()} color="text-emerald-400" />
                <SummaryRow label="Failed" value={run.failed.toString()} color={run.failed > 0 ? 'text-red-400' : 'text-gray-500'} />
                <SummaryRow label="Skipped" value={run.skipped.toString()} color="text-gray-500" />
                <SummaryRow label="Duration" value={formatDuration(run.duration_ms)} />
                {run.error_count > 0 && (
                  <SummaryRow label="Errors" value={run.error_count.toString()} color="text-amber-400" />
                )}
              </div>
            </div>
          </div>

          {/* Device info */}
          {run.device && (
            <div className="glass-card p-5">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Device
              </h3>
              <div className="space-y-2">
                <InfoRow icon={<Cpu className="w-3.5 h-3.5" />} label={run.device.name} />
                <InfoRow icon={<Layers className="w-3.5 h-3.5" />} label={run.device.device_type} capitalize />
                {run.device.firmware_version && (
                  <InfoRow icon={<Package className="w-3.5 h-3.5" />} label={run.device.firmware_version} mono />
                )}
                {run.device.connection_type && (
                  <InfoRow icon={<Hash className="w-3.5 h-3.5" />} label={run.device.connection_type.toUpperCase()} mono />
                )}
              </div>
            </div>
          )}

          {/* CI trigger */}
          <div className="glass-card p-5">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              CI / Trigger
            </h3>
            <div className="space-y-2">
              <InfoRow icon={<Zap className="w-3.5 h-3.5" />} label={run.trigger_type.replace('_', ' ')} capitalize />
              {run.branch && (
                <InfoRow icon={<GitBranch className="w-3.5 h-3.5" />} label={run.branch} mono />
              )}
              {run.commit_sha && (
                <InfoRow
                  icon={<GitCommit className="w-3.5 h-3.5" />}
                  label={run.commit_sha.slice(0, 7)}
                  mono
                />
              )}
              {run.build_number && (
                <InfoRow icon={<Package className="w-3.5 h-3.5" />} label={run.build_number} mono />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Associated logs — full width */}
      {deviceLogs.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-gray-500" />
              Device Logs
            </h2>
            <Link
              to={`/logs`}
              className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              View all logs for this device
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          <div className="glass-card overflow-hidden">
            <div className="bg-[#060609] font-mono divide-y divide-white/[0.03]">
              {deviceLogs.map(log => (
                <div
                  key={log.id}
                  className="flex gap-3 px-4 py-2 hover:bg-white/[0.02] transition-colors text-xs"
                >
                  <span className="text-gray-700 flex-shrink-0 w-28 truncate">
                    {new Date(log.timestamp).toLocaleTimeString('en-US', {
                      hour12: false,
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                  <span
                    className={`w-9 text-center flex-shrink-0 font-bold uppercase ${LOG_LEVEL_COLORS[log.level] ?? 'text-gray-400'}`}
                  >
                    {log.level === 'fatal' ? 'FATL' : log.level.toUpperCase().slice(0, 4)}
                  </span>
                  {log.source && (
                    <span className="text-blue-400/60 flex-shrink-0 w-24 truncate">
                      [{log.source}]
                    </span>
                  )}
                  <span
                    className={`flex-1 ${LOG_LEVEL_COLORS[log.level] ?? 'text-gray-400'} ${
                      log.level === 'debug' || log.level === 'trace' ? 'opacity-60' : ''
                    }`}
                  >
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Small helpers ─────────────────────────────────────────────────────────────

function MetaChip({
  icon,
  label,
  value,
  mono = false,
  capitalize: cap = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
  capitalize?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-gray-500 text-xs">
        {icon}
        <span>{label}</span>
      </div>
      <span
        className={`text-sm text-white truncate ${mono ? 'font-mono' : ''} ${cap ? 'capitalize' : ''}`}
      >
        {value}
      </span>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  color = 'text-white',
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-gray-500">{label}</span>
      <span className={`font-medium ${color}`}>{value}</span>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  mono = false,
  capitalize: cap = false,
}: {
  icon: React.ReactNode;
  label: string;
  mono?: boolean;
  capitalize?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-gray-600 flex-shrink-0">{icon}</span>
      <span className={`text-gray-300 ${mono ? 'font-mono' : ''} ${cap ? 'capitalize' : ''}`}>
        {label}
      </span>
    </div>
  );
}
