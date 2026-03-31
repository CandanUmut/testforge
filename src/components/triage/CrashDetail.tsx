import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Crash } from '../../lib/types';
import { SeverityBadge, StatusBadge } from '../common/Badge';
import { formatRelativeTime } from '../../utils/formatters';
import { CRASH_TYPE_LABELS } from '../../utils/constants';
import {
  Brain, Lightbulb, Cpu, Calendar, RefreshCw, Fingerprint,
  Sparkles, ThumbsUp, ThumbsDown, ChevronRight,
} from 'lucide-react';
import { demoCrashes } from '../../utils/seedData';

interface CrashDetailProps {
  crash: Crash;
}

// ─── AI text highlighting ─────────────────────────────────────────────────────

function tokenizeTechnicalText(text: string): { part: string; isCode: boolean }[] {
  const words = text.split(' ');
  return words.map(word => {
    const stripped = word.replace(/[.,;:!?()[\]"']/g, '');
    const isCode =
      stripped.includes('/') ||
      stripped.includes('::') ||
      stripped.includes('+') ||
      stripped.includes('->') ||
      (stripped.startsWith('0x') && stripped.length > 3);
    return { part: word, isCode };
  });
}

function TechnicalText({ text }: { text: string }) {
  const tokens = tokenizeTechnicalText(text);
  return (
    <>
      {tokens.map((token, i) => (
        <span key={i}>
          {token.isCode ? (
            <code className="font-mono text-purple-300 bg-purple-400/10 px-1 rounded text-[0.8em]">
              {token.part}
            </code>
          ) : (
            token.part
          )}{' '}
        </span>
      ))}
    </>
  );
}

// ─── Occurrence Timeline ──────────────────────────────────────────────────────

function OccurrenceTimeline({ crash }: { crash: Crash }) {
  const NUM_DAYS = 14;

  const firstMs = new Date(crash.first_seen_at).getTime();
  const lastMs = new Date(crash.last_seen_at).getTime();
  const nowMs = Date.now();

  const buckets: number[] = Array(NUM_DAYS).fill(0);

  const daySpan = Math.max((lastMs - firstMs) / 86400000, 0.5);
  const totalOcc = crash.occurrence_count;

  const seed = crash.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);

  for (let i = 0; i < totalOcc; i++) {
    const rand = ((seed * (i + 1) * 2654435761) >>> 0) / 4294967296;
    const occDayOffset = rand * daySpan;
    const occMs = firstMs + occDayOffset * 86400000;
    const daysFromNow = (nowMs - occMs) / 86400000;
    const bucket = NUM_DAYS - 1 - Math.floor(daysFromNow);
    if (bucket >= 0 && bucket < NUM_DAYS) {
      buckets[bucket]++;
    }
  }

  const maxCount = Math.max(...buckets, 1);

  const dayLabels: string[] = buckets.map((_, i) => {
    const d = new Date(nowMs - (NUM_DAYS - 1 - i) * 86400000);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  const barHeight = 40;

  return (
    <div className="glass-card p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Occurrence Timeline</h3>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${NUM_DAYS * 20} ${barHeight + 16}`}
          className="w-full"
          style={{ minWidth: '280px' }}
          aria-label="Occurrence timeline bar chart"
        >
          {buckets.map((count, i) => {
            const barH = count === 0 ? 2 : Math.max(3, Math.round((count / maxCount) * barHeight));
            const x = i * 20 + 2;
            const y = barHeight - barH;
            const color = count === 0
              ? '#1f2937'
              : count >= maxCount * 0.7
                ? '#ef4444'
                : '#f59e0b';

            return (
              <g key={i}>
                <rect
                  x={x}
                  y={y}
                  width={16}
                  height={barH}
                  rx={2}
                  fill={color}
                  opacity={count === 0 ? 0.3 : 0.85}
                >
                  <title>{`${dayLabels[i]}: ${count} occurrence${count !== 1 ? 's' : ''}`}</title>
                </rect>
              </g>
            );
          })}
          <line
            x1={0}
            y1={barHeight + 1}
            x2={NUM_DAYS * 20}
            y2={barHeight + 1}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={1}
          />
          <text x={2} y={barHeight + 12} fill="#6b7280" fontSize={7}>{dayLabels[0]}</text>
          <text x={NUM_DAYS * 20 - 2} y={barHeight + 12} fill="#6b7280" fontSize={7} textAnchor="end">
            {dayLabels[NUM_DAYS - 1]}
          </text>
        </svg>
      </div>

      <p className="text-[11px] text-gray-500 mt-2">
        First seen {formatRelativeTime(crash.first_seen_at)}
        {' · '}
        Last seen {formatRelativeTime(crash.last_seen_at)}
        {' · '}
        <span className="text-gray-400 font-medium">{crash.occurrence_count} total occurrences</span>
      </p>
    </div>
  );
}

// ─── Status stepper ───────────────────────────────────────────────────────────

const WORKFLOW_STEPS = [
  { key: 'new', label: 'New' },
  { key: 'investigating', label: 'Investigating' },
  { key: 'identified', label: 'Identified' },
  { key: 'fixed', label: 'Fixed' },
] as const;

type WorkflowStep = (typeof WORKFLOW_STEPS)[number]['key'];

function StatusStepper({ status }: { status: string }) {
  const validStatuses: WorkflowStep[] = ['new', 'investigating', 'identified', 'fixed'];
  const effectiveStatus: WorkflowStep = validStatuses.includes(status as WorkflowStep)
    ? (status as WorkflowStep)
    : 'new';

  const currentIndex = WORKFLOW_STEPS.findIndex(s => s.key === effectiveStatus);

  return (
    <div className="glass-card p-5">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
        Status Workflow
      </h3>
      <div className="flex items-center gap-0">
        {WORKFLOW_STEPS.map((step, i) => {
          const isPast = i < currentIndex;
          const isCurrent = i === currentIndex;

          return (
            <div key={step.key} className="flex items-center flex-1 min-w-0">
              {/* Step node */}
              <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                <div
                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                    isCurrent
                      ? 'bg-blue-500 border-blue-500 shadow-lg shadow-blue-500/30'
                      : isPast
                        ? 'bg-gray-600 border-gray-600'
                        : 'bg-transparent border-gray-700'
                  }`}
                >
                  {isPast && (
                    <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  {isCurrent && (
                    <div className="w-2.5 h-2.5 rounded-full bg-white" />
                  )}
                </div>
                <span
                  className={`text-[10px] font-medium whitespace-nowrap ${
                    isCurrent ? 'text-blue-400 font-bold' : isPast ? 'text-gray-500' : 'text-gray-700'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector arrow */}
              {i < WORKFLOW_STEPS.length - 1 && (
                <div className="flex-1 flex items-center mx-1 mb-5">
                  <div
                    className={`h-px flex-1 ${
                      i < currentIndex ? 'bg-gray-600' : 'bg-gray-800'
                    }`}
                  />
                  <ChevronRight
                    className={`w-3 h-3 flex-shrink-0 -mx-0.5 ${
                      i < currentIndex ? 'text-gray-600' : 'text-gray-800'
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Related crashes ──────────────────────────────────────────────────────────

function RelatedCrashes({ crash }: { crash: Crash }) {
  const navigate = useNavigate();

  const related = demoCrashes
    .filter(c => c.id !== crash.id)
    .filter(c => c.crash_type === crash.crash_type || c.device_id === crash.device_id)
    .slice(0, 2);

  if (related.length === 0) return null;

  const severityColor: Record<string, string> = {
    critical: 'text-red-400 bg-red-400/10 border-red-400/20',
    high: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    medium: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    low: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  };

  return (
    <div className="glass-card p-5">
      <h3 className="text-sm font-semibold text-white mb-3">Similar Crashes</h3>
      <div className="space-y-2">
        {related.map(r => (
          <div
            key={r.id}
            className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-colors"
          >
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white font-medium truncate">{r.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`badge text-[10px] py-0 ${severityColor[r.severity] ?? ''}`}>
                  {r.severity}
                </span>
                <span className="text-[10px] text-gray-500">{r.occurrence_count}x occurrences</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/crash-triage')}
              className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors flex-shrink-0 flex items-center gap-0.5"
            >
              View <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function CrashDetail({ crash }: CrashDetailProps) {
  const [aiHelpful, setAiHelpful] = useState<boolean | null>(null);

  const confidenceColor = 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';

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

      {/* Status Workflow Stepper */}
      <StatusStepper status={crash.status} />

      {/* Occurrence Timeline */}
      <OccurrenceTimeline crash={crash} />

      {/* AI Analysis */}
      {crash.ai_analysis && (
        <div className="glass-card p-5 border-purple-500/20">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <Brain className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <h3 className="text-sm font-semibold text-white">AI Root Cause Analysis</h3>
              <span className="flex items-center gap-1 badge text-purple-300 bg-purple-400/10 border-purple-400/20 text-[10px]">
                <Sparkles className="w-2.5 h-2.5" />
                AI Analysis
              </span>
            </div>
            <span className={`badge text-[10px] ${confidenceColor}`}>
              Confidence: High
            </span>
          </div>

          <p className="text-sm text-gray-300 leading-relaxed">
            <TechnicalText text={crash.ai_analysis} />
          </p>

          {/* Helpful feedback row */}
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-3">
            <span className="text-[11px] text-gray-500">Was this helpful?</span>
            <button
              onClick={() => setAiHelpful(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all ${
                aiHelpful === true
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              <ThumbsUp className="w-3 h-3" />
              Helpful
            </button>
            <button
              onClick={() => setAiHelpful(false)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all ${
                aiHelpful === false
                  ? 'bg-red-500/20 border-red-500/40 text-red-400'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              <ThumbsDown className="w-3 h-3" />
              Not helpful
            </button>
            {aiHelpful !== null && (
              <span className="text-[11px] text-gray-500 ml-1">
                {aiHelpful ? 'Thanks for the feedback!' : "We'll improve this."}
              </span>
            )}
          </div>
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
          <p className="text-sm text-gray-300 leading-relaxed">
            <TechnicalText text={crash.ai_suggested_fix} />
          </p>
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

      {/* Related Crashes */}
      <RelatedCrashes crash={crash} />
    </div>
  );
}
