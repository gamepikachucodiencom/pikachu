/**
 * Validation Constants
 * Regex patterns, validation rules, and format validators
 */

/**
 * Email validation regex
 * Matches basic email format: user@domain
 */
export const EMAIL_REGEX = /^\S+@\S+$/;

/**
 * Slug generation regex patterns
 */
export const SLUG_VALIDATION = {
  // Remove special characters (keep word chars, spaces, hyphens)
  REMOVE_SPECIAL_CHARS: /[^\w\s-]/g,
  // Replace spaces and underscores with hyphens
  NORMALIZE_SEPARATORS: /[\s_-]+/g,
  // Remove leading/trailing hyphens
  TRIM_HYPHENS: /^-+|-+$/g,
} as const;

/**
 * Password validation rules
 */
export const PASSWORD_VALIDATION = {
  MIN_LENGTH: 6,
} as const;

/**
 * Username validation rules
 */
export const USERNAME_VALIDATION = {
  MIN_LENGTH: 3,
  MAX_LENGTH: 20,
  // Alphanumeric, underscore, hyphen
  PATTERN: /^[a-zA-Z0-9_-]+$/,
} as const;

/**
 * Migration file name pattern
 * Format: YYYYMMDDHHMMSS_description.sql
 */
export const MIGRATION_FILE_PATTERN = /^(\d{14})_(.+)\.sql$/;

