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
        <h2 className="text-xl font-bold text-gray-900">Set up your organization</h2>
        <p className="text-sm text-gray-500 mt-1">
          Your workspace for all test runs, devices, and reports.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Organization name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={orgName}
            onChange={e => setOrgName(e.target.value)}
            placeholder="Acme Firmware Team"
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Timezone</label>
          <select value={timezone} onChange={e => setTimezone(e.target.value)} className="input-field">
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
          <label className="block text-xs font-medium text-gray-600 mb-2">Plan</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'starter', label: 'Starter', price: '$199/mo', desc: '10 devices · 5 users' },
              { id: 'professional', label: 'Professional', price: '$499/mo', desc: '50 devices · 15 users' },
              { id: 'enterprise', label: 'Enterprise', price: 'Custom', desc: 'Unlimited' },
            ].map(p => (
              <button
                key={p.id}
                onClick={() => setPlan(p.id)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  plan === p.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="text-sm font-semibold text-gray-900">{p.label}</div>
                <div className="text-xs text-indigo-600 mt-0.5">{p.price}</div>
                <div className="text-xs text-gray-400 mt-1">{p.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        disabled={!orgName.trim()}
        onClick={() => onNext({ orgName, timezone, plan })}
        className="btn-primary w-full flex items-center justify-center gap-2 py-2.5"
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
      className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors"
    >
      {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

function StepDevice({ onNext, onBack, data }: StepProps) {
  const [deviceName, setDeviceName] = useState(data.deviceName ?? '');
  const [platform, setPlatform] = useState(data.platform ?? 'stm32h7');

  const installCmd = `curl -fsSL https://get.testforge.dev/install.sh | bash`;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Register your first device</h2>
        <p className="text-sm text-gray-500 mt-1">
          Install the TestForge agent on the host machine connected to your hardware.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Device name</label>
          <input
            type="text"
            value={deviceName}
            onChange={e => setDeviceName(e.target.value)}
            placeholder="DUT-A001"
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">Platform</label>
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
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Install command</label>
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Terminal size={12} className="text-gray-400" />
                <span className="text-xs text-gray-400">bash</span>
              </div>
              <CopyBtn text={installCmd} />
            </div>
            <pre className="text-xs font-mono text-gray-700 whitespace-pre-wrap break-all">{installCmd}</pre>
          </div>
        </div>

        <div className="flex items-start gap-3 bg-indigo-50 border border-indigo-200 rounded-lg p-3">
          <Zap size={14} className="text-indigo-600 mt-0.5 shrink-0" />
          <p className="text-xs text-indigo-700">
            The agent auto-discovers USB/JTAG connections and starts streaming telemetry within seconds of install.
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="btn-secondary flex items-center gap-2 px-4 py-2.5">
          <ChevronLeft size={16} />
          Back
        </button>
        <button
          onClick={() => onNext({ deviceName: deviceName || 'DUT-A001', platform })}
          className="btn-primary flex-1 flex items-center justify-center gap-2 py-2.5"
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
  const pushCmd = `python testforge_reporter.py \\
  --url https://your-project.supabase.co \\
  --api-key tf_xxxxxxxxxxxx \\
  --junit-xml results.xml \\
  --device-name DUT-A001 \\
  --suite-name post-flash-smoke`;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Push your first results</h2>
        <p className="text-sm text-gray-500 mt-1">
          Use the reporter script to send JUnit XML results to TestForge.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-xs text-indigo-600 font-bold">1</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 mb-2">Run the reporter script</p>
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-3">
              <div className="flex justify-between mb-2">
                <span className="text-xs text-gray-400">bash</span>
                <CopyBtn text={pushCmd} />
              </div>
              <pre className="text-xs font-mono text-gray-700 whitespace-pre-wrap break-all overflow-x-auto">{pushCmd}</pre>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-xs text-emerald-600 font-bold">2</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 mb-1">Results appear in the dashboard</p>
            <p className="text-xs text-gray-500">Pass rate, trend charts, and crash detection update in real time.</p>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="btn-secondary flex items-center gap-2 px-4 py-2.5">
          <ChevronLeft size={16} />
          Back
        </button>
        <button
          onClick={() => onNext()}
          className="btn-primary flex-1 flex items-center justify-center gap-2 py-2.5"
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
        <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
          <CheckCircle2 size={32} className="text-emerald-500" />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900">You're all set!</h2>
        <p className="text-sm text-gray-500 mt-2">
          <span className="text-gray-900 font-medium">{data.orgName || 'Your organization'}</span> is ready.
        </p>
      </div>

      <div className="text-left bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-3">
        {[
          { label: 'Organization created', done: true },
          { label: `Device "${data.deviceName || 'DUT-A001'}" registered`, done: true },
          { label: 'First test run pushed', done: true },
          { label: 'Connect Slack for crash alerts', done: false, cta: '/app/settings' },
          { label: 'Set up CI/CD integration', done: false, cta: '/docs/setup' },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${item.done ? 'bg-emerald-50 border-emerald-300' : 'border-gray-300 bg-white'}`}>
              {item.done
                ? <Check size={11} className="text-emerald-500" />
                : <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />}
            </div>
            <span className={`text-sm flex-1 ${item.done ? 'text-gray-900' : 'text-gray-500'}`}>{item.label}</span>
            {!item.done && item.cta && (
              <button
                onClick={() => { onNext(); navigate(item.cta!); }}
                className="text-xs text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                Set up &rarr;
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Dashboard', icon: Zap, path: '/app/dashboard' },
          { label: 'API Docs', icon: Terminal, path: '/docs/api' },
        ].map(link => {
          const Icon = link.icon;
          return (
            <button
              key={link.path}
              onClick={() => { onNext(); navigate(link.path); }}
              className="flex items-center gap-2 p-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Icon size={14} className="text-indigo-600" />
              {link.label}
              <ArrowRight size={12} className="ml-auto text-gray-300" />
            </button>
          );
        })}
      </div>

      <button
        onClick={() => { onNext(); navigate('/app/dashboard'); }}
        className="btn-primary w-full flex items-center justify-center gap-2 py-2.5"
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
    else navigate('/app/dashboard');
  };

  const goBack = () => setStep(s => Math.max(0, s - 1));

  const CurrentStep = STEPS[step].component;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap size={20} className="text-indigo-600" />
            <span className="text-lg font-bold text-gray-900">TestForge</span>
          </div>
          <p className="text-xs text-gray-400">Setup wizard</p>
        </div>

        <div className="flex items-center justify-center gap-0 mb-8">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done = i < step;
            const active = i === step;
            return (
              <div key={s.id} className="flex items-center">
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                    done ? 'bg-indigo-600 border-indigo-600' : active ? 'bg-indigo-50 border-indigo-500' : 'bg-white border-gray-200'
                  }`}>
                    {done
                      ? <Check size={14} className="text-white" />
                      : <Icon size={14} className={active ? 'text-indigo-600' : 'text-gray-400'} />}
                  </div>
                  <span className={`text-xs hidden sm:block ${active ? 'text-gray-900' : done ? 'text-indigo-600' : 'text-gray-400'}`}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`w-12 h-px mx-2 mb-4 ${i < step ? 'bg-indigo-500' : 'bg-gray-200'}`} />
                )}
              </div>
            );
          })}
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-card">
          <CurrentStep onNext={goNext} onBack={step > 0 ? goBack : undefined} data={collectedData} />
        </div>

        {step < STEPS.length - 1 && (
          <div className="text-center mt-4">
            <button
              onClick={() => navigate('/app/dashboard')}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Skip setup &rarr; Go to dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
