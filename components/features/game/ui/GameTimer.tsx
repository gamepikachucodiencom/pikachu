'use client';

import { useEffect } from 'react';
import { useTimerStore, TimerPlayer } from '@/stores/useTimerStore';
import styles from './GameTimer.module.css';

interface GameTimerProps {
  player: TimerPlayer;
  isActive: boolean;
}

/**
 * GameTimer - Chess clock component styled like cotuong.com
 * Shows time remaining with hourglass icon
 */
export default function GameTimer({ player, isActive }: GameTimerProps) {
  const { getFormattedTime, redTime, blackTime } = useTimerStore();

  const time = player === 'red' ? redTime : blackTime;
  const formattedTime = getFormattedTime(player);

  // Low time warning (under 30 seconds)
  const isLowTime = time <= 30;
  // Critical time (under 10 seconds)
  const isCriticalTime = time <= 10;

  return (
    <div
      className={`
        ${styles.timerContainer} 
        ${isActive ? styles.active : ''} 
        ${isLowTime ? styles.lowTime : ''} 
        ${isCriticalTime ? styles.criticalTime : ''}
      `}
    >
      {/* Hourglass Icon */}
      <div className={styles.iconContainer}>
        <svg
          className={`${styles.hourglassIcon} ${isActive ? styles.hourglassActive : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Hourglass frame */}
          <path
            d="M6 2H18V6C18 8.20914 16.2091 10 14 10H10C7.79086 10 6 8.20914 6 6V2Z"
            fill="currentColor"
            opacity="0.3"
          />
          <path
            d="M6 22H18V18C18 15.7909 16.2091 14 14 14H10C7.79086 14 6 15.7909 6 18V22Z"
            fill="currentColor"
            opacity="0.6"
          />
          {/* Frame outline */}
          <path
            d="M5 2H19M5 22H19M6 2V6C6 8.20914 7.79086 10 10 10H14C16.2091 10 18 8.20914 18 6V2M6 22V18C6 15.7909 7.79086 14 10 14H14C16.2091 14 18 15.7909 18 18V22M10 10C10 10 10 12 12 12C14 12 14 10 14 10M10 14C10 14 10 12 12 12C14 12 14 14 14 14"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Time Display */}
      <div className={styles.timeDisplay}>
        <span className={styles.timeText}>{formattedTime}</span>
      </div>
    </div>
  );
}
