import { unstable_cache } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import type { CustomPage, SiteSetting } from '@/types/cms';

/**
 * Server-side function to fetch global CSS from site_settings
 * Uses Next.js unstable_cache for 5-minute revalidation
 */
export async function getGlobalCss(): Promise<string | null> {
  // Early return if environment variables are not set
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  // Wrap everything in try-catch to handle any errors from unstable_cache
  try {
    // Use unstable_cache with 5-minute revalidation
    // Use anonymous client (no cookies) since this is public data
    const cachedFetch = unstable_cache(
      async () => {
        try {
          const supabase = createClient(supabaseUrl, supabaseAnonKey);

          const { data, error } = await supabase
            .from('site_settings')
            .select('value')
            .eq('key', 'global_css')
            .single();

          if (error) {
            // PGRST116 = no rows; PGRST205 = table not in schema cache; PGRST301 = relation does not exist
            // 42P01 is PostgreSQL error code for "relation does not exist"
            const isExpectedError =
              error.code === 'PGRST116' ||
              error.code === 'PGRST205' ||
              error.code === 'PGRST301' ||
              error.code === '42P01' ||
              error.message?.includes('No rows') ||
              error.message?.includes('does not exist') ||
              error.message?.includes('relation') ||
              error.message?.includes('schema cache') ||
              error.message?.includes('permission denied');

            if (isExpectedError) {
              // Table doesn't exist, no rows, or permission denied - this is fine, just return null
              return null;
            }

            // Only log unexpected errors in development
            if (process.env.NODE_ENV === 'development') {
              console.warn('[getGlobalCss] Unexpected error:', {
                code: error.code,
                message: error.message,
              });
            }
            return null;
          }

          return data?.value || null;
        } catch (fetchError) {
          // Catch any unexpected errors (network, serialization, etc.)
          // Silently return null - this is an optional feature
          return null;
        }
      },
      ['global-css'], // Cache key
      {
        revalidate: 300, // 5 minutes
        tags: ['global-css'], // Cache tag for manual invalidation
      }
    );

    // Call cached fetch and catch any errors from the cache system itself
    try {
      return await cachedFetch();
    } catch (cacheError) {
      // unstable_cache might throw errors during revalidation
      // Silently return null - this is an optional feature
      return null;
    }
  } catch (error) {
    // Top-level catch for any other errors
    // Silently return null - this is an optional feature
    return null;
  }
}

/**
 * Server-side function to fetch custom page by slug
 * Handles nested slugs by joining array with '/'
 *
 * @param slugArray - Array of slug segments from Next.js params (e.g., ['about', 'us'] -> 'about/us')
 * @returns CustomPage if found and published, null otherwise
 */
export async function getPageBySlug(
  slugArray: string[]
): Promise<CustomPage | null> {
  try {
    // Join slug array with '/' to handle nested pages
    // ['about'] -> 'about'
    // ['about', 'us'] -> 'about/us'
    const slug = slugArray.join('/');

    // Use anonymous client (no cookies) since this is public data
    // This avoids cookie access issues if this function is later cached
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase
      .from('custom_pages')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    if (error) {
      // PGRST116 = no rows; PGRST205 = table not in schema cache; PGRST301 = relation does not exist
      const isExpectedError =
        error.code === 'PGRST116' ||
        error.code === 'PGRST205' ||
        error.code === 'PGRST301' ||
        error.message?.includes('No rows') ||
        error.message?.includes('does not exist') ||
        error.message?.includes('schema cache');
      if (isExpectedError) {
        return null;
      }
      console.error('Error fetching custom page by slug:', {
        slug,
        error: error.message,
        code: error.code,
      });
      return null;
    }

    if (!data) {
      return null;
    }

    return data as CustomPage;
  } catch (error) {
    console.error('Error in getPageBySlug:', {
      slugArray,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}
