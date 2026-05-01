'use client';

import { ReactNode, useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import { useUIStore } from '@/stores/uiStore';
import styles from './AppLayout.module.css';
import Footer from './Footer';

/** Những trang muốn hiển thị full chiều ngang màn hình (Immersive) */
const IMMERSIVE_PAGES = ['/'];

export default function AppShell({ children }: { children: ReactNode }) {
  const pathnameFromRouter = usePathname();
  const [pathnameFromWindow, setPathnameFromWindow] = useState<string | null>(
    () => (typeof window !== 'undefined' ? window.location.pathname : null)
  );

  useEffect(() => {
    setPathnameFromWindow(
      typeof window !== 'undefined' ? window.location.pathname : null
    );
  }, [pathnameFromRouter]);

  const pathname = pathnameFromRouter || pathnameFromWindow || '';

  const contentClassName = useMemo(() => {
    const shouldBeFullWidth = pathname
      ? IMMERSIVE_PAGES.some(
          (page) => pathname === page || pathname.startsWith(page + '/')
        )
      : false;

    return shouldBeFullWidth ? styles.fullWidthContent : styles.content;
  }, [pathname]);

  const setSoundMuted = useUIStore((s) => s.setSoundMuted);

  // Khôi phục cài đặt âm thanh từ LocalStorage
  useEffect(() => {
    const stored = localStorage.getItem('game_sounds_muted');
    if (stored === 'true') setSoundMuted(true);
  }, [setSoundMuted]);

  return (
    <div className={styles.appLayout}>
      <Navbar />
      <div className={contentClassName}>{children}</div>
      <Footer />
    </div>
  );
}
