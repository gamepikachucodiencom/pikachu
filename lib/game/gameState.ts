/**
 * Game State Detection Utilities
 * Handles check, checkmate, and game end conditions
 */

import type { Piece, BoardPosition } from '@/lib/chess/boardUtils';
import type { BoardState, Move } from './chessRules';
import { isValidMove, getValidMoves } from './chessRules';
import { makeMoveOnBoard } from '@/lib/chess/boardUtils';

/**
 * Check if a king is in check
 * A king is in check if it can be captured by an opponent piece
 */
export function isInCheck(
  board: BoardState,
  kingColor: 'red' | 'black'
): boolean {
  // Find the king
  let kingPosition: BoardPosition | null = null;
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 9; col++) {
      const piece = board[row][col];
      if (piece && piece.type === 'king' && piece.color === kingColor) {
        kingPosition = { row, col };
        break;
      }
    }
    if (kingPosition) break;
  }

  if (!kingPosition) return false; // No king found (shouldn't happen)

  // Check if any opponent piece can capture the king
  const opponentColor = kingColor === 'red' ? 'black' : 'red';
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 9; col++) {
      const piece = board[row][col];
      if (piece && piece.color === opponentColor) {
        const move: Move = {
          from: { row, col },
          to: kingPosition,
          piece,
        };
        if (isValidMove(board, move)) {
          return true; // King is in check
        }
      }
    }
  }

  return false;
}

/**
 * Check if a king is in checkmate
 * A king is in checkmate if it's in check and has no legal moves
 */
export function isCheckmate(
  board: BoardState,
  kingColor: 'red' | 'black'
): boolean {
  // First check if king is in check
  if (!isInCheck(board, kingColor)) {
    return false;
  }

  // Try all possible moves for all pieces of this color
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 9; col++) {
      const piece = board[row][col];
      if (piece && piece.color === kingColor) {
        const validMoves = getValidMoves(board, { row, col });
        
        // Try each valid move to see if it gets out of check
        for (const moveTo of validMoves) {
          const testBoard = makeMoveOnBoard(
            board,
            { row, col },
            moveTo
          );
          
          // Check if this move gets out of check
          if (!isInCheck(testBoard, kingColor)) {
            return false; // Found a move that gets out of check
          }
        }
      }
    }
  }

  // No moves can get out of check - it's checkmate
  return true;
}

/**
 * Find the king piece position
 */
export function findKing(
  board: BoardState,
  color: 'red' | 'black'
): BoardPosition | null {
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 9; col++) {
      const piece = board[row][col];
      if (piece && piece.type === 'king' && piece.color === color) {
        return { row, col };
      }
    }
  }
  return null;
}

/**
 * Returns true if making the given move would leave the moving side's king in check.
 * Used to reject moves that don't get out of check (or would put/leave king in check).
 */
export function doesMoveLeaveKingInCheck(
  board: BoardState,
  move: Move,
  kingColor: 'red' | 'black'
): boolean {
  const testBoard = makeMoveOnBoard(board, move.from, move.to);
  return isInCheck(testBoard, kingColor);
}

