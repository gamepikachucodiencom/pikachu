'use client';

import styles from './ReadyOverlay.module.css';

interface ReadyOverlayProps {
  visible: boolean;
  onReady: () => void;
  disabled?: boolean;
}

export default function ReadyOverlay({
  visible,
  onReady,
  disabled = false,
}: ReadyOverlayProps) {
  if (!visible) return null;

  return (
    <div className={styles.overlay} role="dialog" aria-label="Sẵn sàng">
      <button
        type="button"
        className={styles.readyButton}
        onClick={onReady}
        disabled={disabled}
      >
        Sẵn sàng
      </button>
    </div>
  );
}

