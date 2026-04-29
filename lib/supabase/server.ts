import {
  CookieOptions,
  createServerClient as createSupabaseServerClient,
} from '@supabase/ssr';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export async function createServerClient() {
  const cookieStore = await cookies();
  
  // In Next.js 16, we need to ensure cookies are read correctly
  // The cookie store can only be read once per request, so we capture it
  // But Supabase needs to read cookies multiple times (for session refresh),
  // so we need to make sure getAll() can be called multiple times
  // We'll read all cookies once and cache them, but this might break session refresh
  // Actually, let's try a different approach - ensure the store is properly awaited
  
  return createSupabaseServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        // Return cookies from the awaited cookie store
        // In Next.js 16, this should work as long as we don't consume the store elsewhere
        try {
          return cookieStore.getAll();
        } catch (error) {
          // If cookies have been consumed, return empty array
          // This shouldn't happen, but handle it gracefully
          if (process.env.NODE_ENV === 'development') {
            console.error('[Supabase Server] Error reading cookies:', error);
          }
          return [];
        }
      },
      setAll(
        cookiesToSet: Array<{
          name: string;
          value: string;
          options?: CookieOptions;
        }>
      ) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch (error) {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
          // In Next.js 16, this is expected behavior for Server Components
        }
      },
    },
  });
}
