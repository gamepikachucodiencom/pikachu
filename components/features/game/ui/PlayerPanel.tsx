'use client';

import styles from './PlayerPanel.module.css';

interface PlayerPanelProps {
  name: string;
  avatar: string;
  side: 'red' | 'black';
  isTurn: boolean;
  rank?: string;      // e.g., "Kỳ thủ", "Cao thủ"
  stars?: number;     // 1-5 star rating
  /** When set and isTurn, shows countdown circle around avatar (per-move time). */
  moveTimeRemaining?: number;
  moveTimeTotal?: number;
}

/**
 * PlayerPanel - Wood-style frame and name on scroll
 * Avatar has wood border (same pattern/colors as name scroll rolls); name on scroll below.
 */
export default function PlayerPanel({ 
  name, 
  avatar, 
  side, 
  isTurn,
  rank = 'Kỳ thủ',
  stars = 2,
  moveTimeRemaining,
  moveTimeTotal = 60,
}: PlayerPanelProps) {
  // Clamp stars between 1 and 5
  const starCount = Math.min(5, Math.max(1, stars));

  const showCountdown =
    isTurn &&
    moveTimeRemaining != null &&
    moveTimeTotal > 0;

  const circumference = 2 * Math.PI * 50;
  const remainingFraction = showCountdown
    ? Math.max(0, Math.min(1, moveTimeRemaining / moveTimeTotal))
    : 1;
  const strokeDashArray = circumference;
  const strokeDashOffset = -circumference * (1 - remainingFraction);

  const countdownColorClass =
    !showCountdown ? '' :
    moveTimeRemaining! <= 15 ? styles.countdownRed :
    moveTimeRemaining! <= 30 ? styles.countdownYellow :
    styles.countdownGreen;
  
  return (
    <div className={`
      ${styles.playerPanel} 
      ${styles[`playerPanel${side === 'red' ? 'Red' : 'Black'}`]} 
      ${isTurn ? styles.playerPanelActive : ''}
    `}>
      {/* Wood-style Frame Container */}
      <div className={styles.frameContainer}>
        {/* Frame SVG: oval with wood gradient + wuxia motifs */}
        <svg 
          className={styles.frameSvg} 
          viewBox="0 0 140 180" 
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Roll gradient - same as name scroll (gold / teal) */}
            <linearGradient id={`frameGradient-${side}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={side === 'red' ? '#e8c96a' : '#7eb8b8'} />
              <stop offset="50%" stopColor={side === 'red' ? '#c9a84c' : '#3a9a9a'} />
              <stop offset="100%" stopColor={side === 'red' ? '#8a7235' : '#2a6a6a'} />
            </linearGradient>
            <filter id={`innerGlow-${side}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Outer frame (wood gradient stroke) */}
          <path 
            className={styles.frameOuter}
            d="M70 8 C108 8 128 28 128 62 L128 118 C128 152 98 172 70 172 C42 172 12 152 12 118 L12 62 C12 28 32 8 70 8"
            stroke={`url(#frameGradient-${side})`}
            strokeWidth="4"
            fill="none"
            filter={`url(#innerGlow-${side})`}
          />
          {/* Inner frame line */}
          <path 
            className={styles.frameInner}
            d="M70 14 C102 14 121 32 121 62 L121 118 C121 145 96 164 70 164 C44 164 19 145 19 118 L19 62 C19 32 38 14 70 14"
            stroke={`url(#frameGradient-${side})`}
            strokeWidth="1.5"
            fill="none"
            opacity="0.75"
          />
          {/* Wuxia cloud/ink motif - top left */}
          <path 
            d="M22 24 Q14 18 20 12 Q26 20 22 24"
            fill={`url(#frameGradient-${side})`}
            opacity="0.5"
          />
          {/* Wuxia cloud/ink motif - top right */}
          <path 
            d="M118 24 Q126 18 120 12 Q114 20 118 24"
            fill={`url(#frameGradient-${side})`}
            opacity="0.5"
          />
          {/* Wuxia ink stroke - bottom left */}
          <path 
            d="M24 158 Q18 164 22 168 Q28 162 24 158"
            fill={`url(#frameGradient-${side})`}
            opacity="0.4"
          />
          {/* Wuxia ink stroke - bottom right */}
          <path 
            d="M116 158 Q122 164 118 168 Q112 162 116 158"
            fill={`url(#frameGradient-${side})`}
            opacity="0.4"
          />
        </svg>
        {/* Avatar with wood border (same pattern as name scroll rolls) */}
        <div className={styles.avatarWrapper}>
          {showCountdown && (
            <svg
              className={`${styles.countdownCircle} ${countdownColorClass}`}
              viewBox="0 0 100 100"
              aria-hidden
            >
              <circle
                className={styles.countdownCircleBg}
                cx="50"
                cy="50"
                r="50"
                fill="none"
              />
              <circle
                className={styles.countdownCircleStroke}
                cx="50"
                cy="50"
                r="50"
                fill="none"
                style={{
                  strokeDasharray: strokeDashArray,
                  strokeDashoffset: strokeDashOffset,
                }}
                transform="rotate(-90 50 50)"
              />
            </svg>
          )}
          <div className={styles.avatarWoodRing}>
            <div className={styles.avatarContainer}>
              <img src={avatar} alt={name} className={styles.avatar} />
            </div>
          </div>
          
          {/* Rank Badge */}
          <div className={styles.rankBadge}>
            <span className={styles.rankText}>{rank}</span>
            {/* Star Rating */}
            <div className={styles.starContainer}>
              {Array.from({ length: 5 }).map((_, index) => (
                <svg 
                  key={index}
                  className={`${styles.star} ${index < starCount ? styles.starFilled : styles.starEmpty}`}
                  viewBox="0 0 24 24" 
                  fill="currentColor"
                >
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Player Name on Scroll */}
      <div className={styles.scrollContainer}>
        <div className={styles.scrollRollLeft}>
          <div className={styles.scrollRollKnob} />
        </div>
        <div className={styles.scrollPaper}>
          <span className={styles.name}>{name}</span>
        </div>
        <div className={styles.scrollRollRight}>
          <div className={styles.scrollRollKnob} />
        </div>
      </div>
    </div>
  );
}
