/**
 * Minimax AI for Xiangqi using ffish-es6 for legal move generation.
 * Uses alpha-beta pruning. Evaluation: material (Red - Black).
 */

import type { Piece, PieceType } from '@/lib/chess/boardUtils';
import { parseFen, makeMoveOnBoard, boardToFen } from '@/lib/chess/boardUtils';

// --- Scoring constants (Xiangqi piece values) ---
const PIECE_VALUES: Record<PieceType, number> = {
  king: 10_000,
  rook: 900,
  cannon: 450,
  horse: 400,
  advisor: 20,
  elephant: 20,
  pawn: 10,
};

/** Pawn value when across the river. Red: row <= 4; Black: row >= 5. */
const PAWN_ACROSS_RIVER = 20;

/** Max search depth to keep recursion shallow (FEN parse/make each node). */
const MAX_DEPTH = 3;

// --- ffish Board interface (setFen, legalMoves only) ---
export interface FfishBoard {
  setFen(fen: string): void;
  legalMoves(): string;
}

// --- Helpers ---

function parseActiveColor(fen: string): 'red' | 'black' {
  const parts = fen.split(/\s+/);
  const c = (parts[1] || 'w').toLowerCase();
  return c === 'b' ? 'black' : 'red';
}

function getPieceValue(piece: Piece, row: number): number {
  if (piece.type === 'pawn') {
    const across = piece.color === 'red' ? row <= 4 : row >= 5;
    return across ? PAWN_ACROSS_RIVER : PIECE_VALUES.pawn;
  }
  return PIECE_VALUES[piece.type];
}

/**
 * Parse UCCI move (e.g. "a1a2", "a10a8") to board coordinates.
 * Rank 1 = row 9, Rank 10 = row 0; file a=0..i=8.
 */
function ucciToFromTo(ucci: string): { from: { row: number; col: number }; to: { row: number; col: number } } | null {
  if (ucci.length < 4) return null;
  const fromCol = ucci.charCodeAt(0) - 97;
  let fromRank: number;
  let toStart: number;
  if (ucci.length >= 5 && ucci[1] === '1' && ucci[2] === '0') {
    fromRank = 10;
    toStart = 3;
  } else {
    fromRank = parseInt(ucci[1], 10);
    toStart = 2;
  }
  if (isNaN(fromRank) || fromRank < 1 || fromRank > 10 || toStart >= ucci.length) return null;
  const fromRow = 10 - fromRank;

  const toCol = ucci.charCodeAt(toStart) - 97;
  let toRank: number;
  if (toStart + 2 < ucci.length && ucci[toStart + 1] === '1' && ucci[toStart + 2] === '0') {
    toRank = 10;
  } else {
    toRank = parseInt(ucci[toStart + 1], 10);
  }
  if (isNaN(toRank) || toRank < 1 || toRank > 10) return null;
  const toRow = 10 - toRank;

  if (fromRow < 0 || fromRow > 9 || fromCol < 0 || fromCol > 8 || toRow < 0 || toRow > 9 || toCol < 0 || toCol > 8) {
    return null;
  }
  return { from: { row: fromRow, col: fromCol }, to: { row: toRow, col: toCol } };
}

/**
 * Apply a UCCI move to a FEN and return the resulting FEN.
 */
function applyMoveUcci(fen: string, ucci: string): string {
  const coords = ucciToFromTo(ucci);
  if (!coords) return fen;
  const board = parseFen(fen);
  const nextColor = parseActiveColor(fen) === 'red' ? 'black' : 'red';
  const newBoard = makeMoveOnBoard(board, coords.from, coords.to);
  return boardToFen(newBoard, nextColor);
}

// --- Evaluation ---

/**
 * Evaluate a position. Returns (Red material - Black material).
 * Positive = good for Red, negative = good for Black.
 */
export function evaluateFen(fen: string): number {
  const board = parseFen(fen);
  let score = 0;
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 9; col++) {
      const piece = board[row][col];
      if (piece) {
        const v = getPieceValue(piece, row);
        score += piece.color === 'red' ? v : -v;
      }
    }
  }
  return score;
}

// --- Minimax with Alpha-Beta ---

function minimax(
  fen: string,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  board: FfishBoard
): number {
  if (depth <= 0) return evaluateFen(fen);

  board.setFen(fen);
  const movesStr = board.legalMoves();
  const moves = movesStr ? movesStr.split(/\s+/).filter(Boolean) : [];
  if (moves.length === 0) return evaluateFen(fen);

  if (isMaximizing) {
    let best = -Infinity;
    for (const m of moves) {
      const nextFen = applyMoveUcci(fen, m);
      const v = minimax(nextFen, depth - 1, alpha, beta, false, board);
      best = Math.max(best, v);
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break;
    }
    return best;
  } else {
    let best = Infinity;
    for (const m of moves) {
      const nextFen = applyMoveUcci(fen, m);
      const v = minimax(nextFen, depth - 1, alpha, beta, true, board);
      best = Math.min(best, v);
      beta = Math.min(beta, best);
      if (beta <= alpha) break;
    }
    return best;
  }
}

// --- Public API ---

/**
 * Compute the best move for the side to move using minimax with alpha-beta.
 * Uses ffish-es6 Board only for setFen and legalMoves. Depth is capped at MAX_DEPTH.
 * @param fen - Position FEN (e.g. "rnbakabnr/9/1c5c1/... w" or "... b").
 * @param depth - Search depth in plies (capped at 3).
 * @param board - ffish Board('xiangqi') instance.
 * @returns Best move in UCCI format (e.g. "e3e4"), or "" if none.
 */
export function getBestMove(fen: string, depth: number, board: FfishBoard): Promise<string> {
  const d = Math.min(Math.max(1, depth), MAX_DEPTH);
  board.setFen(fen);
  const movesStr = board.legalMoves();
  const moves = movesStr ? movesStr.split(/\s+/).filter(Boolean) : [];
  if (moves.length === 0) return Promise.resolve('');

  const active = parseActiveColor(fen);
  const isBlackRoot = active === 'black'; // Black minimizes (eval = Red - Black)

  let bestMove = moves[0];
  let bestVal = isBlackRoot ? Infinity : -Infinity;
  let alpha = -Infinity;
  let beta = Infinity;

  for (const m of moves) {
    const nextFen = applyMoveUcci(fen, m);
    const v = minimax(nextFen, d - 1, alpha, beta, isBlackRoot, board);

    if (isBlackRoot) {
      if (v < bestVal) {
        bestVal = v;
        bestMove = m;
      }
      beta = Math.min(beta, bestVal);
    } else {
      if (v > bestVal) {
        bestVal = v;
        bestMove = m;
      }
      alpha = Math.max(alpha, bestVal);
    }
    if (beta <= alpha) break;
  }

  return Promise.resolve(bestMove);
}
