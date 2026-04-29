import { Metadata } from 'next';
import UserListPage from '@/components/admin/UserListPage';

export const metadata: Metadata = {
  title: 'Quản Lý Người Dùng | Admin',
  description: 'Quản lý danh sách người dùng',
};

export default async function AdminUsersPage() {
  return <UserListPage />;
}

export const dynamic = 'force-dynamic';

