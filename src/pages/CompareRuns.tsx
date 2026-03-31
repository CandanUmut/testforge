import { useMemo, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, CheckCircle2, XCircle, MinusCircle,
  TrendingDown, TrendingUp, AlertTriangle, Download, GitBranch,
  Cpu, Clock, BarChart2, Zap,
} from 'lucide-react';
import { demoTestRuns } from '../utils/seedData';
import { StatusBadge } from '../components/common/Badge';
import { formatDuration, formatDateTime, formatPassRate } from '../utils/formatters';
import type { TestRun, TestCategory } from '../lib/types';

// ─── Mock comparison generation ───────────────────────────────────────────────

interface ChangedTest {
  test_name: string;
  category: TestCategory;
  statusA: 'passed' | 'failed' | 'skipped';
  statusB: 'passed' | 'failed' | 'skipped';
  kind: 'regression' | 'fixed' | 'new_failure';
}

const TEST_NAMES_BY_SUITE: Record<string, { category: TestCategory; names: string[] }> = {
  smoke: {
    category: 'smoke',
    names: [
      'device_boot_sequence', 'usb_enumeration_check', 'firmware_version_verify',
      'basic_connectivity_ping', 'agent_handshake', 'log_stream_alive',
    ],
  },
  regression: {
    category: 'regression',
    names: [
      'suspend_resume_cycle', 'deep_sleep_entry', 'wake_on_modem',
      'battery_drain_idle', 'cpu_freq_scaling', 'thermal_throttle_recovery',
    ],
  },
  power: {
    category: 'power',
    names: [
      'idle_current_draw_uA', 'active_current_draw_mA', 'sleep_mode_enter_exit',
      'wakeup_source_rtc', 'wakeup_source_gpio', 'power_rail_sequencing',
    ],
  },
  firmware: {
    category: 'firmware',
    names: [
      'ota_update_stage1', 'ota_update_stage2', 'rollback_on_crc_fail',
      'flash_write_erase_cycle', 'bootloader_handoff', 'signature_verify',
    ],
  },
  connectivity: {
    category: 'integration',
    names: [
      'ble_scan_start_stop', 'ble_advertise_connectable', 'ble_pairing_bonding',
      'ble_throughput_1m_phy', 'ble_connection_stability', 'gatt_service_discovery',
    ],
  },
  stress: {
    category: 'stress',
    names: [
      'cpu_load_100pct_60min', 'memory_alloc_exhaust', 'flash_write_endurance',
      'thermal_extreme_cycle', 'network_flood_receive', 'interrupt_storm_handling',
    ],
  },
};

function generateMockComparison(runA: TestRun, runB: TestRun): ChangedTest[] {
  const suiteKey = runA.suite_name ?? 'smoke';
  const group = TEST_NAMES_BY_SUITE[suiteKey] ?? TEST_NAMES_BY_SUITE['smoke'];

  // Deterministic seed from both run IDs
  const seed = (runA.id + runB.id)
    .split('')
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);

  let s = seed;
  const rng = () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };

  const names = [...group.names];
  // Shuffle deterministically
  for (let i = names.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [names[i], names[j]] = [names[j], names[i]];
  }

  const results: ChangedTest[] = [];

  // 3 regressions: passed in A → failed in B
  for (let i = 0; i < 3 && i < names.length; i++) {
    results.push({
      test_name: names[i],
      category: group.category,
      statusA: 'passed',
      statusB: 'failed',
      kind: 'regression',
    });
  }

  // 2 fixes: failed in A → passed in B
  for (let i = 3; i < 5 && i < names.length; i++) {
    results.push({
      test_name: names[i],
      category: group.category,
      statusA: 'failed',
      statusB: 'passed',
      kind: 'fixed',
    });
  }

  return results;
}

// ─── Small helper components ──────────────────────────────────────────────────

