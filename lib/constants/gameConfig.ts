/**
 * Game Configuration Constants
 * Centralized game rules, timeouts, and engine settings
 */

export const GAME_CONFIG = {
  // Board state
  INITIAL_FEN: 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1',

  // Timeouts (in milliseconds)
  TIMEOUT: {
    AI_MOVE: 5000, // 5 seconds for AI to make a move
    NETWORK_REQUEST: 10000, // 10 seconds for network requests
  },

  // Per-move time limit (seconds) for human in AI games
  MOVE_TIME_LIMIT: 60,

  // Validation
  VALIDATION: {
    MIN_COL: 0,
    MAX_COL: 8,
    MIN_ROW: 0,
    MAX_ROW: 9,
  },
} as const;

// Export individual constants for convenience
export const INITIAL_FEN = GAME_CONFIG.INITIAL_FEN;
export const TIMEOUT = GAME_CONFIG.TIMEOUT;
export const MOVE_TIME_LIMIT = GAME_CONFIG.MOVE_TIME_LIMIT;
export const VALIDATION = GAME_CONFIG.VALIDATION;

