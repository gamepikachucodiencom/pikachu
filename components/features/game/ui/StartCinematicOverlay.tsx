'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './StartCinematicOverlay.module.css';

interface StartCinematicOverlayProps {
  visible: boolean;
  durationMs?: number;
  onDone?: () => void;
}

export default function StartCinematicOverlay({
  visible,
  durationMs = 2000,
  onDone,
}: StartCinematicOverlayProps) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    if (!visible) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    setAnimKey((k) => k + 1);
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      onDone?.();
    }, durationMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [visible, durationMs, onDone]);

  if (!visible) return null;

  return (
    <div
      key={animKey}
      className={styles.overlay}
      role="status"
      aria-live="polite"
      aria-label="Bắt đầu"
      style={{ ['--durationMs' as any]: `${durationMs}ms` }}
    >
      <div className={styles.center}>
        <div className={styles.ink} aria-hidden />
        <div className={styles.title}>Bắt đầu</div>
      </div>
    </div>
  );
}

