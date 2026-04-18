import { useState } from 'react';
import { useOrganization } from '../hooks/useOrganization';
import { useDataContext } from '../contexts/DataContext';
import { ComingSoonBadge } from '../components/common/Badge';
import {
  Building, Users, Key, Bell, Webhook, Plus, Trash2, Copy, Check,
  Shield, User, Crown,
} from 'lucide-react';

export function Settings() {
  const { organization, profile } = useOrganization();
  const { apiKeys } = useDataContext();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [orgName, setOrgName] = useState(organization?.name || '');
  const [saved, setSaved] = useState(false);
  const [showNewKey, setShowNewKey] = useState<string | null>(null);

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

  function handleGenerateKey() {
    const newKey = 'tfk_' + Array.from({ length: 32 }, () =>
      'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 36)]
    ).join('');
    setShowNewKey(newKey);
  }

  const teamMembers = [
    { name: profile?.full_name || 'You', email: profile?.email || '', role: 'owner', avatar: 'U' },
    { name: 'Alex Chen', email: 'alex@example.com', role: 'admin', avatar: 'A' },
    { name: 'Sam Rivera', email: 'sam@example.com', role: 'member', avatar: 'S' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your organization and integrations</p>
      </div>

      {/* Organization */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center">
            <Building className="w-4 h-4 text-indigo-600" />
          </div>
          <h2 className="text-base font-semibold text-gray-900">Organization</h2>
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
              <span className="badge text-indigo-600 bg-indigo-50 border-indigo-200 capitalize">
                {organization?.plan || 'starter'}
              </span>
              <button type="button" className="text-xs text-indigo-600 hover:text-indigo-700">
                Upgrade plan &rarr;
              </button>
            </div>
          </div>
          <button type="submit" className="btn-primary py-2 px-4 text-sm">
            {saved ? 'Saved!' : 'Save changes'}
          </button>
        </form>
      </div>

      {/* Team members */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center">
              <Users className="w-4 h-4 text-indigo-600" />
            </div>
            <h2 className="text-base font-semibold text-gray-900">Team Members</h2>
          </div>
          <button className="btn-secondary flex items-center gap-2 text-sm py-1.5 px-3">
            <Plus className="w-3.5 h-3.5" />
            Invite
          </button>
        </div>
        <div className="space-y-3">
          {teamMembers.map((member, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200">
              <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-xs font-bold text-indigo-600">
                {member.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{member.name}</p>
                <p className="text-xs text-gray-500">{member.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`badge text-xs ${
                  member.role === 'owner' ? 'text-amber-600 bg-amber-50 border-amber-200' :
                  member.role === 'admin' ? 'text-blue-600 bg-blue-50 border-blue-200' :
                  'text-gray-600 bg-gray-100 border-gray-200'
                }`}>
                  {member.role === 'owner' && <Crown className="w-2.5 h-2.5 inline mr-0.5" />}
                  {member.role === 'admin' && <Shield className="w-2.5 h-2.5 inline mr-0.5" />}
                  {member.role === 'member' && <User className="w-2.5 h-2.5 inline mr-0.5" />}
                  {member.role}
                </span>
                {member.role !== 'owner' && (
                  <button className="text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* API Keys */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center">
              <Key className="w-4 h-4 text-emerald-600" />
            </div>
            <h2 className="text-base font-semibold text-gray-900">API Keys</h2>
          </div>
          <button
            onClick={handleGenerateKey}
            className="btn-primary flex items-center gap-2 text-sm py-1.5 px-3"
          >
            <Plus className="w-3.5 h-3.5" />
            New Key
          </button>
        </div>

        {/* New key display */}
        {showNewKey && (
          <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
            <p className="text-xs text-emerald-700 font-medium mb-2">
              New API key created. Copy it now -- it won't be shown again.
            </p>
            <div className="flex items-center gap-2">
              <code className="text-sm font-mono text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded flex-1 overflow-x-auto">
                {showNewKey}
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(showNewKey);
                  setShowNewKey(null);
                }}
                className="btn-primary py-1.5 px-3 text-xs"
              >
                Copy & Close
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {apiKeys.map(key => (
            <div key={key.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{key.name}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <p className="text-xs font-mono text-gray-500">{key.key_prefix}••••••••••••</p>
                  {key.last_used_at && (
                    <p className="text-xs text-gray-400">Last used: {new Date(key.last_used_at).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-gray-500">
                  {key.permissions.join(', ')}
                </span>
                <button
                  onClick={() => copyKey(key.key_prefix)}
                  className="text-gray-400 hover:text-gray-700 transition-colors p-1"
                  title="Copy key"
                >
                  {copiedKey === key.key_prefix
                    ? <Check className="w-3.5 h-3.5 text-emerald-500" />
                    : <Copy className="w-3.5 h-3.5" />
                  }
                </button>
                <button className="text-gray-400 hover:text-red-500 transition-colors p-1">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
          <p className="text-xs text-gray-600">
            Use API keys to authenticate requests from your CI/CD pipeline, devices, or custom integrations.{' '}
            <a href="#" className="text-indigo-600 hover:text-indigo-700">Read the API docs &rarr;</a>
          </p>
        </div>
      </div>

      {/* Webhooks */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center">
              <Webhook className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Webhooks</h2>
            </div>
          </div>
          <ComingSoonBadge />
        </div>
        <p className="text-sm text-gray-500">
          Configure outbound webhooks to notify your systems when test runs complete, crashes are detected, or device status changes.
        </p>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
              <Bell className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="text-base font-semibold text-gray-900">Notifications</h2>
          </div>
          <ComingSoonBadge />
        </div>
        <p className="text-sm text-gray-500">
          Configure Slack, email, and PagerDuty notifications for critical crashes, device offline events, and threshold breaches.
        </p>
      </div>
    </div>
  );
}
