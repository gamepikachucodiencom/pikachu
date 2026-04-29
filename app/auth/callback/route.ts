import { createServerClient, CookieOptions } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const DEFAULT_REDIRECT_PATH = '/';

const resolveSafeNextPath = (nextPath: string | null): string => {
  if (!nextPath) return DEFAULT_REDIRECT_PATH;
  if (!nextPath.startsWith('/')) return DEFAULT_REDIRECT_PATH;
  if (nextPath.startsWith('//')) return DEFAULT_REDIRECT_PATH;

  return nextPath;
};

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;
  const nextPath = resolveSafeNextPath(requestUrl.searchParams.get('next'));

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
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
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Error exchanging code for session:', error);
      return NextResponse.redirect(`${origin}/dang-nhap?error=auth_failed`);
    }

    // Create profile if new user
    if (data?.user) {
      try {
        const { data: existingProfile, error: profileCheckError } =
          await supabase
            .from('profiles')
            .select('id')
            .eq('id', data.user.id)
            .single();

        if (profileCheckError && profileCheckError.code !== 'PGRST116') {
          // PGRST116 is "not found" error, which is expected for new users
          console.error('Error checking profile:', profileCheckError);
        }

        // Profile should be auto-created by database trigger (handle_new_user)
        // This is just a safety check - if trigger failed, wait a bit and retry
        if (!existingProfile) {
          console.warn(
            'Profile not found immediately after user creation. Trigger should create it.'
          );
          // Wait a moment for trigger to complete, then check again
          await new Promise((resolve) => setTimeout(resolve, 500));

          const { data: retryProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', data.user.id)
            .single();

          if (!retryProfile) {
            console.error(
              'Profile still not found after retry. Trigger may have failed.'
            );
            // Don't fail auth flow - user can still log in, profile will be created on next login
          }
        }
      } catch (error) {
        console.error('Unexpected error in profile creation:', error);
        // Continue with auth flow even if profile creation fails
      }
    }
  }

  return NextResponse.redirect(`${origin}${nextPath}`);
}
