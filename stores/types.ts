// Game-related types
export type GameMode = 'human-vs-human' | 'human-vs-ai';

export type GameStatus = 'waiting' | 'playing' | 'paused' | 'finished';

export type PlayerColor = 'red' | 'black';

export interface GameState {
  mode: GameMode;
  status: GameStatus;
  currentPlayer: PlayerColor;
  boardFen: string;
  moveHistory: string[];
  /** Bumped to request a visual pulse on the in-check king ring (UI-only). */
  checkPulseNonce?: number;
  capturedPieces: {
    red: string[];
    black: string[];
  };
  timeControl?: {
    red: number; // seconds
    black: number; // seconds
  };
  roomCode?: string; // For online games
  opponentId?: string; // For online games
  aiDifficulty?: 'easy' | 'medium' | 'hard' | 'very-hard';
}

// Shop-related types
export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: 'knb';
  imageUrl?: string;
  category: 'piece' | 'board' | 'theme' | 'powerup' | 'other';
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface CartItem extends ShopItem {
  quantity: number;
}

// Auth-related types
// UserProfile is the Source of Truth for user data (from public.profiles table)
// auth.users is strictly for authentication
export interface UserProfile {
  id: string;
  email?: string; // Optional as it may not always be fetched
  username: string;
  avatar_url?: string; // Changed from avatar to match database
  elo_rating: number; // Changed from rating to match database
  wins: number;
  losses: number;
  draws: number;
  current_theme_id: string;
  knb?: number;
  // Legacy fields (for backward compatibility during migration)
  rating?: number; // Deprecated, use elo_rating
  avatar?: string; // Deprecated, use avatar_url
}

// UI-related types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

