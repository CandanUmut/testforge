import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const terminalLines = [
  { type: 'pass', text: 'power_state_suspend_resume', time: '1.2s' },
  { type: 'fail', text: 'ble_connection_stability', time: 'timeout' },
  { type: 'pass', text: 'firmware_flash_verify', time: '3.4s' },
  { type: 'pass', text: 'lte_band_qualification_b12', time: '0.8s' },
  { type: 'pass', text: 'usb_host_enumeration', time: '0.4s' },
  { type: 'fail', text: 'deep_sleep_wake_source_validation', time: '15.0s' },
  { type: 'pass', text: 'ota_update_download_verify', time: '8.1s' },
  { type: 'pass', text: 'watchdog_reset_recovery', time: '2.3s' },
  { type: 'pass', text: 'adb_connection_stress', time: '5.6s' },
  { type: 'fail', text: 'concurrent_bt_wifi_scan', time: 'oom' },
  { type: 'pass', text: 'uart_loopback_stress', time: '1.8s' },
  { type: 'pass', text: 'gpio_interrupt_latency', time: '0.1s' },
  { type: 'pass', text: 'i2c_sensor_scan_all', time: '0.7s' },
  { type: 'fail', text: 'modem_pdn_context_restore', time: 'assert' },
  { type: 'pass', text: 'boot_time_measurement', time: '4.2s' },
  { type: 'pass', text: 'thermal_throttle_detection', time: '12.0s' },
];

const trustLogos = [
  { label: 'EmbedTech Systems', initials: 'ET' },
  { label: 'Series A IoT Startup', initials: 'IO' },
  { label: 'Firmware Engineering Co.', initials: 'FE' },
  { label: 'Connected Devices Lab', initials: 'CD' },
  { label: 'Hardware Startup', initials: 'HW' },
];

function TerminalLine({ type, text, time }: { type: string; text: string; time: string }) {
  if (type === 'pass') {
    return (
      <div className="flex items-center gap-2 py-0.5 font-mono text-xs sm:text-sm">
        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
        <span className="text-emerald-400 font-medium w-14">[PASS]</span>
        <span className="text-gray-300 flex-1 truncate">{text}</span>
        <span className="text-gray-600 flex-shrink-0">{time}</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 py-0.5 font-mono text-xs sm:text-sm">
      <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
      <span className="text-red-400 font-medium w-14">[FAIL]</span>
      <span className="text-gray-300 flex-1 truncate">{text}</span>
      <span className="text-red-400/70 flex-shrink-0">{time}</span>
    </div>
  );
}

export function Hero() {
  const { enterDemoMode } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let frame: number;
    let pos = 0;

    function step() {
      pos += 0.4;
      const half = el!.scrollHeight / 2;
      if (pos >= half) pos = 0;
      el!.scrollTop = pos;
      frame = requestAnimationFrame(step);
    }
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-100" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0A0A0F]" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 lg:py-32 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: copy */}
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
              <Link to="/signup" className="btn-primary flex items-center justify-center gap-2 text-base py-3 px-8">
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
            <div className="grid grid-cols-3 gap-6">
              {[
                { value: '6 yrs', label: 'Test automation experience' },
                { value: '50+', label: 'Device types supported' },
                { value: '99.9%', label: 'Uptime guarantee' },
              ].map(stat => (
                <div key={stat.label}>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: terminal */}
          <div className="relative">
            <div className="glass-card overflow-hidden glow-blue">
              {/* Terminal header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/3">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-amber-500/70" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
                <span className="ml-2 text-xs text-gray-500 font-mono">testforge — Full Regression — build-412</span>
              </div>

              {/* Status bar */}
              <div className="flex items-center justify-between px-4 py-2 bg-blue-500/5 border-b border-blue-500/10">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-xs font-mono text-blue-400">Running... 12 devices</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="text-emerald-400">12 pass</span>
                  <span className="text-red-400">3 fail</span>
                  <span className="text-gray-500">0 skip</span>
                </div>
              </div>

              {/* Scrolling test output */}
              <div
                ref={scrollRef}
                className="h-72 overflow-hidden px-4 py-3"
                style={{ scrollbarWidth: 'none' }}
              >
                {/* Doubled for seamless loop */}
                {[...terminalLines, ...terminalLines].map((line, i) => (
                  <TerminalLine key={i} {...line} />
                ))}
              </div>

              {/* Bottom stats */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-white/5 bg-white/3">
                <span className="text-xs text-gray-500 font-mono">
                  Pixel 8 Pro #1 · fw-5.0.3 · adb
                </span>
                <span className="text-xs font-mono text-gray-500">
                  Duration: 14m 32s
                </span>
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -bottom-4 -right-4 glass-card px-3 py-2 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-emerald-400 font-medium font-mono">AI triage complete</span>
            </div>
          </div>
        </div>

        {/* Trust bar */}
        <div className="mt-20 pt-12 border-t border-white/5">
          <p className="text-center text-xs text-gray-600 uppercase tracking-widest mb-8">
            Trusted by hardware teams shipping real products
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {trustLogos.map(logo => (
              <div
                key={logo.label}
                className="flex items-center gap-2.5 opacity-30 hover:opacity-50 transition-opacity"
              >
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-xs font-bold text-white">
                  {logo.initials}
                </div>
                <span className="text-sm text-gray-400 hidden sm:block">{logo.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
