'use client';

import { useEffect, useRef, useMemo } from 'react';
import { gsap } from 'gsap';
import Image from 'next/image';
import styles from './CheckmateOverlay.module.css';

type GameEndReason = 'checkmate' | 'timeout' | 'resignation';

interface CheckmateOverlayProps {
  isVisible: boolean;
  isWinner: boolean; // true if current player won, false if lost
  reason?: GameEndReason; // Reason for game end (defaults to 'checkmate')
  onClose?: () => void;
}

// Get message based on win/lose status and reason
function getMessage(isWinner: boolean, reason: GameEndReason): string {
  if (isWinner) {
    switch (reason) {
      case 'timeout':
        return 'Đối thủ đã hết thời gian!';
      case 'resignation':
        return 'Đối thủ đã đầu hàng!';
      case 'checkmate':
      default:
        return 'Bạn đã chiến thắng!';
    }
  } else {
    switch (reason) {
      case 'timeout':
        return 'Bạn đã hết thời gian!';
      case 'resignation':
        return 'Bạn đã đầu hàng!';
      case 'checkmate':
      default:
        return 'Bạn đã thua cuộc';
    }
  }
}

// Generate random particles for floating effect
function generateParticles(count: number): Array<{
  id: number;
  size: number;
  left: string;
  delay: number;
  duration: number;
}> {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    size: Math.random() * 8 + 4, // 4-12px
    left: `${Math.random() * 100}%`,
    delay: Math.random() * 5,
    duration: Math.random() * 4 + 6, // 6-10s
  }));
}

export default function CheckmateOverlay({
  isVisible,
  isWinner,
  reason = 'checkmate',
  onClose,
}: CheckmateOverlayProps) {
  const sealRef = useRef<HTMLDivElement>(null);
  const sealTitleRef = useRef<HTMLHeadingElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const inkSplashRef = useRef<HTMLImageElement>(null);
  const brushStrokeRef = useRef<HTMLDivElement>(null);
  const messageRef = useRef<HTMLParagraphElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  // Memoize particles to prevent regeneration on re-renders
  const particles = useMemo(() => generateParticles(15), []);

  useEffect(() => {
    if (!isVisible) {
      // Kill any existing animation when hiding
      if (timelineRef.current) {
        timelineRef.current.kill();
        timelineRef.current = null;
      }
      return;
    }

    // Create animation timeline
    const tl = gsap.timeline();
    timelineRef.current = tl;

    // 0.0s - Overlay fade in
    if (overlayRef.current) {
      tl.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.4, ease: 'power2.out' },
        0
      );
    }

    // 0.2s - Ink splash spreads outward
    if (inkSplashRef.current) {
      tl.fromTo(
        inkSplashRef.current,
        { scale: 0, opacity: 0, rotation: -5 },
        {
          scale: 1,
          opacity: 1,
          rotation: 0,
          duration: 0.8,
          ease: 'power3.out',
        },
        0.2
      );
    }

    // 0.4s - Seal stamp drops with bounce
    if (sealRef.current) {
      tl.fromTo(
        sealRef.current,
        {
          scale: 3,
          opacity: 0,
          y: -80,
          rotation: -8,
        },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          rotation: 0,
          duration: 0.7,
          ease: 'back.out(1.4)',
        },
        0.4
      );
    }

    // 0.6s - Seal title fades in with scale
    if (sealTitleRef.current) {
      tl.fromTo(
        sealTitleRef.current,
        { scale: 0.8, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.5,
          ease: 'power2.out',
        },
        0.7
      );
    }

    // 0.8s - Brush stroke reveals
    if (brushStrokeRef.current) {
      tl.fromTo(
        brushStrokeRef.current,
        { scaleX: 0, opacity: 0 },
        {
          scaleX: 1,
          opacity: 1,
          duration: 0.6,
          ease: 'power2.out',
        },
        0.9
      );
    }

    // 1.0s - Message text fades in
    if (messageRef.current) {
      tl.fromTo(
        messageRef.current,
        { y: 15, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          ease: 'power2.out',
        },
        1.1
      );
    }

    // 1.2s - Button fades in
    if (buttonRef.current) {
      tl.fromTo(
        buttonRef.current,
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          ease: 'power2.out',
        },
        1.3
      );
    }

    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, [isVisible]);

  if (!isVisible) return null;

  const sealBorderSrc = isWinner
    ? '/assets/ui/seal-border-win.svg'
    : '/assets/ui/seal-border-lose.svg';

  return (
    <div ref={overlayRef} className={styles.overlay}>
      {/* Floating particles */}
      <div className={styles.particleContainer}>
        {particles.map((particle) => (
          <div
            key={particle.id}
            className={`${styles.particle} ${
              isWinner ? styles.particleWin : styles.particleLose
            }`}
            style={{
              width: particle.size,
              height: particle.size,
              left: particle.left,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Ink splash background */}
      <Image
        ref={inkSplashRef}
        src="/assets/ui/ink-splash.svg"
        alt=""
        width={400}
        height={400}
        className={`${styles.inkSplash} ${
          isWinner ? styles.inkSplashWin : styles.inkSplashLose
        }`}
        priority
      />

      <div className={styles.content}>
        {/* Traditional seal stamp */}
        <div
          ref={sealRef}
          className={`${styles.seal} ${
            isWinner ? styles.sealWinner : styles.sealLoser
          }`}
        >
          {/* Seal border SVG */}
          <Image
            src={sealBorderSrc}
            alt=""
            width={180}
            height={180}
            className={styles.sealBorder}
            priority
          />

          {/* Inner seal with text */}
          <div className={styles.sealInner}>
            <h1 ref={sealTitleRef} className={styles.sealTitle}>
              {isWinner ? 'Thắng' : 'Thua'}
            </h1>
          </div>
        </div>

        {/* Brush stroke divider */}
        <div
          ref={brushStrokeRef}
          className={`${styles.brushStroke} ${
            isWinner ? styles.brushStrokeWin : styles.brushStrokeLose
          }`}
        />

        {/* Message */}
        <p ref={messageRef} className={styles.message}>
          {getMessage(isWinner, reason)}
        </p>

        {/* Confirm button */}
        {onClose && (
          <button
            ref={buttonRef}
            className={`${styles.closeButton} ${
              isWinner ? styles.closeButtonWin : styles.closeButtonLose
            }`}
            onClick={onClose}
          >
            Xác nhận
          </button>
        )}
      </div>
    </div>
  );
}
