/**
 * Board Constants
 * Centralized board dimensions, margins, and cell sizes
 */

export const BOARD_CONFIG = {
  // Canvas dimensions (pixel-perfect)
  CANVAS_WIDTH: 1836,
  CANVAS_HEIGHT: 2000,

  // Margins
  MARGIN_X: 100,
  MARGIN_Y: 100,

  // Cell dimensions
  CELL_WIDTH: 204.5, // (1836 - 200) / 8
  CELL_HEIGHT: 200, // (2000 - 200) / 9

  // Board grid dimensions (Xiangqi: 9 files x 10 ranks)
  FILES: 9, // Columns (0-8)
  RANKS: 10, // Rows (0-9)

  // River position (splits the board)
  RIVER_RANK: 4, // River is between rank 4 and 5

  // Palace dimensions (3x3 squares at each end)
  PALACE_FILES: [3, 4, 5], // Files 3, 4, 5
  PALACE_TOP_RANKS: [0, 1, 2], // Black palace (top)
  PALACE_BOTTOM_RANKS: [7, 8, 9], // Red palace (bottom)
} as const;

// Export individual constants for convenience
export const CANVAS_WIDTH = BOARD_CONFIG.CANVAS_WIDTH;
export const CANVAS_HEIGHT = BOARD_CONFIG.CANVAS_HEIGHT;
export const MARGIN_X = BOARD_CONFIG.MARGIN_X;
export const MARGIN_Y = BOARD_CONFIG.MARGIN_Y;
export const CELL_WIDTH = BOARD_CONFIG.CELL_WIDTH;
export const CELL_HEIGHT = BOARD_CONFIG.CELL_HEIGHT;
export const FILES = BOARD_CONFIG.FILES;
export const RANKS = BOARD_CONFIG.RANKS;
export const RIVER_RANK = BOARD_CONFIG.RIVER_RANK;
