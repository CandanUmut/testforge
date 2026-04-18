import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { demoData, demoOrganization, demoProfile, demoDevices, demoTestRuns, demoCrashes, demoLogs, demoAlerts, demoApiKeys, getDashboardStats, getPassFailTrend, getFailureCategories } from '../lib/demo-data';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { getAppPath, getModeBasePath, type AppMode, type AppSection } from '../lib/routes';
import type { Device, TestRun, Crash, Log, Alert, ApiKey, Organization, Profile, DashboardStats, PassFailDataPoint, FailureCategoryDataPoint } from '../lib/types';

interface DataContextValue {
  mode: AppMode;
  isDemoMode: boolean;
  basePath: string;
  demoData: typeof demoData;
  getScopedPath: (section?: AppSection) => string;

  // Unified data interface
  devices: Device[];
  testRuns: TestRun[];
  crashes: Crash[];
  logs: Log[];
  alerts: Alert[];
  apiKeys: ApiKey[];
  organization: Organization | null;
  profile: Profile | null;
  dashboardStats: DashboardStats | null;
  passFailTrend: PassFailDataPoint[];
  failureCategories: FailureCategoryDataPoint[];
  dataLoading: boolean;
  refreshData: () => void;
}

const DataContext = createContext<DataContextValue | null>(null);

interface DataProviderProps {
  children: ReactNode;
  mode: AppMode;
}

export function DataProvider({ children, mode }: DataProviderProps) {
  const isDemoMode = mode === 'demo';
  const auth = useAuth();

  const [devices, setDevices] = useState<Device[]>(isDemoMode ? demoDevices : []);
  const [testRuns, setTestRuns] = useState<TestRun[]>(isDemoMode ? demoTestRuns : []);
  const [crashes, setCrashes] = useState<Crash[]>(isDemoMode ? demoCrashes : []);
  const [logs, setLogs] = useState<Log[]>(isDemoMode ? demoLogs : []);
  const [alerts, setAlerts] = useState<Alert[]>(isDemoMode ? demoAlerts : []);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(isDemoMode ? demoApiKeys : []);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(isDemoMode ? getDashboardStats() : null);
  const [passFailTrend, setPassFailTrend] = useState<PassFailDataPoint[]>(isDemoMode ? getPassFailTrend() : []);
  const [failureCategories, setFailureCategories] = useState<FailureCategoryDataPoint[]>(isDemoMode ? getFailureCategories() : []);
  const [dataLoading, setDataLoading] = useState(!isDemoMode);

  const orgId = isDemoMode ? demoOrganization.id : auth.organization?.id;

  const loadSupabaseData = useCallback(async () => {
    if (isDemoMode || !orgId) return;
    setDataLoading(true);
    try {
      const [devRes, runsRes, crashRes, logRes, alertRes, keyRes] = await Promise.all([
        supabase.from('devices').select('*').eq('organization_id', orgId).order('name'),
        supabase.from('test_runs').select('*, device:devices(*)').eq('organization_id', orgId).order('created_at', { ascending: false }),
        supabase.from('crashes').select('*, device:devices(*)').eq('organization_id', orgId).order('last_seen_at', { ascending: false }),
        supabase.from('logs').select('*, device:devices(*)').eq('organization_id', orgId).order('timestamp', { ascending: false }).limit(200),
        supabase.from('alerts').select('*').eq('organization_id', orgId).order('created_at', { ascending: false }),
        supabase.from('api_keys').select('*').eq('organization_id', orgId).order('created_at', { ascending: false }),
      ]);

      if (devRes.data) setDevices(devRes.data);
      if (runsRes.data) setTestRuns(runsRes.data);
      if (crashRes.data) setCrashes(crashRes.data);
      if (logRes.data) setLogs(logRes.data);
      if (alertRes.data) setAlerts(alertRes.data);
      if (keyRes.data) setApiKeys(keyRes.data);

      // Fetch dashboard stats via RPC
      const { data: statsData } = await supabase.rpc('get_dashboard_stats', { org_uuid: orgId });
      if (statsData) setDashboardStats(statsData as DashboardStats);
    } catch {
      // Data loading failed — keep empty arrays
    } finally {
      setDataLoading(false);
    }
  }, [isDemoMode, orgId]);

  useEffect(() => {
    if (!isDemoMode && orgId) {
      loadSupabaseData();
    }
  }, [isDemoMode, orgId, loadSupabaseData]);

  const value: DataContextValue = {
    mode,
    isDemoMode,
    basePath: getModeBasePath(mode),
    demoData,
    getScopedPath: (section) => getAppPath(mode, section),

    devices,
    testRuns,
    crashes,
    logs,
    alerts,
    apiKeys,
    organization: isDemoMode ? demoOrganization : auth.organization,
    profile: isDemoMode ? demoProfile : auth.profile,
    dashboardStats,
    passFailTrend,
    failureCategories,
    dataLoading,
    refreshData: loadSupabaseData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useDataContext() {
  const context = useContext(DataContext);

  if (!context) {
    throw new Error('useDataContext must be used within DataProvider');
  }

  return context;
}

// Convenience alias
export const useData = useDataContext;
