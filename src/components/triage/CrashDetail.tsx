import type { Crash } from '../../lib/types';
import { SeverityBadge, StatusBadge } from '../common/Badge';
import { formatDateTime, formatRelativeTime } from '../../utils/formatters';
import { CRASH_TYPE_LABELS } from '../../utils/constants';
import { Brain, Lightbulb, Cpu, Calendar, RefreshCw, Fingerprint } from 'lucide-react';

interface CrashDetailProps {
  crash: Crash;
}

export function CrashDetail({ crash }: CrashDetailProps) {
  return (
    <div className="h-full overflow-y-auto space-y-4 pr-1">
      {/* Header */}
      <div className="glass-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
          <h2 className="text-base font-semibold text-white flex-1">{crash.title}</h2>
          <StatusBadge status={crash.status} />
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <SeverityBadge severity={crash.severity} />
          <span className="badge text-gray-400 bg-gray-400/10 border-gray-400/20">
            {CRASH_TYPE_LABELS[crash.crash_type] || crash.crash_type}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2 text-gray-400">
            <RefreshCw className="w-3 h-3" />
            <span>{crash.occurrence_count} occurrences</span>
          </div>
          {crash.device && (
            <div className="flex items-center gap-2 text-gray-400">
              <Cpu className="w-3 h-3" />
              <span>{crash.device.name}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-gray-400">
            <Calendar className="w-3 h-3" />
            <span>First: {formatRelativeTime(crash.first_seen_at)}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <Calendar className="w-3 h-3" />
            <span>Last: {formatRelativeTime(crash.last_seen_at)}</span>
          </div>
          {crash.fingerprint && (
            <div className="flex items-center gap-2 text-gray-400 col-span-2">
              <Fingerprint className="w-3 h-3" />
              <span className="font-mono">{crash.fingerprint}</span>
            </div>
          )}
        </div>
      </div>

      {/* AI Analysis */}
      {crash.ai_analysis && (
        <div className="glass-card p-5 border-purple-500/20">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <Brain className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <h3 className="text-sm font-semibold text-white">AI Root Cause Analysis</h3>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">{crash.ai_analysis}</p>
        </div>
      )}

      {/* Suggested Fix */}
      {crash.ai_suggested_fix && (
        <div className="glass-card p-5 border-emerald-500/20">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Lightbulb className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <h3 className="text-sm font-semibold text-white">Suggested Fix</h3>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">{crash.ai_suggested_fix}</p>
        </div>
      )}

      {/* Stack Trace */}
      {crash.stack_trace && (
        <div className="glass-card overflow-hidden">
          <div className="px-5 py-3 border-b border-white/5">
            <h3 className="text-sm font-semibold text-white">Stack Trace</h3>
          </div>
          <div className="bg-[#060609] p-5 overflow-x-auto">
            <pre className="font-mono text-xs text-gray-300 whitespace-pre leading-relaxed">
              {crash.stack_trace}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
