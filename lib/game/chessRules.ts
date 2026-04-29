/**
 * Chinese Chess (Xiangqi) Game Rules Engine
 * Handles move validation and game logic for all pieces
 */

import type { Piece, BoardPosition } from '@/lib/chess/boardUtils';

export interface Move {
  from: BoardPosition;
  to: BoardPosition;
  piece: Piece;
  captured?: Piece;
}

export type BoardState = (Piece | null)[][];

/**
 * Check if a move is valid for Chinese Chess
 */
export function isValidMove(
  board: BoardState,
  move: Move,
  isHiddenChess: boolean = false
): boolean {
  const { from, to, piece } = move;

  // Basic bounds check
  if (
    to.row < 0 ||
    to.row > 9 ||
    to.col < 0 ||
    to.col > 8 ||
    from.row < 0 ||
    from.row > 9 ||
    from.col < 0 ||
    from.col > 8
  ) {
    return false;
  }

  // Can't move to same position
  if (from.row === to.row && from.col === to.col) {
    return false;
  }

  // Can't capture own piece
  const targetPiece = board[to.row][to.col];
  if (targetPiece && targetPiece.color === piece.color) {
    return false;
  }

  // Check piece-specific rules
  switch (piece.type) {
    case 'king':
      return isValidKingMove(board, move);
    case 'advisor':
      return isValidAdvisorMove(board, move);
    case 'elephant':
      return isValidElephantMove(board, move);
    case 'horse':
      return isValidHorseMove(board, move);
    case 'rook':
      return isValidRookMove(board, move);
    case 'cannon':
      return isValidCannonMove(board, move);
    case 'pawn':
      return isValidPawnMove(board, move);
    default:
      return false;
  }
}

/**
 * King (将/帅) moves
 * - Moves one step horizontally or vertically within the palace
 * - Cannot face the opponent king directly
 */
function isValidKingMove(board: BoardState, move: Move): boolean {
  const { from, to, piece } = move;
  const rowDiff = Math.abs(to.row - from.row);
  const colDiff = Math.abs(to.col - from.col);

  // Must move exactly one step
  if (rowDiff + colDiff !== 1) return false;

  // Must stay in palace
  const isInPalace =
    piece.color === 'red'
      ? to.row >= 7 && to.row <= 9 && to.col >= 3 && to.col <= 5
      : to.row >= 0 && to.row <= 2 && to.col >= 3 && to.col <= 5;

  if (!isInPalace) return false;

  // Check if facing opponent king directly
  return !isFacingKings(board, to, piece.color);
}

/**
 * Advisor (士/仕) moves
 * - Moves one step diagonally within the palace
 */
function isValidAdvisorMove(board: BoardState, move: Move): boolean {
  const { from, to, piece } = move;
  const rowDiff = Math.abs(to.row - from.row);
  const colDiff = Math.abs(to.col - from.col);

  // Must move exactly one step diagonally
  if (rowDiff !== 1 || colDiff !== 1) return false;

  // Must stay in palace
  return piece.color === 'red'
    ? to.row >= 7 && to.row <= 9 && to.col >= 3 && to.col <= 5
    : to.row >= 0 && to.row <= 2 && to.col >= 3 && to.col <= 5;
}

/**
 * Elephant (象/相) moves
 * - Moves two steps diagonally
 * - Cannot cross the river
 * - Blocked if there's a piece in the middle
 */
function isValidElephantMove(board: BoardState, move: Move): boolean {
  const { from, to, piece } = move;
  const rowDiff = Math.abs(to.row - from.row);
  const colDiff = Math.abs(to.col - from.col);

  // Must move exactly two steps diagonally
  if (rowDiff !== 2 || colDiff !== 2) return false;

  // Check if blocked
  const midRow = (from.row + to.row) / 2;
  const midCol = (from.col + to.col) / 2;
  if (board[midRow][midCol]) return false;

  // Cannot cross river
  if (piece.color === 'red') {
    return to.row >= 5; // Red elephants stay on their side
  } else {
    return to.row <= 4; // Black elephants stay on their side
  }
}

/**
 * Horse (马) moves
 * - Moves like a knight: one step orthogonally, then one step diagonally
 * - Blocked if there's a piece in the orthogonal direction
 */
function isValidHorseMove(board: BoardState, move: Move): boolean {
  const { from, to, piece } = move;
  const rowDiff = Math.abs(to.row - from.row);
  const colDiff = Math.abs(to.col - from.col);

  // Must be L-shaped: (2,1) or (1,2)
  if (!((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2))) {
    return false;
  }

  // Check if blocked
  let blockRow = from.row;
  let blockCol = from.col;

  if (rowDiff === 2) {
    blockRow = from.row + (to.row > from.row ? 1 : -1);
  } else {
    blockCol = from.col + (to.col > from.col ? 1 : -1);
  }

  return !board[blockRow][blockCol];
}

/**
 * Rook (车) moves
 * - Moves any number of steps horizontally or vertically
 * - Cannot jump over pieces
 */
