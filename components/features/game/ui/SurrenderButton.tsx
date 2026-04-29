'use client';

import styles from './SurrenderButton.module.css';

interface SurrenderButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

/**
 * SurrenderButton - "Đầu hàng" button with flag icon, pill style.
 * Placed below GameTimer in player panels. Disabled on AI side in vs-AI mode.
 */
export default function SurrenderButton({
  onClick,
  disabled = false,
}: SurrenderButtonProps) {
  return (
    <button
      type="button"
      className={`${styles.surrenderButton} ${disabled ? styles.surrenderButtonDisabled : ''}`}
      onClick={onClick}
      disabled={disabled}
      aria-label="Đầu hàng"
    >
      <span className={styles.flagIcon} aria-hidden>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          {/* Pole */}
          <path
            d="M7 2v20"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          {/* White flag: rectangle flying right from pole */}
          <path d="M7 4h11v6H7V4z" fill="currentColor" opacity="0.95" />
        </svg>
      </span>
      <span className={styles.label}>Đầu hàng</span>
    </button>
  );
}
