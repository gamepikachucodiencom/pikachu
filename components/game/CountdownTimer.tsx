'use client';

import { useEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';
import styles from './CountdownTimer.module.css';

interface CountdownTimerProps {
  seconds: number;
  onTimeout?: () => void;
  color?: 'red' | 'black';
  size?: 'sm' | 'md' | 'lg';
}

export default function CountdownTimer({
  seconds,
  onTimeout,
  color = 'red',
  size = 'md',
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const [isWarning, setIsWarning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset timer when seconds prop changes
    setTimeLeft(seconds);
    setIsWarning(false);

    // Clear existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Start countdown
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          if (onTimeout) {
            onTimeout();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [seconds, onTimeout]);

  // Warning animation when time is low
  useEffect(() => {
    if (timeLeft <= 10 && timeLeft > 0) {
      setIsWarning(true);
      if (badgeRef.current) {
        gsap.to(badgeRef.current, {
          scale: 1.1,
          duration: 0.3,
          yoyo: true,
          repeat: 1,
          ease: 'power2.inOut',
        });
      }
    } else {
      setIsWarning(false);
    }
  }, [timeLeft]);

  const formatTime = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getColorClass = () => {
    if (timeLeft === 0) return styles.badgeZero;
    if (timeLeft <= 10) return isWarning ? `${styles.badgeOrange} ${styles.variantFilled}` : styles.badgeOrange;
    return color === 'red' ? styles.badgeRed : styles.badgeDark;
  };

  const sizeClass = {
    sm: styles.sizeSm,
    md: styles.sizeMd,
    lg: styles.sizeLg,
  }[size];

  return (
    <span
      ref={badgeRef}
      className={`${styles.badge} ${getColorClass()} ${sizeClass}`}
    >
      {formatTime(timeLeft)}
    </span>
  );
}

