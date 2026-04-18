import { useDataContext } from '../contexts/DataContext';

export function useOrganization() {
  const { organization, profile, dataLoading } = useDataContext();

  return {
    organization,
    profile,
    loading: dataLoading,
  };
}
