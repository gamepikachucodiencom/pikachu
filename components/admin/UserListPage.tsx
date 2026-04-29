'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast/ToastProvider';
import type { UserProfile } from '@/stores/types';
import styles from './UserListPage.module.css';

interface UserWithBan extends UserProfile {
  is_banned: boolean;
  created_at: string;
}

export default function UserListPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [users, setUsers] = useState<UserWithBan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setUsers(data as UserWithBan[]);
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : 'Không thể tải danh sách người dùng';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBanToggle = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_banned: !currentStatus })
        .eq('id', userId);

      if (error) throw error;

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, is_banned: !currentStatus } : u
        )
      );
      showToast(
        currentStatus ? 'Đã mở khóa người dùng' : 'Đã khóa người dùng',
        'success'
      );
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : 'Không thể cập nhật trạng thái';
      showToast(msg, 'error');
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.root}>
      <div className={styles.container}>
        <h1 className={styles.title}>Quản Lý Người Dùng</h1>

        <div className={styles.searchRow}>
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className={styles.loadingWrap}>
            <div className={styles.spinner} />
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>KNB</th>
                  <th>Thắng/Thua/Hòa</th>
                  <th>Trạng Thái</th>
                  <th>Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className={styles.emptyCell}>
                      Không có người dùng nào
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>{user.username || 'N/A'}</td>
                      <td>{user.email || 'N/A'}</td>
                      <td>{user.knb ?? 0}</td>
                      <td>
                        {user.wins ?? 0}/{user.losses ?? 0}/{user.draws ?? 0}
                      </td>
                      <td>
                        <span
                          className={`${styles.badge} ${
                            user.is_banned ? styles.badgeRed : styles.badgeGreen
                          }`}
                        >
                          {user.is_banned ? 'Đã Khóa' : 'Hoạt Động'}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <button
                            type="button"
                            className={`${styles.btn} ${styles.btnLight}`}
                            onClick={() => router.push(`/admin/users/${user.id}`)}
                          >
                            Chi Tiết
                          </button>
                          <button
                            type="button"
                            className={`${styles.btn} ${
                              user.is_banned ? styles.btnSuccess : styles.btnDanger
                            }`}
                            onClick={() => handleBanToggle(user.id, user.is_banned)}
                          >
                            {user.is_banned ? 'Mở Khóa' : 'Khóa'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
