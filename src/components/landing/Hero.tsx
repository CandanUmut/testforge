import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';
import { PUBLIC_ROUTES, getAppPath } from '../../lib/routes';

interface TerminalLine {
  text: string;
  tone: 'default' | 'success' | 'error' | 'info' | 'warning';
}

const scenarios: { title: string; lines: TerminalLine[] }[] = [
  {
    title: 'Nightly Validation',
    lines: [
      { text: '[02:00:01] TestForge Agent v2.1.0 connected', tone: 'default' },
      { text: '[02:00:01] Scanning lab network...', tone: 'info' },
      { text: '[02:00:02] \u25cf 44 devices online  \u25cf 3 offline  \u25cf 2 maintenance', tone: 'default' },
      { text: '[02:00:03] Starting nightly firmware validation suite', tone: 'info' },
      { text: '[02:00:04] \u25b8 Flashing build-512 \u2192 DUT-A001 [\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2591\u2591] done (38s)', tone: 'default' },
      { text: '[02:00:04] \u25b8 Flashing build-512 \u2192 DUT-A002 [\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2591\u2591] done (41s)', tone: 'default' },
      { text: '[02:00:05] \u25b8 Waiting for boot... DUT-A001 ready (12s) \u00b7 DUT-A002 ready (15s)', tone: 'default' },
      { text: '[02:00:06] Running post-flash-smoke on 44 devices...', tone: 'info' },
      { text: '[02:00:09] \u25cf DUT-A001: 24/24 passed (1m 12s)', tone: 'success' },
      { text: '[02:00:10] \u25cf DUT-A002: 23/24 passed, 1 failed (1m 18s)', tone: 'error' },
      { text: '[02:00:10]   \u2514\u2500 FAIL: suspend_resume \u2014 KernelPanic at power.c:847', tone: 'error' },
      { text: '[02:00:11] \u26a1 Crash auto-triaged \u2192 ticket FWVAL-1892 created', tone: 'warning' },
      { text: '[02:00:12] \u25b8 43/44 devices passed \u00b7 Report sent to #firmware channel', tone: 'success' },
    ],
  },
  {
    title: 'Device Health Check',
    lines: [
      { text: '[08:15:00] Running device health check...', tone: 'info' },
      { text: '[08:15:01] \u25cf DUT-A001  online   battery: 92%  fw: v3.2.1', tone: 'success' },
      { text: '[08:15:01] \u25cf DUT-A008  offline  last seen: 6h ago \u2014 alert created', tone: 'error' },
      { text: '[08:15:02] \u25cf MDM-003   testing  signal: -85dBm  band: B12', tone: 'info' },
      { text: '[08:15:02] \u25cf BLE-004   online   fw: v3.1.3  RSSI: -62dBm', tone: 'success' },
      { text: '[08:15:03] \u25cf DUT-B006  low battery (8%) \u2014 charging recommended', tone: 'warning' },
      { text: '[08:15:03] \u25b8 3 devices need attention \u00b7 2 alerts created', tone: 'warning' },
      { text: '[08:15:04] \u25b8 Heartbeat summary: 44/47 healthy', tone: 'success' },
      { text: '[08:15:04] Weekly report queued for Monday 06:00 UTC', tone: 'default' },
    ],
  },
  {
    title: 'Regression Detection',
    lines: [
      { text: '[14:30:00] CI webhook received \u2014 branch: release/3.2.1 build-518', tone: 'default' },
      { text: '[14:30:01] Deploying to regression fleet (12 devices)...', tone: 'info' },
      { text: '[14:30:15] Running full-regression suite...', tone: 'info' },
      { text: '[14:30:45] \u25cf Pass rate: 78% (previously 94%)', tone: 'error' },
      { text: '[14:30:45]   \u2514\u2500 16% drop detected \u2014 investigating...', tone: 'error' },
      { text: '[14:30:46] \u25cf 3 new failures in suspend_resume_stress', tone: 'error' },
      { text: '[14:30:46] \u25cf 2 new failures in connectivity_sweep', tone: 'error' },
      { text: '[14:30:47] \u26a1 Regression alert \u2192 #firmware-validation', tone: 'warning' },
      { text: '[14:30:47] \u26a1 2 tickets created: FWVAL-1901, FWVAL-1902', tone: 'warning' },
      { text: '[14:30:48] \u25b8 Bisect suggestion: regression between build-515 and build-518', tone: 'info' },
    ],
  },
];

const toneClasses: Record<TerminalLine['tone'], string> = {
  default: 'text-gray-700',
  success: 'text-emerald-600',
  error: 'text-red-500',
  info: 'text-blue-600',
  warning: 'text-amber-500',
};

