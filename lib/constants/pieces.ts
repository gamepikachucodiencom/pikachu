/**
 * Piece Constants
 * Centralized piece sizes, colors, and character mappings
 */

import type { PieceType } from '@/lib/chess/boardUtils';

export const PIECE_CONFIG = {
  // Piece size
  SIZE: 180,

  // Piece colors (hex values as numbers for PixiJS)
  COLORS: {
    red: {
      background: 0xfdf6e3, // Cream background (#FDF6E3) for pieces to 'pop' off board
      border: 0xb71c1c, // Cinnabar Red (Chữ quân Đỏ) #B71C1C
      text: 0xffffff, // White text
      paint: 0xb71c1c, // Cinnabar Red (Chữ quân Đỏ) #B71C1C for engraved text
    },
    black: {
      background: 0xfdf6e3, // Cream background (#FDF6E3) for pieces to 'pop' off board
      border: 0x212121, // Soft black border (#212121) - not harsh #000
      text: 0xffffff, // White text
      paint: 0x212121, // Soft black (#212121) for engraved text - not harsh #000
    },
  },

  // Shadow configuration (2.5D lifted look)
  SHADOW: {
    COLOR: 0x000000, // Black
    ALPHA_NORMAL: 0.55,
    ALPHA_LIFTED: 0.3,
    Y_OFFSET_NORMAL: 14,
    Y_OFFSET_LIFTED: 25,
    RADIUS_X_FACTOR: 0.5, // size * 0.5 - slightly larger footprint
    RADIUS_Y_FACTOR: 0.4, // size * 0.4
    BLUR: 6,
  },

  // Text rendering ("dried ink" look: soft edges, matte, no gloss)
  TEXT: {
    FONT_FAMILY: 'KaiTi, STKaiti, BiauKai, serif',
    SIZE_FACTOR: 0.5, // size * 0.65
    INNER_SHADOW_ALPHA: 0.6,
    HIGHLIGHT_ALPHA: 0.06, // Near zero for matte dried-ink look (was 0.4 for carved gloss)
    HIGHLIGHT_OFFSET_Y: 1,
    PAINT_OFFSET_Y: 0.5,
    /** Vertical offset (pixels). Negative = move character up for a more realistic look. */
    CHARACTER_OFFSET_Y: -10,
    /** Slight blur for soft ink-bleed edges (dried ink look). */
    INK_BLUR_STRENGTH: 1,
  },
} as const;

// Character Map: Traditional Chinese characters for dynamic text rendering
export const PIECE_CHARACTERS: Record<
  PieceType,
  { red: string; black: string }
> = {
  king: { red: '帥', black: '將' },
  advisor: { red: '仕', black: '士' },
  elephant: { red: '相', black: '象' },
  horse: { red: '傌', black: '馬' },
  rook: { red: '俥', black: '車' },
  cannon: { red: '炮', black: '砲' },
  pawn: { red: '兵', black: '卒' },
} as const;

// Legacy piece names (for fallback)
export const PIECE_NAMES: Record<PieceType, { red: string; black: string }> = {
  king: { red: '帅', black: '将' },
  advisor: { red: '仕', black: '士' },
  elephant: { red: '相', black: '象' },
  horse: { red: '马', black: '马' },
  rook: { red: '车', black: '车' },
  cannon: { red: '炮', black: '炮' },
  pawn: { red: '兵', black: '卒' },
} as const;

// Export individual constants for convenience
export const PIECE_SIZE = PIECE_CONFIG.SIZE;
export const PIECE_COLORS = PIECE_CONFIG.COLORS;
export const PIECE_SHADOW = PIECE_CONFIG.SHADOW;
export const PIECE_TEXT = PIECE_CONFIG.TEXT;
