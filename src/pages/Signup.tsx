import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Mail, Lock, User, Building } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { isDemoMode as hasMissingBackendConfig } from '../lib/supabase';
import { getAppPath, PUBLIC_ROUTES } from '../lib/routes';

export function Signup() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [form, setForm] = useState({ email: '', password: '', fullName: '', orgName: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    setError('');
    const { error: err } = await signUp(form.email, form.password, form.fullName, form.orgName);
    if (err) {
      setError(err.message);
      setLoading(false);
    } else {
      navigate('/app/dashboard');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to={PUBLIC_ROUTES.landing} className="inline-flex items-center gap-2 font-bold text-xl mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center">
              <Zap className="w-5 h-5 text-indigo-600" />
            </div>
            <span className="text-gray-900">Test<span className="text-indigo-600">Forge</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 mt-2 text-sm">Start with a 14-day free trial. No credit card required.</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-card p-8">
          {hasMissingBackendConfig && (
            <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-xs">
              Backend not configured. Use the demo dashboard while Supabase is being set up.
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={form.fullName}
                  onChange={e => update('fullName', e.target.value)}
                  placeholder="Your full name"
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Company</label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={form.orgName}
                  onChange={e => update('orgName', e.target.value)}
                  placeholder="Your company name"
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Work email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => update('email', e.target.value)}
                  placeholder="you@company.com"
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  value={form.password}
                  onChange={e => update('password', e.target.value)}
                  placeholder="Min. 8 characters"
                  className="input-field pl-10"
                  minLength={8}
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Creating account...' : 'Create Free Account'}
            </button>
          </form>

          <p className="text-center text-gray-400 text-xs mt-4">
            By signing up you agree to our{' '}
            <a href="#" className="text-gray-500 hover:text-gray-700 underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-gray-500 hover:text-gray-700 underline">Privacy Policy</a>.
          </p>
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          Already have an account?{' '}
          <Link to={PUBLIC_ROUTES.login} className="text-indigo-600 hover:text-indigo-700 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
