import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

// ─── Terminal sequence ────────────────────────────────────────────────────────

type LineType =
  | 'command'
  | 'spinner'
  | 'success'
  | 'fail'
  | 'fail-detail'
  | 'blank'
  | 'info'
  | 'test-pass'
  | 'test-fail';

interface SequenceStep {
  /** ms to wait BEFORE this step becomes visible */
  delay: number;
  type: LineType;
  text: string;
  /** right-aligned time label for test result lines */
  time?: string;
  /** if true this step replaces the previous spinner line */
  replacesSpinner?: boolean;
}

const SEQUENCE: SequenceStep[] = [
  { delay: 200,  type: 'command',  text: '$ testforge run --suite smoke --device pixel-8-pro-1' },
  { delay: 500,  type: 'spinner',  text: 'Connecting to device PX8P-001-A via ADB...' },
  { delay: 1000, type: 'success',  text: '✓ Device connected (Android 14, fw-5.0.3)', replacesSpinner: true },
  { delay: 300,  type: 'spinner',  text: 'Flashing firmware build-412...' },
  { delay: 2000, type: 'success',  text: '✓ Firmware flashed (34.2s)', replacesSpinner: true },
  { delay: 200,  type: 'blank',    text: '' },
  { delay: 100,  type: 'info',     text: 'Running smoke test suite (48 tests)...' },
  { delay: 200,  type: 'test-pass', text: 'boot_time_under_30s',    time: '1.2s' },
  { delay: 200,  type: 'test-pass', text: 'wifi_connect_wpa3',      time: '3.8s' },
  { delay: 200,  type: 'test-pass', text: 'bluetooth_pair_unpair',  time: '5.1s' },
  { delay: 700,  type: 'test-fail', text: 'suspend_resume_cycle',   time: 'timeout' },
  { delay: 150,  type: 'fail-detail', text: '→ Power state stuck in S3. See crash #CR-0847' },
  { delay: 200,  type: 'test-pass', text: 'camera_capture_hdr',     time: '2.3s' },
  { delay: 200,  type: 'test-pass', text: 'nfc_tap_and_pay',        time: '1.8s' },
  { delay: 200,  type: 'test-pass', text: 'lte_band_attach_b71',    time: '4.2s' },
  { delay: 200,  type: 'test-pass', text: 'gps_cold_fix',           time: '8.7s' },
  { delay: 200,  type: 'blank',    text: '' },
  { delay: 100,  type: 'info',     text: 'Results: 46 passed, 1 failed, 1 skipped (2m 14s)' },
  { delay: 500,  type: 'spinner',  text: 'Generating crash triage report...' },
  { delay: 800,  type: 'success',  text: '✓ Crash auto-triaged: kernel panic in dpm_suspend (critical)', replacesSpinner: true },
  { delay: 120,  type: 'success',  text: '✓ Report sent to #testforge-alerts on Slack' },
  { delay: 120,  type: 'success',  text: '✓ Jira ticket TF-892 created automatically' },
];

const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

const trustLogos = [
  { label: 'EmbedTech Systems',      initials: 'ET' },
  { label: 'Series A IoT Startup',   initials: 'IO' },
  { label: 'Firmware Engineering Co.',initials: 'FE' },
  { label: 'Connected Devices Lab',  initials: 'CD' },
  { label: 'Hardware Startup',       initials: 'HW' },
];

const stats = [
  { value: '6 yrs',  label: 'building test infrastructure' },
  { value: '50+',    label: 'device types supported' },
  { value: '< 15m',  label: 'from crash to root cause' },
  { value: '100%',   label: 'demo mode — try it now' },
];

// ─── Rendered line component ──────────────────────────────────────────────────

interface RenderedLine {
  id: number;
  type: LineType;
  text: string;
  time?: string;
}

function TermLine({ line }: { line: RenderedLine }) {
  const base = 'font-mono text-xs sm:text-[13px] leading-6 whitespace-pre';

  switch (line.type) {
    case 'command':
      return <div className={`${base} text-gray-300`}>{line.text}</div>;

    case 'spinner':
      return <div className={`${base} text-blue-400`}>{line.text}</div>;

    case 'success':
      return <div className={`${base} text-emerald-400`}>{line.text}</div>;

    case 'blank':
      return <div className={`${base}`}>&nbsp;</div>;

    case 'info':
      return <div className={`${base} text-gray-300`}>{line.text}</div>;

    case 'test-pass':
      return (
        <div className={`${base} flex items-center gap-1`}>
          <span className="text-emerald-400 flex-shrink-0">  ✓</span>
          <span className="text-emerald-300 flex-1">{line.text}</span>
          {line.time && <span className="text-gray-600 flex-shrink-0 ml-2">{line.time}</span>}
        </div>
      );

    case 'test-fail':
      return (
        <div className={`${base} flex items-center gap-1`}>
          <span className="text-red-400 flex-shrink-0">  ✗</span>
          <span className="text-red-400 flex-1">{line.text}</span>
          {line.time && <span className="text-red-500/70 flex-shrink-0 ml-2">{line.time}</span>}
        </div>
      );

    case 'fail-detail':
      return <div className={`${base} text-red-400/80 pl-6`}>{line.text}</div>;

    case 'fail':
      return <div className={`${base} text-red-400`}>{line.text}</div>;

    default:
      return <div className={`${base} text-gray-400`}>{line.text}</div>;
  }
}

