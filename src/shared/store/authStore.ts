import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      isLoading: true,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setSession: (session) => set({
        session,
        user: session?.user ?? null,
        isAuthenticated: !!session
      }),
      setLoading: (isLoading) => set({ isLoading }),
      signOut: () => set({
        user: null,
        session: null,
        isAuthenticated: false
      }),
    }),
    {
      name: 'taskflow-auth',
      partialize: (state) => ({
        // Only persist minimal auth state
        isAuthenticated: state.isAuthenticated
      }),
    }
  )
);
