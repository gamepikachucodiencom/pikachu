/**
 * Theme System Type Definitions
 * Defines the structure for theme configuration files
 */

export type PieceKey =
  | 'red_general'
  | 'red_advisor'
  | 'red_elephant'
  | 'red_horse'
  | 'red_chariot'
  | 'red_cannon'
  | 'red_soldier'
  | 'black_general'
  | 'black_advisor'
  | 'black_elephant'
  | 'black_horse'
  | 'black_chariot'
  | 'black_cannon'
  | 'black_soldier';

export type SoundKey = 'move' | 'capture' | 'check' | 'win' | 'lose';

/** Keys for AI avatar by difficulty (must match PlayWithAIPage Difficulty) */
export type AiDifficultyKey = 'easy' | 'medium' | 'hard' | 'very-hard';

export type EffectType = 'explosion' | 'trail' | 'sparkle' | 'none';

export interface ThemeBoard {
  file: string;
  board_texture?: string; // Optional seamless texture for tiling
  width: number;
  height: number;
  background_color: string;
}

export interface ThemePieces {
  size: number;
  style: string;
  files?: Record<PieceKey, string>; // Legacy: individual piece files
  assets?: {
    // New: dynamic_text style assets
    background: string;
    font_family: string;
    move_indicator?: string; // SVG for empty square moves
    capture_indicator?: string; // SVG for capture moves
  };
  colors?: {
    // New: dynamic_text style colors
    red: string;
    black: string;
    text_shadow: string;
  };
}

export interface ThemeSounds {
  move: string;
  capture: string;
  check: string;
  win?: string;
  lose?: string;
}

export interface ThemeColors {
  highlight_valid: string;
  highlight_selected: string;
  highlight_last_move: string;
  highlight_check: string;
}

export interface ThemeEffect {
  type: EffectType;
  duration: number;
  spritesheet?: string;
  color?: string;
}

export interface ThemeEffects {
  enabled: boolean;
  capture?: ThemeEffect;
  move?: ThemeEffect;
  check?: ThemeEffect;
}

export interface ThemeConfig {
  id: string;
  name: string;
  version?: string;
  author?: string;
  price?: number;
  currency?: string;
  is_premium?: boolean;
  preview_image?: string;
  /** Optional default avatar paths (relative to theme root) for guest players */
  avatars?: string[];
  /** Optional AI avatar paths by difficulty (relative to theme root) */
  ai_avatars?: Record<AiDifficultyKey, string>;
  board: ThemeBoard;
  pieces: ThemePieces;
  sounds: ThemeSounds;
  colors: ThemeColors;
  effects: ThemeEffects;
}

/**
 * Helper type for theme asset paths
 */
export interface ThemeAssetPaths {
  board: string | null;
  pieces: Record<PieceKey, string>;
  sounds: Record<SoundKey, string | null>;
  preview: string | null;
  /** Full URLs for default guest avatars */
  avatars?: string[];
  /** Full URLs for AI avatars by difficulty */
  ai_avatars?: Record<AiDifficultyKey, string>;
}
