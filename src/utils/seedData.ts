import type {
  Organization, Device, TestRun, Crash, Log, Alert, ApiKey, DemoData,
} from '../lib/types';

const ORG_ID = 'd0000000-0000-0000-0000-000000000001';
const now = new Date();
const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000).toISOString();
const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600000).toISOString();
const minutesAgo = (m: number) => new Date(now.getTime() - m * 60000).toISOString();

export const demoOrganization: Organization = {
  id: ORG_ID,
  name: 'TestForge Demo',
  slug: 'testforge-demo',
  plan: 'professional',
  settings: {},
  created_at: daysAgo(90),
  updated_at: daysAgo(1),
};

export const demoDevices: Device[] = [
  {
    id: 'd1000000-0000-0000-0000-000000000001',
    organization_id: ORG_ID,
    name: 'Pixel 8 Pro #1',
    device_type: 'android',
    serial_number: 'PX8P-001-A',
    firmware_version: 'android-14-r27',
    status: 'online',
    connection_type: 'adb',
    metadata: {},
    last_seen_at: minutesAgo(2),
    created_at: daysAgo(60),
  },
  {
    id: 'd1000000-0000-0000-0000-000000000002',
    organization_id: ORG_ID,
    name: 'Pixel 8 Pro #2',
    device_type: 'android',
    serial_number: 'PX8P-002-B',
    firmware_version: 'android-14-r27',
    status: 'testing',
    connection_type: 'adb',
    metadata: {},
    last_seen_at: minutesAgo(1),
    created_at: daysAgo(60),
  },
  {
    id: 'd1000000-0000-0000-0000-000000000003',
    organization_id: ORG_ID,
    name: 'IoT Sensor Hub v3',
    device_type: 'iot',
    serial_number: 'IOTS-003-C',
    firmware_version: 'fw-2.4.1',
    status: 'online',
    connection_type: 'uart',
    metadata: {},
    last_seen_at: minutesAgo(5),
    created_at: daysAgo(45),
  },
  {
    id: 'd1000000-0000-0000-0000-000000000004',
    organization_id: ORG_ID,
    name: 'Smart Display Dev Kit',
    device_type: 'embedded',
    serial_number: 'SDDK-004-D',
    firmware_version: 'fw-1.8.0',
    status: 'offline',
    connection_type: 'ssh',
    metadata: {},
    last_seen_at: hoursAgo(2),
    created_at: daysAgo(30),
  },
  {
    id: 'd1000000-0000-0000-0000-000000000005',
    organization_id: ORG_ID,
    name: 'NRF52 BLE Module',
    device_type: 'embedded',
    serial_number: 'NRF-005-E',
    firmware_version: 'fw-3.1.2',
    status: 'online',
    connection_type: 'uart',
    metadata: {},
    last_seen_at: minutesAgo(8),
    created_at: daysAgo(45),
  },
  {
    id: 'd1000000-0000-0000-0000-000000000006',
    organization_id: ORG_ID,
    name: 'T730 Modem Board',
    device_type: 'embedded',
    serial_number: 'T730-006-F',
    firmware_version: 'fw-5.0.3',
    status: 'maintenance',
    connection_type: 'adb',
    metadata: {},
    last_seen_at: minutesAgo(30),
    created_at: daysAgo(60),
  },
];

const deviceIds = demoDevices.map(d => d.id).filter((_, i) => i !== 3);

const suiteNames = [
  'Smoke Test Suite', 'Full Regression', 'Power State Validation',
  'Firmware Flash Verify', 'LTE Band Qualification', 'BLE Connectivity Test',
  'Stress Test 24hr', 'OTA Update Validation',
];

const triggerTypes = ['ci_cd', 'ci_cd', 'ci_cd', 'scheduled', 'manual', 'webhook'] as const;
const statuses = ['passed', 'passed', 'passed', 'passed', 'passed', 'failed', 'failed', 'error', 'timeout'] as const;
const branches = ['main', 'main', 'develop', 'feature/power-opt', 'feature/ble-v2', 'hotfix/crash-fix'];
const environments = ['staging', 'staging', 'production', 'development'];

