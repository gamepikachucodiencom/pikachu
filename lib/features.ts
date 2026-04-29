/**
 * Feature Flag System
 *
 * Controls feature visibility and access via Environment Variables.
 * Safe for both Client and Server Components.
 */

import { redirect } from 'next/navigation';

/**
 * Feature keys that can be toggled via environment variables
 */
export type FeatureKey =
  | 'SHOP'
  | 'RANKING'
  | 'MULTIPLAYER'
  | 'AI_MODE'
  | 'BLOG';

/**
 * Feature configuration mapping feature keys to environment variable names
 */
const FEATURE_CONFIG: Record<FeatureKey, string> = {
  SHOP: 'NEXT_PUBLIC_ENABLE_SHOP',
  RANKING: 'NEXT_PUBLIC_ENABLE_RANKING',
  MULTIPLAYER: 'NEXT_PUBLIC_ENABLE_MULTIPLAYER',
  AI_MODE: 'NEXT_PUBLIC_ENABLE_AI',
  BLOG: 'NEXT_PUBLIC_ENABLE_BLOG',
} as const;

/**
 * Get environment variable value with fallbacks
 * In Next.js, NEXT_PUBLIC_ vars are embedded at build time
 * This function uses direct property access (same pattern that works in Navbar)
 */
function getEnvValue(varName: string): string | undefined {
  if (typeof process === 'undefined' || !process.env) {
    return undefined;
  }

  // Use direct property access for known NEXT_PUBLIC vars (same pattern that works in Navbar)
  // This avoids issues with bracket notation in certain contexts
  switch (varName) {
    case 'NEXT_PUBLIC_ENABLE_BLOG':
      return process.env.NEXT_PUBLIC_ENABLE_BLOG;
    case 'NEXT_PUBLIC_ENABLE_SHOP':
      return process.env.NEXT_PUBLIC_ENABLE_SHOP;
    case 'NEXT_PUBLIC_ENABLE_RANKING':
      return process.env.NEXT_PUBLIC_ENABLE_RANKING;
    case 'NEXT_PUBLIC_ENABLE_MULTIPLAYER':
      return process.env.NEXT_PUBLIC_ENABLE_MULTIPLAYER;
    case 'NEXT_PUBLIC_ENABLE_AI':
      return process.env.NEXT_PUBLIC_ENABLE_AI;
    default:
      // Fallback: Try bracket notation for unknown vars
      return process.env[varName];
  }
}

/**
 * Check if a feature is enabled
 *
 * Safe for both Client and Server Components.
 * Returns `true` if the environment variable is set to 'true' (case-insensitive).
 *
 * @param key - The feature key to check
 * @returns `true` if feature is enabled, `false` otherwise
 */
export function isFeatureEnabled(key: FeatureKey): boolean {
  const envVarName = FEATURE_CONFIG[key];
  const envValue = getEnvValue(envVarName);

  if (!envValue) {
    return false;
  }

  const normalizedValue = String(envValue)
    .trim()
    .replace(/^["']|["']$/g, '')
    .toLowerCase();
  return normalizedValue === 'true';
}

/**
 * Require a feature to be enabled (Server Component Only)
 *
 * Throws a redirect if the feature is disabled.
 * This function MUST be called at the top level of a Server Component.
 *
 * IMPORTANT: This function is SERVER-ONLY. Do not use in Client Components.
 * The `redirect` function from Next.js throws a special error that Next.js
 * catches to perform the redirect.
 *
 * @param key - The feature key to require
 * @param redirectPath - Optional redirect path (defaults to '/')
 * @throws {never} - Always throws a redirect, never returns
 *
 * @example
 * ```tsx
 * // In app/(pages)/shop/page.tsx (Server Component)
 * export default function ShopPage() {
 *   requireFeature('SHOP'); // Redirects to '/' if disabled
 *   return <ShopContent />;
 * }
 * ```
 */
export function requireFeature(
  key: FeatureKey,
  redirectPath: string = '/'
): never {
  const isEnabled = isFeatureEnabled(key);

  if (!isEnabled) {
    // redirect() throws a special error that Next.js catches
    // We need to ensure it actually throws
    const redirectResult = redirect(redirectPath);
    // If redirect() somehow returns (it shouldn't), throw an error
    throw new Error(
      `Feature ${key} is disabled. Redirect failed. This should never happen.`
    );
  }

  // Feature is enabled, continue normally
  // This return statement should never be reached due to TypeScript's never type
  // but we include it for clarity
  return undefined as never;
}

/**
 * Get all feature states as an object
 * Useful for debugging or feature status pages
 */
export function getAllFeatureStates(): Record<FeatureKey, boolean> {
  return {
    SHOP: isFeatureEnabled('SHOP'),
    RANKING: isFeatureEnabled('RANKING'),
    MULTIPLAYER: isFeatureEnabled('MULTIPLAYER'),
    AI_MODE: isFeatureEnabled('AI_MODE'),
    BLOG: isFeatureEnabled('BLOG'),
  };
}
