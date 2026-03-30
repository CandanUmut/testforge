import { useState } from 'react';
import type { Crash, CrashStatus } from '../../lib/types';
import { CheckCircle, AlertTriangle, XCircle, Copy, ExternalLink, UserCheck } from 'lucide-react';

interface TriageActionsProps {
  crash: Crash;
  onStatusChange?: (status: CrashStatus) => void;
}

const statusActions: { status: CrashStatus; label: string; icon: typeof CheckCircle; color: string }[] = [
  { status: 'investigating', label: 'Mark Investigating', icon: AlertTriangle, color: 'text-amber-400 bg-amber-400/10 border-amber-400/20 hover:bg-amber-400/20' },
  { status: 'identified', label: 'Mark Identified', icon: CheckCircle, color: 'text-blue-400 bg-blue-400/10 border-blue-400/20 hover:bg-blue-400/20' },
  { status: 'fixed', label: 'Mark Fixed', icon: CheckCircle, color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20 hover:bg-emerald-400/20' },
  { status: 'wont_fix', label: "Won't Fix", icon: XCircle, color: 'text-gray-400 bg-gray-400/10 border-gray-400/20 hover:bg-gray-400/20' },
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
    <div className="glass-card p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Triage Actions</h3>

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
      <div className="border-t border-white/5 pt-4 space-y-2">
        <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all">
          <UserCheck className="w-3.5 h-3.5" />
          Assign to me
        </button>
        <button
          onClick={copyFingerprint}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <Copy className="w-3.5 h-3.5" />
          {copied ? 'Copied!' : 'Copy fingerprint'}
        </button>
        <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all">
          <ExternalLink className="w-3.5 h-3.5" />
          Create Jira ticket
          <span className="ml-auto text-[10px] text-amber-400 bg-amber-400/10 px-1 py-0.5 rounded">soon</span>
        </button>
      </div>
    </div>
  );
}