function rand<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const demoTestRuns: TestRun[] = Array.from({ length: 50 }, (_, i) => {
  const daysBack = Math.random() * 30;
  const created = new Date(now.getTime() - daysBack * 86400000);
  const status = rand(statuses);
  const total = randInt(20, 200);
  const passed = status === 'passed'
    ? Math.floor(total * (0.9 + Math.random() * 0.1))
    : Math.floor(total * (0.4 + Math.random() * 0.3));
  const failed = status === 'passed'
    ? Math.floor(total * Math.random() * 0.05)
    : Math.floor(total * (0.1 + Math.random() * 0.3));
  const deviceId = rand(deviceIds);
  const device = demoDevices.find(d => d.id === deviceId);

  return {
    id: `run-${String(i).padStart(4, '0')}`,
    organization_id: ORG_ID,
    device_id: deviceId,
    name: rand(suiteNames),
    suite_name: rand(['smoke', 'regression', 'power', 'firmware', 'connectivity', 'stress']),
    trigger_type: rand(triggerTypes),
    status,
    total_tests: total,
    passed,
    failed: Math.min(failed, total - passed),
    skipped: randInt(0, 5),
    error_count: ['error', 'timeout'].includes(status) ? randInt(1, 5) : 0,
    duration_ms: randInt(60000, 3600000),
    firmware_version: `fw-${randInt(1, 5)}.${randInt(0, 9)}.${randInt(0, 19)}`,
    build_number: `build-${randInt(100, 600)}`,
    branch: rand(branches),
    environment: rand(environments),
    metadata: {},
    started_at: created.toISOString(),
    completed_at: new Date(created.getTime() + randInt(60000, 7200000)).toISOString(),
    created_at: created.toISOString(),
    device,
  };
}).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

export const demoCrashes: Crash[] = [
  {
    id: 'crash-001',
    organization_id: ORG_ID,
    device_id: 'd1000000-0000-0000-0000-000000000001',
    title: 'Kernel panic during suspend-to-RAM transition',
    crash_type: 'kernel_panic',
    severity: 'critical',
    status: 'investigating',
    occurrence_count: 12,
    first_seen_at: daysAgo(5),
    last_seen_at: hoursAgo(2),
    stack_trace: `kernel BUG at drivers/base/power/main.c:1187!
Call Trace:
 dpm_suspend+0x234/0x450
 suspend_devices_and_enter+0xc8/0x780
 pm_suspend+0x2ec/0x380
 state_store+0x78/0xb0`,
    ai_analysis: 'Pattern indicates a race condition in the power management driver during suspend. The crash occurs when a USB device is disconnected during the suspend transition. Related to known issue in kernel 5.15.x power management subsystem.',
    ai_suggested_fix: 'Apply patch from kernel commit a3b2c1d. Pin USB hub driver state before initiating suspend sequence. Add mutex lock around dpm_suspend path.',
    fingerprint: 'kernel-panic-dpm-suspend-usb',
    metadata: {},
    created_at: daysAgo(5),
    device: demoDevices[0],
  },
  {
    id: 'crash-002',
    organization_id: ORG_ID,
    device_id: 'd1000000-0000-0000-0000-000000000003',
    title: 'OOM kill during BLE scanning + WiFi simultaneous',
    crash_type: 'oom',
    severity: 'high',
    status: 'new',
    occurrence_count: 8,
    first_seen_at: daysAgo(3),
    last_seen_at: now.toISOString(),
    stack_trace: `Out of memory: Kill process 1847 (bt_scanner) score 420 or sacrifice child
Killed process 1847 (bt_scanner) total-vm:45320kB, anon-rss:38400kB`,
    ai_analysis: 'Memory exhaustion when BLE scanning and WiFi AP mode are active simultaneously. The BLE scanner allocates ~38MB for scan result buffering without pagination. Combined with WiFi AP memory overhead, this exceeds the 64MB available on this SoC.',
    ai_suggested_fix: 'Implement BLE scan result ring buffer with 4MB cap. Add memory pressure callback to reduce scan window when available memory drops below 8MB threshold.',
    fingerprint: 'oom-ble-scan-wifi-coexist',
    metadata: {},
    created_at: daysAgo(3),
    device: demoDevices[2],
  },
  {
    id: 'crash-003',
    organization_id: ORG_ID,
    device_id: 'd1000000-0000-0000-0000-000000000006',
    title: 'Modem firmware assert: invalid PDN context',
    crash_type: 'assertion',
    severity: 'high',
    status: 'identified',
    occurrence_count: 23,
    first_seen_at: daysAgo(14),
    last_seen_at: daysAgo(1),
    stack_trace: `ASSERT FAILED: pdnCtx != NULL at modem/src/pdn_manager.c:445
Backtrace:
 #0 pdn_activate_default+0x128
 #1 attach_procedure+0x340
 #2 emm_service_request+0x1a8`,
    ai_analysis: 'The PDN context becomes NULL when a network-initiated detach occurs during an ongoing service request. The modem firmware does not handle the race between detach and service request procedures.',
    ai_suggested_fix: 'Add null check with graceful re-attach at pdn_manager.c:445. Queue service request to retry after re-attach completes. Firmware update to v5.1.0+ includes the fix.',
    fingerprint: 'assert-pdn-null-detach-race',
    metadata: {},
    created_at: daysAgo(14),
    device: demoDevices[5],
  },
  {
    id: 'crash-004',
    organization_id: ORG_ID,
    device_id: 'd1000000-0000-0000-0000-000000000002',
    title: 'ANR in SystemUI during notification flood',
    crash_type: 'anr',
    severity: 'medium',
    status: 'new',
    occurrence_count: 5,
    first_seen_at: daysAgo(7),
    last_seen_at: daysAgo(3),
    stack_trace: `ANR in com.android.systemui
Reason: Input dispatching timed out (StatusBar)
CPU usage: 98% user, 1% kernel
Main thread:
  at android.view.ViewRootImpl.performTraversals(ViewRootImpl.java:3401)`,
    ai_analysis: 'ANR triggered when >50 notifications arrive within 2 seconds. The StatusBar attempts to animate each notification individually, causing the main thread to block on layout passes.',
    ai_suggested_fix: 'Batch notification updates using a 500ms debounce window. Collapse notifications beyond threshold into a summary group. Offload animation calculations to RenderThread.',
    fingerprint: 'anr-systemui-notif-flood',
    metadata: {},
    created_at: daysAgo(7),
    device: demoDevices[1],
  },
  {
    id: 'crash-005',
    organization_id: ORG_ID,
    device_id: 'd1000000-0000-0000-0000-000000000005',
    title: 'Watchdog reset: BLE stack unresponsive',
    crash_type: 'watchdog',
    severity: 'critical',
    status: 'fixed',
    occurrence_count: 45,
    first_seen_at: daysAgo(20),
    last_seen_at: daysAgo(10),
    stack_trace: `WDT: Task bt_task not responding for 15000ms
Reset reason: WATCHDOG
Last known state: BLE_ADV_START
Heap free: 2048 bytes`,
    ai_analysis: 'BLE advertising start command blocks indefinitely when the radio is in a transitional state between advertising sets. Missing timeout on the HCI command response wait loop.',
    ai_suggested_fix: 'Added 3-second timeout to HCI command response wait. On timeout, force radio reset and retry advertising start. Fix deployed in fw-3.1.3.',
    fingerprint: 'wdt-ble-adv-hci-hang',
    metadata: {},
    created_at: daysAgo(20),
    device: demoDevices[4],
  },
];

