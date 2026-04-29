// Custom hooks for common store operations

import { useCallback } from 'react';
import { useGameStore } from './gameStore';
import { useAuthStore } from './authStore';
import { useShopStore } from './shopStore';
import { useUIStore } from './uiStore';
import { isFeatureEnabled } from '@/lib/features';
import { showComingSoon } from '@/lib/utils/coming-soon';

/**
 * Hook to check if user can afford an item
 */
export function useCanAfford() {
  const profile = useAuthStore((state) => state.profile);

  return (item: { price: number; currency: 'knb' }) => {
    if (!profile) return false;
    return (profile.knb ?? 0) >= item.price;
  };
}

/**
 * Hook to get current game state snapshot
 */
export function useGameSnapshot() {
  return useGameStore((state) => ({
    mode: state.mode,
    status: state.status,
    currentPlayer: state.currentPlayer,
    boardFen: state.boardFen,
    moveCount: state.moveHistory.length,
    isPlaying: state.status === 'playing',
    isFinished: state.status === 'finished',
  }));
}

/**
 * Hook to get user currency
 */
export function useUserCurrency() {
  return useAuthStore((state) => ({
    knb: state.profile?.knb ?? 0,
  }));
}

/**
 * Hook to check if item is purchased
 */
export function useIsPurchased() {
  const purchasedItems = useShopStore((state) => state.purchasedItems);
  return (itemId: string) => purchasedItems.includes(itemId);
}

/**
 * Opens the AI game setup modal (difficulty / time) when AI_MODE is enabled;
 * otherwise shows the standard "coming soon" toast.
 */
export function useOpenAiGameSetup() {
  const openGameModeModal = useUIStore((s) => s.openGameModeModal);

  return useCallback(
    (label?: string) => {
      if (!isFeatureEnabled('AI_MODE')) {
        showComingSoon(label ?? 'Đấu với máy');
        return;
      }
      openGameModeModal('ai');
    },
    [openGameModeModal]
  );
}

