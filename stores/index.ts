// Central export for all stores
export { useAuthStore } from './authStore';
export { useShopStore } from './shopStore';
export { useUIStore } from './uiStore';

// Re-export types
export type {
  GameMode,
  GameStatus,
  PlayerColor,
  GameState,
  ShopItem,
  CartItem,
  UserProfile,
  Notification,
} from './types';
