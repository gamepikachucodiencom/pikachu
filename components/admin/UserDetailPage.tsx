'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast/ToastProvider';
import type { UserProfile } from '@/stores/types';
import styles from './UserDetailPage.module.css';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  currency: string;
  description: string;
  created_at: string;
}

interface UserDetail extends UserProfile {
  is_banned: boolean;
  created_at: string;
}

const typeLabel = (t: string) =>
  t === 'purchase' ? 'Mua' : t === 'deposit' ? 'Nạp' : 'Hoàn';

const typeBadgeClass = (t: string) =>
  t === 'purchase' ? styles.badgeRed : t === 'deposit' ? styles.badgeGreen : styles.badgeBlue;

export default function UserDetailPage({ userId }: { userId: string }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'transactions'>('profile');

  useEffect(() => {
    loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) throw userError;
      if (userData) setUser(userData as UserDetail);

      const { data: transData, error: transError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (transError) throw transError;
      if (transData) setTransactions(transData as Transaction[]);
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : 'Không thể tải thông tin người dùng';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBanToggle = async () => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_banned: !user.is_banned })
        .eq('id', userId);

      if (error) throw error;
      setUser({ ...user, is_banned: !user.is_banned });
      showToast(
        user.is_banned ? 'Đã mở khóa người dùng' : 'Đã khóa người dùng',
        'success'
      );
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : 'Không thể cập nhật trạng thái';
      showToast(msg, 'error');
    }
  };

  if (loading || !user) {
    return (
      <div className={styles.loadingWrap}>
        <p className={styles.loadingText}>Đang tải...</p>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <div className={styles.container}>
        <header className={styles.header}>
          <button
            type="button"
            className={styles.backBtn}
            onClick={() => router.push('/admin/users')}
          >
            ← Quay Lại
          </button>
          <h1 className={styles.title}>Chi Tiết Người Dùng</h1>
        </header>

        <div role="tablist" className={styles.tabList}>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'profile'}
            className={`${styles.tab} ${activeTab === 'profile' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Thông Tin
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'transactions'}
            className={`${styles.tab} ${activeTab === 'transactions' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('transactions')}
          >
            Giao Dịch
          </button>
        </div>

        {activeTab === 'profile' && (
          <section className={styles.panel} role="tabpanel">
            <div className={styles.card}>
              <div className={styles.profileList}>
                <div className={styles.profileRow}>
                  <span className={styles.profileLabel}>Username:</span>
                  <span className={styles.profileValue}>{user.username}</span>
                </div>
                <div className={styles.profileRow}>
                  <span className={styles.profileLabel}>Email:</span>
                  <span className={styles.profileValue}>{user.email}</span>
                </div>
                <div className={styles.profileRow}>
                  <span className={styles.profileLabel}>KNB:</span>
                  <span className={styles.profileValue}>{user.knb ?? 0}</span>
                </div>
                <div className={styles.profileRow}>
                  <span className={styles.profileLabel}>Điểm:</span>
                  <span className={styles.profileValue}>{user.rating || 1000}</span>
                </div>
                <div className={styles.profileRow}>
                  <span className={styles.profileLabel}>Thống Kê:</span>
                  <span className={styles.profileValue}>
                    Thắng: {user.wins} | Thua: {user.losses} | Hòa: {user.draws}
                  </span>
                </div>
                <div className={styles.profileRow}>
                  <span className={styles.profileLabel}>Trạng Thái:</span>
                  <span
                    className={`${styles.badge} ${
                      user.is_banned ? styles.badgeRed : styles.badgeGreen
                    }`}
                  >
                    {user.is_banned ? 'Đã Khóa' : 'Hoạt Động'}
                  </span>
                </div>
                <div className={styles.profileRow}>
                  <span className={styles.profileLabel}>Ngày Tạo:</span>
                  <span className={styles.profileValue}>
                    {new Date(user.created_at).toLocaleString('vi-VN')}
                  </span>
                </div>
                <button
                  type="button"
                  className={`${styles.banBtn} ${
                    user.is_banned ? styles.banBtnSuccess : styles.banBtnDanger
                  }`}
                  onClick={handleBanToggle}
                >
                  {user.is_banned ? 'Mở Khóa Người Dùng' : 'Khóa Người Dùng'}
                </button>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'transactions' && (
          <section className={styles.panel} role="tabpanel">
            <div className={styles.card}>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Loại</th>
                      <th>Số Lượng</th>
                      <th>Tiền Tệ</th>
                      <th>Mô Tả</th>
                      <th>Thời Gian</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((trans) => (
                      <tr key={trans.id}>
                        <td>
                          <span className={`${styles.badge} ${typeBadgeClass(trans.type)}`}>
                            {typeLabel(trans.type)}
                          </span>
                        </td>
                        <td>{Math.abs(trans.amount)}</td>
                        <td>KNB</td>
                        <td>{trans.description}</td>
                        <td>{new Date(trans.created_at).toLocaleString('vi-VN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
