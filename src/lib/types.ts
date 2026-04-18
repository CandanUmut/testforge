// ─── Organizations ───────────────────────────────────────────────────────────

export type PlanType = 'starter' | 'professional' | 'enterprise';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: PlanType;
  logo_url?: string;
  domain?: string;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// ─── Profiles ────────────────────────────────────────────────────────────────

export type UserRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface Profile {
  id: string;
  organization_id?: string;
  full_name?: string;
  email: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// ─── Devices ─────────────────────────────────────────────────────────────────

export type DeviceType = 'android' | 'ios' | 'embedded' | 'iot' | 'web' | 'desktop' | 'custom';
export type DeviceStatus = 'online' | 'offline' | 'testing' | 'error' | 'maintenance' | 'flashing';
export type ConnectionType = 'usb' | 'adb' | 'uart' | 'ssh' | 'wifi' | 'api' | 'agent';

export interface Device {
  id: string;
  organization_id: string;
  name: string;
  device_type: DeviceType;
  serial_number?: string;
  firmware_version?: string;
  os_version?: string;
  status: DeviceStatus;
  connection_type?: ConnectionType;
  battery_level?: number;
  carrier?: string;
  metadata: Record<string, unknown>;
  last_seen_at?: string;
  created_at: string;
}

// ─── Test Runs ────────────────────────────────────────────────────────────────

export type TriggerType = 'manual' | 'ci_cd' | 'scheduled' | 'webhook' | 'api';
export type RunStatus = 'pending' | 'running' | 'passed' | 'failed' | 'error' | 'cancelled' | 'timeout';

export interface TestRun {
  id: string;
  organization_id: string;
  device_id?: string;
  name: string;
  suite_name?: string;
  trigger_type: TriggerType;
  status: RunStatus;
  total_tests: number;
  passed: number;
  failed: number;
  skipped: number;
  error_count: number;
  duration_ms?: number;
  firmware_version?: string;
  build_number?: string;
  branch?: string;
  commit_sha?: string;
  environment: string;
  metadata: Record<string, unknown>;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  // joined
  device?: Device;
}

// ─── Test Results ─────────────────────────────────────────────────────────────

export type TestCategory = 'unit' | 'integration' | 'e2e' | 'smoke' | 'regression' | 'performance' | 'stress' | 'power' | 'firmware' | 'hardware' | 'custom';
export type TestStatus = 'passed' | 'failed' | 'error' | 'skipped' | 'flaky' | 'timeout';

export interface TestResult {
  id: string;
  test_run_id: string;
  organization_id: string;
  test_name: string;
  test_class?: string;
  test_category?: TestCategory;
  status: TestStatus;
  duration_ms?: number;
  error_message?: string;
  stack_trace?: string;
  screenshot_url?: string;
  log_url?: string;
  retry_count: number;
  is_flaky: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
}

// ─── Crashes ─────────────────────────────────────────────────────────────────

export type CrashType = 'kernel_panic' | 'anr' | 'native_crash' | 'java_exception' | 'segfault' | 'watchdog' | 'oom' | 'assertion' | 'timeout' | 'power_failure' | 'modem' | 'unknown';
export type Severity = 'critical' | 'high' | 'medium' | 'low';
export type CrashStatus = 'new' | 'investigating' | 'identified' | 'fixed' | 'wont_fix' | 'duplicate';

export interface Crash {
  id: string;
  organization_id: string;
  device_id?: string;
  test_run_id?: string;
  title: string;
  crash_type: CrashType;
  severity: Severity;
  status: CrashStatus;
  occurrence_count: number;
  first_seen_at: string;
  last_seen_at: string;
  stack_trace?: string;
  log_snippet?: string;
  root_cause?: string;
  ai_analysis?: string;
  ai_suggested_fix?: string;
  assigned_to?: string;
  assigned_team?: string;
  affected_devices?: string[];
  fingerprint?: string;
  jira_ticket?: string;
  metadata: Record<string, unknown>;
  created_at: string;
  // joined
  device?: Device;
  assignee?: Profile;
}

// ─── Logs ─────────────────────────────────────────────────────────────────────

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface Log {
  id: string;
  organization_id: string;
  device_id?: string;
  test_run_id?: string;
  level: LogLevel;
  source?: string;
  message: string;
  timestamp: string;
  metadata: Record<string, unknown>;
  created_at: string;
  // joined
  device?: Device;
}

// ─── API Keys ─────────────────────────────────────────────────────────────────

export interface ApiKey {
  id: string;
  organization_id: string;
  name: string;
  key_hash: string;
  key_prefix: string;
  permissions: string[];
  last_used_at?: string;
  expires_at?: string;
  is_active: boolean;
  created_by?: string;
  created_at: string;
}

// ─── Alerts ───────────────────────────────────────────────────────────────────

export type AlertType = 'test_failure' | 'crash_detected' | 'device_offline' | 'threshold_breach' | 'build_failed' | 'flaky_test' | 'system';
export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface Alert {
  id: string;
  organization_id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message?: string;
  source_id?: string;
  source_type?: string;
  is_read: boolean;
  is_resolved: boolean;
  resolved_at?: string;
  created_at: string;
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export interface DashboardStats {
  totalRunsThisWeek: number;
  passRate: number;
  activeDevices: number;
  openCrashes: number;
  passRateTrend: number; // +/- percentage change vs last week
  runsTrend: number;
}

export interface PassFailDataPoint {
  date: string;
  passed: number;
  failed: number;
  total: number;
}

export interface FailureCategoryDataPoint {
  name: string;
  value: number;
  color: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
  };
}

// ─── Demo Mode ────────────────────────────────────────────────────────────────

export interface DemoData {
  organization: Organization;
  devices: Device[];
  testRuns: TestRun[];
  crashes: Crash[];
  logs: Log[];
  alerts: Alert[];
  apiKeys: ApiKey[];
}
