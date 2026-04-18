import type { ReactNode } from 'react';
import { STATUS_COLORS, SEVERITY_COLORS } from '../../utils/constants';

interface BadgeProps {
  children: ReactNode;
  variant?: 'status' | 'severity' | 'default' | 'blue' | 'green' | 'indigo' | 'gray';
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variantClasses = {
    default: 'text-gray-600 bg-gray-100 border-gray-200',
    blue: 'text-blue-600 bg-blue-50 border-blue-200',
    green: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    indigo: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    gray: 'text-gray-500 bg-gray-100 border-gray-200',
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
    starter: 'text-gray-600 bg-gray-100 border-gray-200',
    professional: 'text-blue-600 bg-blue-50 border-blue-200',
    enterprise: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  };
  return (
    <span className={`badge ${colors[plan] || colors.starter}`}>
      {plan}
    </span>
  );
}

export function ComingSoonBadge() {
  return (
    <span className="badge text-amber-600 bg-amber-50 border-amber-200">
      Coming soon
    </span>
  );
}