function isValidRookMove(board: BoardState, move: Move): boolean {
  const { from, to } = move;
  const rowDiff = to.row - from.row;
  const colDiff = to.col - from.col;

  // Must move horizontally or vertically
  if (rowDiff !== 0 && colDiff !== 0) return false;

  // Check if path is clear
  if (rowDiff === 0) {
    // Horizontal move
    const start = Math.min(from.col, to.col);
    const end = Math.max(from.col, to.col);
    for (let col = start + 1; col < end; col++) {
      if (board[from.row][col]) return false;
    }
  } else {
    // Vertical move
    const start = Math.min(from.row, to.row);
    const end = Math.max(from.row, to.row);
    for (let row = start + 1; row < end; row++) {
      if (board[row][from.col]) return false;
    }
  }

  return true;
}

/**
 * Cannon (炮) moves
 * - Moves like a rook when not capturing
 * - When capturing, must jump over exactly one piece
 */
function isValidCannonMove(board: BoardState, move: Move): boolean {
  const { from, to } = move;
  const rowDiff = to.row - from.row;
  const colDiff = to.col - from.col;

  // Must move horizontally or vertically
  if (rowDiff !== 0 && colDiff !== 0) return false;

  const targetPiece = board[to.row][to.col];
  const isCapture = targetPiece !== null;

  if (isCapture) {
    // When capturing, must jump over exactly one piece
    let pieceCount = 0;
    if (rowDiff === 0) {
      const start = Math.min(from.col, to.col);
      const end = Math.max(from.col, to.col);
      for (let col = start + 1; col < end; col++) {
        if (board[from.row][col]) pieceCount++;
      }
    } else {
      const start = Math.min(from.row, to.row);
      const end = Math.max(from.row, to.row);
      for (let row = start + 1; row < end; row++) {
        if (board[row][from.col]) pieceCount++;
      }
    }
    return pieceCount === 1;
  } else {
    // When not capturing, path must be clear (like rook)
    if (rowDiff === 0) {
      const start = Math.min(from.col, to.col);
      const end = Math.max(from.col, to.col);
      for (let col = start + 1; col < end; col++) {
        if (board[from.row][col]) return false;
      }
    } else {
      const start = Math.min(from.row, to.row);
      const end = Math.max(from.row, to.row);
      for (let row = start + 1; row < end; row++) {
        if (board[row][from.col]) return false;
      }
    }
    return true;
  }
}

/**
 * Pawn (兵/卒) moves
 * - Before crossing river: moves forward only
 * - After crossing river: moves forward or horizontally
 */
function isValidPawnMove(board: BoardState, move: Move): boolean {
  const { from, to, piece } = move;
  const rowDiff = to.row - from.row;
  const colDiff = Math.abs(to.col - from.col);

  const isAcrossRiver =
    piece.color === 'red' ? from.row <= 4 : from.row >= 5;

  if (!isAcrossRiver) {
    // Before crossing river: only forward
    if (piece.color === 'red') {
      return rowDiff === -1 && colDiff === 0;
    } else {
      return rowDiff === 1 && colDiff === 0;
    }
  } else {
    // After crossing river: forward or horizontal
    if (piece.color === 'red') {
      return (rowDiff === -1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    } else {
      return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    }
  }
}

/**
 * Check if two kings are facing each other directly
 */
function isFacingKings(
  board: BoardState,
  position: BoardPosition,
  color: 'red' | 'black'
): boolean {
  const kingCol = position.col;
  let foundOwnKing = false;
  let foundOpponentKing = false;

  for (let row = 0; row <= 9; row++) {
    const piece = board[row][kingCol];
    if (piece && piece.type === 'king') {
      if (piece.color === color) {
        foundOwnKing = true;
      } else {
        foundOpponentKing = true;
      }
    }
  }

  if (!foundOwnKing || !foundOpponentKing) return false;

  // Check if path is clear between kings
  const ownKingRow = color === 'red' ? 9 : 0;
  const opponentKingRow = color === 'red' ? 0 : 9;
  const start = Math.min(ownKingRow, opponentKingRow);
  const end = Math.max(ownKingRow, opponentKingRow);

  let pieceCount = 0;
  for (let row = start + 1; row < end; row++) {
    if (board[row][kingCol]) pieceCount++;
  }

  return pieceCount === 0;
}

/**
 * Get all valid moves for a piece
 */
export function getValidMoves(
  board: BoardState,
  position: BoardPosition,
  isHiddenChess: boolean = false
): BoardPosition[] {
  const piece = board[position.row][position.col];
  if (!piece) return [];

  const validMoves: BoardPosition[] = [];

  // Try all possible positions
  for (let row = 0; row <= 9; row++) {
    for (let col = 0; col <= 8; col++) {
      const move: Move = {
        from: position,
        to: { row, col },
        piece,
        captured: board[row][col] || undefined,
      };

      if (isValidMove(board, move, isHiddenChess)) {
        validMoves.push({ row, col });
      }
    }
  }

  return validMoves;
}

