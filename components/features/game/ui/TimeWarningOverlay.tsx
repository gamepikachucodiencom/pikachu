'use client';

import styles from './TimeWarningOverlay.module.css';

interface TimeWarningOverlayProps {
  visible: boolean;
  message?: string;
}

const DEFAULT_MESSAGE = 'Sắp hết thời gian thực hiện nước đi!';

/**
 * Full-screen overlay that blinks red when move time is low (e.g. under 15s).
 * Used to warn the player that running out of time will lose the game.
 */
export default function TimeWarningOverlay({
  visible,
  message = DEFAULT_MESSAGE,
}: TimeWarningOverlayProps) {
  if (!visible) return null;

  return (
    <div
      className={styles.overlay}
      role="alert"
      aria-live="assertive"
      aria-label={message}
    >
      <div className={styles.content}>
        <span className={styles.message}>{message}</span>
      </div>
    </div>
  );
}
