import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FullPageSpinner } from './LoadingSpinner';
import type { ReactNode } from 'react';
import { PUBLIC_ROUTES } from '../../lib/routes';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) return <FullPageSpinner />;
  if (!user) return <Navigate to={PUBLIC_ROUTES.login} replace />;

  return <>{children}</>;
}
