import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isDemoMode } from '../lib/supabase';
import type { Profile, Organization } from '../lib/types';
import { demoOrganization } from '../utils/seedData';

const DEMO_USER = {
  id: 'demo-user-001',
  email: 'demo@testforge.dev',
};

const DEMO_PROFILE: Profile = {
  id: 'demo-user-001',
  organization_id: 'd0000000-0000-0000-0000-000000000001',
  full_name: 'Demo User',
  email: 'demo@testforge.dev',
  role: 'owner',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

interface AuthContextValue {
  user: { id: string; email: string } | null;
  profile: Profile | null;
  organization: Organization | null;
  loading: boolean;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string, orgName: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isDemoMode) {
      // Auto-login as demo user when no Supabase is configured
      setUser(DEMO_USER);
      setProfile(DEMO_PROFILE);
      setOrganization(demoOrganization);
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email ?? '' });
        loadProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email ?? '' });
        loadProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
        setOrganization(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadProfile(userId: string) {
    try {
      setError(null);
      const { data: profileData, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileErr) {
        setError(profileErr.message);
        return;
      }

      if (profileData) {
        setProfile(profileData);
        if (profileData.organization_id) {
          const { data: orgData } = await supabase
            .from('organizations')
            .select('*')
            .eq('id', profileData.organization_id)
            .single();
          if (orgData) setOrganization(orgData);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }

  async function signIn(email: string, password: string) {
    if (isDemoMode) {
      return { error: new Error('Supabase credentials are not configured. Use demo mode instead.') };
    }
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(signInError.message);
      return { error: signInError as Error };
    }
    // Redirect to dashboard — handled by the caller after successful login
    // The caller should navigate to /#/app/dashboard
    return { error: null };
  }

  async function signUp(email: string, password: string, fullName: string, orgName: string) {
    if (isDemoMode) {
      return { error: new Error('Supabase credentials are not configured. Use demo mode instead.') };
    }

    setError(null);

    // The DB trigger handle_new_user() will auto-create org + profile on signup
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, org_name: orgName } },
    });

    if (signUpError) {
      setError(signUpError.message);
      return { error: signUpError as Error };
    }
    if (!authData.user) {
      const err = new Error('Signup failed');
      setError(err.message);
      return { error: err };
    }

    return { error: null };
  }

  async function signInWithGoogle() {
    if (isDemoMode) {
      return { error: new Error('Supabase credentials are not configured. Use demo mode instead.') };
    }
    setError(null);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (oauthError) {
      setError(oauthError.message);
    }
    return { error: oauthError as Error | null };
  }

  async function signOut() {
    setError(null);
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      organization,
      loading,
      isLoading: loading,
      error,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
