/**
 * Enum Constants
 * Status strings, types, and enum-like values used across the application
 */

/**
 * Article types for blog posts
 */
export const ARTICLE_TYPES = {
  GUIDE: 'Guide',
  OPENINGS: 'Openings',
  PUZZLES: 'Puzzles',
  ENDGAME: 'Endgame',
} as const;

export type ArticleType = typeof ARTICLE_TYPES[keyof typeof ARTICLE_TYPES];

/**
 * Article status values
 */
export const ARTICLE_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const;

export type ArticleStatus = typeof ARTICLE_STATUS[keyof typeof ARTICLE_STATUS];

/**
 * Piece colors in Chinese Chess
 */
export const PIECE_COLORS = {
  RED: 'red',
  BLACK: 'black',
} as const;

export type PieceColor = typeof PIECE_COLORS[keyof typeof PIECE_COLORS];

/**
 * AI difficulty levels
 */
export const AI_DIFFICULTY = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
  VERY_HARD: 'very-hard',
} as const;

export type Difficulty = typeof AI_DIFFICULTY[keyof typeof AI_DIFFICULTY];

/**
 * Article type labels (Vietnamese)
 */
export const ARTICLE_TYPE_LABELS: Record<ArticleType, string> = {
  [ARTICLE_TYPES.GUIDE]: 'Hướng Dẫn',
  [ARTICLE_TYPES.OPENINGS]: 'Khai Cuộc',
  [ARTICLE_TYPES.PUZZLES]: 'Giải Trận',
  [ARTICLE_TYPES.ENDGAME]: 'Tàn Cuộc',
} as const;

/**
 * Article status labels (Vietnamese)
 */
export const ARTICLE_STATUS_LABELS: Record<ArticleStatus, string> = {
  [ARTICLE_STATUS.DRAFT]: 'Bản nháp',
  [ARTICLE_STATUS.PUBLISHED]: 'Đã xuất bản',
  [ARTICLE_STATUS.ARCHIVED]: 'Đã lưu trữ',
} as const;

