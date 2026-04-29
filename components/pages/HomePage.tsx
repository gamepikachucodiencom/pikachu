'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import BackToTop from '@/components/common/BackToTop';
import FAQSection from '@/components/features/landing/FAQSection';
import IntroSection from '@/components/features/landing/IntroSection';
import ThemeSidebar from '@/components/layout/ThemeSidebar';
import styles from './HomePage.module.css';

const PikachuBoard = dynamic(() => import('@/components/game/PikachuBoard'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        color: '#FF9800',
        padding: '50px',
        textAlign: 'center',
        fontWeight: 'bold',
      }}
    >
      Đang nạp Game Pikachu...
    </div>
  ),
});

interface HomePageProps {
  theme?: string;
}

// BƯỚC QUYẾT ĐỊNH NẰM Ở ĐÂY: Đổi mặc định thành 'pikachu-co-dien-2003'
export default function HomePage({
  theme = 'pikachu-co-dien-2003',
}: HomePageProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className={styles.container}>
      {/* 🎮 KHU VỰC 1: DASHBOARD CHƠI GAME */}
      <section className={styles.dashboardSection}>
        <div className={styles.dashboardGrid}>
          <div className={styles.sideColumn}>
            <ThemeSidebar startIdx={0} endIdx={4} />
          </div>

          <div className={styles.gameArea}>
            <div className={styles.boardWrapper}>
              {/* TRUYỀN LỆNH MỞ MENU VÀO BÊN TRONG BÀN GAME */}
              <PikachuBoard
                theme={theme}
                onOpenMenu={() => setIsMobileMenuOpen(true)}
              />
            </div>
          </div>

          <div className={styles.sideColumn}>
            <ThemeSidebar startIdx={4} endIdx={8} />
          </div>
        </div>
      </section>

      {/* --- POPUP MENU TRÊN MOBILE (VẪN GIỮ NGUYÊN) --- */}
      {isMobileMenuOpen && (
        <div
          className={styles.mobileDrawerOverlay}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className={styles.mobileDrawerContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.closeMenuBtn}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              X
            </button>
            <h3
              style={{
                marginTop: 0,
                color: '#03A9F4',
                textAlign: 'center',
                marginBottom: '20px',
              }}
            >
              Chọn Game Khác
            </h3>
            <ThemeSidebar startIdx={0} endIdx={8} />
          </div>
        </div>
      )}

      {/* 📝 KHU VỰC 2: NỘI DUNG SEO */}
      <section className={styles.seoSection}>
        <IntroSection theme={theme} />
        <FAQSection theme={theme} />
      </section>

      <BackToTop />
    </div>
  );
}
