/**
 * AI Engine Integration using ffish-es6 for legal moves and minimax for move selection.
 */

import { getBestMove as getBestMoveMinimax } from '@/lib/game/ai/minimax';
import { AI_ENGINE_TIMEOUT } from '@/lib/constants/config';

// Type for ffish engine module (initialized engine)
interface FfishEngine {
  Board: new (variant?: string) => {
    setFen: (fen: string) => void;
    legalMoves: () => string;
    delete: () => void;
  };
}

export interface AIEngine {
  getBestMove: (fen: string, depth?: number) => Promise<string | null>;
  isReady: () => boolean;
  destroy: () => void;
}

/**
 * Create AI engine instance (minimax + alpha-beta over ffish legal moves).
 * @param engineModule - The initialized ffish engine module (after calling ffish factory)
 */
export async function createAIEngine(
  engineModule: FfishEngine,
  difficulty: 'easy' | 'medium' | 'hard' | 'very-hard' = 'medium'
): Promise<AIEngine> {
  const depthMap = {
    easy: 2,
    medium: 4,
    hard: 6,
    'very-hard': 8,
  };

  const depth = depthMap[difficulty];
  let board: InstanceType<FfishEngine['Board']> | null = null;

  try {
    if (!engineModule.Board || typeof engineModule.Board !== 'function') {
      throw new Error(
        'Board constructor not available. Make sure the ffish module is properly initialized.'
      );
    }
    board = new engineModule.Board('xiangqi');
  } catch (error) {
    console.error('Failed to initialize AI engine:', error);
    throw error;
  }

  return {
    isReady: () => board !== null,

    getBestMove: async (fen: string, depthOverride?: number): Promise<string | null> => {
      if (!board) return null;
      try {
        const searchDepth = depthOverride ?? depth;
        const move = await getBestMoveMinimax(fen, searchDepth, board);
        return move || null;
      } catch (error) {
        console.error('Error getting AI move:', error);
        return null;
      }
    },

    destroy: () => {
      if (board) {
        board.delete();
        board = null;
      }
    },
  };
}

/**
 * Get AI move using worker (for better performance)
 */
export async function getAIMoveFromWorker(
  worker: Worker,
  fen: string,
  depth: number = 4
): Promise<string | null> {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve(null);
    }, AI_ENGINE_TIMEOUT); // AI engine timeout

    const handleMessage = (e: MessageEvent) => {
      if (e.data.type === 'BEST_MOVE') {
        clearTimeout(timeout);
        worker.removeEventListener('message', handleMessage);
        resolve(e.data.move);
      } else if (e.data.type === 'ERROR') {
        clearTimeout(timeout);
        worker.removeEventListener('message', handleMessage);
        resolve(null);
      }
    };

    worker.addEventListener('message', handleMessage);
    worker.postMessage({
      type: 'GET_MOVE',
      fen,
      depth,
    });
  });
}
