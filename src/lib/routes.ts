export type AppMode = 'app' | 'demo';

export type AppSection =
  | 'dashboard'
  | 'test-runs'
  | 'devices'
  | 'crash-triage'
  | 'logs'
  | 'reports'
  | 'settings';

export const PUBLIC_ROUTES = {
  landing: '/',
  login: '/login',
  signup: '/signup',
  setupGuide: '/docs/setup',
  apiDocs: '/docs/api',
} as const;

export const DEFAULT_APP_SECTION: AppSection = 'dashboard';

export function getModeBasePath(mode: AppMode) {
  return mode === 'demo' ? '/demo' : '/app';
}

export function getAppPath(mode: AppMode, section: AppSection = DEFAULT_APP_SECTION) {
  const basePath = getModeBasePath(mode);
  if (section === DEFAULT_APP_SECTION) {
    return mode === 'demo' ? basePath : `${basePath}/dashboard`;
  }

  return `${basePath}/${section}`;
}
