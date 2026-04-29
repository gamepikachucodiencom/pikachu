'use client';

import styles from './LeaveConfirmModal.module.css';

interface LeaveConfirmModalProps {
  open: boolean;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
}

/**
 * In-game leave/surrender confirm modal. Replaces window.confirm() for a consistent game look.
 * Scroll/parchment style with golden header and footer.
 */
export default function LeaveConfirmModal({
  open,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  title = 'Thông báo',
}: LeaveConfirmModalProps) {
  if (!open) return null;

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="leave-modal-message"
    >
      <div className={styles.card}>
        <header className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
        </header>
        <div className={styles.body}>
          <p id="leave-modal-message" className={styles.message}>
            {message}
          </p>
          <div className={styles.actions}>
            <button
              type="button"
              className={`${styles.button} ${styles.buttonCancel}`}
              onClick={onCancel}
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              className={`${styles.button} ${styles.buttonConfirm}`}
              onClick={onConfirm}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
        <footer className={styles.footer} aria-hidden="true" />
      </div>
    </div>
  );
}