// ─── Animated terminal ────────────────────────────────────────────────────────

function AnimatedTerminal() {
  const [lines, setLines] = useState<RenderedLine[]>([]);
  const [spinnerText, setSpinnerText] = useState('');
  const [spinnerFrame, setSpinnerFrame] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lineIdRef = useRef(0);

  // Auto-scroll to bottom whenever lines change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines, spinnerText]);

  useEffect(() => {
    let cancelled = false;

    async function runSequence() {
      // Reset
      setLines([]);
      setSpinnerText('');
      setIsSpinning(false);

      let pendingSpinnerText = '';

      for (const step of SEQUENCE) {
        if (cancelled) return;

        await new Promise<void>(resolve => setTimeout(resolve, step.delay));
        if (cancelled) return;

        if (step.type === 'spinner') {
          pendingSpinnerText = step.text;
          setSpinnerText(`${SPINNER_FRAMES[0]} ${step.text}`);
          setIsSpinning(true);
        } else if (step.replacesSpinner) {
          // Remove the spinner line and commit the resolved line
          setIsSpinning(false);
          setSpinnerText('');
          pendingSpinnerText = '';
          const id = ++lineIdRef.current;
          setLines(prev => [...prev, { id, type: step.type, text: step.text, time: step.time }]);
        } else {
          const id = ++lineIdRef.current;
          setLines(prev => [...prev, { id, type: step.type, text: step.text, time: step.time }]);
        }
      }

      // Idle 3 seconds then restart
      if (!cancelled) {
        await new Promise<void>(resolve => setTimeout(resolve, 3000));
        if (!cancelled) runSequence();
      }
    }

    runSequence();
    return () => { cancelled = true; };
  }, []);

  // Spinner animation
  useEffect(() => {
    if (!isSpinning) return;
    const iv = setInterval(() => {
      setSpinnerFrame(f => {
        const next = (f + 1) % SPINNER_FRAMES.length;
        setSpinnerText(prev => {
          // Replace leading spinner char
          const rest = prev.replace(/^[⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏] /, '');
          return `${SPINNER_FRAMES[next]} ${rest}`;
        });
        return next;
      });
    }, 80);
    return () => clearInterval(iv);
  }, [isSpinning]);

  return (
    <div className="glass-card overflow-hidden glow-blue">
      {/* macOS window chrome */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/[0.03]">
        <div className="w-3 h-3 rounded-full bg-red-500/80" />
        <div className="w-3 h-3 rounded-full bg-amber-400/80" />
        <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
        <span className="ml-3 text-xs text-gray-500 font-mono">testforge — smoke suite — pixel-8-pro-1</span>
      </div>

      {/* Terminal body */}
      <div
        ref={scrollRef}
        className="h-80 overflow-y-auto px-5 py-4 space-y-0.5"
        style={{ scrollbarWidth: 'none' }}
      >
        {lines.map(line => (
          <TermLine key={line.id} line={line} />
        ))}

        {/* Active spinner line */}
        {isSpinning && spinnerText && (
          <div className="font-mono text-xs sm:text-[13px] leading-6 text-blue-400">
            {spinnerText}
          </div>
        )}

        {/* Blinking cursor */}
        <div className="font-mono text-xs sm:text-[13px] leading-6 text-gray-500 mt-1">
          <span className="cursor-blink">█</span>
        </div>
      </div>

      {/* Footer bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-white/5 bg-white/[0.03]">
        <span className="text-xs text-gray-600 font-mono">Pixel 8 Pro #1 · fw-5.0.3 · adb</span>
        <span className="text-xs text-gray-600 font-mono">build-412</span>
      </div>
    </div>
  );
}

// ─── Hero section ─────────────────────────────────────────────────────────────

export function Hero() {
  const { enterDemoMode } = useAuth();
  // useNavigate is not needed here — enterDemoMode auto-logins in demo mode
  // and the Link to="/dashboard" will just work

  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-100" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0A0A0F]" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 lg:py-32 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* ── Left: copy ── */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-400 text-xs font-medium mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              Phase 1 — Now Live
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Test infrastructure{' '}
              <span className="text-gradient-blue">that runs itself.</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-400 leading-relaxed mb-10 max-w-lg">
              TestForge automates device testing, crash triage, and quality reporting — so your engineers build products, not test pipelines.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link
                to="/signup"
                className="btn-primary flex items-center justify-center gap-2 text-base py-3 px-8"
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/dashboard"
                onClick={enterDemoMode}
                className="btn-secondary flex items-center justify-center gap-2 text-base py-3 px-8"
              >
                <Play className="w-4 h-4 text-blue-400" />
                See Live Demo
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {stats.map(stat => (
                <div key={stat.label}>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: animated terminal ── */}
          <div className="relative">
            <AnimatedTerminal />

            {/* Floating badge */}
            <div className="absolute -bottom-4 -right-4 glass-card px-3 py-2 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-emerald-400 font-medium font-mono">AI triage complete</span>
            </div>
          </div>
        </div>

        {/* Origin bar */}
        <div className="mt-20 pt-12 border-t border-white/5">
          <p className="text-center text-sm text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Built by engineers who spent 6 years doing test automation at Samsung Semiconductor —
            TestForge is the system we wished existed.
          </p>
        </div>
      </div>
    </section>
  );
}
