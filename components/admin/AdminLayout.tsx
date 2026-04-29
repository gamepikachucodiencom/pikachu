'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores';
import type { User } from '@supabase/supabase-js';
import {
  IconUsers,
  IconBookOpen,
  IconLogout,
  IconChess,
} from '@/components/icons';
import styles from './AdminLayout.module.css';

interface AdminLayoutProps {
  children: React.ReactNode;
  user: User | null;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const navItems: NavItem[] = [
  { href: '/admin', label: 'Tổng Quan', icon: IconChess },
  { href: '/admin/users', label: 'Người Dùng', icon: IconUsers },
  { href: '/admin/blog', label: 'Bài Viết', icon: IconBookOpen },
  { href: '/admin/transactions', label: 'Giao Dịch', icon: IconChess },
];

export default function AdminLayout({ children, user }: AdminLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  const handleSignOut = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    try {
      await logout(); // This clears Supabase AND the persisted Zustand store
      window.location.href = '/'; // Hard reload to clear any remaining memory state
    } catch (error) {
      console.error('Error signing out:', error);
      window.location.href = '/';
    }
  };

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  const isExpanded = sidebarExpanded;

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className={styles.root}>
      {/* Overlay - click to close (Scenario A: siblings) */}
      {sidebarOpen && (
        <div
          className={styles.overlay}
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      <aside
        className={`${styles.sidebar} ${
          sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed
        } ${isExpanded ? styles.sidebarExpanded : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.sidebarHeader}>
          {isExpanded && <h1 className={styles.sidebarTitle}>Admin Panel</h1>}
          <button
            type="button"
            onClick={() =>
              isDesktop
                ? setSidebarExpanded(!sidebarExpanded)
                : setSidebarOpen(!sidebarOpen)
            }
            className={styles.sidebarToggle}
            aria-label="Toggle sidebar"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isExpanded ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        <nav className={styles.nav}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navLink} ${active ? styles.navLinkActive : ''}`}
              >
                <Icon size={20} className={styles.navIcon} />
                {isExpanded && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          {isExpanded && user && (
            <div className={styles.userEmail}>{user.email}</div>
          )}
          <button
            type="button"
            onClick={(e) => handleSignOut(e)}
            className={styles.logoutBtn}
          >
            <IconLogout size={20} className={styles.navIcon} />
            {isExpanded && <span>Đăng Xuất</span>}
          </button>
        </div>
      </aside>

      <div className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerInner}>
            <h2 className={styles.headerTitle}>
              {navItems.find((i) => isActive(i.href))?.label || 'Admin'}
            </h2>
            <div className={styles.headerActions}>
              <button
                type="button"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={styles.mobileMenuBtn}
                aria-label="Toggle sidebar"
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
