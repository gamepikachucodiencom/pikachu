'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import BackToTop from '@/components/common/BackToTop';
import ThemeSidebar from '@/components/layout/ThemeSidebar';
import { themeSeoContent } from '@/lib/seoContent';
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

export default function HomePage({
  theme = 'pikachu-co-dien-2003',
}: HomePageProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Lấy data SEO từ file seoContent.ts dựa vào theme đang mở
  const seoData =
    themeSeoContent[theme] || themeSeoContent['pikachu-co-dien-2003'];

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

      {/* --- POPUP MENU TRÊN MOBILE --- */}
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

      {/* 📝 KHU VỰC 2: NỘI DUNG SEO CHUẨN (TỰ ĐỘNG LẤY TỪ DATA CỦA BÁC) */}
      <section
        className={styles.seoSection}
        style={{
          padding: '2rem 1rem',
          maxWidth: '1200px',
          margin: '0 auto',
          color: '#e2e8f0',
        }}
      >
        {/* Tiêu đề chính (H1) - Lấy từ introTitle */}
        <h1
          style={{
            color: '#fff',
            fontSize: '1.75rem',
            marginBottom: '1.5rem',
            textAlign: 'center',
            fontWeight: 'bold',
          }}
        >
          {seoData.introTitle}
        </h1>

        {/* Các đoạn văn giới thiệu - Lấy từ introParagraphs */}
        <div style={{ marginBottom: '2rem' }}>
          {seoData.introParagraphs.map((para, idx) => (
            <p
              key={idx}
              style={{
                marginBottom: '1rem',
                lineHeight: '1.7',
                textAlign: 'justify',
              }}
            >
              {para}
            </p>
          ))}
        </div>

        {/* Phần Hỏi Đáp - Lấy từ faqs */}
        {seoData.faqs && seoData.faqs.length > 0 && (
          <div style={{ marginTop: '3rem' }}>
            <h2
              style={{
                color: '#03A9F4',
                fontSize: '1.5rem',
                marginBottom: '1.5rem',
                borderBottom: '2px solid #334155',
                paddingBottom: '10px',
              }}
            >
              Câu Hỏi Thường Gặp
            </h2>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
              }}
            >
              {seoData.faqs.map((faq, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#1e293b',
                    padding: '1.5rem',
                    borderRadius: '8px',
                  }}
                >
                  <h3
                    style={{
                      color: '#FF9800',
                      fontSize: '1.1rem',
                      marginBottom: '0.75rem',
                    }}
                  >
                    {idx + 1}. {faq.question}
                  </h3>
                  <p style={{ lineHeight: '1.6', color: '#cbd5e1' }}>
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <BackToTop />
    </div>
  );
}
