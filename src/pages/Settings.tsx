import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { demoApiKeys } from '../utils/seedData';
import { ComingSoonBadge } from '../components/common/Badge';
import {
  Building, Users, Key, Bell, Webhook, Plus, Trash2, Copy, Check,
  Shield, User, Crown,
} from 'lucide-react';

export function Settings() {
  const { organization, profile } = useAuth();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [orgName, setOrgName] = useState(organization?.name || '');
  const [saved, setSaved] = useState(false);

  function copyKey(prefix: string) {
    navigator.clipboard.writeText(`${prefix}xxxxxxxxxxxx`);
    setCopiedKey(prefix);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const teamMembers = [
    { name: profile?.full_name || 'You', email: profile?.email || '', role: 'owner', avatar: 'U' },
    { name: 'Alex Chen', email: 'alex@example.com', role: 'admin', avatar: 'A' },
    { name: 'Sam Rivera', email: 'sam@example.com', role: 'member', avatar: 'S' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-white">Settings</h1>
        <p className="text-sm text-gray-400 mt-1">Manage your organization and integrations</p>
      </div>

      {/* Organization */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-blue-400/10 border border-blue-400/20 flex items-center justify-center">
            <Building className="w-4 h-4 text-blue-400" />
          </div>
          <h2 className="text-base font-semibold text-white">Organization</h2>
        </div>
        <form onSubmit={handleSave} className="space-y-4 max-w-md">
          <div>
            <label className="label">Organization name</label>
            <input
              type="text"
              value={orgName}
              onChange={e => setOrgName(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="label">Plan</label>
            <div className="flex items-center gap-3">
              <span className="badge text-blue-400 bg-blue-400/10 border-blue-400/20 capitalize">
                {organization?.plan || 'starter'}
              </span>
              <button type="button" className="text-xs text-blue-400 hover:text-blue-300">
                Upgrade plan →
              </button>
            </div>
          </div>
          <button type="submit" className="btn-primary py-2 px-4 text-sm">
            {saved ? 'Saved!' : 'Save changes'}
          </button>
        </form>
      </div>

      {/* Team members */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-400/10 border border-purple-400/20 flex items-center justify-center">
              <Users className="w-4 h-4 text-purple-400" />
            </div>
            <h2 className="text-base font-semibold text-white">Team Members</h2>
          </div>
          <button className="btn-secondary flex items-center gap-2 text-sm py-1.5 px-3">
            <Plus className="w-3.5 h-3.5" />
            Invite
          </button>
        </div>
        <div className="space-y-3">
          {teamMembers.map((member, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/3 border border-white/5">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-xs font-bold text-blue-400">
                {member.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{member.name}</p>
                <p className="text-xs text-gray-500">{member.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`badge text-xs ${
                  member.role === 'owner' ? 'text-amber-400 bg-amber-400/10 border-amber-400/20' :
                  member.role === 'admin' ? 'text-blue-400 bg-blue-400/10 border-blue-400/20' :
                  'text-gray-400 bg-gray-400/10 border-gray-400/20'
                }`}>
                  {member.role === 'owner' && <Crown className="w-2.5 h-2.5 inline mr-0.5" />}
                  {member.role === 'admin' && <Shield className="w-2.5 h-2.5 inline mr-0.5" />}
                  {member.role === 'member' && <User className="w-2.5 h-2.5 inline mr-0.5" />}
                  {member.role}
                </span>
                {member.role !== 'owner' && (
                  <button className="text-gray-600 hover:text-red-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* API Keys */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center">
              <Key className="w-4 h-4 text-emerald-400" />
            </div>
            <h2 className="text-base font-semibold text-white">API Keys</h2>
          </div>
          <button className="btn-secondary flex items-center gap-2 text-sm py-1.5 px-3">
            <Plus className="w-3.5 h-3.5" />
            New Key
          </button>
        </div>
        <div className="space-y-3">
          {demoApiKeys.map(key => (
            <div key={key.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/3 border border-white/5">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{key.name}</p>
                <p className="text-xs font-mono text-gray-500 mt-0.5">{key.key_prefix}••••••••••••</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-gray-500">
                  {key.permissions.join(', ')}
                </span>
                <button
                  onClick={() => copyKey(key.key_prefix)}
                  className="text-gray-600 hover:text-white transition-colors p-1"
                  title="Copy key"
                >
                  {copiedKey === key.key_prefix
                    ? <Check className="w-3.5 h-3.5 text-emerald-400" />
                    : <Copy className="w-3.5 h-3.5" />
                  }
                </button>
                <button className="text-gray-600 hover:text-red-400 transition-colors p-1">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
          <p className="text-xs text-gray-400">
            Use API keys to authenticate requests from your CI/CD pipeline, devices, or custom integrations.{' '}
            <a href="#" className="text-blue-400 hover:text-blue-300">Read the API docs →</a>
          </p>
        </div>
      </div>

      {/* Webhooks */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
              <Webhook className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Webhooks</h2>
            </div>
          </div>
          <ComingSoonBadge />
        </div>
        <p className="text-sm text-gray-400">
          Configure outbound webhooks to notify your systems when test runs complete, crashes are detected, or device status changes.
        </p>
      </div>

      {/* Notifications */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-pink-400/10 border border-pink-400/20 flex items-center justify-center">
              <Bell className="w-4 h-4 text-pink-400" />
            </div>
            <h2 className="text-base font-semibold text-white">Notifications</h2>
          </div>
          <ComingSoonBadge />
        </div>
        <p className="text-sm text-gray-400">
          Configure Slack, email, and PagerDuty notifications for critical crashes, device offline events, and threshold breaches.
        </p>
      </div>
    </div>
  );
}