function AnimatedTerminal() {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(0);
  const [fading, setFading] = useState(false);
  const timerRef = useRef<number | null>(null);
  const scenario = scenarios[scenarioIndex];

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    // Reset for new scenario
    setVisibleCount(0);
    setFading(false);

    let step = 0;
    const totalLines = scenarios[scenarioIndex].lines.length;

    function tick() {
      step++;
      if (step <= totalLines) {
        setVisibleCount(step);
        // Vary the delay slightly for realism
        const delay = 600 + Math.random() * 200;
        timerRef.current = window.setTimeout(tick, delay);
      } else {
        // All lines shown — pause, then fade out and advance
        timerRef.current = window.setTimeout(() => {
          setFading(true);
          timerRef.current = window.setTimeout(() => {
            setScenarioIndex(i => (i + 1) % scenarios.length);
          }, 600); // fade-out duration
        }, 3000); // pause before fade
      }
    }

    // Start first line after a short delay
    timerRef.current = window.setTimeout(tick, 400);

    return clearTimer;
  }, [scenarioIndex, clearTimer]);

  return (
    <div
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
      style={{ borderRadius: 16, boxShadow: '0 24px 64px rgba(15,23,42,0.10), 0 2px 8px rgba(15,23,42,0.04)' }}
    >
      {/* Title bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
        <div className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <div className="h-3 w-3 rounded-full bg-[#febc2e]" />
        <div className="h-3 w-3 rounded-full bg-[#28c840]" />
        <span className="ml-3 font-mono text-[11px] text-slate-400">testforge-agent — lab-server-01</span>
      </div>

      {/* Terminal body */}
      <div
        className="relative bg-[#f8fafc] px-5 py-4 transition-opacity duration-500"
        style={{ minHeight: 340, opacity: fading ? 0 : 1 }}
      >
        {scenario.lines.map((line, i) => {
          const isVisible = i < visibleCount;
          const isLast = i === visibleCount - 1;
          return (
            <div
              key={`${scenarioIndex}-${i}`}
              className={`font-mono text-[13px] leading-7 ${toneClasses[line.tone]}`}
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(4px)',
                transition: 'opacity 200ms ease-out, transform 200ms ease-out',
              }}
            >
              {line.text}
              {isVisible && isLast && (
                <span className="cursor-blink ml-1 text-slate-400">_</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom status bar */}
      <div className="flex items-center justify-between border-t border-slate-200 bg-white px-5 py-3 font-mono text-[11px] text-slate-400">
        <span>47 devices</span>
        <span>89% pass rate</span>
        <span>4 open crashes</span>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-28 sm:px-6 lg:px-8">
      <div className="absolute inset-x-0 top-0 -z-10 h-[640px] bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.12),_transparent_38%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.08),_transparent_30%)]" />
      <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-600">
            Built for hardware, firmware, and software test teams
          </p>
          <h1 className="mt-8 text-5xl font-semibold tracking-[-0.06em] text-slate-950 sm:text-6xl lg:text-7xl">
            Ship faster.
            <br />
            Test smarter.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
            In the AI era, code ships faster than teams can test it. TestForge gives hardware,
            firmware, and software teams one platform for device management, test orchestration,
            crash triage, and real-time visibility so quality keeps pace with velocity.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              to={getAppPath('demo')}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-4 text-sm font-medium text-white transition hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98]"
            >
              See Live Demo
              <Play className="h-4 w-4" />
            </Link>
            <Link
              to={PUBLIC_ROUTES.signup}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-6 py-4 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
            >
              Start Free Trial
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <p className="mt-5 text-sm text-slate-500">
            No credit card required · 14-day free trial · Setup in 5 minutes
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Device health', value: '47 tracked devices' },
              { label: 'Crash visibility', value: '23 open crashes' },
              { label: 'Historical context', value: '90 days of runs' },
            ].map(item => (
              <div key={item.label} className="rounded-3xl border border-slate-200 bg-white/80 px-5 py-4 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{item.label}</p>
                <p className="mt-2 text-base font-semibold tracking-[-0.02em] text-slate-950">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-10 top-10 hidden h-28 w-28 rounded-full bg-emerald-100 blur-3xl lg:block" />
          <div className="absolute -right-6 bottom-12 hidden h-24 w-24 rounded-full bg-blue-100 blur-3xl lg:block" />
          <AnimatedTerminal />
          <div className="absolute -bottom-6 left-8 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Auto-triage</p>
            <p className="mt-1 text-sm font-medium text-slate-950">KernelPanic at power.c:847 — seen 3 times</p>
          </div>
        </div>
      </div>
    </section>
  );
}
