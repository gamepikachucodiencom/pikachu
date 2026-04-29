import { Metadata } from 'next';
import TransactionLogsPage from '@/components/admin/TransactionLogsPage';

export const metadata: Metadata = {
  title: 'Nhật Ký Giao Dịch | Admin',
  description: 'Xem tất cả giao dịch',
};

export default async function AdminTransactionsPage() {
  return <TransactionLogsPage />;
}

export const dynamic = 'force-dynamic';

