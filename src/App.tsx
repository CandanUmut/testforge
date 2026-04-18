import { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { FullPageSpinner } from './components/common/LoadingSpinner';
import { PUBLIC_ROUTES, getAppPath } from './lib/routes';

// Eager load auth + landing (needed immediately)
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { NotFound } from './pages/NotFound';

// Lazy load dashboard pages
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const TestRuns = lazy(() => import('./pages/TestRuns').then(m => ({ default: m.TestRuns })));
const TestRunDetail = lazy(() => import('./pages/TestRunDetail').then(m => ({ default: m.TestRunDetail })));
const CompareRuns = lazy(() => import('./pages/CompareRuns').then(m => ({ default: m.CompareRuns })));
const CrashTriage = lazy(() => import('./pages/CrashTriage').then(m => ({ default: m.CrashTriage })));
const LogExplorer = lazy(() => import('./pages/LogExplorer').then(m => ({ default: m.LogExplorer })));
const Reports = lazy(() => import('./pages/Reports').then(m => ({ default: m.Reports })));
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));
const Devices = lazy(() => import('./pages/Devices').then(m => ({ default: m.Devices })));
const SetupGuide = lazy(() => import('./pages/SetupGuide').then(m => ({ default: m.SetupGuide })));
const ApiDocs = lazy(() => import('./pages/ApiDocs').then(m => ({ default: m.ApiDocs })));
const Onboarding = lazy(() => import('./pages/Onboarding').then(m => ({ default: m.Onboarding })));
const Setup = lazy(() => import('./pages/Setup').then(m => ({ default: m.Setup })));
const Docs = lazy(() => import('./pages/Docs').then(m => ({ default: m.Docs })));

export function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path={PUBLIC_ROUTES.landing} element={<Landing />} />
          <Route path={PUBLIC_ROUTES.login} element={<Login />} />
          <Route path={PUBLIC_ROUTES.signup} element={<Signup />} />
          <Route
            path={PUBLIC_ROUTES.setupGuide}
            element={
              <Suspense fallback={<FullPageSpinner />}>
                <SetupGuide />
              </Suspense>
            }
          />
          <Route
            path={PUBLIC_ROUTES.apiDocs}
            element={
              <Suspense fallback={<FullPageSpinner />}>
                <ApiDocs />
              </Suspense>
            }
          />
          <Route
            path="/onboarding"
            element={
              <Suspense fallback={<FullPageSpinner />}>
                <Onboarding />
              </Suspense>
            }
          />
          <Route
            path="/setup"
            element={
              <Suspense fallback={<FullPageSpinner />}>
                <Setup />
              </Suspense>
            }
          />
          <Route
            path="/docs"
            element={
              <Suspense fallback={<FullPageSpinner />}>
                <Docs />
              </Suspense>
            }
          />

          {/* Demo app */}
          <Route
            path="/demo"
            element={
              <DataProvider mode="demo">
                <AppLayout />
              </DataProvider>
            }
          >
            <Route
              index
              element={
                <Suspense fallback={<FullPageSpinner />}>
                  <Dashboard />
                </Suspense>
              }
            />
            <Route
              path="dashboard"
              element={
                <Suspense fallback={<FullPageSpinner />}>
                  <Dashboard />
                </Suspense>
              }
            />
            <Route
              path="test-runs"
              element={
                <Suspense fallback={<FullPageSpinner />}>
                  <TestRuns />
                </Suspense>
              }
            />
            <Route
              path="test-runs/:id"
              element={
                <Suspense fallback={<FullPageSpinner />}>
                  <TestRunDetail />
                </Suspense>
              }
            />
            <Route
              path="test-runs/compare"
              element={
                <Suspense fallback={<FullPageSpinner />}>
                  <CompareRuns />
                </Suspense>
              }
            />
            <Route
              path="crash-triage"
              element={
                <Suspense fallback={<FullPageSpinner />}>
                  <CrashTriage />
                </Suspense>
              }
            />
            <Route
              path="logs"
              element={
                <Suspense fallback={<FullPageSpinner />}>
                  <LogExplorer />
                </Suspense>
              }
            />
            <Route
              path="devices"
              element={
                <Suspense fallback={<FullPageSpinner />}>
                  <Devices />
                </Suspense>
              }
            />
            <Route
              path="reports"
              element={
                <Suspense fallback={<FullPageSpinner />}>
                  <Reports />
                </Suspense>
              }
            />
            <Route
              path="settings"
              element={
                <Suspense fallback={<FullPageSpinner />}>
                  <Settings />
                </Suspense>
              }
            />
          </Route>

          {/* Protected app */}
          <Route
            element={
              <ProtectedRoute>
                <DataProvider mode="app">
                  <AppLayout />
                </DataProvider>
              </ProtectedRoute>
            }
          >
            <Route path="/app" element={<Navigate to={getAppPath('app')} replace />} />
            <Route
              path="/app/dashboard"
              element={
                <Suspense fallback={<FullPageSpinner />}>
                  <Dashboard />
                </Suspense>
              }
            />
            <Route
              path="/app/test-runs"
              element={
                <Suspense fallback={<FullPageSpinner />}>
                  <TestRuns />
                </Suspense>
              }
            />
            <Route
              path="/app/test-runs/:id"
              element={
                <Suspense fallback={<FullPageSpinner />}>
                  <TestRunDetail />
                </Suspense>
              }
            />
            <Route
              path="/app/test-runs/compare"
              element={
                <Suspense fallback={<FullPageSpinner />}>
                  <CompareRuns />
                </Suspense>
              }
            />
            <Route
              path="/app/crash-triage"
              element={
                <Suspense fallback={<FullPageSpinner />}>
                  <CrashTriage />
                </Suspense>
              }
            />
            <Route
              path="/app/logs"
              element={
                <Suspense fallback={<FullPageSpinner />}>
                  <LogExplorer />
                </Suspense>
              }
            />
            <Route
              path="/app/devices"
              element={
                <Suspense fallback={<FullPageSpinner />}>
                  <Devices />
                </Suspense>
              }
            />
            <Route
              path="/app/reports"
              element={
                <Suspense fallback={<FullPageSpinner />}>
                  <Reports />
                </Suspense>
              }
            />
            <Route
              path="/app/settings"
              element={
                <Suspense fallback={<FullPageSpinner />}>
                  <Settings />
                </Suspense>
              }
            />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </HashRouter>
  );
}
