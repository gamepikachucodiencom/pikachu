import { createServerClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';

/**
 * Check if the current request is from an allowed IP address
 * In production, this restricts admin access to localhost/local network
 */
async function isAllowedIP(): Promise<boolean> {
  // In development, allow all
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  // Get allowed IPs from environment (comma-separated)
  const allowedIPs = process.env.ADMIN_ALLOWED_IPS?.split(',') || [
    '127.0.0.1',
    '::1',
  ];

  // Get client IP from headers
  const headersList = await headers();
  const forwardedFor = headersList.get('x-forwarded-for');
  const realIP = headersList.get('x-real-ip');
  const clientIP = forwardedFor?.split(',')[0] || realIP || 'unknown';

  // Check if IP is allowed
  return allowedIPs.some((ip) => clientIP.includes(ip.trim()));
}

/**
 * Check if user is an admin
 * You can customize this based on your Supabase user metadata or a separate admin table
 * @returns Object with isAdmin boolean and user object (or null if no user)
 */
async function isAdminUser(): Promise<{
  isAdmin: boolean;
  user: any | null;
}> {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      return { isAdmin: false, user: null };
    }

    if (!user) {
      return { isAdmin: false, user: null };
    }

    // Option 1: Check user metadata for admin role
    const isAdminByMetadata =
      user.user_metadata?.role === 'admin' ||
      user.user_metadata?.isAdmin === true;

    // Option 2: Check against environment variable (comma-separated admin emails)
    const adminEmailsRaw = process.env.ADMIN_EMAILS || '';
    const adminEmails = adminEmailsRaw
      .split(',')
      .map((e) => e.trim())
      .filter(Boolean);

    const isAdminByEmail = adminEmails.includes(user.email || '');

    const isAdmin = isAdminByMetadata || isAdminByEmail;

    return { isAdmin, user };
  } catch (error) {
    console.error('[Admin Auth] Error checking admin status:', error);
    if (error instanceof Error) {
      console.error('[Admin Auth] Error stack:', error.stack);
    }
    return { isAdmin: false, user: null };
  }
}

/**
 * Verify admin access - admins can access from any IP
 * IP restrictions only apply to non-admin users
 * @returns Object with authorized boolean, reason, and hasUser boolean to distinguish between "no user" and "user but not admin"
 */
export async function verifyAdminAccess(): Promise<{
  authorized: boolean;
  reason?: string;
  hasUser?: boolean; // true if user is authenticated, false if not
}> {
  // Check user authentication and admin status first
  const { isAdmin, user } = await isAdminUser();

  // If user is an admin, allow access from any IP
  if (isAdmin) {
    return { authorized: true, hasUser: true };
  }

  // Distinguish between "no user" and "user but not admin"
  const hasUser = !!user;

  // For non-admin users, check IP restrictions (optional security layer)
  // In development, allow all IPs
  if (process.env.NODE_ENV === 'development') {
    return {
      authorized: false,
      reason: hasUser ? 'User is not an admin' : 'User is not authenticated',
      hasUser,
    };
  }

  // In production, check IP only for non-admin users
  if (!(await isAllowedIP())) {
    return {
      authorized: false,
      reason: 'IP address not allowed',
      hasUser,
    };
  }

  return {
    authorized: false,
    reason: hasUser ? 'User is not an admin' : 'User is not authenticated',
    hasUser,
  };
}
