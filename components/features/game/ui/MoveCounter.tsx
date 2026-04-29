'use client';

import styles from './MoveCounter.module.css';

interface MoveCounterProps {
  moveNumber: number;
  spectatorCount?: number;
}

/**
 * MoveCounter - Top-left indicator showing current move number
 * Styled like cotuong.com with eye icon
 */
export default function MoveCounter({
  moveNumber,
  spectatorCount,
}: MoveCounterProps) {
  return (
    <div className={styles.counterContainer}>
      {/* Move Number */}
      <div className={styles.moveNumber}>
        <span className={styles.number}>{moveNumber}</span>
      </div>

      {/* Eye Icon with Optional Spectator Count */}
      <div className={styles.spectatorSection}>
        <svg
          className={styles.eyeIcon}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
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
        {spectatorCount !== undefined && spectatorCount > 0 && (
          <span className={styles.spectatorCount}>{spectatorCount}</span>
        )}
      </div>
    </div>
  );
}
