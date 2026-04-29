import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const pathname = request.nextUrl.pathname;
  
  // Only run session refresh on admin routes to avoid blocking the entire site
  if (pathname.startsWith('/admin')) {
    try {
      // Add a timeout to prevent infinite loading
      const timeoutPromise = new Promise<NextResponse>((resolve) => {
        setTimeout(() => resolve(NextResponse.next()), 3000); // 3 second timeout
      });

      const sessionPromise = updateSession(request);
      return await Promise.race([sessionPromise, timeoutPromise]);
    } catch (error) {
      // If proxy fails, continue without session refresh
      if (process.env.NODE_ENV === 'development') {
        console.error('[Proxy] Error updating session:', error);
      }
      return NextResponse.next();
    }
  }

  // For all other routes, just pass through
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Only match admin routes to minimize impact
    '/admin/:path*',
  ],
};

