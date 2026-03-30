import { DEVICE_STATUS_COLORS } from '../../utils/constants';
import type { DeviceStatus } from '../../lib/types';

interface StatusDotProps {
  status: DeviceStatus;
  size?: 'sm' | 'md';
}

export function StatusDot({ status, size = 'md' }: StatusDotProps) {
  const color = DEVICE_STATUS_COLORS[status];
  const sizeClass = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2';
  const pulsing = status === 'online' || status === 'testing';

  return (
    <span className="relative inline-flex">
      {pulsing && (
        <span className={`${sizeClass} rounded-full ${color.replace('text-', 'bg-')} opacity-30 absolute ping-ring`} />
      )}
      <span className={`${sizeClass} rounded-full ${color.replace('text-', 'bg-')}`} />
    </span>
  );
}