function PassRateBar({ passed, total, label }: { passed: number; total: number; label: string }) {
  const pct = total > 0 ? Math.round((passed / total) * 100) : 0;
  const color = pct >= 90 ? 'bg-emerald-500' : pct >= 70 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-400">{label}</span>
        <span className="text-white font-semibold">{pct}%</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function KindIcon({ kind }: { kind: ChangedTest['kind'] }) {
  if (kind === 'regression') return <TrendingDown className="w-3.5 h-3.5 text-red-400" />;
  if (kind === 'fixed') return <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />;
  return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
}

function StatusIcon({ status }: { status: 'passed' | 'failed' | 'skipped' }) {
  if (status === 'passed') return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
  if (status === 'skipped') return <MinusCircle className="w-3.5 h-3.5 text-gray-500" />;
  return <XCircle className="w-3.5 h-3.5 text-red-400" />;
}

function RunCard({ run, label }: { run: TestRun; label: 'A' | 'B' }) {
  const pct = run.total_tests > 0
    ? Math.round((run.passed / run.total_tests) * 100)
    : 0;

  return (
    <div className="glass-card p-5 flex-1">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Run {label}</span>
        <StatusBadge status={run.status} />
      </div>

      <Link
        to={`/test-runs/${run.id}`}
        className="block hover:text-blue-300 transition-colors"
      >
        <h3 className="text-base font-bold text-white leading-tight hover:text-blue-300 transition-colors">
          {run.name}
        </h3>
      </Link>
      <p className="text-xs text-gray-600 font-mono mt-0.5">{run.id}</p>

      <div className="mt-4 space-y-3">
        <PassRateBar passed={run.passed} total={run.total_tests} label="Pass rate" />

        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="space-y-0.5">
            <p className="text-xs text-gray-500">Total tests</p>
            <p className="text-sm font-semibold text-white">{run.total_tests}</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-xs text-gray-500">Pass rate</p>
            <p className="text-sm font-semibold text-white">{pct}%</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-xs text-gray-500">Failed</p>
            <p className={`text-sm font-semibold ${run.failed > 0 ? 'text-red-400' : 'text-gray-500'}`}>
              {run.failed}
            </p>
          </div>
          <div className="space-y-0.5">
            <p className="text-xs text-gray-500">Duration</p>
            <p className="text-sm font-semibold text-white">{formatDuration(run.duration_ms)}</p>
          </div>
        </div>

        <div className="border-t border-white/5 pt-3 space-y-1.5">
          {run.device && (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Cpu className="w-3 h-3 text-gray-600 flex-shrink-0" />
              <span className="truncate">{run.device.name}</span>
            </div>
          )}
          {run.branch && (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <GitBranch className="w-3 h-3 text-gray-600 flex-shrink-0" />
              <span className="font-mono truncate">{run.branch}</span>
            </div>
          )}
          {run.started_at && (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Clock className="w-3 h-3 text-gray-600 flex-shrink-0" />
              <span>{formatDateTime(run.started_at)}</span>
            </div>
          )}
          {run.build_number && (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Zap className="w-3 h-3 text-gray-600 flex-shrink-0" />
              <span className="font-mono">{run.build_number}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Empty state ───────────────────────────────────────────────────────────────

function EmptyCompare({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  return (
    <div className="p-6">
      <button
        onClick={() => navigate('/test-runs')}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Test Runs
      </button>
      <div className="glass-card p-12 flex flex-col items-center justify-center gap-4 text-center max-w-md mx-auto">
        <BarChart2 className="w-10 h-10 text-gray-600" />
        <p className="text-lg font-semibold text-white">Select runs to compare</p>
        <p className="text-sm text-gray-500">
          Go back to Test Runs and select two runs using the checkboxes, then click
          "Compare 2 runs".
        </p>
        <button onClick={() => navigate('/test-runs')} className="btn-secondary mt-2">
          Back to Test Runs
        </button>
      </div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-3 shadow-2xl text-sm text-white animate-in">
      <span>{message}</span>
      <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors text-xs">✕</button>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export function CompareRuns() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [toast, setToast] = useState<string | null>(null);

  const idA = searchParams.get('a') ?? '';
  const idB = searchParams.get('b') ?? '';

  const runA = useMemo(() => demoTestRuns.find(r => r.id === idA), [idA]);
  const runB = useMemo(() => demoTestRuns.find(r => r.id === idB), [idB]);

  const changes = useMemo(() => {
    if (!runA || !runB) return [];
    return generateMockComparison(runA, runB);
  }, [runA, runB]);

  if (!runA || !runB) {
    return <EmptyCompare navigate={navigate} />;
  }

  const regressions = changes.filter(c => c.kind === 'regression');
  const fixes = changes.filter(c => c.kind === 'fixed');
  const newFailures = changes.filter(c => c.kind === 'new_failure');

  function handleExport() {
    setToast('Export coming soon — CSV diff will be available via API');
    setTimeout(() => setToast(null), 3500);
  }

  const passRateDiff = runB.total_tests > 0 && runA.total_tests > 0
    ? Math.round((runB.passed / runB.total_tests - runA.passed / runA.total_tests) * 100)
    : 0;

  const failDiff = runB.failed - runA.failed;

  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto">

      {/* Header row */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/test-runs')}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Test Runs
        </button>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 hover:text-white hover:bg-white/8 transition-all"
        >
          <Download className="w-4 h-4" />
          Export diff as CSV
        </button>
      </div>

      <div>
        <h1 className="text-xl font-bold text-white">Compare Runs</h1>
        <p className="text-sm text-gray-500 mt-1">
          Diff between{' '}
          <span className="text-gray-300 font-mono">{runA.id}</span>
          {' '}and{' '}
          <span className="text-gray-300 font-mono">{runB.id}</span>
        </p>
      </div>

      {/* Run cards side by side */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch">
        <RunCard run={runA} label="A" />

        {/* VS divider */}
        <div className="flex sm:flex-col items-center justify-center gap-3 py-2 sm:py-0">
          <div className="flex-1 sm:flex-none h-px sm:h-full sm:w-px bg-white/8 sm:min-h-[40px]" />
          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
            <ArrowRight className="w-3.5 h-3.5 text-gray-500" />
          </div>
          <div className="flex-1 sm:flex-none h-px sm:h-full sm:w-px bg-white/8 sm:min-h-[40px]" />
        </div>

        <RunCard run={runB} label="B" />
      </div>

      {/* Delta summary chips */}
      <div className="glass-card p-4 flex flex-wrap gap-4">
        <DeltaChip
          label="Pass rate change"
          value={passRateDiff >= 0 ? `+${passRateDiff}%` : `${passRateDiff}%`}
          positive={passRateDiff >= 0}
        />
        <DeltaChip
          label="Failures change"
          value={failDiff > 0 ? `+${failDiff}` : failDiff < 0 ? `${failDiff}` : '0'}
          positive={failDiff <= 0}
        />
        <DeltaChip
          label="Regressions"
          value={regressions.length.toString()}
          positive={regressions.length === 0}
          neutral={regressions.length === 0}
        />
        <DeltaChip
          label="Fixed tests"
          value={fixes.length.toString()}
          positive={fixes.length > 0}
          neutral={fixes.length === 0}
        />
        <DeltaChip
          label="Total changed"
          value={changes.length.toString()}
          positive={false}
          neutral={changes.length === 0}
        />
      </div>

      {/* Changes table */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-white">Test Status Changes</h2>

        {changes.length === 0 ? (
          <div className="glass-card p-10 flex flex-col items-center gap-3 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            <p className="text-sm text-gray-400">No status changes detected between these runs.</p>
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/8">
                    <th className="table-header">Test name</th>
                    <th className="table-header hidden sm:table-cell">Category</th>
                    <th className="table-header">Run A</th>
                    <th className="table-header">Run B</th>
                    <th className="table-header">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Regressions first */}
                  {regressions.map(ch => (
                    <ChangeRow key={`reg-${ch.test_name}`} change={ch} />
                  ))}
                  {/* Then fixes */}
                  {fixes.map(ch => (
                    <ChangeRow key={`fix-${ch.test_name}`} change={ch} />
                  ))}
                  {/* Then new failures */}
                  {newFailures.map(ch => (
                    <ChangeRow key={`new-${ch.test_name}`} change={ch} />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Legend */}
            <div className="border-t border-white/5 px-4 py-3 flex flex-wrap gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <TrendingDown className="w-3 h-3 text-red-400" />
                Regression (pass → fail)
              </span>
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-3 h-3 text-emerald-400" />
                Fixed (fail → pass)
              </span>
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                New failure
              </span>
            </div>
          </div>
        )}
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

// ─── ChangeRow ─────────────────────────────────────────────────────────────────

function ChangeRow({ change }: { change: ChangedTest }) {
  const kindLabel: Record<ChangedTest['kind'], string> = {
    regression: 'Regression',
    fixed: 'Fixed',
    new_failure: 'New failure',
  };
  const kindColor: Record<ChangedTest['kind'], string> = {
    regression: 'text-red-400',
    fixed: 'text-emerald-400',
    new_failure: 'text-amber-400',
  };

  return (
    <tr className="table-row">
      <td className="table-cell">
        <span className="text-xs font-mono text-gray-300">{change.test_name}</span>
      </td>
      <td className="table-cell hidden sm:table-cell">
        <span className="text-xs text-gray-500 capitalize">{change.category}</span>
      </td>
      <td className="table-cell">
        <span className="flex items-center gap-1.5">
          <StatusIcon status={change.statusA} />
          <span className="text-xs text-gray-400 capitalize">{change.statusA}</span>
        </span>
      </td>
      <td className="table-cell">
        <span className="flex items-center gap-1.5">
          <StatusIcon status={change.statusB} />
          <span className="text-xs text-gray-400 capitalize">{change.statusB}</span>
        </span>
      </td>
      <td className="table-cell">
        <span className={`flex items-center gap-1.5 text-xs font-medium ${kindColor[change.kind]}`}>
          <KindIcon kind={change.kind} />
          {kindLabel[change.kind]}
        </span>
      </td>
    </tr>
  );
}

// ─── DeltaChip ─────────────────────────────────────────────────────────────────

function DeltaChip({
  label,
  value,
  positive,
  neutral = false,
}: {
  label: string;
  value: string;
  positive: boolean;
  neutral?: boolean;
}) {
  const color = neutral
    ? 'text-gray-400'
    : positive
    ? 'text-emerald-400'
    : 'text-red-400';

  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-gray-600">{label}</span>
      <span className={`text-sm font-semibold ${color}`}>{value}</span>
    </div>
  );
}
