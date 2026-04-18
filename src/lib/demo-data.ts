import type { Profile } from './types';

export {
  demoAlerts,
  demoApiKeys,
  demoCrashes,
  demoData,
  demoDevices,
  demoLogs,
  demoOrganization,
  demoTestRuns,
  getActivityTimeline,
  getDashboardStats,
  getFailureCategories,
  getPassFailTrend,
  getSparklineData,
} from '../utils/seedData';

export const demoProfile: Profile = {
  id: 'demo-user-001',
  organization_id: 'd0000000-0000-0000-0000-000000000001',
  full_name: 'Demo User',
  email: 'demo@testforge.dev',
  role: 'owner',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};
