import { createContext, useContext, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/shared/services/supabase';
import { useAuthStore } from '@/shared/store';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  continueAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const {
    user,
    session,
    isLoading,
    isAuthenticated,
    setUser,
    setSession,
    setLoading,
    signOut: clearAuth
  } = useAuthStore();

  useEffect(() => {
    // Skip Supabase session check if user is already authenticated (guest mode)
    // Guest users have id 'guest-user' and don't have a Supabase session
    if (user?.id === 'guest-user') {
      setLoading(false);
      return;
    }

    // Get initial session for real users
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [user, setSession, setLoading]);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    clearAuth();
  };

  const continueAsGuest = () => {
    // Create a mock user for demo/testing purposes
    const mockUser = {
      id: 'guest-user',
      email: 'guest@taskflow.demo',
      app_metadata: {},
      user_metadata: { name: 'Guest User' },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    } as User;
    setUser(mockUser);
    setLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isAuthenticated,
        signIn,
        signUp,
        signOut,
        continueAsGuest,
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
