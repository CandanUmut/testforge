import { useAuth } from '../contexts/AuthContext';

export function useOrganization() {
  const { organization, profile, loading } = useAuth();
  return { organization, profile, loading };
}