export const demoLogs: Log[] = [
  { id: 'log-001', organization_id: ORG_ID, device_id: 'd1000000-0000-0000-0000-000000000001', level: 'error', source: 'kernel', message: 'BUG: unable to handle page fault at 0000000000001370', timestamp: hoursAgo(1), metadata: {}, created_at: hoursAgo(1) },
  { id: 'log-002', organization_id: ORG_ID, device_id: 'd1000000-0000-0000-0000-000000000001', level: 'warn', source: 'power_mgr', message: 'suspend aborted: wakelock "usb_host" held for 30s', timestamp: hoursAgo(1), metadata: {}, created_at: hoursAgo(1) },
  { id: 'log-003', organization_id: ORG_ID, device_id: 'd1000000-0000-0000-0000-000000000003', level: 'info', source: 'ble_stack', message: 'Advertising started on handle 0x01, interval 100ms', timestamp: minutesAgo(30), metadata: {}, created_at: minutesAgo(30) },
  { id: 'log-004', organization_id: ORG_ID, device_id: 'd1000000-0000-0000-0000-000000000003', level: 'error', source: 'ble_stack', message: 'HCI command timeout: LE_SET_ADV_PARAMS (0x2006)', timestamp: minutesAgo(25), metadata: {}, created_at: minutesAgo(25) },
  { id: 'log-005', organization_id: ORG_ID, device_id: 'd1000000-0000-0000-0000-000000000005', level: 'info', source: 'firmware', message: 'OTA update check: current=3.1.2, latest=3.1.3', timestamp: minutesAgo(15), metadata: {}, created_at: minutesAgo(15) },
  { id: 'log-006', organization_id: ORG_ID, device_id: 'd1000000-0000-0000-0000-000000000006', level: 'fatal', source: 'modem', message: 'ASSERT: pdnCtx != NULL at pdn_manager.c:445', timestamp: minutesAgo(10), metadata: {}, created_at: minutesAgo(10) },
  { id: 'log-007', organization_id: ORG_ID, device_id: 'd1000000-0000-0000-0000-000000000006', level: 'error', source: 'modem', message: 'NAS: EMM detach received during service request', timestamp: minutesAgo(9), metadata: {}, created_at: minutesAgo(9) },
  { id: 'log-008', organization_id: ORG_ID, device_id: 'd1000000-0000-0000-0000-000000000002', level: 'warn', source: 'android', message: 'ActivityManager: ANR in com.android.systemui (StatusBar)', timestamp: hoursAgo(3), metadata: {}, created_at: hoursAgo(3) },
  { id: 'log-009', organization_id: ORG_ID, device_id: 'd1000000-0000-0000-0000-000000000001', level: 'info', source: 'testforge_agent', message: 'Test run started: Smoke Test Suite (build-412, fw-5.0.3)', timestamp: minutesAgo(45), metadata: {}, created_at: minutesAgo(45) },
  { id: 'log-010', organization_id: ORG_ID, device_id: 'd1000000-0000-0000-0000-000000000001', level: 'info', source: 'testforge_agent', message: 'Test run completed: 48/50 passed, 2 failed, 0 skipped (duration: 12m 34s)', timestamp: minutesAgo(32), metadata: {}, created_at: minutesAgo(32) },
  { id: 'log-011', organization_id: ORG_ID, device_id: 'd1000000-0000-0000-0000-000000000003', level: 'debug', source: 'wifi', message: 'DHCP lease renewed: 192.168.4.23 via wlan0', timestamp: minutesAgo(20), metadata: {}, created_at: minutesAgo(20) },
  { id: 'log-012', organization_id: ORG_ID, device_id: 'd1000000-0000-0000-0000-000000000005', level: 'info', source: 'firmware', message: 'BLE connection established: addr=AA:BB:CC:DD:EE:FF, RSSI=-62dBm', timestamp: minutesAgo(12), metadata: {}, created_at: minutesAgo(12) },
  { id: 'log-013', organization_id: ORG_ID, device_id: 'd1000000-0000-0000-0000-000000000002', level: 'debug', source: 'testforge_agent', message: 'Flashing firmware fw-14-r28 via ADB, image size: 1.4GB', timestamp: hoursAgo(5), metadata: {}, created_at: hoursAgo(5) },
  { id: 'log-014', organization_id: ORG_ID, device_id: 'd1000000-0000-0000-0000-000000000001', level: 'warn', source: 'thermal', message: 'CPU temperature high: 87°C, throttling activated', timestamp: minutesAgo(18), metadata: {}, created_at: minutesAgo(18) },
  { id: 'log-015', organization_id: ORG_ID, device_id: 'd1000000-0000-0000-0000-000000000006', level: 'info', source: 'modem', message: 'LTE attach successful: PLMN=310260, Band=B12, RSRP=-95dBm', timestamp: daysAgo(1), metadata: {}, created_at: daysAgo(1) },
];

