/**
 * Authentication Provider for React Native
 * Identical to web auth except uses React Native Supabase client
 */

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { supabase } from './supabase';
import type { User, Session } from '@supabase/supabase-js';
import { mockUserProfile } from './mockData';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: Error }>;
  signUp: (email: string, password: string) => Promise<{ error?: Error }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const USE_MOCK_AUTH = process.env.EXPO_PUBLIC_USE_MOCK_DATA === 'true';

  const createOfflineSession = useCallback(() => {
    if (!USE_MOCK_AUTH) {
      return null;
    }

    const offlineUser = {
      id: 'mock-user',
      aud: 'authenticated',
      role: 'authenticated',
      email: mockUserProfile.email,
      app_metadata: { provider: 'email' },
      user_metadata: {
        full_name: mockUserProfile.display_name,
        avatar_url: mockUserProfile.avatar_url,
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_sign_in_at: new Date().toISOString(),
      email_confirmed_at: new Date().toISOString(),
      confirmation_sent_at: new Date().toISOString(),
      phone: null,
      phone_confirmed_at: null,
      recovery_sent_at: null,
      email_change_sent_at: null,
      new_email: null,
      new_phone: null,
      invited_at: null,
      app_metadata_updated_at: new Date().toISOString(),
      identities: [],
      factors: [],
    } as unknown as User;

    return {
      access_token: 'offline-access-token',
      refresh_token: 'offline-refresh-token',
      token_type: 'bearer',
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      user: offlineUser,
    } as Session;
  }, []);

  const activateOfflineSession = useCallback(() => {
    const offlineSession = createOfflineSession();
    if (!offlineSession) return;
    setSession(offlineSession);
    setUser(offlineSession.user);
    setLoading(false);
  }, [createOfflineSession]);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        console.log('[Auth] Initial session check:', data.session?.user?.email || 'No session');
        setSession(data.session);
        setUser(data.session?.user ?? null);
      } catch (error) {
        console.warn('[Auth] Failed to fetch session');
        console.warn(error);
        if (USE_MOCK_AUTH) {
          activateOfflineSession();
        } else {
          setSession(null);
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    bootstrap();

    let subscription: ReturnType<typeof supabase.auth.onAuthStateChange>['data']['subscription'] | null = null;
    try {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        console.log('[Auth] State changed:', _event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      });
      subscription = data.subscription;
    } catch (error) {
      console.warn('[Auth] Failed to subscribe to auth changes');
      console.warn(error);
      if (USE_MOCK_AUTH) {
        activateOfflineSession();
      }
    }

    return () => subscription?.unsubscribe();
  }, [activateOfflineSession, USE_MOCK_AUTH]);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { error: undefined };
    } catch (error) {
      console.error('[Auth] Sign-in failed', error);
      if (USE_MOCK_AUTH) {
        activateOfflineSession();
        return { error: undefined };
      }
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      return { error: undefined };
    } catch (error) {
      console.error('[Auth] Sign-up failed', error);
      if (USE_MOCK_AUTH) {
        activateOfflineSession();
        return { error: undefined };
      }
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('[Auth] Sign-out failed', error);
      if (USE_MOCK_AUTH) {
        setUser(null);
        setSession(null);
      } else {
        throw error;
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
