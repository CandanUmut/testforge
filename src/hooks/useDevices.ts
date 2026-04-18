import { useMemo } from 'react';
import { useDataContext } from '../contexts/DataContext';
import type { DeviceStatus } from '../lib/types';

interface UseDevicesOptions {
  status?: DeviceStatus;
  search?: string;
}

export function useDevices(options: UseDevicesOptions = {}) {
  const { devices, dataLoading } = useDataContext();

  const filtered = useMemo(() => {
    let result = [...devices];
    if (options.status) {
      result = result.filter(d => d.status === options.status);
    }
    if (options.search) {
      const q = options.search.toLowerCase();
      result = result.filter(d =>
        d.name.toLowerCase().includes(q) ||
        d.serial_number?.toLowerCase().includes(q) ||
        d.device_type.toLowerCase().includes(q)
      );
    }
    return result;
  }, [devices, options.status, options.search]);

  return { devices: filtered, loading: dataLoading };
}
