import { Cpu, BatteryCharging, Cable } from 'lucide-react';

const capabilities = [
  {
    title: 'Firmware Validation Pipeline',
    copy: 'Automated flash, boot, test, and report. Support for fastboot, OTA, UART. Validate every build before it reaches QA.',
    icon: Cpu,
  },
  {
    title: 'Power State Testing',
    copy: 'Automated suspend/resume cycling, deep sleep validation, wake source verification. Catch power management regressions that hide for weeks.',
    icon: BatteryCharging,
  },
  {
    title: 'Multi-Device Orchestration',
    copy: 'Same test suite across 50+ devices in parallel. Automatic allocation, health checks, and result correlation across device variants.',
    icon: Cable,
  },
];

const yamlConfig = `# testforge.yml — firmware validation pipeline
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
      devices: ["DUT-A*"]
  - report:
      channels: [slack, jira]
      on_failure: create_ticket`;

export function HardwareSection() {
  return (
    <section id="hardware" className="bg-gray-50 px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">
            Built for Hardware Teams
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-slate-950">
            Built by a hardware test engineer. For hardware test teams.
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            Most test tools are built by web developers who have never touched a UART cable. TestForge
            was born in a lab with 200+ devices, firmware flashing failures at 3am, and the reality
            that hardware testing is fundamentally different from software testing.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {capabilities.map(({ copy, icon: Icon, title }) => (
            <div key={title} className="rounded-2xl border border-gray-200 bg-white p-8 shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-6 text-xl font-semibold tracking-tight text-slate-950">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{copy}</p>
            </div>
          ))}
        </div>

        {/* Config snippet */}
        <div className="mt-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-card">
          <p className="text-sm font-medium text-gray-500 mb-3">Example pipeline configuration</p>
          <pre className="overflow-x-auto rounded-xl bg-gray-50 border border-gray-100 p-5 text-sm leading-6 font-mono text-gray-700">
            <code>{yamlConfig}</code>
          </pre>
        </div>
      </div>
    </section>
  );
}
