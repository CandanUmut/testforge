export const APP_NAME = 'TestForge';
export const APP_DESCRIPTION = 'Test infrastructure that runs itself.';
export const GITHUB_URL = 'https://github.com/candanumut/testforge';
export const AUTHOR_GITHUB = 'https://github.com/candanumut';

export const DEMO_ORG_ID = 'd0000000-0000-0000-0000-000000000001';
export const DEMO_ORG_SLUG = 'testforge-demo';

export const COLORS = {
  blue: '#3B82F6',
  green: '#10B981',
  amber: '#F59E0B',
  red: '#EF4444',
  indigo: '#4f46e5',
  pink: '#EC4899',
  gray: '#6B7280',
  dark: '#0f172a',
  card: '#ffffff',
  border: '#e5e7eb',
} as const;

export const STATUS_COLORS = {
  passed: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  failed: 'text-red-600 bg-red-50 border-red-200',
  error: 'text-amber-600 bg-amber-50 border-amber-200',
  running: 'text-blue-600 bg-blue-50 border-blue-200',
  pending: 'text-gray-600 bg-gray-100 border-gray-200',
  cancelled: 'text-gray-600 bg-gray-100 border-gray-200',
  timeout: 'text-orange-600 bg-orange-50 border-orange-200',
  skipped: 'text-gray-500 bg-gray-100 border-gray-200',
  flaky: 'text-indigo-600 bg-indigo-50 border-indigo-200',
} as const;

export const SEVERITY_COLORS = {
  critical: 'text-red-600 bg-red-50 border-red-200',
  high: 'text-orange-600 bg-orange-50 border-orange-200',
  medium: 'text-amber-600 bg-amber-50 border-amber-200',
  low: 'text-blue-600 bg-blue-50 border-blue-200',
  info: 'text-gray-600 bg-gray-100 border-gray-200',
  warning: 'text-amber-600 bg-amber-50 border-amber-200',
} as const;

export const DEVICE_STATUS_COLORS = {
  online: 'text-emerald-500',
  offline: 'text-gray-400',
  testing: 'text-blue-500',
  error: 'text-red-400',
  maintenance: 'text-amber-400',
  flashing: 'text-blue-500',
} as const;

export const CRASH_TYPE_LABELS: Record<string, string> = {
  kernel_panic: 'Kernel Panic',
  anr: 'ANR',
  native_crash: 'Native Crash',
  java_exception: 'Java Exception',
  segfault: 'Segfault',
  watchdog: 'Watchdog Reset',
  oom: 'OOM Kill',
  assertion: 'Assertion Failed',
  timeout: 'Timeout',
  power_failure: 'Power Failure',
  unknown: 'Unknown',
};

export const LOG_LEVEL_COLORS: Record<string, string> = {
  trace: 'text-gray-400',
  debug: 'text-gray-500',
  info: 'text-blue-600',
  warn: 'text-amber-600',
  error: 'text-red-500',
  fatal: 'text-red-700',
};

export const FAILURE_CATEGORY_COLORS = [
  '#ef4444',
  '#f59e0b',
  '#6366f1',
  '#ec4899',
  '#3b82f6',
  '#10b981',
  '#6b7280',
];

export const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'Test Runs', path: '/test-runs', icon: 'PlayCircle' },
  { label: 'Crash Triage', path: '/crash-triage', icon: 'Bug' },
  { label: 'Log Explorer', path: '/logs', icon: 'FileText' },
  { label: 'Devices', path: '/devices', icon: 'Cpu' },
  { label: 'Reports', path: '/reports', icon: 'BarChart3' },
  { label: 'Settings', path: '/settings', icon: 'Settings' },
] as const;
