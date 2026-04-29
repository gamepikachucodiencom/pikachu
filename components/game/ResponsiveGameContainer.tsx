'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './ResponsiveGameContainer.module.css';

interface ResponsiveGameContainerProps {
  children: React.ReactNode;
  aspect: number; // width / height ratio (e.g., 1836 / 2000 = 0.918)
  className?: string;
  /** When true, fill parent (100% size) so board fits without cropping. Use when parent already has a defined size (e.g. PlayWithAIPage). */
  fillParent?: boolean;
}

/**
 * Responsive container for game boards that:
 * - On mobile (portrait): Takes 95vw width, maintains aspect ratio
 * - On desktop/tablet: Fits within 90vh height, maintains aspect ratio
 * - Prevents scrolling on mobile
 */
export default function ResponsiveGameContainer({
  children,
  aspect,
  className = '',
  fillParent = false,
}: ResponsiveGameContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(true); // Start with true to prevent flash

  useEffect(() => {
    if (fillParent) return;
    const checkMobile = () => {
      if (typeof window === 'undefined') return;
      const isPortrait = window.innerHeight > window.innerWidth;
      const isSmallScreen = window.innerWidth < 768;
      const mobile = isPortrait || isSmallScreen;
      setIsMobile(mobile);
    };

    if (typeof window !== 'undefined') {
      checkMobile();
      const timeoutId = setTimeout(checkMobile, 100);
      window.addEventListener('resize', checkMobile);
      window.addEventListener('orientationchange', checkMobile);

      return () => {
        clearTimeout(timeoutId);
        if (typeof window !== 'undefined') {
          window.removeEventListener('resize', checkMobile);
          window.removeEventListener('orientationchange', checkMobile);
        }
      };
    }
  }, [fillParent]);

  const aspectRatioValue = aspect;

  const sizeClass = fillParent
    ? styles.containerFillParent
    : isMobile
      ? styles.containerMobile
      : styles.containerDesktop;

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${sizeClass} ${className}`}
      style={{
        aspectRatio: aspectRatioValue,
      }}
    >
      <div className={styles.innerContainer}>
        {children}
      </div>
    </div>
  );
}

