/**
 * Chinese Chess (Xiangqi) Board Utilities
 * Handles FEN parsing, position conversion, and piece mapping
 */

export type PieceType =
  | 'king' // 将/帅 (K/k)
  | 'advisor' // 士/仕 (A/a)
  | 'elephant' // 象/相 (B/b)
  | 'horse' // 马 (N/n)
  | 'rook' // 车 (R/r)
  | 'cannon' // 炮 (C/c)
  | 'pawn'; // 兵/卒 (P/p)

export type PieceColor = 'red' | 'black';

export interface Piece {
  type: PieceType;
  color: PieceColor;
  symbol: string; // FEN symbol (K, k, R, r, etc.)
}

export interface BoardPosition {
  row: number; // 0-9 (0 is top, 9 is bottom)
  col: number; // 0-8 (0 is left, 8 is right)
}

/**
 * Parse FEN string to board representation
 * Chinese chess board is 9x10 (9 files, 10 ranks)
 */
export function parseFen(fen: string): (Piece | null)[][] {
  const board: (Piece | null)[][] = Array(10)
    .fill(null)
    .map(() => Array(9).fill(null));

  const [positionPart] = fen.split(' '); // Get only the position part
  const ranks = positionPart.split('/');

  if (ranks.length !== 10) {
    console.error('Invalid FEN: Expected 10 ranks, got', ranks.length);
    return board;
  }

  ranks.forEach((rank, rankIndex) => {
    let fileIndex = 0;
    for (let i = 0; i < rank.length; i++) {
      const char = rank[i];
      const num = parseInt(char, 10);

      if (!isNaN(num)) {
        // Empty squares
        fileIndex += num;
      } else {
        // Piece
        const piece = fenToPiece(char);
        if (piece && fileIndex < 9) {
          board[rankIndex][fileIndex] = piece;
        }
        fileIndex++;
      }
    }
  });

  return board;
}

/**
 * Convert FEN symbol to Piece object
 */
export function fenToPiece(symbol: string): Piece | null {
  const pieceMap: Record<string, Piece> = {
    K: { type: 'king', color: 'red', symbol: 'K' },
    A: { type: 'advisor', color: 'red', symbol: 'A' },
    B: { type: 'elephant', color: 'red', symbol: 'B' },
    N: { type: 'horse', color: 'red', symbol: 'N' },
    R: { type: 'rook', color: 'red', symbol: 'R' },
    C: { type: 'cannon', color: 'red', symbol: 'C' },
    P: { type: 'pawn', color: 'red', symbol: 'P' },
    k: { type: 'king', color: 'black', symbol: 'k' },
    a: { type: 'advisor', color: 'black', symbol: 'a' },
    b: { type: 'elephant', color: 'black', symbol: 'b' },
    n: { type: 'horse', color: 'black', symbol: 'n' },
    r: { type: 'rook', color: 'black', symbol: 'r' },
    c: { type: 'cannon', color: 'black', symbol: 'c' },
    p: { type: 'pawn', color: 'black', symbol: 'p' },
  };

  return pieceMap[symbol] || null;
}

/**
 * Convert Piece object to FEN symbol
 */
export function pieceToFen(piece: Piece | null): string {
  if (!piece) return '';
  return piece.symbol;
}

/**
 * Convert board state to FEN string
 */
export function boardToFen(board: (Piece | null)[][], activeColor: 'red' | 'black' = 'red'): string {
  const ranks: string[] = [];

  for (let row = 0; row < 10; row++) {
    let rank = '';
    let emptyCount = 0;

    for (let col = 0; col < 9; col++) {
      const piece = board[row][col];
      if (piece) {
        if (emptyCount > 0) {
          rank += emptyCount.toString();
          emptyCount = 0;
        }
        rank += piece.symbol;
      } else {
        emptyCount++;
      }
    }

    if (emptyCount > 0) {
      rank += emptyCount.toString();
    }

    ranks.push(rank);
  }

  return `${ranks.join('/')} ${activeColor === 'red' ? 'w' : 'b'}`;
}

/**
 * Update board state after a move
 */
export function makeMoveOnBoard(
  board: (Piece | null)[][],
  from: BoardPosition,
  to: BoardPosition
): (Piece | null)[][] {
  const newBoard = board.map((rank) => [...rank]);
  const piece = newBoard[from.row][from.col];
  newBoard[to.row][to.col] = piece;
  newBoard[from.row][from.col] = null;
  return newBoard;
}

/**
 * Convert screen coordinates to board position
 */
export function screenToPosition(
  screenX: number,
  screenY: number,
  boardWidth: number,
  boardHeight: number
): BoardPosition | null {
  const cellWidth = boardWidth / 9;
  const cellHeight = boardHeight / 10;

  // Find nearest intersection point (pieces are at intersections)
  // Round to nearest intersection (col * cellWidth, row * cellHeight)
  const col = Math.round(screenX / cellWidth);
  const row = Math.round(screenY / cellHeight);

  if (row >= 0 && row <= 9 && col >= 0 && col <= 8) {
    return { row, col };
  }

  return null;
}

/**
 * Convert board position to screen coordinates (at intersection of lines)
 * In Chinese chess, pieces are placed at the intersections, not in the center of squares
 */
export function positionToScreen(
  row: number,
  col: number,
  boardWidth: number,
  boardHeight: number
): { x: number; y: number } {
  const cellWidth = boardWidth / 9;
  const cellHeight = boardHeight / 10;

  // Pieces are at intersections: x = col * cellWidth, y = row * cellHeight
  return {
    x: col * cellWidth,
    y: row * cellHeight,
  };
}