export const demoAlerts: Alert[] = [
  {
    id: 'alert-001',
    organization_id: ORG_ID,
    type: 'crash_detected',
    severity: 'critical',
    title: 'New critical crash: Kernel panic during suspend',
    message: 'Kernel panic detected on Pixel 8 Pro #1. 12 occurrences in the last 5 days. Auto-triage suggests race condition in power management.',
    is_read: false,
    is_resolved: false,
    created_at: hoursAgo(2),
  },
  {
    id: 'alert-002',
    organization_id: ORG_ID,
    type: 'test_failure',
    severity: 'warning',
    title: 'Regression: Power State Validation suite failing',
    message: '3 consecutive failures on T730 Modem Board. Pass rate dropped from 94% to 67%. Affected tests: suspend_resume_cycle, deep_sleep_entry, wake_on_modem.',
    is_read: false,
    is_resolved: false,
    created_at: hoursAgo(6),
  },
  {
    id: 'alert-003',
    organization_id: ORG_ID,
    type: 'device_offline',
    severity: 'warning',
    title: 'Smart Display Dev Kit offline for 2+ hours',
    message: 'Device SDDK-004-D last seen 2 hours ago. Connection type: SSH. Last known firmware: fw-1.8.0.',
    is_read: true,
    is_resolved: false,
    created_at: hoursAgo(2),
  },
  {
    id: 'alert-004',
    organization_id: ORG_ID,
    type: 'flaky_test',
    severity: 'info',
    title: 'Flaky test detected: ble_connection_stability',
    message: 'Test ble_connection_stability has failed intermittently 4 out of last 10 runs. Suggest investigating BLE connection parameters.',
    is_read: true,
    is_resolved: false,
    created_at: daysAgo(1),
  },
  {
    id: 'alert-005',
    organization_id: ORG_ID,
    type: 'threshold_breach',
    severity: 'warning',
    title: 'Build failure rate above 20% threshold',
    message: 'Branch feature/ble-v2 has 35% build failure rate over the last 48 hours (7/20 builds failed).',
    is_read: false,
    is_resolved: false,
    created_at: hoursAgo(12),
  },
  {
    id: 'alert-006',
    organization_id: ORG_ID,
    type: 'system',
    severity: 'info',
    title: 'Weekly report generated',
    message: 'Your weekly TestForge report is ready. Summary: 47 test runs, 82% pass rate, 3 new crashes detected, 1 crash resolved.',
    is_read: true,
    is_resolved: true,
    resolved_at: daysAgo(2),
    created_at: daysAgo(2),
  },
];

