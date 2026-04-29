import { Metadata } from 'next';
import UserDetailPage from '@/components/admin/UserDetailPage';

export const metadata: Metadata = {
  title: 'Chi Tiết Người Dùng | Admin',
  description: 'Chi tiết thông tin người dùng',
};

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <UserDetailPage userId={id} />;
}

export const dynamic = 'force-dynamic';

