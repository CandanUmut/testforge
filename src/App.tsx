import { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { FullPageSpinner } from './components/common/LoadingSpinner';

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
const Docs = lazy(() => import('./pages/Docs').then(m => ({ default: m.Docs })));
const Onboarding = lazy(() => import('./pages/Onboarding').then(m => ({ default: m.Onboarding })));

export function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/onboarding"
            element={
              <Suspense fallback={<FullPageSpinner />}>
                <Onboarding />
              </Suspense>
            }
          />

          {/* Protected app */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route
              path="/dashboard"
              element={
                <Suspense fallback={<FullPageSpinner />}>
                  <Dashboard />
                </Suspense>
              }
            />
            <Route
              path="/test-runs"
              element={
                <Suspense fallback={<FullPageSpinner />}>
                  <TestRuns />
                </Suspense>
              }
            />
            <Route
              path="/test-runs/:id"
              element={
                <Suspense fallback={<FullPageSpinner />}>
                  <TestRunDetail />
                </Suspense>
              }
            />
            <Route
              path="/test-runs/compare"
              element={
                <Suspense fallback={<FullPageSpinner />}>
                  <CompareRuns />
                </Suspense>
              }
            />
            <Route
              path="/crash-triage"
              element={
                <Suspense fallback={<FullPageSpinner />}>
                  <CrashTriage />
                </Suspense>
              }
            />
            <Route
              path="/logs"
              element={
                <Suspense fallback={<FullPageSpinner />}>
                  <LogExplorer />
                </Suspense>
              }
            />
            <Route
              path="/devices"
              element={
                <Suspense fallback={<FullPageSpinner />}>
                  <Devices />
                </Suspense>
              }
            />
            <Route
              path="/reports"
              element={
                <Suspense fallback={<FullPageSpinner />}>
                  <Reports />
                </Suspense>
              }
            />
            <Route
              path="/settings"
              element={
                <Suspense fallback={<FullPageSpinner />}>
                  <Settings />
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
            <Route path="/app" element={<Navigate to="/dashboard" replace />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </HashRouter>
  );
}