export const demoApiKeys: ApiKey[] = [
  {
    id: 'key-001',
    organization_id: ORG_ID,
    name: 'CI Pipeline (GitHub Actions)',
    key_hash: 'hashed_value_1',
    key_prefix: 'tf_live_a1b2',
    permissions: ['read', 'write'],
    last_used_at: minutesAgo(32),
    is_active: true,
    created_at: daysAgo(30),
  },
  {
    id: 'key-002',
    organization_id: ORG_ID,
    name: 'Dashboard Integration',
    key_hash: 'hashed_value_2',
    key_prefix: 'tf_live_c3d4',
    permissions: ['read'],
    last_used_at: hoursAgo(4),
    is_active: true,
    created_at: daysAgo(15),
  },
];

export const demoData: DemoData = {
  organization: demoOrganization,
  devices: demoDevices,
  testRuns: demoTestRuns,
  crashes: demoCrashes,
  logs: demoLogs,
  alerts: demoAlerts,
  apiKeys: demoApiKeys,
};

// Compute pass/fail trend for the last 30 days
export function getPassFailTrend() {
  const days: Record<string, { passed: number; failed: number; total: number }> = {};

  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    days[key] = { passed: 0, failed: 0, total: 0 };
  }

  demoTestRuns.forEach(run => {
    const d = new Date(run.created_at);
    const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (days[key]) {
      days[key].passed += run.passed;
      days[key].failed += run.failed;
      days[key].total += run.total_tests;
    }
  });

  return Object.entries(days).map(([date, vals]) => ({ date, ...vals }));
}

export function getFailureCategories() {
  const categories: Record<string, number> = {};
  demoTestRuns.forEach(run => {
    if (run.status === 'failed' || run.status === 'error') {
      const cat = run.suite_name || 'Other';
      categories[cat] = (categories[cat] || 0) + run.failed;
    }
  });

  const colors = ['#EF4444', '#F59E0B', '#8B5CF6', '#EC4899', '#3B82F6', '#10B981'];
  return Object.entries(categories)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, value], i) => ({ name, value, color: colors[i] }));
}

// ─── Activity Timeline ────────────────────────────────────────────────────────

export type ActivityEventType =
  | 'test_complete'
  | 'crash_detected'
  | 'device_online'
  | 'device_offline'
  | 'report_generated'
  | 'alert_created';

export interface ActivityEvent {
  id: string;
  type: ActivityEventType;
  title: string;
  description: string;
  timestamp: string;
}

