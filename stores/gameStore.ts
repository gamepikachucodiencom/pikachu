import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameState, GameMode, PlayerColor, GameStatus } from './types';

interface GameStore extends GameState {
  // Actions
  setGameMode: (mode: GameMode) => void;
  setStatus: (status: GameStatus) => void;
  setCurrentPlayer: (player: PlayerColor) => void;
  setBoardFen: (fen: string) => void;
  addMove: (move: string) => void;
  addCapturedPiece: (color: PlayerColor, piece: string) => void;
  setTimeControl: (red: number, black: number) => void;
  setRoomCode: (code: string | undefined) => void;
  setOpponentId: (id: string | undefined) => void;
  setAiDifficulty: (difficulty: 'easy' | 'medium' | 'hard' | 'very-hard') => void;
  bumpCheckPulse: () => void;
  resetGame: () => void;
  resetBoard: () => void;
}

const initialGameState: GameState = {
  mode: 'human-vs-human',
  status: 'waiting',
  currentPlayer: 'red',
  boardFen: 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w',
  moveHistory: [],
  checkPulseNonce: 0,
  capturedPieces: {
    red: [],
    black: [],
  },
};

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      ...initialGameState,

      setGameMode: (mode) =>
        set((state) => ({
          mode,
          status: 'waiting',
          boardFen: initialGameState.boardFen,
          moveHistory: [],
          capturedPieces: { red: [], black: [] },
        })),

      setStatus: (status) => set({ status }),

      setCurrentPlayer: (player) => set({ currentPlayer: player }),

      setBoardFen: (fen) => set({ boardFen: fen }),

      addMove: (move) =>
        set((state) => ({
          moveHistory: [...state.moveHistory, move],
          currentPlayer: state.currentPlayer === 'red' ? 'black' : 'red',
        })),

      addCapturedPiece: (color, piece) =>
        set((state) => ({
          capturedPieces: {
            ...state.capturedPieces,
            [color]: [...state.capturedPieces[color], piece],
          },
        })),

      setTimeControl: (red, black) =>
        set({
          timeControl: { red, black },
        }),

      setRoomCode: (code) => set({ roomCode: code }),

      setOpponentId: (id) => set({ opponentId: id }),

      setAiDifficulty: (difficulty) => set({ aiDifficulty: difficulty }),

      bumpCheckPulse: () =>
        set((state) => ({
          checkPulseNonce: (state.checkPulseNonce ?? 0) + 1,
        })),

      resetGame: () =>
        set({
          ...initialGameState,
          mode: 'human-vs-human',
        }),

      resetBoard: () =>
        set({
          boardFen: initialGameState.boardFen,
          moveHistory: [],
          capturedPieces: { red: [], black: [] },
          currentPlayer: 'red',
          status: 'waiting',
        }),
    }),
    {
      name: 'chinese-chess-game-storage',
      partialize: (state) => ({
        mode: state.mode,
        aiDifficulty: state.aiDifficulty,
        // Don't persist game state, only preferences
      }),
    }
  )
);

