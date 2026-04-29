import { redirect } from 'next/navigation';
import { verifyAdminAccess } from '@/lib/admin/auth';
import { createServerClient } from '@/lib/supabase/server';
import AdminLayout from '@/components/admin/AdminLayout';

export default async function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verify admin access
  const { authorized, reason, hasUser } = await verifyAdminAccess();

  if (!authorized) {
    // If user is not authenticated, redirect to homepage
    if (!hasUser) {
      redirect('/');
    }

    // If user is authenticated but not an admin, return 404
    redirect('/404');
  }

  // Get user info for display
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <AdminLayout user={user}>{children}</AdminLayout>;
}

// Force dynamic rendering to check auth on every request
export const dynamic = 'force-dynamic';

