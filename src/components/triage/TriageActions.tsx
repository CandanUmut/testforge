import { useState } from 'react';
import type { Crash, CrashStatus } from '../../lib/types';
import { CheckCircle, AlertTriangle, XCircle, Copy, ExternalLink, UserCheck } from 'lucide-react';

interface TriageActionsProps {
  crash: Crash;
  onStatusChange?: (status: CrashStatus) => void;
}

const statusActions: { status: CrashStatus; label: string; icon: typeof CheckCircle; color: string }[] = [
  { status: 'investigating', label: 'Mark Investigating', icon: AlertTriangle, color: 'text-amber-600 bg-amber-50 border-amber-200 hover:bg-amber-100' },
  { status: 'identified', label: 'Mark Identified', icon: CheckCircle, color: 'text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100' },
  { status: 'fixed', label: 'Mark Fixed', icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-100' },
  { status: 'wont_fix', label: "Won't Fix", icon: XCircle, color: 'text-gray-600 bg-gray-50 border-gray-200 hover:bg-gray-100' },
];

export function TriageActions({ crash, onStatusChange }: TriageActionsProps) {
  const [copied, setCopied] = useState(false);

  function copyFingerprint() {
    if (crash.fingerprint) {
      navigator.clipboard.writeText(crash.fingerprint);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Triage Actions</h3>

      {/* Status change */}
      <div className="space-y-2 mb-5">
        {statusActions
          .filter(a => a.status !== crash.status)
          .map(action => {
            const Icon = action.icon;
            return (
              <button
                key={action.status}
                onClick={() => onStatusChange?.(action.status)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${action.color}`}
              >
                <Icon className="w-3.5 h-3.5" />
                {action.label}
              </button>
            );
          })}
      </div>

      {/* Other actions */}
      <div className="border-t border-gray-100 pt-4 space-y-2">
        <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all">
          <UserCheck className="w-3.5 h-3.5" />
          Assign to me
        </button>
        <button
          onClick={copyFingerprint}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all"
        >
          <Copy className="w-3.5 h-3.5" />
          {copied ? 'Copied!' : 'Copy fingerprint'}
        </button>
        <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all">
          <ExternalLink className="w-3.5 h-3.5" />
          Create Jira ticket
          <span className="ml-auto text-[10px] text-amber-600 bg-amber-50 px-1 py-0.5 rounded border border-amber-200">soon</span>
        </button>
      </div>
    </div>
  );
}
