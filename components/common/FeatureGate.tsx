'use client';

import React, { useState, useEffect } from 'react';
import { isFeatureEnabled, type FeatureKey } from '@/lib/features';
import { showComingSoon } from '@/lib/utils/coming-soon';
import styles from './FeatureGate.module.css';

interface FeatureGateProps {
  /**
   * The feature key to check
   */
  feature: FeatureKey;
  
  /**
   * Content to render if feature is enabled
   */
  children: React.ReactNode;
  
  /**
   * Behavior when feature is disabled:
   * - "hide": Returns null (completely hidden)
   * - "lock": Renders children with disabled styling and "Coming Soon" badge
   * 
   * @default "hide"
   */
  type?: 'hide' | 'lock';
}

/**
 * FeatureGate Component
 * 
 * Conditionally renders children based on feature flag state.
 * Uses client-side only check to avoid hydration mismatches.
 * 
 * @example
 * ```tsx
 * // Hide completely when disabled
 * <FeatureGate feature="SHOP" type="hide">
 *   <Button>Shop</Button>
 * </FeatureGate>
 * 
 * // Show with disabled styling when disabled
 * <FeatureGate feature="RANKING" type="lock">
 *   <Card>Ranking Content</Card>
 * </FeatureGate>
 * ```
 */
export default function FeatureGate({
  feature,
  children,
  type = 'hide',
}: FeatureGateProps) {
  const getFeatureLabel = (key: FeatureKey): string => {
    if (key === 'SHOP') return 'Cửa hàng';
    if (key === 'RANKING') return 'Xếp hạng';
    if (key === 'BLOG') return 'Học viện';
    if (key === 'MULTIPLAYER') return 'Chơi online';
    if (key === 'AI_MODE') return 'Chơi với AI';
    return 'Tính năng này';
  };

  // Use useState to track mounted state and avoid hydration mismatch
  const [mounted, setMounted] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true); // Default to enabled to match server render

  useEffect(() => {
    setMounted(true);
    setIsEnabled(isFeatureEnabled(feature));
  }, [feature]);

  // During SSR and initial client render, render children normally to avoid hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  // If feature is enabled, render children normally
  if (isEnabled) {
    return <>{children}</>;
  }

  // If feature is disabled and type is "hide", return null
  if (type === 'hide') {
    return null;
  }

  // If feature is disabled and type is "lock", render with disabled styling
  return (
    <div
      className={styles.disabledContainer}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        showComingSoon(getFeatureLabel(feature));
      }}
    >
      {children}
      <div className={styles.badgeContainer}>
        <span className={styles.badge}>🔒</span>
      </div>
    </div>
  );
}

