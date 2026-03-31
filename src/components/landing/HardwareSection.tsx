import { HardDrive, BatteryCharging, GitBranch } from 'lucide-react';

// ─── YAML / terminal code snippets ───────────────────────────────────────────

const firmwareYaml = `# testforge.yml
pipeline:
  - flash:
      method: fastboot
      image: builds/latest/boot.img
      timeout: 120s
  - boot_verify:
      wait_for: "sys.boot_completed=1"
      timeout: 60s
  - run_suite:
      name: post-flash-smoke
      parallel: true
      devices: ["PX8P-*"]
  - report:
      channels: [slack, jira]
      on_failure: create_ticket`;

const powerStateTerminal = [
  { text: 'Running power state suite (12 tests)...', type: 'info' },
  { text: '  ✓ suspend_s3_entry_exit',      time: '4.2s',   type: 'pass' },
  { text: '  ✓ deep_sleep_wakeup_rtc',      time: '8.1s',   type: 'pass' },
  { text: '  ✓ wake_source_gpio_irq',       time: '1.4s',   type: 'pass' },
  { text: '  ✗ suspend_resume_cycle_x100',  time: 'timeout', type: 'fail' },
  { text: '    → dpm_suspend hung after 94 cycles', type: 'detail' },
  { text: '  ✓ idle_power_draw_ua',         time: '2.3s',   type: 'pass' },
  { text: '  ✓ battery_gauge_accuracy',     time: '3.7s',   type: 'pass' },
  { text: '', type: 'blank' },
  { text: 'Results: 11 passed, 1 failed', type: 'summary' },
];

const orchTerminal = [
  { text: '$ testforge run --suite regression --all', type: 'cmd' },
  { text: '⠋ Allocating 8 available devices...', type: 'spin' },
  { text: '✓ Fleet ready: 8/8 devices online', type: 'ok' },
  { text: '', type: 'blank' },
  { text: '[PX8P-001] ✓ boot_time_under_30s    1.2s', type: 'pass' },
  { text: '[PX8P-002] ✓ boot_time_under_30s    1.4s', type: 'pass' },
  { text: '[SM-S24-1] ✓ boot_time_under_30s    1.1s', type: 'pass' },
  { text: '[PX8P-003] ✓ wifi_connect_wpa3      3.8s', type: 'pass' },
  { text: '[SM-S24-2] ✗ wifi_connect_wpa3   timeout', type: 'fail' },
  { text: '[PX8P-001] ✓ bluetooth_pair_unpair  5.1s', type: 'pass' },
  { text: '', type: 'blank' },
  { text: '8 devices · 240 tests · 3m 12s total', type: 'summary' },
];

// ─── Code block renderers ─────────────────────────────────────────────────────

function YamlBlock({ code }: { code: string }) {
  return (
    <pre className="mt-4 p-4 rounded-lg bg-black/40 border border-white/5 overflow-x-auto text-[11px] sm:text-xs font-mono leading-5 text-gray-400 whitespace-pre">
      {code.split('\n').map((line, i) => {
        const trimmed = line.trimStart();
        // Comments
        if (trimmed.startsWith('#')) {
          return <span key={i} className="text-gray-600">{line}{'\n'}</span>;
        }
        // Keys (before colon)
        const colonIdx = line.indexOf(':');
        if (colonIdx !== -1 && colonIdx < line.length - 1) {
          const key = line.slice(0, colonIdx + 1);
          const val = line.slice(colonIdx + 1);
          // Highlight string values in brackets/quotes
          const valStyled = val.replace(/(".*?"|'.*?'|\[.*?\])/g, '<em>$1</em>');
          return (
            <span key={i}>
              <span className="text-blue-400/80">{key}</span>
              <span dangerouslySetInnerHTML={{ __html: valStyled.replace(/<em>(.*?)<\/em>/g, '<span style="color:#10B981">$1</span>') }} />
              {'\n'}
            </span>
          );
        }
        // List indicators
        if (trimmed.startsWith('- ')) {
          const indent = line.slice(0, line.indexOf('- '));
          const rest = trimmed.slice(2);
          return <span key={i}>{indent}<span className="text-gray-500">- </span><span className="text-gray-300">{rest}</span>{'\n'}</span>;
        }
        return <span key={i}>{line}{'\n'}</span>;
      })}
    </pre>
  );
}

