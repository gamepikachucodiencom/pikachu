'use client';
import Link from 'next/link';

import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { getPageMetadata } from '@/lib/seo/metadata';
import styles from './HeroSection.module.css';

export default function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null);
  const meta = getPageMetadata('/');

  useEffect(() => {
    let retryTimeout: NodeJS.Timeout | null = null;
    let fallbackTimeout: NodeJS.Timeout | null = null;
    let initTimeout: NodeJS.Timeout | null = null;

    const animateHero = () => {
      if (!heroRef.current) return;

      const children = Array.from(heroRef.current.children) as HTMLElement[];

      if (children.length === 0) {
        retryTimeout = setTimeout(animateHero, 100);
        return;
      }

      children.forEach((child) => {
        child.style.opacity = '1';
        child.style.visibility = 'visible';
      });

      try {
        gsap.fromTo(
          children,
          { y: 20, opacity: 0, visibility: 'hidden' },
          {
            y: 0,
            opacity: 1,
            visibility: 'visible',
            duration: 0.8,
            stagger: 0.1,
            ease: 'power2.out',
            onComplete: () => {
              children.forEach((child) => {
                child.style.removeProperty('opacity');
                child.style.removeProperty('visibility');
                child.style.removeProperty('transform');
              });
            },
          }
        );
      } catch (error) {
        console.warn('GSAP animation failed, ensuring hero visibility:', error);
        children.forEach((child) => {
          child.style.opacity = '1';
          child.style.visibility = 'visible';
          child.style.transform = 'translateY(0)';
        });
      }

      fallbackTimeout = setTimeout(() => {
        children.forEach((child) => {
          child.style.opacity = '1';
          child.style.visibility = 'visible';
          child.style.transform = 'translateY(0)';
        });
      }, 1500);
    };

    initTimeout = setTimeout(animateHero, 50);

    return () => {
      if (retryTimeout) clearTimeout(retryTimeout);
      if (fallbackTimeout) clearTimeout(fallbackTimeout);
      if (initTimeout) clearTimeout(initTimeout);
    };
  }, []);

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.hero}>
          <div className={styles.heroGlow} />
          <div className={styles.heroContent} ref={heroRef}>
            {/* Tiêu đề và Mô tả được kéo tự động từ file SEO */}
            <h1 className={styles.heroTitle}>{meta.h1}</h1>
            <p className={styles.heroDescription}>{meta.description}</p>

            {/* --- KHỐI ĐIỀU HƯỚNG MỚI DÀNH CHO PIKACHU --- */}
            <div className={styles.heroGameModes}>
              {/* Nút 1: Chơi Ngay (Trỏ thẳng vào bàn game) */}
              <Link
                href="/choi-game"
                className={`${styles.modeCard} ${styles.cardPikachu}`}
              >
                <div className={styles.modeImage}>
                  {/* Bác nhớ up ảnh con Pikachu xịn xò vào đường dẫn này */}
                  <img src="/assets/web/1.jpg" alt="Chơi Game Pikachu" />
                </div>
                <div className={styles.modeContent}>
                  <h3 className={styles.modeTitle}>Chơi Ngay (Bản 2003)</h3>
                </div>
              </Link>

              {/* Nút 2: Bảng Xếp Hạng (Kích thích đua top) */}
              <Link
                href="/bang-xep-hang"
                className={`${styles.modeCard} ${styles.cardCoup}`}
              >
                <div className={styles.modeImage}>
                  {/* Kiếm cái icon cúp vàng thả vào đây */}
                  <img
                    src="/assets/web/icon-trophy.webp"
                    alt="Đua Top Pikachu"
                  />
                </div>
                <div className={styles.modeContent}>
                  <h3 className={styles.modeTitle}>Đua Top Xếp Hạng</h3>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
