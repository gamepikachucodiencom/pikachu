'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { GameSpectatorProfile } from '@/lib/game/onlineGame';
import styles from './SpectatorAudienceBlock.module.css';

export type SpectatorPanelAlign = 'start' | 'end';

interface SpectatorAudienceBlockProps {
  spectators: GameSpectatorProfile[];
  className?: string;
  /** Popover horizontal alignment relative to trigger */
  panelAlign?: SpectatorPanelAlign;
}

export default function SpectatorAudienceBlock({
  spectators,
  className,
  panelAlign = 'start',
}: SpectatorAudienceBlockProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const count = spectators.length;

  const close = useCallback(() => setOpen(false), []);

  const toggle = useCallback(() => {
    setOpen((v) => !v);
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };

    const onPointer = (e: PointerEvent) => {
      const el = rootRef.current;
      if (!el || el.contains(e.target as Node)) return;
      close();
    };

    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer, true);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer, true);
    };
  }, [open, close]);

  if (count === 0) return null;

  return (
    <div
      ref={rootRef}
      className={`${styles.root}${className ? ` ${className}` : ''}`}
    >
      <button
        type="button"
        className={`${styles.trigger}${open ? ` ${styles.triggerOpen}` : ''}`}
        onClick={toggle}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={`Người xem: ${count}`}
      >
        <span className={styles.count}>{count}</span>
        <svg
          className={styles.eyeIcon}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <path
            d="M12 5C7 5 2.73 8.11 1 12C2.73 15.89 7 19 12 19C17 19 21.27 15.89 23 12C21.27 8.11 17 5 12 5Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx="12"
            cy="12"
            r="3"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <circle cx="12" cy="12" r="1" fill="currentColor" />
        </svg>
      </button>

      {open && (
        <div
          className={`${styles.panel} ${
            panelAlign === 'end' ? styles.panelAlignEnd : styles.panelAlignStart
          }`}
          role="dialog"
          aria-label="Danh sách người xem"
        >
          <h2 className={styles.panelTitle}>Người xem</h2>
          <ul className={styles.listScroll}>
            {spectators.map((s) => (
              <li key={s.userId} className={styles.row}>
                <div className={styles.avatarWrap}>
                  {s.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element -- remote profile URLs
                    <img
                      src={s.avatar}
                      alt=""
                      className={styles.avatarImg}
                    />
                  ) : (
                    <span className={styles.avatarFallback} aria-hidden>
                      {s.username.slice(0, 1).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className={styles.textCol}>
                  <p className={styles.displayName}>{s.username}</p>
                  <p className={styles.roleLabel}>Người xem</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
