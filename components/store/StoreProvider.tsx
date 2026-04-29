'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase/client';
import type { UserProfile } from '@/stores/types';

/**
 * Provider component to sync Supabase auth with Zustand auth store
 * Add this to your root layout
 */
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((state) => state.setUser);
  const setProfile = useAuthStore((state) => state.setProfile);
  const setLoading = useAuthStore((state) => state.setLoading);

  /**
   * Fetch profile from public.profiles table (Source of Truth)
   * This replaces any reliance on auth.users.user_metadata
   */
  const fetchProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile from profiles table:', error);
        return null;
      }

      if (!data) {
        console.warn(`Profile not found for user ${userId}. Trigger should create it automatically.`);
        return null;
      }

      return data as UserProfile;
    } catch (error) {
      console.error('Unexpected error fetching profile:', error);
      return null;
    }
  };

  useEffect(() => {
    // Get initial session and profile
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Fetch profile data
        const profile = await fetchProfile(session.user.id);
        if (profile) {
          setProfile(profile);
        }
      } else {
        setProfile(null);
      }
      
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Fetch profile data when auth state changes
        const profile = await fetchProfile(session.user.id);
        if (profile) {
          setProfile(profile);
        } else {
          // If profile doesn't exist, wait a bit and try again
          // (in case the database trigger is still processing)
          setTimeout(async () => {
            const retryProfile = await fetchProfile(session.user.id);
            if (retryProfile) {
              setProfile(retryProfile);
            }
          }, 1000);
        }
      } else {
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setProfile, setLoading]);

  return <>{children}</>;
}

