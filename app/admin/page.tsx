import AdminDashboard from '@/components/admin/AdminDashboard';

export default async function AdminPage() {
  return <AdminDashboard />;
}

// Force dynamic rendering to check auth on every request
export const dynamic = 'force-dynamic';
