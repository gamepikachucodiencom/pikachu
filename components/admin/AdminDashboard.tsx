'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { IconAlertTriangle } from '@/components/icons';
import styles from './AdminDashboard.module.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalGames: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setStats({
        totalUsers: 0,
        activeUsers: 0,
        totalGames: 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingText}>Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className={styles.root}>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <h3 className={styles.statLabel}>Total Users</h3>
            <p className={styles.statValue}>{stats.totalUsers}</p>
          </div>
          <div className={styles.statCard}>
            <h3 className={styles.statLabel}>Active Users</h3>
            <p className={styles.statValue}>{stats.activeUsers}</p>
          </div>
          <div className={styles.statCard}>
            <h3 className={styles.statLabel}>Total Games</h3>
            <p className={styles.statValue}>{stats.totalGames}</p>
          </div>
        </div>

        <div className={styles.actionsCard}>
          <h2 className={styles.actionsTitle}>Admin Actions</h2>
          <div className={styles.actionsList}>
            <div className={styles.actionItem}>
              <h3 className={styles.actionItemTitle}>User Management</h3>
              <p className={styles.actionItemDesc}>
                Manage users, roles, and permissions
              </p>
              <a href="/admin/users" className={styles.actionLink}>
                Manage Users
              </a>
            </div>
            <div className={styles.actionItem}>
              <h3 className={styles.actionItemTitle}>Blog Management</h3>
              <p className={styles.actionItemDesc}>
                Create, edit, and manage blog articles
              </p>
              <a href="/admin/blog" className={styles.actionLink}>
                Manage Blog
              </a>
            </div>
            <div className={styles.actionItem}>
              <h3 className={styles.actionItemTitle}>Game Statistics</h3>
              <p className={styles.actionItemDesc}>
                View game analytics and statistics
              </p>
              <button className={styles.actionButton} type="button">
                View Statistics
              </button>
            </div>
            <div className={styles.actionItem}>
              <h3 className={styles.actionItemTitle}>System Settings</h3>
              <p className={styles.actionItemDesc}>
                Configure system-wide settings
              </p>
              <button className={styles.actionButton} type="button">
                Settings
              </button>
            </div>
          </div>
        </div>

        <div className={styles.notice}>
          <div className={styles.noticeInner}>
            <div className={styles.noticeIcon}>
              <IconAlertTriangle size={20} style={{ color: '#f59e0b' }} />
            </div>
            <div>
              <h3 className={styles.noticeTitle}>Security Notice</h3>
              <p className={styles.noticeText}>
                This admin panel is protected and only accessible to authorized
                administrators from allowed IP addresses. Access is logged for
                security purposes.
              </p>
            </div>
          </div>
        </div>
    </div>
  );
}
