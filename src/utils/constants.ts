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
  purple: '#8B5CF6',
  pink: '#EC4899',
  gray: '#6B7280',
  dark: '#0A0A0F',
  card: '#0F0F1A',
  border: 'rgba(255,255,255,0.08)',
} as const;

export const STATUS_COLORS = {
  passed: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  failed: 'text-red-400 bg-red-400/10 border-red-400/20',
  error: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  running: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  pending: 'text-gray-400 bg-gray-400/10 border-gray-400/20',
  cancelled: 'text-gray-400 bg-gray-400/10 border-gray-400/20',
  timeout: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  skipped: 'text-gray-500 bg-gray-500/10 border-gray-500/20',
  flaky: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
} as const;

export const SEVERITY_COLORS = {
  critical: 'text-red-400 bg-red-400/10 border-red-400/20',
  high: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  medium: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  low: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  info: 'text-gray-400 bg-gray-400/10 border-gray-400/20',
  warning: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
} as const;

export const DEVICE_STATUS_COLORS = {
  online: 'text-emerald-400',
  offline: 'text-gray-500',
  testing: 'text-blue-400',
  error: 'text-red-400',
  maintenance: 'text-amber-400',
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
  trace: 'text-gray-600',
  debug: 'text-gray-400',
  info: 'text-blue-400',
  warn: 'text-amber-400',
  error: 'text-red-400',
  fatal: 'text-red-600',
};

export const FAILURE_CATEGORY_COLORS = [
  '#EF4444',
  '#F59E0B',
  '#8B5CF6',
  '#EC4899',
  '#3B82F6',
  '#10B981',
  '#6B7280',
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
