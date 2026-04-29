'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './CheckIndicator.module.css';

interface CheckIndicatorProps {
  /** When true, shows the center banner */
  visible: boolean;
  /** Banner text; defaults to "Chiếu tướng!" when not provided */
  message?: string;
}

export default function CheckIndicator({ visible, message }: CheckIndicatorProps) {
  const [exiting, setExiting] = useState(false);
  const prevVisibleRef = useRef(visible);
  const exitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (prevVisibleRef.current && !visible) {
      setExiting(true);
      if (exitTimeoutRef.current) clearTimeout(exitTimeoutRef.current);
      exitTimeoutRef.current = setTimeout(() => {
        setExiting(false);
        exitTimeoutRef.current = null;
      }, 250);
    }
    prevVisibleRef.current = visible;
    return () => {
      if (exitTimeoutRef.current) {
        clearTimeout(exitTimeoutRef.current);
        exitTimeoutRef.current = null;
      }
    };
  }, [visible]);

  if (!visible && !exiting) return null;

  return (
    <div
      className={`${styles.banner} ${exiting ? styles.exiting : ''}`.trim()}
      role="status"
      aria-live="polite"
    >
      <p className={styles.text}>{message ?? 'Chiếu tướng!'}</p>
    </div>
  );
}
