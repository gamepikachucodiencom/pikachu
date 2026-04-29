/**
 * UI Constants
 * Centralized UI colors, z-indexes, and animation durations
 */

export const UI_CONFIG = {
  // Z-Index layers
  Z_INDEX: {
    BOARD: 0,
    PIECES: 1000,
    FLYING_PIECES: 1000, // Same as pieces, but sorted
    INDICATORS: 2000, // Much higher than pieces
  },

  // Board colors (thick carved-wood grid: UI only, no layout/position logic)
  BOARD_COLORS: {
    GRID_LINE: 0x5d4037, // Dark brown (#5D4037) for high contrast
    GRID_LINE_ALPHA: 1.0, // Full opacity for sharp lines
    GRID_LINE_WIDTH: 4, // Thick lines (carved wood look), stroke centered on path
    GRID_SHADOW_OFFSET: 4, // px offset for recessed groove (bottom-right) – increased for depth
    GRID_SHADOW_COLOR: 0x3d2c1e, // Darker brown for shadow (recessed look)
    GRID_SHADOW_ALPHA: 0.95,
    GRID_HIGHLIGHT_OFFSET: -2, // px offset for top-left edge of groove (carved 3D)
    GRID_HIGHLIGHT_COLOR: 0x8b7355, // Light brown/be for groove edge
    GRID_HIGHLIGHT_ALPHA: 0.75,
    GRID_DEEP_SHADOW_OFFSET: 6, // px offset for deepest recess (stronger depth)
    GRID_DEEP_SHADOW_COLOR: 0x2a1e16, // Darkest brown for deep shadow
    GRID_DEEP_SHADOW_ALPHA: 0.6,
    BACKGROUND_FALLBACK: 0xe8dca9, // Warm wood/parchment (#E8DCA9)
    BACKGROUND_FALLBACK_HEX: '#E8DCA9',
  },

  // Highlight colors
  HIGHLIGHT_COLORS: {
    SELECTED: 0x4caf50, // Green (#4CAF50) - rgba(76, 175, 80, 0.4) converted to hex
    SELECTED_ALPHA: 0.4, // Alpha for selected piece highlight
    VALID_MOVE: 0x3b82f6, // Blue dot
    LAST_MOVE: 0x2196f3, // Blue (#2196F3) - rgba(33, 150, 243, 0.3) converted to hex
    LAST_MOVE_ALPHA: 0.3, // Alpha for last move highlight
    CHECK: 0xff0000, // Red
    CHECK_FLASH_COUNT: 2,
  },

  // Animation durations (in seconds)
  ANIMATION: {
    LIFT_DURATION: 0.2,
    PLACE_DURATION: 0.2,
    MOVE_DURATION: 0.35,
    CAPTURE_IMPACT_DURATION: 0.1,
    BOARD_SHAKE_DURATION: 0.1,
    BOARD_SHAKE_AMOUNT: 2,
    FLASH_DURATION: 0.1,
    VALID_MOVE_PULSE_DURATION: 0.6,
    APPROXIMATE_ANIMATION_DURATION: 600, // milliseconds
  },

  // Animation easing
  EASING: {
    LIFT: 'power2.out',
    PLACE: 'power2.in',
    MOVE: 'back.out(1.5)',
    CAPTURE: 'back.out(1.5)',
    PULSE: 'sine.inOut',
  },

  // Piece animation scales
  SCALE: {
    LIFT: 1.15,
    NORMAL: 1.0,
  },

  // Hit area size factor
  HIT_AREA_FACTOR: 1.2, // pieceSize * 1.2

  // Shadow dot alpha for move indicators
  SHADOW_DOT_ALPHA: 0.2, // Very subtle (like an indentation shadow)
} as const;

// Export individual constants for convenience
export const Z_INDEX = UI_CONFIG.Z_INDEX;
export const BOARD_COLORS = UI_CONFIG.BOARD_COLORS;
export const HIGHLIGHT_COLORS = UI_CONFIG.HIGHLIGHT_COLORS;
export const ANIMATION = UI_CONFIG.ANIMATION;
export const EASING = UI_CONFIG.EASING;
export const SCALE = UI_CONFIG.SCALE;

