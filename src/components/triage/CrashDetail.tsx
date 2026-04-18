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
import { demoCrashes } from '../../lib/demo-data';
import { useDataContext } from '../../contexts/DataContext';

interface CrashDetailProps {
  crash: Crash;
}

// --- AI text highlighting ---

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
            <code className="font-mono text-indigo-700 bg-indigo-50 px-1 rounded text-[0.8em]">
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

// --- Occurrence Timeline ---

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
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Occurrence Timeline</h3>

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
              ? '#e5e7eb'
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
            stroke="#e5e7eb"
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
        <span className="text-gray-700 font-medium">{crash.occurrence_count} total occurrences</span>
      </p>
    </div>
  );
}

// --- Status stepper ---

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
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
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
                      ? 'bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-200'
                      : isPast
                        ? 'bg-gray-400 border-gray-400'
                        : 'bg-transparent border-gray-300'
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
                    isCurrent ? 'text-indigo-600 font-bold' : isPast ? 'text-gray-500' : 'text-gray-400'
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
                      i < currentIndex ? 'bg-gray-400' : 'bg-gray-200'
                    }`}
                  />
                  <ChevronRight
                    className={`w-3 h-3 flex-shrink-0 -mx-0.5 ${
                      i < currentIndex ? 'text-gray-400' : 'text-gray-300'
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

// --- Related crashes ---

function RelatedCrashes({ crash }: { crash: Crash }) {
  const navigate = useNavigate();
  const { getScopedPath } = useDataContext();

  const related = demoCrashes
    .filter(c => c.id !== crash.id)
    .filter(c => c.crash_type === crash.crash_type || c.device_id === crash.device_id)
    .slice(0, 2);

  if (related.length === 0) return null;

  const severityColor: Record<string, string> = {
    critical: 'text-red-600 bg-red-50 border-red-200',
    high: 'text-orange-600 bg-orange-50 border-orange-200',
    medium: 'text-amber-600 bg-amber-50 border-amber-200',
    low: 'text-blue-600 bg-blue-50 border-blue-200',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Similar Crashes</h3>
      <div className="space-y-2">
        {related.map(r => (
          <div
            key={r.id}
            className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-900 font-medium truncate">{r.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`badge text-[10px] py-0 ${severityColor[r.severity] ?? ''}`}>
                  {r.severity}
                </span>
                <span className="text-[10px] text-gray-500">{r.occurrence_count}x occurrences</span>
              </div>
            </div>
            <button
              onClick={() => navigate(getScopedPath('crash-triage'))}
              className="text-[11px] text-indigo-600 hover:text-indigo-700 transition-colors flex-shrink-0 flex items-center gap-0.5"
            >
              View <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Main component ---

export function CrashDetail({ crash }: CrashDetailProps) {
  const [aiHelpful, setAiHelpful] = useState<boolean | null>(null);

  return (
    <div className="h-full overflow-y-auto space-y-4 pr-1">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
          <h2 className="text-base font-semibold text-gray-900 flex-1">{crash.title}</h2>
          <StatusBadge status={crash.status} />
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <SeverityBadge severity={crash.severity} />
          <span className="badge text-gray-500 bg-gray-100 border-gray-200">
            {CRASH_TYPE_LABELS[crash.crash_type] || crash.crash_type}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2 text-gray-500">
            <RefreshCw className="w-3 h-3" />
            <span>{crash.occurrence_count} occurrences</span>
          </div>
          {crash.device && (
            <div className="flex items-center gap-2 text-gray-500">
              <Cpu className="w-3 h-3" />
              <span>{crash.device.name}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-gray-500">
            <Calendar className="w-3 h-3" />
            <span>First: {formatRelativeTime(crash.first_seen_at)}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <Calendar className="w-3 h-3" />
            <span>Last: {formatRelativeTime(crash.last_seen_at)}</span>
          </div>
          {crash.fingerprint && (
            <div className="flex items-center gap-2 text-gray-500 col-span-2">
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
        <div className="bg-white rounded-xl border border-indigo-200 shadow-sm p-5">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center">
                <Brain className="w-3.5 h-3.5 text-indigo-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">AI Root Cause Analysis</h3>
              <span className="flex items-center gap-1 badge text-indigo-600 bg-indigo-50 border-indigo-200 text-[10px]">
                <Sparkles className="w-2.5 h-2.5" />
                AI Analysis
              </span>
            </div>
            <span className="badge text-[10px] text-emerald-600 bg-emerald-50 border-emerald-200">
              Confidence: High
            </span>
          </div>

          <p className="text-sm text-gray-700 leading-relaxed">
            <TechnicalText text={crash.ai_analysis} />
          </p>

          {/* Helpful feedback row */}
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-3">
            <span className="text-[11px] text-gray-500">Was this helpful?</span>
            <button
              onClick={() => setAiHelpful(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all ${
                aiHelpful === true
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                  : 'bg-white border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <ThumbsUp className="w-3 h-3" />
              Helpful
            </button>
            <button
              onClick={() => setAiHelpful(false)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all ${
                aiHelpful === false
                  ? 'bg-red-50 border-red-200 text-red-600'
                  : 'bg-white border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50'
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
        <div className="bg-white rounded-xl border border-emerald-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center">
              <Lightbulb className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">Suggested Fix</h3>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            <TechnicalText text={crash.ai_suggested_fix} />
          </p>
        </div>
      )}

      {/* Stack Trace */}
      {crash.stack_trace && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">Stack Trace</h3>
          </div>
          <div className="bg-gray-50 border border-gray-200 p-5 overflow-x-auto m-4 rounded-lg">
            <pre className="font-mono text-xs text-gray-700 whitespace-pre leading-relaxed">
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
