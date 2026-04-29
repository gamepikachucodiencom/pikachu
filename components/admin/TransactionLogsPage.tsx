'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast/ToastProvider';
import styles from './TransactionLogsPage.module.css';

interface Transaction {
  id: string;
  user_id: string;
  username?: string;
  email?: string;
  type: string;
  amount: number;
  currency: string;
  description: string;
  created_at: string;
}

export default function TransactionLogsPage() {
  const { showToast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`*, profiles:user_id (username, email)`)
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) throw error;

      if (data) {
        const formatted = data.map(
          (t: {
            id: string;
            user_id: string;
            type: string;
            amount: number;
            currency: string;
            description: string;
            created_at: string;
            profiles?: { username?: string; email?: string } | null;
          }) => ({
            ...t,
            username: t.profiles?.username,
            email: t.profiles?.email,
          })
        );
        setTransactions(formatted as Transaction[]);
      }
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : 'Không thể tải nhật ký giao dịch';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const filtered = transactions.filter((t) => {
    const matchSearch =
      t.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = typeFilter ? t.type === typeFilter : true;
    return matchSearch && matchType;
  });

  const typeLabel = (t: string) =>
    t === 'purchase' ? 'Mua' : t === 'deposit' ? 'Nạp' : 'Hoàn';
  const badgeClass = (t: string) =>
    t === 'purchase' ? styles.badgeRed : t === 'deposit' ? styles.badgeGreen : styles.badgeBlue;

  return (
    <div className={styles.root}>
      <div className={styles.container}>
        <h1 className={styles.title}>Nhật Ký Giao Dịch</h1>

        <div className={styles.filters}>
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Tìm kiếm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className={styles.select}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">Tất cả loại</option>
            <option value="purchase">Mua</option>
            <option value="deposit">Nạp</option>
            <option value="refund">Hoàn</option>
          </select>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Thời Gian</th>
                <th>Người Dùng</th>
                <th>Loại</th>
                <th>Số Lượng</th>
                <th>Tiền Tệ</th>
                <th>Mô Tả</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((trans) => (
                <tr key={trans.id}>
                  <td>{new Date(trans.created_at).toLocaleString('vi-VN')}</td>
                  <td>
                    <div className={styles.userCell}>
                      <div>{trans.username || 'N/A'}</div>
                      <div className={styles.userEmail}>{trans.email}</div>
                    </div>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${badgeClass(trans.type)}`}>
                      {typeLabel(trans.type)}
                    </span>
                  </td>
                  <td>{Math.abs(trans.amount)}</td>
                  <td>KNB</td>
                  <td>{trans.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
