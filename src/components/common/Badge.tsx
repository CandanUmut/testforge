import type { ReactNode } from 'react';
import { STATUS_COLORS, SEVERITY_COLORS } from '../../utils/constants';

interface BadgeProps {
  children: ReactNode;
  variant?: 'status' | 'severity' | 'default' | 'blue' | 'green' | 'purple' | 'gray';
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variantClasses = {
    default: 'text-gray-400 bg-gray-400/10 border-gray-400/20',
    blue: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    green: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    purple: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
    gray: 'text-gray-500 bg-gray-500/10 border-gray-500/20',
    status: '',
    severity: '',
  };

  return (
    <span className={`badge ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const colorClass = STATUS_COLORS[status as keyof typeof STATUS_COLORS] || STATUS_COLORS.pending;
  return (
    <span className={`badge ${colorClass}`}>
      {status === 'running' && (
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      )}
      {status.replace(/_/g, ' ')}
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: string }) {
  const colorClass = SEVERITY_COLORS[severity as keyof typeof SEVERITY_COLORS] || SEVERITY_COLORS.info;
  return (
    <span className={`badge ${colorClass}`}>
      {severity}
    </span>
  );
}

export function PlanBadge({ plan }: { plan: string }) {
  const colors: Record<string, string> = {
    starter: 'text-gray-400 bg-gray-400/10 border-gray-400/20',
    professional: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    enterprise: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  };
  return (
    <span className={`badge ${colors[plan] || colors.starter}`}>
      {plan}
    </span>
  );
}

export function ComingSoonBadge() {
  return (
    <span className="badge text-amber-400 bg-amber-400/10 border-amber-400/20">
      Coming soon
    </span>
  );
}
