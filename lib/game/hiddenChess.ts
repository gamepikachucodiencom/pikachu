/**
 * Hidden Chess (Cờ Úp) Logic
 * In hidden chess, pieces are face-down and revealed when moved
 */

import type { Piece, BoardPosition } from '@/lib/chess/boardUtils';
import type { BoardState } from './chessRules';

export interface HiddenPiece {
  piece: Piece | null;
  isRevealed: boolean;
  isFaceDown: boolean;
}

export type HiddenBoardState = HiddenPiece[][];

/**
 * Initialize hidden chess board
 * Pieces are randomly placed face-down
 */
export function initializeHiddenBoard(): HiddenBoardState {
  const board: HiddenBoardState = Array(10)
    .fill(null)
    .map(() =>
      Array(9).fill(null).map(() => ({
        piece: null,
        isRevealed: false,
        isFaceDown: true,
      }))
    );

  // Standard starting pieces (will be shuffled)
  const redPieces: Piece[] = [
    { type: 'king', color: 'red', symbol: 'K' },
    { type: 'advisor', color: 'red', symbol: 'A' },
    { type: 'advisor', color: 'red', symbol: 'A' },
    { type: 'elephant', color: 'red', symbol: 'B' },
    { type: 'elephant', color: 'red', symbol: 'B' },
    { type: 'horse', color: 'red', symbol: 'N' },
    { type: 'horse', color: 'red', symbol: 'N' },
    { type: 'rook', color: 'red', symbol: 'R' },
    { type: 'rook', color: 'red', symbol: 'R' },
    { type: 'cannon', color: 'red', symbol: 'C' },
    { type: 'cannon', color: 'red', symbol: 'C' },
    { type: 'pawn', color: 'red', symbol: 'P' },
    { type: 'pawn', color: 'red', symbol: 'P' },
    { type: 'pawn', color: 'red', symbol: 'P' },
    { type: 'pawn', color: 'red', symbol: 'P' },
    { type: 'pawn', color: 'red', symbol: 'P' },
  ];

  const blackPieces: Piece[] = [
    { type: 'king', color: 'black', symbol: 'k' },
    { type: 'advisor', color: 'black', symbol: 'a' },
    { type: 'advisor', color: 'black', symbol: 'a' },
    { type: 'elephant', color: 'black', symbol: 'b' },
    { type: 'elephant', color: 'black', symbol: 'b' },
    { type: 'horse', color: 'black', symbol: 'n' },
    { type: 'horse', color: 'black', symbol: 'n' },
    { type: 'rook', color: 'black', symbol: 'r' },
    { type: 'rook', color: 'black', symbol: 'r' },
    { type: 'cannon', color: 'black', symbol: 'c' },
    { type: 'cannon', color: 'black', symbol: 'c' },
    { type: 'pawn', color: 'black', symbol: 'p' },
    { type: 'pawn', color: 'black', symbol: 'p' },
    { type: 'pawn', color: 'black', symbol: 'p' },
    { type: 'pawn', color: 'black', symbol: 'p' },
    { type: 'pawn', color: 'black', symbol: 'p' },
  ];

  // Shuffle pieces
  const shuffledRed = shuffleArray([...redPieces]);
  const shuffledBlack = shuffleArray([...blackPieces]);

  // Place red pieces (rows 6-9)
  let redIndex = 0;
  for (let row = 6; row <= 9; row++) {
    for (let col = 0; col <= 8; col++) {
      if (redIndex < shuffledRed.length) {
        board[row][col] = {
          piece: shuffledRed[redIndex],
          isRevealed: false,
          isFaceDown: true,
        };
        redIndex++;
      }
    }
  }

  // Place black pieces (rows 0-3)
  let blackIndex = 0;
  for (let row = 0; row <= 3; row++) {
    for (let col = 0; col <= 8; col++) {
      if (blackIndex < shuffledBlack.length) {
        board[row][col] = {
          piece: shuffledBlack[blackIndex],
          isRevealed: false,
          isFaceDown: true,
        };
        blackIndex++;
      }
    }
  }

  return board;
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Reveal a piece when moved
 */
export function revealPiece(
  board: HiddenBoardState,
  position: BoardPosition
): HiddenBoardState {
  const newBoard = board.map((row) => row.map((cell) => ({ ...cell })));
  const cell = newBoard[position.row][position.col];

  if (cell && cell.isFaceDown) {
    cell.isRevealed = true;
    cell.isFaceDown = false;
  }

  return newBoard;
}

/**
 * Make a move in hidden chess
 * Piece is revealed when moved
 */
export function makeHiddenMove(
  board: HiddenBoardState,
  from: BoardPosition,
  to: BoardPosition
): HiddenBoardState {
  const newBoard = board.map((row) => row.map((cell) => ({ ...cell })));

  // Reveal source piece
  const sourceCell = newBoard[from.row][from.col];
  if (sourceCell) {
    sourceCell.isRevealed = true;
    sourceCell.isFaceDown = false;
  }

  // Move piece
  const targetCell = newBoard[to.row][to.col];
  newBoard[to.row][to.col] = {
    piece: sourceCell.piece,
    isRevealed: true,
    isFaceDown: false,
  };

  // Clear source
  newBoard[from.row][from.col] = {
    piece: null,
    isRevealed: false,
    isFaceDown: false,
  };

  return newBoard;
}

/**
 * Convert hidden board to regular board state
 * (for move validation)
 */
export function hiddenToRegularBoard(
  hiddenBoard: HiddenBoardState
): BoardState {
  return hiddenBoard.map((row) =>
    row.map((cell) => (cell.isRevealed ? cell.piece : null))
  );
}

/**
 * Check if a move is valid in hidden chess
 * In hidden chess, any move to an empty square or opponent piece is valid
 * until the piece is revealed
 */
export function isValidHiddenMove(
  board: HiddenBoardState,
  from: BoardPosition,
  to: BoardPosition,
  currentPlayer: 'red' | 'black'
): boolean {
  const sourceCell = board[from.row][from.col];
  if (!sourceCell || !sourceCell.piece) return false;

  // Can't move if piece belongs to opponent
  if (sourceCell.piece.color !== currentPlayer) return false;

  const targetCell = board[to.row][to.col];

  // Can move to empty square
  if (!targetCell.piece) return true;

  // Can capture opponent piece
  if (targetCell.piece.color !== currentPlayer) {
    // If source is revealed, use normal chess rules
    if (sourceCell.isRevealed) {
      // Use regular validation (import from chessRules)
      return true; // Simplified - should use actual validation
    }
    // If not revealed, can capture any opponent piece
    return true;
  }

  return false;
}

