import type {
  Organization, Device, TestRun, Crash, Log, Alert, ApiKey, DemoData,
} from '../lib/types';

const ORG_ID = 'd0000000-0000-0000-0000-000000000001';
const now = new Date();
const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000).toISOString();
const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600000).toISOString();
const minutesAgo = (m: number) => new Date(now.getTime() - m * 60000).toISOString();

// Seeded pseudo-random for deterministic data
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const rng = seededRandom(42);
function srand<T>(arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}
function srandInt(min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

export const demoOrganization: Organization = {
  id: ORG_ID,
  name: 'TestForge Demo Lab',
  slug: 'testforge-demo',
  plan: 'professional',
  settings: {},
  created_at: daysAgo(90),
  updated_at: daysAgo(1),
};

// ─── 47 Devices ────────────────────────────────────────────────────────────────

function makeDevice(
  index: number, name: string, type: Device['device_type'], serial: string,
  fw: string, status: Device['status'], conn: Device['connection_type'],
  battery?: number, carrier?: string, lastSeenMin?: number, lastSeenHrs?: number
): Device {
  const lastSeen = lastSeenHrs ? hoursAgo(lastSeenHrs) : minutesAgo(lastSeenMin ?? srandInt(1, 30));
  return {
    id: `d1000000-0000-0000-0000-${String(index).padStart(12, '0')}`,
    organization_id: ORG_ID,
    name,
    device_type: type,
    serial_number: serial,
    firmware_version: fw,
    status,
    connection_type: conn,
    battery_level: battery,
    carrier,
    metadata: {},
    last_seen_at: lastSeen,
    created_at: daysAgo(srandInt(30, 90)),
  };
}

export const demoDevices: Device[] = [
  // DUT Series A — Android handsets (15 devices)
  makeDevice(1, 'DUT-A001', 'android', 'DUT-A001-7K2X', 'v3.2.1-rc4', 'online', 'adb', 92, 'Carrier-1', 2),
  makeDevice(2, 'DUT-A002', 'android', 'DUT-A002-3M1B', 'v3.2.1-rc4', 'online', 'adb', 87, 'Carrier-2', 5),
  makeDevice(3, 'DUT-A003', 'android', 'DUT-A003-9N4C', 'v3.2.1-rc4', 'testing', 'adb', 74, 'Carrier-3', 1),
  makeDevice(4, 'DUT-A004', 'android', 'DUT-A004-2P8D', 'v3.2.0', 'online', 'adb', 95, 'Carrier-1', 8),
  makeDevice(5, 'DUT-A005', 'android', 'DUT-A005-6Q3E', 'v3.2.1-rc4', 'online', 'adb', 88, 'Carrier-2', 3),
  makeDevice(6, 'DUT-A006', 'android', 'DUT-A006-1R7F', 'v3.2.1-rc4', 'online', 'adb', 91, 'Carrier-3', 12),
  makeDevice(7, 'DUT-A007', 'android', 'DUT-A007-4S2G', 'v3.2.1-rc4', 'online', 'adb', 56, 'Carrier-1', 6),
  makeDevice(8, 'DUT-A008', 'android', 'DUT-A008-8T5H', 'v3.2.0', 'offline', 'adb', 15, undefined, undefined, 6),
  makeDevice(9, 'DUT-A009', 'android', 'DUT-A009-3U9I', 'v3.2.1-rc4', 'online', 'adb', 83, 'Carrier-2', 4),
  makeDevice(10, 'DUT-A010', 'android', 'DUT-A010-7V1J', 'v3.2.1-rc4', 'maintenance', 'adb', 100, 'Carrier-3', 15),
  makeDevice(11, 'DUT-A011', 'android', 'DUT-A011-2W6K', 'v3.2.1-rc4', 'online', 'adb', 79, 'Carrier-1', 7),
  makeDevice(12, 'DUT-A012', 'android', 'DUT-A012-5X0L', 'v3.1.8', 'online', 'adb', 22, 'Carrier-2', 9),
  makeDevice(13, 'DUT-A013', 'android', 'DUT-A013-9Y4M', 'v3.2.1-rc4', 'flashing', 'adb', 100, 'Carrier-3', 1),
  makeDevice(14, 'DUT-A014', 'android', 'DUT-A014-1Z8N', 'v3.2.1-rc4', 'online', 'adb', 67, 'Carrier-1', 11),
  makeDevice(15, 'DUT-A015', 'android', 'DUT-A015-4A3O', 'v3.2.1-rc4', 'online', 'adb', 94, 'Carrier-2', 2),

  // DUT Series B — Android handsets (10 devices)
  makeDevice(16, 'DUT-B001', 'android', 'DUT-B001-7B6P', 'vendor-fw-6.1.1', 'online', 'adb', 90, 'Carrier-1', 3),
  makeDevice(17, 'DUT-B002', 'android', 'DUT-B002-2C1Q', 'vendor-fw-6.1.1', 'online', 'adb', 85, 'Carrier-2', 5),
  makeDevice(18, 'DUT-B003', 'android', 'DUT-B003-6D5R', 'vendor-fw-6.1.1', 'testing', 'adb', 78, 'Carrier-3', 1),
  makeDevice(19, 'DUT-B004', 'android', 'DUT-B004-0E9S', 'vendor-fw-6.1.0', 'online', 'adb', 93, 'Carrier-1', 7),
  makeDevice(20, 'DUT-B005', 'android', 'DUT-B005-3F2T', 'vendor-fw-6.1.1', 'online', 'adb', 71, 'Carrier-2', 4),
  makeDevice(21, 'DUT-B006', 'android', 'DUT-B006-8G7U', 'vendor-fw-6.1.1', 'offline', 'adb', 8, undefined, undefined, 14),
  makeDevice(22, 'DUT-B007', 'android', 'DUT-B007-1H0V', 'vendor-fw-6.1.1', 'online', 'adb', 88, 'Carrier-3', 6),
  makeDevice(23, 'DUT-B008', 'android', 'DUT-B008-5I4W', 'vendor-fw-6.1.1', 'maintenance', 'adb', 100, 'Carrier-1', 20),
  makeDevice(24, 'DUT-B009', 'android', 'DUT-B009-9J8X', 'vendor-fw-6.1.1', 'online', 'adb', 82, 'Carrier-2', 8),
  makeDevice(25, 'DUT-B010', 'android', 'DUT-B010-3K2Y', 'vendor-fw-6.1.1', 'online', 'adb', 96, 'Carrier-3', 3),

  // MDM — Modem modules (8 devices)
  makeDevice(26, 'MDM-001', 'embedded', 'MDM-001-7L6Z', 'fw-5.0.3', 'online', 'uart', undefined, undefined, 4),
  makeDevice(27, 'MDM-002', 'embedded', 'MDM-002-1M0A', 'fw-5.0.3', 'online', 'uart', undefined, undefined, 6),
  makeDevice(28, 'MDM-003', 'embedded', 'MDM-003-5N4B', 'fw-5.0.2', 'online', 'uart', undefined, undefined, 9),
  makeDevice(29, 'MDM-004', 'embedded', 'MDM-004-9O8C', 'fw-5.0.3', 'testing', 'uart', undefined, undefined, 1),
  makeDevice(30, 'MDM-005', 'embedded', 'MDM-005-3P2D', 'fw-5.0.3', 'online', 'uart', undefined, undefined, 5),
  makeDevice(31, 'MDM-006', 'embedded', 'MDM-006-7Q6E', 'fw-5.0.3', 'maintenance', 'uart', undefined, undefined, 30),
  makeDevice(32, 'MDM-007', 'embedded', 'MDM-007-1R0F', 'fw-5.0.3', 'online', 'uart', undefined, undefined, 7),
  makeDevice(33, 'MDM-008', 'embedded', 'MDM-008-5S4G', 'fw-4.9.8', 'offline', 'uart', undefined, undefined, undefined, 48),

  // SBC — Single Board Computers (6 devices)
  makeDevice(34, 'SBC-001', 'iot', 'SBC-001-9T8H', 'sbc-fw-2.1.0', 'online', 'ssh', undefined, undefined, 2),
  makeDevice(35, 'SBC-002', 'iot', 'SBC-002-3U2I', 'sbc-fw-2.1.0', 'online', 'ssh', undefined, undefined, 3),
  makeDevice(36, 'SBC-003', 'iot', 'SBC-003-7V6J', 'sbc-fw-2.1.0', 'online', 'ssh', undefined, undefined, 5),
  makeDevice(37, 'SBC-004', 'iot', 'SBC-004-1W0K', 'sbc-fw-2.0.9', 'online', 'ssh', undefined, undefined, 8),
  makeDevice(38, 'SBC-005', 'iot', 'SBC-005-5X4L', 'sbc-fw-2.1.0', 'maintenance', 'ssh', undefined, undefined, 15),
  makeDevice(39, 'SBC-006', 'iot', 'SBC-006-9Y8M', 'sbc-fw-2.1.0', 'online', 'ssh', undefined, undefined, 4),

  // BLE — BLE Modules (8 devices)
  makeDevice(40, 'BLE-001', 'embedded', 'BLE-001-3Z2N', 'ble-fw-3.1.3', 'online', 'uart', undefined, undefined, 3),
  makeDevice(41, 'BLE-002', 'embedded', 'BLE-002-7A6O', 'ble-fw-3.1.3', 'online', 'uart', undefined, undefined, 5),
  makeDevice(42, 'BLE-003', 'embedded', 'BLE-003-1B0P', 'ble-fw-3.1.3', 'online', 'uart', undefined, undefined, 7),
  makeDevice(43, 'BLE-004', 'embedded', 'BLE-004-5C4Q', 'ble-fw-3.1.2', 'online', 'uart', undefined, undefined, 4),
  makeDevice(44, 'BLE-005', 'embedded', 'BLE-005-9D8R', 'ble-fw-3.1.3', 'flashing', 'uart', undefined, undefined, 1),
  makeDevice(45, 'BLE-006', 'embedded', 'BLE-006-3E2S', 'ble-fw-3.1.3', 'online', 'uart', undefined, undefined, 6),
  makeDevice(46, 'BLE-007', 'embedded', 'BLE-007-7F6T', 'ble-fw-3.1.3', 'online', 'uart', undefined, undefined, 9),
  makeDevice(47, 'BLE-008', 'embedded', 'BLE-008-1G0U', 'ble-fw-3.1.3', 'online', 'uart', undefined, undefined, 2),
];

// ─── 180 Test Runs (90 days, ~2/day) ──────────────────────────────────────────

const onlineDeviceIds = demoDevices.filter(d => d.status !== 'offline').map(d => d.id);

const suiteConfigs = [
  { name: 'post-flash-smoke', suite: 'smoke', tests: [20, 30], duration: [300, 900] },
  { name: 'suspend-resume-stress', suite: 'stress', tests: [15, 25], duration: [1200, 2700] },
  { name: 'connectivity-sweep', suite: 'regression', tests: [30, 50], duration: [600, 1500] },
  { name: 'modem-stability', suite: 'regression', tests: [20, 40], duration: [900, 2400] },
  { name: 'ble-qualification', suite: 'smoke', tests: [25, 35], duration: [600, 1200] },
  { name: 'camera-sanity', suite: 'smoke', tests: [15, 20], duration: [300, 600] },
  { name: 'ota-upgrade-verify', suite: 'firmware', tests: [10, 18], duration: [900, 1800] },
] as const;

const triggerTypes = ['ci_cd', 'ci_cd', 'ci_cd', 'scheduled', 'scheduled', 'manual', 'webhook'] as const;
const branches = ['main', 'main', 'main', 'develop', 'develop', 'feature/power-opt', 'feature/ble-v2', 'release/3.2.1', 'hotfix/crash-fix'];
const environments = ['staging', 'staging', 'production', 'development'];

// Create regression windows: days 20-22, 45-47, 72-74 have lower pass rates
function isRegressionDay(dayBack: number): boolean {
  return (dayBack >= 20 && dayBack <= 22) || (dayBack >= 45 && dayBack <= 47) || (dayBack >= 72 && dayBack <= 74);
}

export const demoTestRuns: TestRun[] = Array.from({ length: 180 }, (_, i) => {
  const daysBack = (i / 2);
  const created = new Date(now.getTime() - daysBack * 86400000 - srandInt(0, 43200000));
  const config = suiteConfigs[i % suiteConfigs.length];
  const total = srandInt(config.tests[0], config.tests[1]);
  const regression = isRegressionDay(Math.floor(daysBack));

  let passed: number, failed: number;
  if (regression) {
    const passRate = 0.55 + rng() * 0.15;
    passed = Math.floor(total * passRate);
    failed = Math.floor(total * (0.15 + rng() * 0.2));
  } else {
    const passRate = 0.85 + rng() * 0.14;
    passed = Math.floor(total * passRate);
    failed = Math.floor(total * rng() * 0.08);
  }

  const skipped = srandInt(0, 3);
  const errorCount = regression && rng() > 0.7 ? srandInt(1, 3) : 0;
  const status = errorCount > 0 ? 'error' : failed > total * 0.15 ? 'failed' : 'passed';
  const deviceId = srand(onlineDeviceIds);
  const device = demoDevices.find(d => d.id === deviceId);
  const durationMs = srandInt(config.duration[0], config.duration[1]) * 1000;

  return {
    id: `run-${String(i).padStart(4, '0')}`,
    organization_id: ORG_ID,
    device_id: deviceId,
    name: config.name,
    suite_name: config.suite,
    trigger_type: srand(triggerTypes) as TestRun['trigger_type'],
    status: status as TestRun['status'],
    total_tests: total,
    passed,
    failed: Math.min(failed, total - passed),
    skipped,
    error_count: errorCount,
    duration_ms: durationMs,
    firmware_version: device?.firmware_version || 'v3.2.1-rc4',
    build_number: `build-${400 + Math.floor(i / 2)}`,
    branch: srand(branches),
    environment: srand(environments),
    metadata: {},
    started_at: created.toISOString(),
    completed_at: new Date(created.getTime() + durationMs).toISOString(),
    created_at: created.toISOString(),
    device,
  };
}).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

// ─── 23 Crashes ────────────────────────────────────────────────────────────────

export const demoCrashes: Crash[] = [
  {
    id: 'crash-001', organization_id: ORG_ID,
    device_id: demoDevices[0].id,
    title: 'KernelPanic at drivers/gpu/power.c:847',
    crash_type: 'kernel_panic', severity: 'critical', status: 'investigating',
    occurrence_count: 12, first_seen_at: daysAgo(8), last_seen_at: hoursAgo(4),
    assigned_team: 'gpu-power-team',
    affected_devices: ['DUT-A001', 'DUT-A003', 'DUT-A007', 'DUT-A009'],
    fingerprint: 'GPU_PWR_847',
    stack_trace: `kernel BUG at drivers/gpu/power.c:847!
Call Trace:
  gpu_power_resume+0x1a4/0x2c0
  dpm_resume_early+0x234/0x450
  suspend_devices_and_enter+0xc8/0x780
  pm_suspend+0x2ec/0x380
  state_store+0x78/0xb0
  kobj_attr_store+0x14/0x30`,
    ai_analysis: `Root Cause: GPU power state transition fails when resuming from deep sleep with active display pipeline. The power controller attempts to restore GPU clocks before the display subsystem has completed its resume sequence.

Impact: Affects all devices with this GPU on firmware builds after v3.2.1-rc4. Triggered by suspend/resume cycles with >10s sleep duration.

Suggested Fix: Ensure display resume completion fence is signaled before GPU clock restore in drivers/gpu/power.c:handle_resume(). Similar fix applied in commit a3f7b2c for other GPU families.

Related: FWVAL-1834, FWVAL-1756 (same subsystem, different trigger)`,
    ai_suggested_fix: 'Add display resume fence wait before GPU clock restore in handle_resume()',
    metadata: {}, created_at: daysAgo(8),
  },
  {
    id: 'crash-002', organization_id: ORG_ID,
    device_id: demoDevices[25].id,
    title: 'NullPointerException in ModemController.java:392',
    crash_type: 'java_exception', severity: 'high', status: 'investigating',
    occurrence_count: 8, first_seen_at: daysAgo(6), last_seen_at: hoursAgo(8),
    assigned_team: 'modem-team',
    affected_devices: ['MDM-001', 'MDM-002', 'MDM-004', 'DUT-B003'],
    fingerprint: 'NPE_MODEM_392',
    stack_trace: `java.lang.NullPointerException: Attempt to invoke virtual method 'int com.modem.PdnContext.getState()' on a null object reference
    at com.modem.ModemController.handleServiceRequest(ModemController.java:392)
    at com.modem.ModemController.onNetworkAttach(ModemController.java:281)
    at com.modem.NasHandler.processAttachAccept(NasHandler.java:156)
    at com.modem.RilMessageHandler.handleMessage(RilMessageHandler.java:89)`,
    ai_analysis: `Root Cause: PDN context becomes null when network-initiated detach occurs during an active service request. The modem controller does not synchronize detach and service request procedures, leading to a race condition.

Impact: Affects MDM modem modules and DUT-B series devices using baseband firmware v5.0.x. Occurs during LTE handover between cells with different PLMNs.

Suggested Fix: Add null check with graceful re-attach at ModemController.java:392. Queue service request to retry after re-attach completes. Firmware update to v5.1.0+ includes the fix.

Related: FWVAL-1892, FWVAL-1801 (same race condition, different entry point)`,
    ai_suggested_fix: 'Add null check and retry queue for PDN context in handleServiceRequest()',
    metadata: {}, created_at: daysAgo(6),
  },
  {
    id: 'crash-003', organization_id: ORG_ID,
    device_id: demoDevices[39].id,
    title: 'BLE_WATCHDOG_TIMEOUT at bt_hci.c:1203',
    crash_type: 'watchdog', severity: 'high', status: 'new',
    occurrence_count: 5, first_seen_at: daysAgo(3), last_seen_at: hoursAgo(2),
    assigned_team: 'bluetooth-team',
    affected_devices: ['BLE-001', 'BLE-003', 'BLE-005'],
    fingerprint: 'BLE_WDT_1203',
    stack_trace: `WDT: Task bt_hci_task not responding for 12000ms
Reset reason: WATCHDOG_TIMEOUT
Last HCI command: LE_SET_EXT_ADV_PARAMS (0x2036)
HCI state: WAITING_RESPONSE
Heap free: 4096 bytes
Stack: bt_hci.c:1203 -> hci_cmd_send_sync -> bt_hci_cmd_send`,
    ai_analysis: `Root Cause: Extended advertising parameter command blocks indefinitely when the BLE radio is transitioning between advertising sets. The HCI command response wait loop has no timeout, causing the watchdog to trigger.

Impact: Affects BLE modules running ble-fw-3.1.2 and earlier. Triggered when switching between legacy and extended advertising modes rapidly.

Suggested Fix: Add 3-second timeout to HCI command response wait in bt_hci.c:hci_cmd_send_sync(). On timeout, force radio reset and retry. Upgrade to ble-fw-3.1.3 includes this fix.

Related: BLE-447, BLE-412 (same HCI path, different commands)`,
    ai_suggested_fix: 'Add timeout to HCI command wait loop, force radio reset on timeout',
    metadata: {}, created_at: daysAgo(3),
  },
  {
    id: 'crash-004', organization_id: ORG_ID,
    device_id: demoDevices[2].id,
    title: 'ANR in com.android.systemui (15s)',
    crash_type: 'anr', severity: 'medium', status: 'new',
    occurrence_count: 15, first_seen_at: daysAgo(12), last_seen_at: hoursAgo(6),
    assigned_team: 'system-team',
    affected_devices: ['DUT-A003', 'DUT-A005', 'DUT-B001', 'DUT-B004', 'DUT-B007'],
    fingerprint: 'ANR_SYSUI_NOTIF',
    stack_trace: `ANR in com.android.systemui
Reason: Input dispatching timed out (StatusBar)
CPU usage: 98% user, 1% kernel, 1% iowait
Main thread (1):
  at android.view.ViewRootImpl.performTraversals(ViewRootImpl.java:3401)
  at android.view.ViewRootImpl.doTraversal(ViewRootImpl.java:2187)
  at android.view.ViewRootImpl$TraversalRunnable.run(ViewRootImpl.java:8777)
  at android.os.Handler.handleCallback(Handler.java:942)`,
    ai_analysis: `Root Cause: ANR triggered when >50 notifications arrive within 2 seconds. The StatusBar attempts to animate each notification individually, causing the main thread to block on repeated layout passes.

Impact: Affects all Android devices in the lab. More frequent on devices with notification-heavy test suites. Does not cause data loss but blocks UI interaction for 15+ seconds.

Suggested Fix: Batch notification updates using a 500ms debounce window. Collapse notifications beyond threshold into a summary group. Offload animation calculations to RenderThread.

Related: ANDROID-2341, ANDROID-2298 (SystemUI performance issues)`,
    ai_suggested_fix: 'Implement notification batching with 500ms debounce window',
    metadata: {}, created_at: daysAgo(12),
  },
  {
    id: 'crash-005', organization_id: ORG_ID,
    device_id: demoDevices[27].id,
    title: 'ASSERT_FAIL: baseband_ver mismatch',
    crash_type: 'assertion', severity: 'critical', status: 'investigating',
    occurrence_count: 3, first_seen_at: daysAgo(2), last_seen_at: hoursAgo(12),
    assigned_team: 'firmware-team',
    affected_devices: ['MDM-003', 'MDM-008'],
    fingerprint: 'ASSERT_BBVER_MISMATCH',
    stack_trace: `ASSERT FAILED: expected_ver == actual_ver at modem/src/baseband_init.c:234
Expected: 5.0.3, Actual: 4.9.8
Backtrace:
  #0 baseband_version_check+0x98
  #1 modem_init_sequence+0x1c4
  #2 main_task_entry+0x340`,
    ai_analysis: `Root Cause: Firmware version mismatch assertion fires when a device with old baseband firmware (v4.9.8) attempts to initialize with a modem driver built for v5.0.3. The version check is too strict — patch versions should be compatible.

Impact: Blocks MDM-008 from completing any test run. Device requires reflash to v5.0.3 to resume testing.

Suggested Fix: Relax version assertion to allow compatible minor versions (5.0.x). Add graceful fallback path for older baseband versions. Document required firmware versions in test prerequisites.

Related: FWVAL-1923 (version compatibility matrix)`,
    ai_suggested_fix: 'Relax version check to allow compatible minor versions',
    metadata: {}, created_at: daysAgo(2),
  },
  {
    id: 'crash-006', organization_id: ORG_ID,
    device_id: demoDevices[3].id,
    title: 'SIGSEGV in libcamera2.so at 0x7f3a2b4c',
    crash_type: 'native_crash', severity: 'high', status: 'new',
    occurrence_count: 7, first_seen_at: daysAgo(5), last_seen_at: daysAgo(1),
    assigned_team: 'camera-team',
    affected_devices: ['DUT-A004', 'DUT-A006', 'DUT-A011'],
    fingerprint: 'SEGV_LIBCAMERA_2B4C',
    stack_trace: `signal 11 (SIGSEGV), code 1 (SEGV_MAPERR), fault addr 0x0000000000000018
  #0 pc 00000000002b4c  /vendor/lib64/libcamera2.so (CameraHal::processCapture+124)
  #1 pc 000000000031a8  /vendor/lib64/libcamera2.so (CameraHal::onFrameAvailable+88)
  #2 pc 00000000004520  /vendor/lib64/libcamera2.so (HalAdapter::handleMessage+320)`,
    ai_analysis: `Root Cause: Null pointer dereference in camera HAL when processing capture results after a rapid open/close cycle. The capture callback fires after the camera session has been torn down.

Impact: Affects DUT-A series devices running camera-sanity test suite. Crash rate ~15% per run with fast capture sequences.

Suggested Fix: Add session validity check before processing capture results. Register cleanup callback to cancel pending captures on session close.

Related: CAM-891, CAM-867 (camera lifecycle issues)`,
    ai_suggested_fix: 'Add session validity check before capture result processing',
    metadata: {}, created_at: daysAgo(5),
  },
  {
    id: 'crash-007', organization_id: ORG_ID,
    device_id: demoDevices[15].id,
    title: 'thermal_shutdown: CPU temp 105C exceeded limit',
    crash_type: 'kernel_panic', severity: 'critical', status: 'investigating',
    occurrence_count: 4, first_seen_at: daysAgo(4), last_seen_at: daysAgo(1),
    assigned_team: 'system-team',
    affected_devices: ['DUT-B001', 'DUT-B005'],
    fingerprint: 'THERMAL_SHUTDOWN_105C',
    stack_trace: `CRITICAL: CPU thermal zone exceeded maximum temperature
thermal_zone0: temp=105234 (threshold=100000)
Action: emergency shutdown initiated
  thermal_emergency_poweroff+0x48/0x80
  thermal_zone_device_update+0x1c4/0x290`,
    ai_analysis: `Root Cause: CPU thermal throttling fails during sustained stress tests. The thermal governor's step_wise algorithm doesn't reduce frequency quickly enough under sustained compute load with simultaneous modem activity.

Impact: Affects DUT-B series devices during 24hr stress tests and modem-stability suites. Can cause hardware damage if repeated.

Suggested Fix: Implement aggressive thermal throttling profile for test environments. Add pre-test thermal check to abort if ambient temp > 35C. Consider adding cooling fans to test rack.

Related: HW-234, HW-201 (thermal management)`,
    ai_suggested_fix: 'Add aggressive thermal profile for test mode, pre-test thermal check',
    metadata: {}, created_at: daysAgo(4),
  },
  {
    id: 'crash-008', organization_id: ORG_ID,
    device_id: demoDevices[33].id,
    title: 'kernel: Out of memory: Killed process (python3)',
    crash_type: 'oom', severity: 'medium', status: 'new',
    occurrence_count: 6, first_seen_at: daysAgo(7), last_seen_at: daysAgo(2),
    assigned_team: 'infra-team',
    affected_devices: ['SBC-001', 'SBC-002', 'SBC-004'],
    fingerprint: 'OOM_SBC_PYTHON',
    stack_trace: `Out of memory: Killed process 2847 (python3) total-vm:512320kB, anon-rss:487200kB
oom_kill_process: 1 callbacks suppressed
Memory cgroup out of memory: Killed process 2847 (python3)`,
    ai_analysis: `Root Cause: Test runner Python process leaks memory when processing large JUnit XML files (>50MB). The XML parser loads the entire file into memory instead of using streaming parsing.

Impact: Affects SBC test nodes with 1GB RAM. Occurs after ~4 hours of continuous test result processing.

Suggested Fix: Switch to iterparse (streaming XML parsing) in testforge_reporter.py. Add memory limit configuration for test runner processes. Implement result file rotation.

Related: INFRA-156 (SBC memory constraints)`,
    ai_suggested_fix: 'Switch to streaming XML parser, add memory limits',
    metadata: {}, created_at: daysAgo(7),
  },
  {
    id: 'crash-009', organization_id: ORG_ID,
    device_id: demoDevices[4].id,
    title: 'wifi_driver: firmware crash detected (reason 7)',
    crash_type: 'native_crash', severity: 'high', status: 'investigating',
    occurrence_count: 9, first_seen_at: daysAgo(10), last_seen_at: daysAgo(1),
    assigned_team: 'connectivity-team',
    affected_devices: ['DUT-A005', 'DUT-A009', 'DUT-A014', 'DUT-B002'],
    fingerprint: 'WIFI_FW_CRASH_R7',
    stack_trace: `wlan0: firmware crash detected (reason 7: TX path hang)
wifi_chipset: Collecting firmware dump...
wifi_chipset: Firmware dump saved to /data/vendor/wifi/fw_dump_20240315_143221.bin
wifi_chipset: Initiating firmware recovery...
wifi_chipset: Firmware recovery completed in 2.3 seconds`,
    ai_analysis: `Root Cause: WiFi firmware TX path hang when transitioning between 2.4GHz and 5GHz bands during active data transfer. The band steering logic doesn't properly drain the TX queue before switching.

Impact: Affects devices with this WiFi chipset. WiFi drops for ~2.5 seconds during recovery. Test runs may report intermittent connectivity failures.

Suggested Fix: Disable band steering during active test runs. Add TX queue drain wait before band switch. WiFi firmware update v1.2.3 fixes the TX path hang.

Related: WIFI-342, WIFI-318 (band steering issues)`,
    ai_suggested_fix: 'Disable band steering during tests, update WiFi firmware',
    metadata: {}, created_at: daysAgo(10),
  },
  {
    id: 'crash-010', organization_id: ORG_ID,
    device_id: demoDevices[16].id,
    title: 'display: FIFO underrun on pipe A',
    crash_type: 'kernel_panic', severity: 'medium', status: 'new',
    occurrence_count: 11, first_seen_at: daysAgo(15), last_seen_at: daysAgo(2),
    assigned_team: 'display-team',
    affected_devices: ['DUT-B001', 'DUT-B003', 'DUT-B006', 'DUT-B009'],
    fingerprint: 'DISPLAY_FIFO_UNDERRUN',
    stack_trace: `[drm:intel_pipe_update_end] *ERROR* FIFO underrun on pipe A
  intel_display.c:commit_tail+0x2a4/0x380
  drm_atomic_helper_commit_hw_done+0x128/0x190
  intel_atomic_commit_work+0x98/0x120`,
    ai_analysis: `Root Cause: Display FIFO underrun occurs during high GPU load when display refresh competes for memory bandwidth. The display controller cannot read framebuffer data fast enough.

Impact: Causes screen flickering during GPU-intensive test suites. Does not crash the device but corrupts display output, potentially affecting screenshot-based test validation.

Suggested Fix: Increase display FIFO watermark levels. Reduce GPU memory bandwidth allocation during display-critical operations. Add display corruption detection to test framework.

Related: DISP-123, DISP-98 (FIFO underrun history)`,
    ai_suggested_fix: 'Increase FIFO watermark levels, add corruption detection',
    metadata: {}, created_at: daysAgo(15),
  },
  {
    id: 'crash-011', organization_id: ORG_ID,
    device_id: demoDevices[26].id,
    title: 'modem: LTE attach rejected (cause 15)',
    crash_type: 'modem', severity: 'medium', status: 'investigating',
    occurrence_count: 18, first_seen_at: daysAgo(20), last_seen_at: daysAgo(1),
    assigned_team: 'modem-team',
    affected_devices: ['MDM-001', 'MDM-002', 'MDM-005', 'MDM-007'],
    fingerprint: 'LTE_ATTACH_REJ_15',
    stack_trace: `NAS: Attach rejected - EMM cause #15 (No suitable cells in tracking area)
  nas_emm.c:emm_attach_reject_handler+0x128
  nas_msg_handler.c:process_dl_nas_msg+0x340
  rrc_connection.c:handle_dl_info_transfer+0x1a8`,
    ai_analysis: `Root Cause: LTE attach rejection due to tracking area mismatch. The lab's femtocell is configured with TAC 0x0001 but devices roaming from macro network expect TAC 0x1234. The modem firmware doesn't retry with updated tracking area.

Impact: Affects all MDM modules during modem-stability tests. Devices fail to attach to lab network after being power-cycled, requiring manual AT command intervention.

Suggested Fix: Update femtocell TAC configuration to match macro network. Add automatic TAC update and re-attach logic to modem firmware. Document femtocell setup in lab configuration guide.

Related: MODEM-567, MODEM-534 (attach procedure issues)`,
    ai_suggested_fix: 'Update femtocell TAC, add auto re-attach logic',
    metadata: {}, created_at: daysAgo(20),
  },
  {
    id: 'crash-012', organization_id: ORG_ID,
    device_id: demoDevices[1].id,
    title: 'USB: device descriptor read error (-110)',
    crash_type: 'kernel_panic', severity: 'low', status: 'new',
    occurrence_count: 22, first_seen_at: daysAgo(30), last_seen_at: daysAgo(1),
    assigned_team: 'infra-team',
    affected_devices: ['DUT-A002', 'DUT-A008', 'DUT-B006'],
    fingerprint: 'USB_DESC_READ_ERR',
    stack_trace: `usb 1-4: device descriptor read/64, error -110
usb 1-4: device not accepting address 12, error -110
hub 1-0:1.0: unable to enumerate USB device on port 4`,
    ai_analysis: `Root Cause: USB hub timeout when enumerating devices after port reset. Usually caused by marginal USB cables or hub power supply issues. The error -110 indicates a timeout in the USB control transfer.

Impact: Low severity — affects ADB connection reliability. Devices reconnect automatically after 5-10 seconds. May cause test run to report false device-offline events.

Suggested Fix: Replace USB cables with certified USB 3.0 cables. Add powered USB hub to reduce power draw issues. Increase USB enumeration timeout in kernel parameters.

Related: INFRA-089 (USB reliability in test rack)`,
    ai_suggested_fix: 'Replace USB cables, add powered hub, increase timeout',
    metadata: {}, created_at: daysAgo(30),
  },
  {
    id: 'crash-013', organization_id: ORG_ID,
    device_id: demoDevices[40].id,
    title: 'BLE: connection supervision timeout',
    crash_type: 'watchdog', severity: 'medium', status: 'new',
    occurrence_count: 14, first_seen_at: daysAgo(11), last_seen_at: daysAgo(1),
    assigned_team: 'bluetooth-team',
    affected_devices: ['BLE-002', 'BLE-004', 'BLE-006'],
    fingerprint: 'BLE_CONN_SUPV_TMO',
    stack_trace: `BLE: Connection supervision timeout (handle=0x0040, reason=0x08)
  ll_connection.c:supervision_timeout_handler+0x68
  ll_connection.c:ll_connection_event+0x2a4
  ble_controller.c:radio_isr+0x190`,
    ai_analysis: `Root Cause: BLE connection supervision timeout occurs when the central device misses 6 consecutive connection events. Root cause is RF interference from WiFi APs co-located in the test lab.

Impact: Affects BLE qualification test reliability. ~20% of long-duration BLE tests fail due to supervision timeouts. Results in misleading failure rates for BLE test suites.

Suggested Fix: Move BLE test devices to RF-shielded enclosure. Increase supervision timeout from 4s to 6s. Add retry logic for BLE connection establishment in test framework.

Related: BLE-234, BLE-201 (BLE reliability in lab)`,
    ai_suggested_fix: 'Add RF shielding, increase supervision timeout, add retry logic',
    metadata: {}, created_at: daysAgo(11),
  },
  {
    id: 'crash-014', organization_id: ORG_ID,
    device_id: demoDevices[17].id,
    title: 'ActivityManager: Force stopping package (ANR)',
    crash_type: 'anr', severity: 'low', status: 'new',
    occurrence_count: 8, first_seen_at: daysAgo(9), last_seen_at: daysAgo(3),
    assigned_team: 'system-team',
    affected_devices: ['DUT-B002', 'DUT-B004', 'DUT-B008'],
    fingerprint: 'ANR_FORCE_STOP_PKG',
    stack_trace: `ANR in com.testforge.agent
Reason: executing service com.testforge.agent/.HeartbeatService
CPU usage: 42% user, 15% kernel, 3% iowait
Main thread:
  at java.net.SocketInputStream.read(SocketInputStream.java:181)
  at com.testforge.agent.ApiClient.sendHeartbeat(ApiClient.java:124)`,
    ai_analysis: `Root Cause: TestForge agent's heartbeat service blocks the main thread with synchronous HTTP call. When the server is slow to respond (>5s), Android kills the service for ANR.

Impact: Causes temporary loss of device heartbeat reporting. Agent auto-restarts but may miss 1-2 heartbeat intervals.

Suggested Fix: Move heartbeat HTTP call to background thread using AsyncTask or coroutines. Add connection timeout of 3 seconds. Implement WorkManager for reliable background execution.

Related: AGENT-45, AGENT-32 (agent reliability)`,
    ai_suggested_fix: 'Move heartbeat to background thread, add connection timeout',
    metadata: {}, created_at: daysAgo(9),
  },
  {
    id: 'crash-015', organization_id: ORG_ID,
    device_id: demoDevices[0].id,
    title: 'AudioFlinger: buffer overflow in audio HAL',
    crash_type: 'native_crash', severity: 'medium', status: 'investigating',
    occurrence_count: 4, first_seen_at: daysAgo(6), last_seen_at: daysAgo(2),
    assigned_team: 'audio-team',
    affected_devices: ['DUT-A001', 'DUT-A004'],
    fingerprint: 'AUDIO_HAL_OVERFLOW',
    stack_trace: `ABORTING: frameworks/av/services/audioflinger/AudioFlinger.cpp:2847
Buffer overflow detected in audio HAL output stream
  #0 pc 000000000002847  /system/lib64/libaudioflinger.so
  #1 pc 00000000000a234  /vendor/lib64/hw/audio.primary.default.so
  #2 pc 000000000003c18  /system/lib64/libaudioflinger.so`,
    ai_analysis: `Root Cause: Audio HAL buffer overflow when switching between Bluetooth A2DP and speaker output during active playback. The buffer size calculation doesn't account for the different sample rates between codecs.

Impact: Causes audio service restart, interrupting any audio-related tests. Does not affect other system functionality.

Suggested Fix: Fix buffer size calculation in audio HAL to handle codec switching. Add sample rate validation before buffer allocation. Audio HAL update in next vendor BSP drop.

Related: AUDIO-78, AUDIO-65 (audio routing issues)`,
    ai_suggested_fix: 'Fix buffer size calculation for codec switching in audio HAL',
    metadata: {}, created_at: daysAgo(6),
  },
  {
    id: 'crash-016', organization_id: ORG_ID,
    device_id: demoDevices[28].id,
    title: 'modem: IMS registration timeout',
    crash_type: 'timeout', severity: 'medium', status: 'new',
    occurrence_count: 10, first_seen_at: daysAgo(14), last_seen_at: daysAgo(1),
    assigned_team: 'modem-team',
    affected_devices: ['MDM-003', 'MDM-005', 'MDM-007'],
    fingerprint: 'IMS_REG_TIMEOUT',
    stack_trace: `IMS: Registration timeout after 30000ms
  ims_registration.c:ims_register+0x2a4
  ims_service.c:start_ims_service+0x128
  modem_init.c:init_ims_subsystem+0x98`,
    ai_analysis: `Root Cause: IMS registration fails because the lab's SIP server certificate has expired. The modem correctly rejects the TLS connection but the timeout handling masks the real error.

Impact: All VoLTE/VoWiFi tests fail on MDM modules. Does not affect basic LTE data connectivity tests.

Suggested Fix: Renew SIP server certificate. Add certificate expiry monitoring to lab infrastructure. Improve error reporting in IMS stack to surface TLS errors.

Related: MODEM-612, IMS-034 (IMS infrastructure)`,
    ai_suggested_fix: 'Renew SIP certificate, add expiry monitoring',
    metadata: {}, created_at: daysAgo(14),
  },
  {
    id: 'crash-017', organization_id: ORG_ID,
    device_id: demoDevices[34].id,
    title: 'pytest: fixture "device_connection" setup failed',
    crash_type: 'assertion', severity: 'low', status: 'new',
    occurrence_count: 20, first_seen_at: daysAgo(18), last_seen_at: daysAgo(1),
    assigned_team: 'infra-team',
    affected_devices: ['SBC-002', 'SBC-003', 'SBC-005'],
    fingerprint: 'PYTEST_FIXTURE_SETUP',
    stack_trace: `E   ConnectionRefusedError: [Errno 111] Connection refused
conftest.py:45: in device_connection
    conn = DeviceConnection(host=device_ip, port=5555)
conftest.py:23: in __init__
    self.socket.connect((host, port))`,
    ai_analysis: `Root Cause: Test fixture fails to establish ADB-over-WiFi connection because the target device's ADB daemon isn't listening on port 5555. Devices need "adb tcpip 5555" after each reboot.

Impact: All tests on SBC nodes that use WiFi-connected devices fail at setup. Does not affect USB-connected devices.

Suggested Fix: Add ADB TCP/IP initialization to device boot script. Implement connection retry with fallback to USB in test fixture. Add health check for ADB port availability.

Related: INFRA-189, INFRA-167 (ADB reliability)`,
    ai_suggested_fix: 'Add ADB TCP/IP to boot script, implement retry with USB fallback',
    metadata: {}, created_at: daysAgo(18),
  },
  {
    id: 'crash-018', organization_id: ORG_ID,
    device_id: demoDevices[6].id,
    title: 'GPS: NMEA parse error, invalid fix quality',
    crash_type: 'assertion', severity: 'low', status: 'investigating',
    occurrence_count: 7, first_seen_at: daysAgo(8), last_seen_at: daysAgo(3),
    assigned_team: 'location-team',
    affected_devices: ['DUT-A007', 'DUT-A012', 'DUT-B009'],
    fingerprint: 'GPS_NMEA_PARSE_ERR',
    stack_trace: `ASSERT: fix_quality >= 1 at gps_hal.c:567
NMEA sentence: $GPGGA,143221.00,,,,,0,00,99.99,,,,,,*6A
Expected: valid fix, Got: fix_quality=0 (invalid)`,
    ai_analysis: `Root Cause: GPS HAL assertion fails when GPS module reports invalid fix. The lab is indoors without GPS signal. Test assumes GPS fix is always available.

Impact: All location-dependent tests fail in the indoor lab. Tests work when devices are placed near windows.

Suggested Fix: Use GPS signal simulator for indoor testing. Add mock location provider for tests that don't specifically test GPS hardware. Skip GPS assertion when running in lab environment.

Related: LOC-45, LOC-38 (indoor testing limitations)`,
    ai_suggested_fix: 'Add GPS simulator, implement mock location provider for lab',
    metadata: {}, created_at: daysAgo(8),
  },
  {
    id: 'crash-019', organization_id: ORG_ID,
    device_id: demoDevices[0].id,
    title: 'SurfaceFlinger: display vsync stall detected',
    crash_type: 'watchdog', severity: 'medium', status: 'new',
    occurrence_count: 6, first_seen_at: daysAgo(5), last_seen_at: daysAgo(1),
    assigned_team: 'display-team',
    affected_devices: ['DUT-A001', 'DUT-A003', 'DUT-A006'],
    fingerprint: 'SF_VSYNC_STALL',
    stack_trace: `SurfaceFlinger: vsync stall detected for 500ms
  EventThread::threadLoop at EventThread.cpp:234
  SurfaceFlinger::onVsync at SurfaceFlinger.cpp:1892
  HWComposer::vsyncCallback at HWComposer.cpp:445`,
    ai_analysis: `Root Cause: VSync stall when display enters low-power mode during automated test execution. The display controller stops generating VSync signals, causing SurfaceFlinger to stall.

Impact: UI rendering freezes for 500ms+ intervals. Screenshot-based test validation may capture blank or partial frames.

Suggested Fix: Disable display low-power mode during test execution via sysfs. Add wakelock to prevent display sleep during active test runs. Implement frame capture retry on stall detection.

Related: DISP-145, DISP-132 (display power management)`,
    ai_suggested_fix: 'Disable display low-power during tests, add wakelock',
    metadata: {}, created_at: daysAgo(5),
  },
  {
    id: 'crash-020', organization_id: ORG_ID,
    device_id: demoDevices[41].id,
    title: 'NRF: flash write failed at 0x7F000',
    crash_type: 'native_crash', severity: 'high', status: 'investigating',
    occurrence_count: 2, first_seen_at: daysAgo(1), last_seen_at: hoursAgo(3),
    assigned_team: 'firmware-team',
    affected_devices: ['BLE-003', 'BLE-005'],
    fingerprint: 'NRF_FLASH_WRITE_FAIL',
    stack_trace: `ERROR: Flash write failed at address 0x7F000, expected 0xFF got 0x00
  nrf_flash.c:flash_write_page+0x128
  dfu_handler.c:apply_firmware_update+0x340
  main.c:dfu_event_handler+0x98`,
    ai_analysis: `Root Cause: Flash page at 0x7F000 has exceeded write endurance limit. The BLE module's flash memory has ~10,000 write cycles per page, and the DFU bootloader writes to this page on every firmware update.

Impact: Blocks OTA firmware updates on affected modules. Devices can still run with current firmware but cannot be updated in the field.

Suggested Fix: Implement flash wear leveling for DFU metadata. Move DFU write pointer to a fresh page. Mark worn pages as bad in flash management table. Consider external flash for DFU staging.

Related: FW-678, FW-645 (flash endurance)`,
    ai_suggested_fix: 'Implement flash wear leveling, move DFU to fresh page',
    metadata: {}, created_at: daysAgo(1),
  },
  {
    id: 'crash-021', organization_id: ORG_ID,
    device_id: demoDevices[18].id,
    title: 'PowerManager: wake lock held too long (60s)',
    crash_type: 'watchdog', severity: 'low', status: 'new',
    occurrence_count: 13, first_seen_at: daysAgo(16), last_seen_at: daysAgo(2),
    assigned_team: 'system-team',
    affected_devices: ['DUT-B003', 'DUT-B005', 'DUT-B010', 'DUT-A003'],
    fingerprint: 'WAKELOCK_HELD_60S',
    stack_trace: `PowerManagerService: Wake lock held too long: TestForgeAgent (60003ms)
  PowerManagerService.java:handleWakeLockTimeout+0x128
  PowerManagerService.java:checkWorkSourceObjectId+0x340`,
    ai_analysis: `Root Cause: TestForge agent acquires a partial wake lock for test execution but doesn't release it when a test hangs. The 60-second watchdog correctly identifies the leak.

Impact: Battery drain on mobile devices during overnight test runs. Does not cause crashes but contributes to thermal issues on extended runs.

Suggested Fix: Add wake lock timeout (30s max) in TestForge agent. Implement periodic wake lock renewal instead of hold-forever pattern. Release wake lock in test teardown regardless of test outcome.

Related: AGENT-67, PWR-234 (wake lock management)`,
    ai_suggested_fix: 'Add 30s wake lock timeout, release in teardown',
    metadata: {}, created_at: daysAgo(16),
  },
  {
    id: 'crash-022', organization_id: ORG_ID,
    device_id: demoDevices[30].id,
    title: 'fastboot: flash failed (sparse image too large)',
    crash_type: 'assertion', severity: 'high', status: 'new',
    occurrence_count: 3, first_seen_at: daysAgo(3), last_seen_at: daysAgo(1),
    assigned_team: 'firmware-team',
    affected_devices: ['MDM-006', 'MDM-008'],
    fingerprint: 'FASTBOOT_SPARSE_TOO_LARGE',
    stack_trace: `FAILED (remote: 'sparse image size 536870912 exceeds partition size 268435456')
fastboot: error: Command failed
  fastboot.cpp:fb_perform_format+0x234
  engine.cpp:flash_sparse_image+0x128`,
    ai_analysis: `Root Cause: New firmware build exceeds the partition size allocated for the modem image. The v5.0.3 modem firmware is 512MB but the partition table only allows 256MB.

Impact: Cannot flash new modem firmware on MDM-006 and MDM-008. Devices stuck on old firmware until partition table is updated.

Suggested Fix: Resize modem partition in partition table (requires full device reformat). Alternatively, enable firmware compression in the build system to fit within 256MB. Update flash scripts to check partition size before flashing.

Related: FWVAL-1956, FLASH-089 (partition sizing)`,
    ai_suggested_fix: 'Resize modem partition or enable firmware compression',
    metadata: {}, created_at: daysAgo(3),
  },
  {
    id: 'crash-023', organization_id: ORG_ID,
    device_id: demoDevices[35].id,
    title: 'ssh: connection reset by peer during test',
    crash_type: 'timeout', severity: 'low', status: 'investigating',
    occurrence_count: 25, first_seen_at: daysAgo(25), last_seen_at: hoursAgo(1),
    assigned_team: 'infra-team',
    affected_devices: ['SBC-003', 'SBC-004', 'SBC-006'],
    fingerprint: 'SSH_CONN_RESET',
    stack_trace: `paramiko.ssh_exception.SSHException: SSH session not active
Connection to 192.168.1.103 closed by remote host.
  File "test_runner.py", line 234, in execute_command
    stdin, stdout, stderr = client.exec_command(cmd, timeout=30)`,
    ai_analysis: `Root Cause: SSH connections to SBC nodes are dropped when the network switch performs MAC table flush every 30 minutes. The SSH keepalive interval (60s) is longer than the switch's MAC aging time.

Impact: Long-running tests on SBC nodes fail mid-execution. Average failure rate ~8% for tests longer than 25 minutes.

Suggested Fix: Reduce SSH keepalive interval to 15 seconds. Increase MAC aging time on network switch to 300 seconds. Add automatic SSH reconnection in test runner.

Related: INFRA-201, NET-045 (network reliability)`,
    ai_suggested_fix: 'Reduce SSH keepalive to 15s, increase switch MAC aging time',
    metadata: {}, created_at: daysAgo(25),
  },
];

// ─── Logs (60 entries) ──────────────────────────────────────────────────────────

export const demoLogs: Log[] = [
  { id: 'log-001', organization_id: ORG_ID, device_id: demoDevices[0].id, level: 'error', source: 'kernel', message: 'BUG: unable to handle page fault at 0000000000001370', timestamp: hoursAgo(1), metadata: {}, created_at: hoursAgo(1) },
  { id: 'log-002', organization_id: ORG_ID, device_id: demoDevices[0].id, level: 'warn', source: 'power_mgr', message: 'suspend aborted: wakelock "usb_host" held for 30s', timestamp: hoursAgo(1), metadata: {}, created_at: hoursAgo(1) },
  { id: 'log-003', organization_id: ORG_ID, device_id: demoDevices[39].id, level: 'info', source: 'ble_stack', message: 'Advertising started on handle 0x01, interval 100ms', timestamp: minutesAgo(30), metadata: {}, created_at: minutesAgo(30) },
  { id: 'log-004', organization_id: ORG_ID, device_id: demoDevices[39].id, level: 'error', source: 'ble_stack', message: 'HCI command timeout: LE_SET_EXT_ADV_PARAMS (0x2036)', timestamp: minutesAgo(25), metadata: {}, created_at: minutesAgo(25) },
  { id: 'log-005', organization_id: ORG_ID, device_id: demoDevices[42].id, level: 'info', source: 'firmware', message: 'OTA update check: current=ble-fw-3.1.2, latest=ble-fw-3.1.3', timestamp: minutesAgo(15), metadata: {}, created_at: minutesAgo(15) },
  { id: 'log-006', organization_id: ORG_ID, device_id: demoDevices[25].id, level: 'fatal', source: 'modem', message: 'ASSERT: pdnCtx != NULL at pdn_manager.c:445', timestamp: minutesAgo(10), metadata: {}, created_at: minutesAgo(10) },
  { id: 'log-007', organization_id: ORG_ID, device_id: demoDevices[25].id, level: 'error', source: 'modem', message: 'NAS: EMM detach received during service request', timestamp: minutesAgo(9), metadata: {}, created_at: minutesAgo(9) },
  { id: 'log-008', organization_id: ORG_ID, device_id: demoDevices[2].id, level: 'warn', source: 'android', message: 'ActivityManager: ANR in com.android.systemui (StatusBar)', timestamp: hoursAgo(3), metadata: {}, created_at: hoursAgo(3) },
  { id: 'log-009', organization_id: ORG_ID, device_id: demoDevices[0].id, level: 'info', source: 'testforge_agent', message: 'Test run started: post-flash-smoke (build-490, v3.2.1-rc4)', timestamp: minutesAgo(45), metadata: {}, created_at: minutesAgo(45) },
  { id: 'log-010', organization_id: ORG_ID, device_id: demoDevices[0].id, level: 'info', source: 'testforge_agent', message: 'Test run completed: 28/30 passed, 2 failed, 0 skipped (duration: 12m 34s)', timestamp: minutesAgo(32), metadata: {}, created_at: minutesAgo(32) },
  { id: 'log-011', organization_id: ORG_ID, device_id: demoDevices[33].id, level: 'debug', source: 'ssh', message: 'Connection established to SBC-001 (192.168.1.101:22)', timestamp: minutesAgo(20), metadata: {}, created_at: minutesAgo(20) },
  { id: 'log-012', organization_id: ORG_ID, device_id: demoDevices[40].id, level: 'info', source: 'firmware', message: 'BLE connection established: addr=AA:BB:CC:DD:EE:FF, RSSI=-62dBm', timestamp: minutesAgo(12), metadata: {}, created_at: minutesAgo(12) },
  { id: 'log-013', organization_id: ORG_ID, device_id: demoDevices[2].id, level: 'debug', source: 'testforge_agent', message: 'Flashing firmware v3.2.1-rc4 via fastboot, image size: 1.4GB', timestamp: hoursAgo(5), metadata: {}, created_at: hoursAgo(5) },
  { id: 'log-014', organization_id: ORG_ID, device_id: demoDevices[15].id, level: 'warn', source: 'thermal', message: 'CPU temperature high: 87C, throttling activated', timestamp: minutesAgo(18), metadata: {}, created_at: minutesAgo(18) },
  { id: 'log-015', organization_id: ORG_ID, device_id: demoDevices[26].id, level: 'info', source: 'modem', message: 'LTE attach successful: PLMN=310260, Band=B12, RSRP=-95dBm', timestamp: daysAgo(1), metadata: {}, created_at: daysAgo(1) },
  { id: 'log-016', organization_id: ORG_ID, device_id: demoDevices[12].id, level: 'info', source: 'fastboot', message: 'Flashing boot partition... transfer: 45.2MB/s', timestamp: minutesAgo(8), metadata: {}, created_at: minutesAgo(8) },
  { id: 'log-017', organization_id: ORG_ID, device_id: demoDevices[12].id, level: 'info', source: 'fastboot', message: 'Flash complete. Rebooting device...', timestamp: minutesAgo(6), metadata: {}, created_at: minutesAgo(6) },
  { id: 'log-018', organization_id: ORG_ID, device_id: demoDevices[7].id, level: 'error', source: 'adb', message: 'error: device DUT-A008-8T5H not found. Is it connected?', timestamp: hoursAgo(6), metadata: {}, created_at: hoursAgo(6) },
  { id: 'log-019', organization_id: ORG_ID, device_id: demoDevices[20].id, level: 'error', source: 'adb', message: 'error: device DUT-B006-8G7U unauthorized. Check device screen for auth dialog.', timestamp: hoursAgo(14), metadata: {}, created_at: hoursAgo(14) },
  { id: 'log-020', organization_id: ORG_ID, device_id: demoDevices[3].id, level: 'warn', source: 'battery', message: 'Battery level critical: 15%. Suspending test execution.', timestamp: hoursAgo(4), metadata: {}, created_at: hoursAgo(4) },
  { id: 'log-021', organization_id: ORG_ID, device_id: demoDevices[15].id, level: 'info', source: 'testforge_agent', message: 'Device heartbeat: DUT-B001 online, battery 90%, temp 34C', timestamp: minutesAgo(3), metadata: {}, created_at: minutesAgo(3) },
  { id: 'log-022', organization_id: ORG_ID, device_id: demoDevices[28].id, level: 'info', source: 'uart', message: 'AT+CFUN=1 -> OK (modem powered on)', timestamp: minutesAgo(40), metadata: {}, created_at: minutesAgo(40) },
  { id: 'log-023', organization_id: ORG_ID, device_id: demoDevices[28].id, level: 'error', source: 'modem', message: 'IMS registration failed: TLS handshake error (certificate expired)', timestamp: minutesAgo(38), metadata: {}, created_at: minutesAgo(38) },
  { id: 'log-024', organization_id: ORG_ID, device_id: demoDevices[33].id, level: 'info', source: 'ssh', message: 'Test runner started: ble-qualification suite on SBC-001', timestamp: hoursAgo(2), metadata: {}, created_at: hoursAgo(2) },
  { id: 'log-025', organization_id: ORG_ID, device_id: demoDevices[34].id, level: 'warn', source: 'system', message: 'Memory usage at 85% (856MB/1024MB). Consider restarting test runner.', timestamp: hoursAgo(3), metadata: {}, created_at: hoursAgo(3) },
  { id: 'log-026', organization_id: ORG_ID, device_id: demoDevices[0].id, level: 'info', source: 'gpu', message: 'GPU frequency scaled to 710MHz (thermal throttle)', timestamp: minutesAgo(17), metadata: {}, created_at: minutesAgo(17) },
  { id: 'log-027', organization_id: ORG_ID, device_id: demoDevices[4].id, level: 'warn', source: 'wifi', message: 'Firmware recovery completed after TX path hang (2.3s downtime)', timestamp: hoursAgo(1), metadata: {}, created_at: hoursAgo(1) },
  { id: 'log-028', organization_id: ORG_ID, device_id: demoDevices[16].id, level: 'error', source: 'display', message: 'FIFO underrun on pipe A during GPU stress test', timestamp: daysAgo(2), metadata: {}, created_at: daysAgo(2) },
  { id: 'log-029', organization_id: ORG_ID, device_id: demoDevices[9].id, level: 'info', source: 'maintenance', message: 'Device DUT-A010 entering maintenance mode: scheduled battery calibration', timestamp: minutesAgo(15), metadata: {}, created_at: minutesAgo(15) },
  { id: 'log-030', organization_id: ORG_ID, device_id: demoDevices[43].id, level: 'info', source: 'dfu', message: 'OTA firmware update started: ble-fw-3.1.2 -> ble-fw-3.1.3', timestamp: minutesAgo(5), metadata: {}, created_at: minutesAgo(5) },
  { id: 'log-031', organization_id: ORG_ID, device_id: demoDevices[1].id, level: 'info', source: 'testforge_agent', message: 'Scheduled test run queued: connectivity-sweep at 02:00 UTC', timestamp: hoursAgo(8), metadata: {}, created_at: hoursAgo(8) },
  { id: 'log-032', organization_id: ORG_ID, device_id: demoDevices[26].id, level: 'info', source: 'modem', message: 'Signal quality: RSRP=-85dBm, RSRQ=-9dB, SINR=15.2dB', timestamp: minutesAgo(22), metadata: {}, created_at: minutesAgo(22) },
  { id: 'log-033', organization_id: ORG_ID, device_id: demoDevices[5].id, level: 'info', source: 'camera', message: 'Camera opened: rear sensor, resolution 4032x3024, HDR enabled', timestamp: hoursAgo(2), metadata: {}, created_at: hoursAgo(2) },
  { id: 'log-034', organization_id: ORG_ID, device_id: demoDevices[5].id, level: 'error', source: 'camera', message: 'Capture failed: SIGSEGV in processCapture after session close', timestamp: hoursAgo(2), metadata: {}, created_at: hoursAgo(2) },
  { id: 'log-035', organization_id: ORG_ID, device_id: demoDevices[36].id, level: 'info', source: 'ssh', message: 'SBC-004 kernel: Linux 6.1 sbc-node ttyS0', timestamp: minutesAgo(50), metadata: {}, created_at: minutesAgo(50) },
  { id: 'log-036', organization_id: ORG_ID, device_id: demoDevices[11].id, level: 'warn', source: 'battery', message: 'Battery level low: 22%. Recommend charging before next test run.', timestamp: hoursAgo(1), metadata: {}, created_at: hoursAgo(1) },
  { id: 'log-037', organization_id: ORG_ID, device_id: demoDevices[22].id, level: 'info', source: 'testforge_agent', message: 'Nightly test suite triggered by CI webhook (branch: main, build-489)', timestamp: hoursAgo(10), metadata: {}, created_at: hoursAgo(10) },
  { id: 'log-038', organization_id: ORG_ID, device_id: demoDevices[22].id, level: 'info', source: 'testforge_agent', message: 'Nightly suite completed: 142/150 passed, 6 failed, 2 skipped (47m 23s)', timestamp: hoursAgo(9), metadata: {}, created_at: hoursAgo(9) },
  { id: 'log-039', organization_id: ORG_ID, device_id: demoDevices[31].id, level: 'error', source: 'uart', message: 'UART timeout: no response from MDM-006 after 5000ms', timestamp: minutesAgo(30), metadata: {}, created_at: minutesAgo(30) },
  { id: 'log-040', organization_id: ORG_ID, device_id: demoDevices[45].id, level: 'info', source: 'ble_stack', message: 'GATT service registered: UUID=180D (Heart Rate), handles 0x0010-0x0018', timestamp: minutesAgo(7), metadata: {}, created_at: minutesAgo(7) },
  { id: 'log-041', organization_id: ORG_ID, device_id: demoDevices[0].id, level: 'info', source: 'testforge_agent', message: 'Crash report uploaded: GPU_PWR_847 (12th occurrence)', timestamp: hoursAgo(4), metadata: {}, created_at: hoursAgo(4) },
  { id: 'log-042', organization_id: ORG_ID, device_id: demoDevices[0].id, level: 'info', source: 'jira', message: 'Jira ticket FWVAL-1892 created for crash GPU_PWR_847 -> gpu-power-team', timestamp: hoursAgo(4), metadata: {}, created_at: hoursAgo(4) },
  { id: 'log-043', organization_id: ORG_ID, device_id: demoDevices[15].id, level: 'warn', source: 'thermal', message: 'Thermal shutdown imminent: CPU 103C. Emergency throttle applied.', timestamp: daysAgo(1), metadata: {}, created_at: daysAgo(1) },
  { id: 'log-044', organization_id: ORG_ID, device_id: demoDevices[29].id, level: 'info', source: 'testforge_agent', message: 'Device MDM-004 allocated for modem-stability suite', timestamp: minutesAgo(1), metadata: {}, created_at: minutesAgo(1) },
  { id: 'log-045', organization_id: ORG_ID, device_id: demoDevices[34].id, level: 'info', source: 'system', message: 'Test results exported: /results/junit-2024-03-15-143221.xml (2.3MB)', timestamp: hoursAgo(2), metadata: {}, created_at: hoursAgo(2) },
  { id: 'log-046', organization_id: ORG_ID, device_id: demoDevices[19].id, level: 'info', source: 'adb', message: 'Screen capture saved: /screenshots/DUT-B004_home_20240315.png', timestamp: hoursAgo(7), metadata: {}, created_at: hoursAgo(7) },
  { id: 'log-047', organization_id: ORG_ID, device_id: demoDevices[27].id, level: 'info', source: 'uart', message: 'AT+COPS? -> +COPS: 0,0,"T-Mobile",7 (LTE connected)', timestamp: minutesAgo(35), metadata: {}, created_at: minutesAgo(35) },
  { id: 'log-048', organization_id: ORG_ID, device_id: demoDevices[40].id, level: 'debug', source: 'ble_stack', message: 'Scan response data set: 31 bytes, TX power: +4dBm', timestamp: minutesAgo(11), metadata: {}, created_at: minutesAgo(11) },
  { id: 'log-049', organization_id: ORG_ID, device_id: demoDevices[3].id, level: 'info', source: 'camera', message: 'Camera sanity test: 15/15 capture modes validated successfully', timestamp: hoursAgo(2), metadata: {}, created_at: hoursAgo(2) },
  { id: 'log-050', organization_id: ORG_ID, device_id: demoDevices[32].id, level: 'error', source: 'uart', message: 'MDM-008 unresponsive for 48h. Marked as offline.', timestamp: hoursAgo(48), metadata: {}, created_at: hoursAgo(48) },
  { id: 'log-051', organization_id: ORG_ID, device_id: demoDevices[37].id, level: 'info', source: 'maintenance', message: 'SBC-005 entering maintenance: SD card health check scheduled', timestamp: minutesAgo(15), metadata: {}, created_at: minutesAgo(15) },
  { id: 'log-052', organization_id: ORG_ID, device_id: demoDevices[13].id, level: 'info', source: 'testforge_agent', message: 'OTA upgrade verify started on DUT-A014 (v3.2.0 -> v3.2.1-rc4)', timestamp: hoursAgo(3), metadata: {}, created_at: hoursAgo(3) },
  { id: 'log-053', organization_id: ORG_ID, device_id: demoDevices[13].id, level: 'info', source: 'testforge_agent', message: 'OTA upgrade verify completed: all 18 checks passed', timestamp: hoursAgo(2), metadata: {}, created_at: hoursAgo(2) },
  { id: 'log-054', organization_id: ORG_ID, device_id: demoDevices[24].id, level: 'info', source: 'adb', message: 'DUT-B010 booted successfully: vendor-fw-6.1.1, uptime 0m', timestamp: hoursAgo(3), metadata: {}, created_at: hoursAgo(3) },
  { id: 'log-055', organization_id: ORG_ID, device_id: demoDevices[0].id, level: 'info', source: 'slack', message: 'Alert sent to #firmware-validation: GPU crash on DUT-A001 (12 occurrences)', timestamp: hoursAgo(4), metadata: {}, created_at: hoursAgo(4) },
  { id: 'log-056', organization_id: ORG_ID, device_id: demoDevices[1].id, level: 'info', source: 'testforge_agent', message: 'Weekly report generated: 47 runs, 86% pass rate, 3 new crashes', timestamp: daysAgo(2), metadata: {}, created_at: daysAgo(2) },
  { id: 'log-057', organization_id: ORG_ID, device_id: demoDevices[26].id, level: 'info', source: 'modem', message: 'Speed test: DL 145.3 Mbps, UL 42.1 Mbps (Band B2, 20MHz)', timestamp: hoursAgo(5), metadata: {}, created_at: hoursAgo(5) },
  { id: 'log-058', organization_id: ORG_ID, device_id: demoDevices[43].id, level: 'info', source: 'dfu', message: 'OTA update complete: ble-fw-3.1.3 verified, rebooting...', timestamp: minutesAgo(3), metadata: {}, created_at: minutesAgo(3) },
  { id: 'log-059', organization_id: ORG_ID, device_id: demoDevices[10].id, level: 'info', source: 'adb', message: 'Logcat capture started: DUT-A011 -> /logs/dut-a011-20240315.log', timestamp: minutesAgo(7), metadata: {}, created_at: minutesAgo(7) },
  { id: 'log-060', organization_id: ORG_ID, device_id: demoDevices[38].id, level: 'info', source: 'maintenance', message: 'SD card health: 94% life remaining, 12TB total written', timestamp: minutesAgo(14), metadata: {}, created_at: minutesAgo(14) },
];

// ─── Alerts (18 entries) ────────────────────────────────────────────────────────

export const demoAlerts: Alert[] = [
  {
    id: 'alert-001', organization_id: ORG_ID,
    type: 'crash_detected', severity: 'critical',
    title: 'New critical crash: KernelPanic at drivers/gpu/power.c:847',
    message: 'GPU power crash on DUT-A001. 12 occurrences in last 8 days. Fingerprint: GPU_PWR_847. Auto-triage: GPU power state race condition during resume.',
    is_read: false, is_resolved: false, created_at: hoursAgo(4),
  },
  {
    id: 'alert-002', organization_id: ORG_ID,
    type: 'test_failure', severity: 'warning',
    title: 'Regression: suspend-resume-stress suite failing',
    message: '3 consecutive failures on DUT-A devices. Pass rate dropped from 92% to 62%. Affected tests: suspend_resume_cycle, deep_sleep_entry, wake_on_modem.',
    is_read: false, is_resolved: false, created_at: hoursAgo(6),
  },
  {
    id: 'alert-003', organization_id: ORG_ID,
    type: 'device_offline', severity: 'warning',
    title: 'DUT-A008 offline for 6+ hours',
    message: 'Device DUT-A008-8T5H last seen 6 hours ago. Battery at 15%. Connection: ADB. May need charging and cable check.',
    is_read: false, is_resolved: false, created_at: hoursAgo(6),
  },
  {
    id: 'alert-004', organization_id: ORG_ID,
    type: 'device_offline', severity: 'warning',
    title: 'DUT-B006 offline for 14+ hours',
    message: 'Device DUT-B006-8G7U last seen 14 hours ago. Battery at 8%. ADB unauthorized — check device screen for auth dialog.',
    is_read: false, is_resolved: false, created_at: hoursAgo(14),
  },
  {
    id: 'alert-005', organization_id: ORG_ID,
    type: 'device_offline', severity: 'critical',
    title: 'MDM-008 offline for 48+ hours',
    message: 'Device MDM-008-5S4G last seen 48 hours ago. Running old firmware fw-4.9.8. UART connection unresponsive. May require physical inspection.',
    is_read: true, is_resolved: false, created_at: hoursAgo(48),
  },
  {
    id: 'alert-006', organization_id: ORG_ID,
    type: 'crash_detected', severity: 'critical',
    title: 'ASSERT_FAIL: baseband version mismatch on MDM-003',
    message: 'Firmware version assertion failure. Expected v5.0.3, actual v4.9.8. Device MDM-003 cannot complete test runs until reflashed.',
    is_read: false, is_resolved: false, created_at: daysAgo(2),
  },
  {
    id: 'alert-007', organization_id: ORG_ID,
    type: 'threshold_breach', severity: 'warning',
    title: 'Build failure rate above 20% on feature/ble-v2',
    message: 'Branch feature/ble-v2 has 35% build failure rate over the last 48 hours (7/20 builds failed). BLE qualification tests are the primary failures.',
    is_read: false, is_resolved: false, created_at: hoursAgo(12),
  },
  {
    id: 'alert-008', organization_id: ORG_ID,
    type: 'flaky_test', severity: 'info',
    title: 'Flaky test detected: ble_connection_stability',
    message: 'Test ble_connection_stability failed intermittently 4 out of last 10 runs across BLE modules. RF interference suspected.',
    is_read: true, is_resolved: false, created_at: daysAgo(1),
  },
  {
    id: 'alert-009', organization_id: ORG_ID,
    type: 'crash_detected', severity: 'warning',
    title: 'Camera HAL crash on DUT-A004 (7 occurrences)',
    message: 'SIGSEGV in libcamera2.so during capture processing. Affects camera-sanity suite. ~15% crash rate on fast capture sequences.',
    is_read: false, is_resolved: false, created_at: daysAgo(1),
  },
  {
    id: 'alert-010', organization_id: ORG_ID,
    type: 'threshold_breach', severity: 'critical',
    title: 'Thermal shutdown on DUT-B001',
    message: 'CPU temperature exceeded 105C during stress test. Emergency shutdown triggered. Risk of hardware damage if test conditions not adjusted.',
    is_read: true, is_resolved: false, created_at: daysAgo(1),
  },
  {
    id: 'alert-011', organization_id: ORG_ID,
    type: 'system', severity: 'info',
    title: 'Weekly report generated',
    message: 'Your weekly TestForge report is ready. Summary: 47 test runs, 86% pass rate, 3 new crashes detected, 1 crash resolved.',
    is_read: true, is_resolved: true, resolved_at: daysAgo(2), created_at: daysAgo(2),
  },
  {
    id: 'alert-012', organization_id: ORG_ID,
    type: 'device_offline', severity: 'info',
    title: 'DUT-A010 entering maintenance mode',
    message: 'Device DUT-A010 moved to maintenance mode for scheduled battery calibration. Expected duration: 2 hours.',
    is_read: true, is_resolved: false, created_at: minutesAgo(15),
  },
  {
    id: 'alert-013', organization_id: ORG_ID,
    type: 'crash_detected', severity: 'warning',
    title: 'BLE module flash write failure (2 occurrences)',
    message: 'Flash write failed at 0x7F000 on BLE-003 and BLE-005. Flash endurance limit may be reached. OTA updates blocked on these modules.',
    is_read: false, is_resolved: false, created_at: hoursAgo(3),
  },
  {
    id: 'alert-014', organization_id: ORG_ID,
    type: 'test_failure', severity: 'warning',
    title: 'IMS registration tests failing on MDM modules',
    message: 'All VoLTE/VoWiFi tests failing due to IMS registration timeout. Root cause: expired SIP server certificate. Infra team notified.',
    is_read: true, is_resolved: false, created_at: daysAgo(1),
  },
  {
    id: 'alert-015', organization_id: ORG_ID,
    type: 'flaky_test', severity: 'info',
    title: 'SSH connection drops during long tests on SBC nodes',
    message: 'Tests >25min on SBC nodes have ~8% SSH drop rate. Network switch MAC aging suspected. SSH keepalive interval adjustment recommended.',
    is_read: true, is_resolved: false, created_at: daysAgo(3),
  },
  {
    id: 'alert-016', organization_id: ORG_ID,
    type: 'system', severity: 'info',
    title: 'Jira ticket FWVAL-1892 auto-created',
    message: 'Automated Jira ticket created for crash GPU_PWR_847 (12 occurrences). Assigned to gpu-power-team. Priority: Critical.',
    is_read: true, is_resolved: true, resolved_at: hoursAgo(4), created_at: hoursAgo(4),
  },
  {
    id: 'alert-017', organization_id: ORG_ID,
    type: 'threshold_breach', severity: 'warning',
    title: 'Low battery warning: DUT-A012 at 22%',
    message: 'Device DUT-A012 battery at 22%. Recommend charging before scheduling next test run to avoid mid-test power loss.',
    is_read: false, is_resolved: false, created_at: hoursAgo(1),
  },
  {
    id: 'alert-018', organization_id: ORG_ID,
    type: 'system', severity: 'info',
    title: 'Nightly test suite completed',
    message: 'Nightly regression suite completed on DUT-B007: 142/150 passed (94.7%), 6 failed, 2 skipped. Duration: 47m 23s.',
    is_read: true, is_resolved: true, resolved_at: hoursAgo(9), created_at: hoursAgo(9),
  },
];

// ─── API Keys ───────────────────────────────────────────────────────────────────

export const demoApiKeys: ApiKey[] = [
  {
    id: 'key-001', organization_id: ORG_ID,
    name: 'CI Pipeline (GitHub Actions)',
    key_hash: 'hashed_value_1', key_prefix: 'tf_live_a1b2',
    permissions: ['read', 'write'],
    last_used_at: minutesAgo(32), is_active: true, created_at: daysAgo(30),
  },
  {
    id: 'key-002', organization_id: ORG_ID,
    name: 'Dashboard Read-Only',
    key_hash: 'hashed_value_2', key_prefix: 'tf_live_c3d4',
    permissions: ['read'],
    last_used_at: hoursAgo(4), is_active: true, created_at: daysAgo(15),
  },
  {
    id: 'key-003', organization_id: ORG_ID,
    name: 'Device Agent (Lab Server)',
    key_hash: 'hashed_value_3', key_prefix: 'tf_live_e5f6',
    permissions: ['read', 'write', 'device'],
    last_used_at: minutesAgo(3), is_active: true, created_at: daysAgo(45),
  },
  {
    id: 'key-004', organization_id: ORG_ID,
    name: 'Jenkins Integration (deprecated)',
    key_hash: 'hashed_value_4', key_prefix: 'tf_live_g7h8',
    permissions: ['read', 'write'],
    last_used_at: daysAgo(20), is_active: false, created_at: daysAgo(60),
  },
];

// ─── Assembled demo data ────────────────────────────────────────────────────────

export const demoData: DemoData = {
  organization: demoOrganization,
  devices: demoDevices,
  testRuns: demoTestRuns,
  crashes: demoCrashes,
  logs: demoLogs,
  alerts: demoAlerts,
  apiKeys: demoApiKeys,
};

// ─── Computed helpers ───────────────────────────────────────────────────────────

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
      const cat = run.name || 'Other';
      categories[cat] = (categories[cat] || 0) + run.failed;
    }
  });

  const colors = ['#EF4444', '#F59E0B', '#6366f1', '#EC4899', '#4f46e5', '#10B981'];
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
    { id: 'act-001', type: 'test_complete', title: 'post-flash-smoke finished', description: 'DUT-A001 — 28/30 passed, 2 failed (build-490)', timestamp: minutesAgo(32) },
    { id: 'act-002', type: 'crash_detected', title: 'GPU power crash detected', description: 'DUT-A001 — KernelPanic at drivers/gpu/power.c:847 (12th occurrence)', timestamp: hoursAgo(4) },
    { id: 'act-003', type: 'device_online', title: 'BLE-001 came online', description: 'UART connected — ble-fw-3.1.3 — advertising active', timestamp: minutesAgo(3) },
    { id: 'act-004', type: 'alert_created', title: 'Regression alert triggered', description: 'suspend-resume-stress suite — pass rate dropped to 62%', timestamp: hoursAgo(6) },
    { id: 'act-005', type: 'test_complete', title: 'modem-stability completed', description: 'MDM-004 — 38/40 passed (build-488)', timestamp: hoursAgo(7) },
    { id: 'act-006', type: 'device_offline', title: 'MDM-008 unresponsive', description: 'UART connection lost — old firmware fw-4.9.8 — offline 48+ hours', timestamp: hoursAgo(48) },
    { id: 'act-007', type: 'crash_detected', title: 'Camera HAL crash', description: 'DUT-A004 — SIGSEGV in libcamera2.so (7th occurrence)', timestamp: daysAgo(1) },
    { id: 'act-008', type: 'test_complete', title: 'ble-qualification passed', description: 'BLE-002 — 35/35 passed (build-489)', timestamp: hoursAgo(4) },
    { id: 'act-009', type: 'report_generated', title: 'Weekly report ready', description: '47 runs · 86% pass rate · 3 new crashes · 1 resolved', timestamp: daysAgo(2) },
    { id: 'act-010', type: 'alert_created', title: 'Thermal shutdown warning', description: 'DUT-B001 CPU temp exceeded 105C during stress test', timestamp: daysAgo(1) },
    { id: 'act-011', type: 'device_online', title: 'DUT-A013 flashing complete', description: 'Fastboot flash done — v3.2.1-rc4 — rebooting', timestamp: minutesAgo(6) },
    { id: 'act-012', type: 'test_complete', title: 'Nightly regression completed', description: 'DUT-B007 — 142/150 passed (94.7%) — 47m 23s', timestamp: hoursAgo(9) },
    { id: 'act-013', type: 'crash_detected', title: 'BLE watchdog timeout', description: 'BLE-001 — BLE_WATCHDOG_TIMEOUT at bt_hci.c:1203 (5th occurrence)', timestamp: hoursAgo(2) },
    { id: 'act-014', type: 'alert_created', title: 'BLE module flash write failure', description: 'BLE-003 — flash endurance limit reached at 0x7F000', timestamp: hoursAgo(3) },
    { id: 'act-015', type: 'test_complete', title: 'OTA upgrade verified', description: 'DUT-A014 — 18/18 checks passed (v3.2.0 → v3.2.1-rc4)', timestamp: hoursAgo(2) },
  ];
}

// ─── Sparkline Data ───────────────────────────────────────────────────────────

export interface SparklinePoint {
  value: number;
}

export function getSparklineData(metric: 'runs' | 'passRate' | 'devices' | 'crashes'): SparklinePoint[] {
  const base: Record<typeof metric, number[]> = {
    runs:     [22, 26, 24, 28, 25, 27, 26],
    passRate: [82, 85, 84, 87, 89, 86, 88],
    devices:  [40, 42, 41, 43, 44, 42, 44],
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
    passRateTrend: +3.2,
    runsTrend: +8,
  };
}