function TermBlock({ lines }: { lines: typeof powerStateTerminal }) {
  return (
    <div className="mt-4 p-4 rounded-lg bg-black/40 border border-white/5 overflow-x-auto">
      {lines.map((line, i) => {
        const mono = 'font-mono text-[11px] sm:text-xs leading-5';
        if (line.type === 'blank') return <div key={i} className="h-2" />;
        if (line.type === 'cmd' || line.type === 'cmd') return (
          <div key={i} className={`${mono} text-gray-300`}>{line.text}</div>
        );
        if (line.type === 'spin') return (
          <div key={i} className={`${mono} text-blue-400`}>{line.text}</div>
        );
        if (line.type === 'ok') return (
          <div key={i} className={`${mono} text-emerald-400`}>{line.text}</div>
        );
        if (line.type === 'info' || line.type === 'summary') return (
          <div key={i} className={`${mono} text-gray-300`}>{line.text}</div>
        );
        if (line.type === 'pass') return (
          <div key={i} className={`${mono} flex items-center gap-1`}>
            <span className="text-emerald-400 flex-shrink-0 flex-1">{line.text}</span>
            {line.time && <span className="text-gray-600 ml-1">{line.time}</span>}
          </div>
        );
        if (line.type === 'fail') return (
          <div key={i} className={`${mono} flex items-center gap-1`}>
            <span className="text-red-400 flex-shrink-0 flex-1">{line.text}</span>
            {line.time && <span className="text-red-500/70 ml-1">{line.time}</span>}
          </div>
        );
        if (line.type === 'detail') return (
          <div key={i} className={`${mono} text-red-400/70 pl-4`}>{line.text}</div>
        );
        return <div key={i} className={`${mono} text-gray-400`}>{line.text}</div>;
      })}
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

export function HardwareSection() {
  return (
    <section className="py-24 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-blue-400 uppercase tracking-widest mb-4">
            Purpose-built for hardware
          </p>
          <h2 className="section-title mb-4">
            Built for the lab bench,{' '}
            <span className="text-gradient-blue">not the browser.</span>
          </h2>
          <p className="section-subtitle">
            Every feature was designed around real hardware test workflows — not adapted from web testing tools.
          </p>
        </div>

        {/* Three-column cards */}
        <div className="grid md:grid-cols-3 gap-6">

          {/* Card 1 — Firmware Validation Pipeline */}
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                <HardDrive className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-base font-bold text-white">Firmware Validation Pipeline</h3>
            </div>

            <p className="text-sm text-gray-400 leading-relaxed mb-2">
              Automated flash → boot → test → report. Support for fastboot, OTA, and UART flashing. Validate every build before it reaches QA.
            </p>

            <YamlBlock code={firmwareYaml} />
          </div>

          {/* Card 2 — Power State Testing */}
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <BatteryCharging className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-base font-bold text-white">Power State Testing</h3>
            </div>

            <p className="text-sm text-gray-400 leading-relaxed mb-2">
              Automated suspend/resume cycling, deep sleep validation, wake source verification. Catch power management regressions that only show up after 100+ cycles.
            </p>

            <TermBlock lines={powerStateTerminal} />
          </div>

          {/* Card 3 — Multi-Device Orchestration */}
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
                <GitBranch className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-base font-bold text-white">Multi-Device Orchestration</h3>
            </div>

            <p className="text-sm text-gray-400 leading-relaxed mb-2">
              Run the same test suite across 50+ devices in parallel. Automatic device allocation, health monitoring, and result correlation across your entire lab.
            </p>

            <TermBlock lines={orchTerminal} />
          </div>
        </div>

        {/* Attribution */}
        <p className="text-center text-xs text-gray-600 mt-10">
          Built by Umut Candan — 6 years at Samsung Semiconductor
        </p>
      </div>
    </section>
  );
}
