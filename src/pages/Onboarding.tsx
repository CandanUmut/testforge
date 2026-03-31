import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, Cpu, UploadCloud, CheckCircle2,
  ChevronRight, ChevronLeft, Copy, Check, Terminal,
  Zap, ArrowRight,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface StepProps {
  onNext: (data?: Record<string, string>) => void;
  onBack?: () => void;
  data: Record<string, string>;
}

// ─── Step 1: Organization Setup ───────────────────────────────────────────────

function StepOrg({ onNext, data }: StepProps) {
  const [orgName, setOrgName] = useState(data.orgName ?? '');
  const [timezone, setTimezone] = useState(data.timezone ?? 'UTC');
  const [plan, setPlan] = useState(data.plan ?? 'starter');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Set up your organization</h2>
        <p className="text-sm text-gray-400 mt-1">
          Your workspace for all test runs, devices, and reports.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">
            Organization name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={orgName}
            onChange={e => setOrgName(e.target.value)}
            placeholder="Acme Firmware Team"
            className="w-full bg-white/6 border border-white/12 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Timezone</label>
          <select
            value={timezone}
            onChange={e => setTimezone(e.target.value)}
            className="w-full bg-white/6 border border-white/12 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition"
          >
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
            <option value="Europe/London">London</option>
            <option value="Europe/Berlin">Berlin</option>
            <option value="Asia/Tokyo">Tokyo</option>
            <option value="Asia/Shanghai">Shanghai</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-2">Plan</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'starter', label: 'Starter', price: 'Free', desc: '2 devices · 1 user' },
              { id: 'professional', label: 'Professional', price: '$399/mo', desc: '20 devices · 10 users' },
              { id: 'enterprise', label: 'Enterprise', price: 'Custom', desc: 'Unlimited' },
            ].map(p => (
              <button
                key={p.id}
                onClick={() => setPlan(p.id)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  plan === p.id
                    ? 'border-blue-500/60 bg-blue-500/10'
                    : 'border-white/10 bg-white/4 hover:border-white/20'
                }`}
              >
                <div className="text-sm font-semibold text-white">{p.label}</div>
                <div className="text-xs text-blue-300 mt-0.5">{p.price}</div>
                <div className="text-xs text-gray-500 mt-1">{p.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        disabled={!orgName.trim()}
        onClick={() => onNext({ orgName, timezone, plan })}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
      >
        Continue
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

// ─── Step 2: Register Device ──────────────────────────────────────────────────

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
    >
      {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

function StepDevice({ onNext, onBack, data }: StepProps) {
  const [deviceName, setDeviceName] = useState(data.deviceName ?? '');
  const [platform, setPlatform] = useState(data.platform ?? 'stm32h7');

  const installCmd = `curl -fsSL https://install.testforge.io | sh -s -- \\
  --org-key tf_org_xxxxxxxxxxxxxxxx \\
  --device-name "${deviceName || 'my-device'}" \\
  --platform ${platform}`;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Register your first device</h2>
        <p className="text-sm text-gray-400 mt-1">
          Install the TestForge agent on the host machine connected to your hardware.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Device name</label>
          <input
            type="text"
            value={deviceName}
            onChange={e => setDeviceName(e.target.value)}
            placeholder="Lab Device 01"
            className="w-full bg-white/6 border border-white/12 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-2">Platform</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {[
              { id: 'stm32h7', label: 'STM32H7' },
              { id: 'nrf52840', label: 'nRF52840' },
              { id: 'esp32s3', label: 'ESP32-S3' },
              { id: 'rp2040', label: 'RP2040' },
              { id: 'imx8', label: 'i.MX8' },
              { id: 'custom', label: 'Custom' },
            ].map(p => (
              <button
                key={p.id}
                onClick={() => setPlatform(p.id)}
                className={`p-2.5 rounded-lg border text-sm font-medium transition-all ${
                  platform === p.id
                    ? 'border-blue-500/60 bg-blue-500/10 text-blue-300'
                    : 'border-white/10 bg-white/4 text-gray-300 hover:border-white/20'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Install command</label>
          <div className="bg-gray-950 rounded-lg border border-white/8 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Terminal size={12} className="text-gray-400" />
                <span className="text-xs text-gray-500">bash</span>
              </div>
              <CopyBtn text={installCmd} />
            </div>
            <pre className="text-xs font-mono text-gray-300 whitespace-pre-wrap break-all">{installCmd}</pre>
          </div>
        </div>

        <div className="flex items-start gap-3 bg-blue-500/8 border border-blue-500/20 rounded-lg p-3">
          <Zap size={14} className="text-blue-400 mt-0.5 shrink-0" />
          <p className="text-xs text-blue-300">
            The agent auto-discovers USB/JTAG connections and starts streaming telemetry within seconds of install.
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/10 text-sm text-gray-300 hover:border-white/20 hover:text-white transition-colors"
        >
          <ChevronLeft size={16} />
          Back
        </button>
        <button
          onClick={() => onNext({ deviceName: deviceName || 'Lab Device 01', platform })}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
        >
          Continue
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

// ─── Step 3: Push First Results ───────────────────────────────────────────────

function StepPush({ onNext, onBack }: StepProps) {
  const createRunCmd = `curl -X POST https://api.testforge.io/v1/runs \\
  -H "Authorization: Bearer <token>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "device_id": "dev_newXYZ",
    "suite": "smoke",
    "firmware_version": "1.0.0"
  }'`;

  const pushResultsCmd = `curl -X POST https://api.testforge.io/v1/runs/run_abc123/results \\
  -H "Authorization: Bearer <token>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "results": [
      {"test_name": "device_boot_sequence", "category": "smoke", "status": "passed", "duration_ms": 1240},
      {"test_name": "usb_enumeration_check", "category": "smoke", "status": "passed", "duration_ms": 320}
    ]
  }'`;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Push your first results</h2>
        <p className="text-sm text-gray-400 mt-1">
          Create a run and stream test results via the REST API or our Python / Node SDKs.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-xs text-blue-300 font-bold">1</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white mb-2">Create a run</p>
            <div className="bg-gray-950 rounded-lg border border-white/8 p-3">
              <div className="flex justify-between mb-2">
                <span className="text-xs text-gray-500">bash</span>
                <CopyBtn text={createRunCmd} />
              </div>
              <pre className="text-xs font-mono text-gray-300 whitespace-pre-wrap break-all overflow-x-auto">{createRunCmd}</pre>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-xs text-blue-300 font-bold">2</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white mb-2">Push test results</p>
            <div className="bg-gray-950 rounded-lg border border-white/8 p-3">
              <div className="flex justify-between mb-2">
                <span className="text-xs text-gray-500">bash</span>
                <CopyBtn text={pushResultsCmd} />
              </div>
              <pre className="text-xs font-mono text-gray-300 whitespace-pre-wrap break-all overflow-x-auto">{pushResultsCmd}</pre>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-xs text-emerald-300 font-bold">3</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white mb-1">Results appear in the dashboard</p>
            <p className="text-xs text-gray-400">Pass rate, trend charts, and crash detection update in real time.</p>
          </div>
        </div>
      </div>

      <div className="bg-white/4 rounded-lg border border-white/8 p-4">
        <p className="text-xs font-semibold text-gray-300 mb-2">Prefer a Python SDK?</p>
        <pre className="text-xs font-mono text-gray-400 whitespace-pre-wrap">{`pip install testforge-sdk

from testforge import TestForge
tf = TestForge(api_key="tf_live_xxx")
run = tf.runs.create(device_id="dev_newXYZ", suite="smoke")
run.push_result("device_boot_sequence", "passed", duration_ms=1240)`}</pre>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/10 text-sm text-gray-300 hover:border-white/20 hover:text-white transition-colors"
        >
          <ChevronLeft size={16} />
          Back
        </button>
        <button
          onClick={() => onNext()}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
        >
          <UploadCloud size={15} />
          I've pushed results
        </button>
      </div>
    </div>
  );
}

// ─── Step 4: You're Ready ─────────────────────────────────────────────────────

function StepReady({ data, onNext }: StepProps) {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
          <CheckCircle2 size={32} className="text-emerald-400" />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-white">You're all set!</h2>
        <p className="text-sm text-gray-400 mt-2">
          <span className="text-white font-medium">{data.orgName || 'Your organization'}</span> is ready.
          Start exploring the platform.
        </p>
      </div>

      {/* Checklist */}
      <div className="text-left bg-white/4 rounded-xl border border-white/8 p-4 space-y-3">
        {[
          { label: 'Organization created', done: true },
          { label: `Device "${data.deviceName || 'Lab Device 01'}" registered`, done: true },
          { label: 'First test run pushed', done: true },
          { label: 'Connect Slack for crash alerts', done: false, cta: '/settings' },
          { label: 'Set up CI/CD integration', done: false, cta: '/docs' },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${item.done ? 'bg-emerald-500/20 border-emerald-500/40' : 'border-white/15 bg-white/4'}`}>
              {item.done
                ? <Check size={11} className="text-emerald-400" />
                : <span className="w-1.5 h-1.5 rounded-full bg-gray-600" />}
            </div>
            <span className={`text-sm flex-1 ${item.done ? 'text-white' : 'text-gray-400'}`}>{item.label}</span>
            {!item.done && item.cta && (
              <button
                onClick={() => { onNext(); navigate(item.cta!); }}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                Set up →
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Dashboard', icon: Zap, path: '/dashboard' },
          { label: 'API Docs', icon: Terminal, path: '/docs' },
        ].map(link => {
          const Icon = link.icon;
          return (
            <button
              key={link.path}
              onClick={() => { onNext(); navigate(link.path); }}
              className="flex items-center gap-2 p-3 bg-white/4 hover:bg-white/6 border border-white/10 rounded-xl text-sm text-gray-300 hover:text-white transition-colors"
            >
              <Icon size={14} className="text-blue-400" />
              {link.label}
              <ArrowRight size={12} className="ml-auto text-gray-600" />
            </button>
          );
        })}
      </div>

      <button
        onClick={() => { onNext(); navigate('/dashboard'); }}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
      >
        Go to Dashboard
        <ArrowRight size={16} />
      </button>
    </div>
  );
}

// ─── Step config ──────────────────────────────────────────────────────────────

interface StepConfig {
  id: string;
  label: string;
  icon: React.ElementType;
  component: React.FC<StepProps>;
}

const STEPS: StepConfig[] = [
  { id: 'org', label: 'Organization', icon: Building2, component: StepOrg },
  { id: 'device', label: 'Device', icon: Cpu, component: StepDevice },
  { id: 'push', label: 'Push Results', icon: UploadCloud, component: StepPush },
  { id: 'ready', label: 'Ready', icon: CheckCircle2, component: StepReady },
];

// ─── Main page ────────────────────────────────────────────────────────────────

export function Onboarding() {
  const [step, setStep] = useState(0);
  const [collectedData, setCollectedData] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const goNext = (data?: Record<string, string>) => {
    if (data) setCollectedData(prev => ({ ...prev, ...data }));
    if (step < STEPS.length - 1) setStep(s => s + 1);
    else navigate('/dashboard');
  };

  const goBack = () => setStep(s => Math.max(0, s - 1));

  const CurrentStep = STEPS[step].component;

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap size={20} className="text-blue-400" />
            <span className="text-lg font-bold text-white">TestForge</span>
          </div>
          <p className="text-xs text-gray-500">Setup wizard</p>
        </div>

        {/* Progress steps */}
        <div className="flex items-center justify-center gap-0 mb-8">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done = i < step;
            const active = i === step;
            return (
              <div key={s.id} className="flex items-center">
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                    done ? 'bg-blue-600 border-blue-600' : active ? 'bg-blue-500/20 border-blue-500' : 'bg-white/4 border-white/15'
                  }`}>
                    {done
                      ? <Check size={14} className="text-white" />
                      : <Icon size={14} className={active ? 'text-blue-400' : 'text-gray-500'} />}
                  </div>
                  <span className={`text-xs hidden sm:block ${active ? 'text-white' : done ? 'text-blue-400' : 'text-gray-600'}`}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`w-12 h-px mx-2 mb-4 ${i < step ? 'bg-blue-500' : 'bg-white/10'}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Card */}
        <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 shadow-2xl">
          <CurrentStep
            onNext={goNext}
            onBack={step > 0 ? goBack : undefined}
            data={collectedData}
          />
        </div>

        {/* Skip link */}
        {step < STEPS.length - 1 && (
          <div className="text-center mt-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-xs text-gray-500 hover:text-gray-400 transition-colors"
            >
              Skip setup → Go to dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
