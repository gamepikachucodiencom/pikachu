/**
 * Application Configuration Constants
 * App-wide settings, timeouts, limits, and configuration values
 */

/**
 * AI Engine timeout (in milliseconds)
 */
export const AI_ENGINE_TIMEOUT = 10000; // 10 seconds

/**
 * Pagination defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const;

/**
 * Content limits
 */
export const CONTENT_LIMITS = {
  TITLE_MAX_LENGTH: 200,
  EXCERPT_MAX_LENGTH: 500,
  SLUG_MAX_LENGTH: 255,
} as const;