export function getActivityTimeline(): ActivityEvent[] {
  return [
    {
      id: 'act-001',
      type: 'test_complete',
      title: 'Smoke Test Suite finished',
      description: 'Pixel 8 Pro #1 — 48/50 passed, 2 failed (build-412)',
      timestamp: minutesAgo(32),
    },
    {
      id: 'act-002',
      type: 'crash_detected',
      title: 'Kernel panic detected',
      description: 'Pixel 8 Pro #1 — suspend-to-RAM transition (critical)',
      timestamp: hoursAgo(2),
    },
    {
      id: 'act-003',
      type: 'device_online',
      title: 'NRF52 BLE Module came online',
      description: 'Connection: UART — fw-3.1.2 — RSSI healthy',
      timestamp: minutesAgo(8),
    },
    {
      id: 'act-004',
      type: 'alert_created',
      title: 'Regression alert triggered',
      description: 'Power State Validation suite — pass rate dropped to 67%',
      timestamp: hoursAgo(6),
    },
    {
      id: 'act-005',
      type: 'test_complete',
      title: 'Full Regression completed',
      description: 'T730 Modem Board — 112/150 passed (build-408)',
      timestamp: hoursAgo(7),
    },
    {
      id: 'act-006',
      type: 'device_offline',
      title: 'Smart Display Dev Kit went offline',
      description: 'SSH connection lost — last seen 2 hours ago',
      timestamp: hoursAgo(2),
    },
    {
      id: 'act-007',
      type: 'crash_detected',
      title: 'OOM kill during BLE + WiFi scan',
      description: 'IoT Sensor Hub v3 — 8 occurrences in last 3 days',
      timestamp: hoursAgo(3),
    },
    {
      id: 'act-008',
      type: 'test_complete',
      title: 'BLE Connectivity Test passed',
      description: 'NRF52 BLE Module — 30/30 passed (build-411)',
      timestamp: hoursAgo(4),
    },
    {
      id: 'act-009',
      type: 'report_generated',
      title: 'Weekly report ready',
      description: '47 runs · 82% pass rate · 3 new crashes this week',
      timestamp: daysAgo(2),
    },
    {
      id: 'act-010',
      type: 'alert_created',
      title: 'Build failure rate above threshold',
      description: 'feature/ble-v2 — 35% failure rate over 48 hours',
      timestamp: hoursAgo(12),
    },
    {
      id: 'act-011',
      type: 'device_online',
      title: 'Pixel 8 Pro #2 ready',
      description: 'ADB connected — android-14-r27 — testing mode',
      timestamp: minutesAgo(1),
    },
    {
      id: 'act-012',
      type: 'test_complete',
      title: 'OTA Update Validation passed',
      description: 'IoT Sensor Hub v3 — 25/25 passed (fw-2.4.1)',
      timestamp: hoursAgo(9),
    },
    {
      id: 'act-013',
      type: 'crash_detected',
      title: 'ANR in SystemUI',
      description: 'Pixel 8 Pro #2 — notification flood, 5 occurrences',
      timestamp: daysAgo(3),
    },
    {
      id: 'act-014',
      type: 'alert_created',
      title: 'Flaky test detected',
      description: 'ble_connection_stability — 4/10 runs failed intermittently',
      timestamp: daysAgo(1),
    },
    {
      id: 'act-015',
      type: 'report_generated',
      title: 'Crash triage report exported',
      description: '5 crashes · 1 fixed · 2 investigating · PDF generated',
      timestamp: daysAgo(1),
    },
  ];
}

// ─── Sparkline Data ───────────────────────────────────────────────────────────

export interface SparklinePoint {
  value: number;
}

export function getSparklineData(metric: 'runs' | 'passRate' | 'devices' | 'crashes'): SparklinePoint[] {
  const base: Record<typeof metric, number[]> = {
    runs:     [5, 7, 6, 9, 8, 11, 10],
    passRate: [78, 81, 79, 83, 85, 82, 86],
    devices:  [3, 4, 4, 5, 4, 5, 5],
    crashes:  [7, 6, 8, 5, 6, 4, 4],
  };
  return base[metric].map(value => ({ value }));
}

export function getDashboardStats() {
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
  const recentRuns = demoTestRuns.filter(r => new Date(r.created_at) > sevenDaysAgo);
  const totalTests = recentRuns.reduce((s, r) => s + r.total_tests, 0);
  const totalPassed = recentRuns.reduce((s, r) => s + r.passed, 0);
  const passRate = totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0;

  const activeDevices = demoDevices.filter(d => ['online', 'testing'].includes(d.status)).length;
  const openCrashes = demoCrashes.filter(c => !['fixed', 'wont_fix', 'duplicate'].includes(c.status)).length;

  return {
    totalRunsThisWeek: recentRuns.length,
    passRate,
    activeDevices,
    openCrashes,
    passRateTrend: +4.2,
    runsTrend: +12,
  };
}
