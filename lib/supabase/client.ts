import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Use createBrowserClient from @supabase/ssr to ensure cookies are properly set
// This allows the server-side code to read the authentication session
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
