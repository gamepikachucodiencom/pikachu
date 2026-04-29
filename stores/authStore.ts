import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile } from './types';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';

interface AuthStore {
  user: User | null; // From auth.users - strictly for authentication
  profile: UserProfile | null; // From public.profiles - Source of Truth for user data
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  updateKnb: (knb: number) => void;
  refreshProfile: () => Promise<void>; // Re-fetch profile from database
  logout: () => Promise<void>;
}

const initialProfile: UserProfile = {
  id: '',
  username: '',
  elo_rating: 1200,
  wins: 0,
  losses: 0,
  draws: 0,
  current_theme_id: 'default',
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      setProfile: (profile) =>
        set({
          profile: profile || initialProfile,
        }),

      setLoading: (loading) => set({ isLoading: loading }),

      updateProfile: (updates) =>
        set((state) => ({
          profile: state.profile
            ? { ...state.profile, ...updates }
            : { ...initialProfile, ...updates },
        })),

      updateKnb: (knb) =>
        set((state) => {
          if (!state.profile) return state;
          return {
            profile: {
              ...state.profile,
              knb,
            },
          };
        }),

      // Refresh profile from database (Source of Truth)
      refreshProfile: async () => {
        const state = get();
        if (!state.user?.id) {
          console.warn('Cannot refresh profile: no user ID');
          return;
        }

        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', state.user.id)
            .single();

          if (error) {
            console.error('Error refreshing profile:', error);
            return;
          }

          if (data) {
            set({ profile: data as UserProfile });
          }
        } catch (error) {
          console.error('Unexpected error refreshing profile:', error);
        }
      },

      logout: async () => {
        try {
          // Sign out from Supabase first
          const { error } = await supabase.auth.signOut();
          if (error) {
            console.error('[AuthStore] Error signing out:', error);
          }
        } catch (error) {
          console.error('[AuthStore] Unexpected error during sign out:', error);
        } finally {
          // Always clear the store, even if signOut fails
          set({
            user: null,
            profile: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },
    }),
    {
      name: 'chinese-chess-auth-storage',
      partialize: (state) => ({
        // Only persist profile, not sensitive user data
        profile: state.profile,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

