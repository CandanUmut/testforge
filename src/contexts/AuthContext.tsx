import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isDemoMode } from '../lib/supabase';
import type { Profile, Organization } from '../lib/types';
import { demoOrganization } from '../utils/seedData';

interface AuthContextValue {
  user: { id: string; email: string } | null;
  profile: Profile | null;
  organization: Organization | null;
  loading: boolean;
  isDemoMode: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string, orgName: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  enterDemoMode: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(isDemoMode);

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
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

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
    } finally {
      setLoading(false);
    }
  }

  function enterDemoMode() {
    setIsDemo(true);
    setUser(DEMO_USER);
    setProfile(DEMO_PROFILE);
    setOrganization(demoOrganization);
  }

  async function signIn(email: string, password: string) {
    if (isDemoMode) {
      enterDemoMode();
      return { error: null };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  }

  async function signUp(email: string, password: string, fullName: string, orgName: string) {
    if (isDemoMode) {
      enterDemoMode();
      return { error: null };
    }

    const slug = orgName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (signUpError) return { error: signUpError as Error };
    if (!authData.user) return { error: new Error('Signup failed') };

    // Create organization
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .insert({ name: orgName, slug, plan: 'starter' })
      .select()
      .single();

    if (orgError) return { error: orgError as Error };

    // Link profile to org
    await supabase
      .from('profiles')
      .update({ organization_id: orgData.id, full_name: fullName, role: 'owner' })
      .eq('id', authData.user.id);

    return { error: null };
  }

  async function signInWithGoogle() {
    if (isDemoMode) {
      enterDemoMode();
      return { error: null };
    }
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    return { error: error as Error | null };
  }

  async function signOut() {
    if (isDemo) {
      setUser(null);
      setProfile(null);
      setOrganization(null);
      setIsDemo(isDemoMode);
      return;
    }
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      organization,
      loading,
      isDemoMode: isDemo,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
      enterDemoMode,
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
