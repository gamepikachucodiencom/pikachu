'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '@/stores';
import { useToast } from '@/components/ui/Toast/ToastProvider';
import { useGameSound } from '@/hooks/useGameSound';
import type { Piece, BoardPosition } from '@/lib/chess/boardUtils';
import { isValidMove, getValidMoves, type Move } from '@/lib/game/chessRules';
import { isInCheck, doesMoveLeaveKingInCheck } from '@/lib/game/gameState';
import { parseFen, makeMoveOnBoard, boardToFen } from '@/lib/chess/boardUtils';
import { createAIEngine, type AIEngine } from '@/lib/game/aiEngine';

type GameMode = 'ai' | 'online' | 'pass-n-play';
type Difficulty = 'easy' | 'medium' | 'hard' | 'very-hard';

const DIFFICULTY_DEPTHS: Record<Difficulty, number> = {
  easy: 2,
  medium: 4,
  hard: 6,
  'very-hard': 8,
};

interface UseXiangqiGameOptions {
  mode: GameMode;
  aiDifficulty?: Difficulty;
  onCheck?: (color: 'red' | 'black') => void;
  onCheckmate?: (color: 'red' | 'black') => void;
  /** When provided, invalid-move messages (e.g. "Đi nước này sẽ mất tướng") are shown via this callback for board-center display instead of global toast */
  onBoardCenterMessage?: (message: string, type?: 'error' | 'info') => void;
}

interface UseXiangqiGameReturn {
  // State
  fen: string;
  turn: 'red' | 'black';
  selectedPiece: BoardPosition | null;
  validMoves: BoardPosition[];
  isAIThinking: boolean;
  isAnimating: boolean;
  captureTextVisible: boolean; // true while "Ăn" is on screen; blocks player and AI
  setCaptureTextVisible: (visible: boolean) => void;
  pendingCapture: {
    fromRow: number;
    fromCol: number;
    toRow: number;
    toCol: number;
  } | null;

  // Handlers
  handleSquareClick: (row: number, col: number) => void;
  handlePieceClick: (row: number, col: number, piece: Piece | null) => void;
  handleAnimateCapture: (
    fromRow: number,
    fromCol: number,
    toRow: number,
    toCol: number
  ) => Promise<void>;
  restartGame: () => void;
  undoMove: () => void;
}

export function useXiangqiGame(
  options: UseXiangqiGameOptions
): UseXiangqiGameReturn {
  const { mode, aiDifficulty = 'medium', onCheck, onCheckmate, onBoardCenterMessage } = options;
  const { showToast } = useToast();
  const gameSound = useGameSound(); // For instant sound feedback
  const {
    boardFen,
    currentPlayer,
    status,
    setStatus,
    setCurrentPlayer,
    setBoardFen,
    addMove,
    resetBoard,
    bumpCheckPulse,
  } = useGameStore();

  const [selectedPosition, setSelectedPosition] =
    useState<BoardPosition | null>(null);
  const [validMoves, setValidMoves] = useState<BoardPosition[]>([]);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [captureTextVisible, setCaptureTextVisible] = useState(false);
  const [pendingCapture, setPendingCapture] = useState<{
    fromRow: number;
    fromCol: number;
    toRow: number;
    toCol: number;
  } | null>(null);

  const aiEngineRef = useRef<AIEngine | null>(null);
  const ffishModuleRef = useRef<any>(null);
  const aiMoveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize AI engine for AI mode
  useEffect(() => {
    if (mode !== 'ai' || status !== 'playing') {
      return;
    }

    const initAI = async () => {
      try {
        // Dynamically import ffish-es6
        const ffishModule = await import('ffish-es6');
        const ffishFactory = ffishModule.default;

        // Initialize the ffish engine module with locateFile option
        const engineModule = await ffishFactory({
          locateFile: (file: string) => {
            // Point to the public wasm folder
            if (file.endsWith('.wasm')) {
              return `${window.location.origin}/wasm/${file}`;
            }
            return file;
          },
        });

        // Store the initialized engine module
        ffishModuleRef.current = engineModule;

        // Create AI engine with selected difficulty
        const engine = await createAIEngine(
          engineModule,
          aiDifficulty === 'very-hard' ? 'hard' : aiDifficulty
        );
        aiEngineRef.current = engine;
      } catch (error) {
        console.error('Failed to initialize AI engine:', error);
        showToast('Không thể khởi tạo AI. Vui lòng thử lại.', 'error');
      }
    };

    initAI();

    return () => {
      if (aiEngineRef.current) {
        aiEngineRef.current.destroy();
        aiEngineRef.current = null;
      }
    };
  }, [mode, status, aiDifficulty, showToast]);

  // Make AI move
  const makeAIMove = useCallback(
    async (currentFen?: string) => {
      if (
        mode !== 'ai' ||
        !aiEngineRef.current ||
        !aiEngineRef.current.isReady()
      ) {
        console.error('AI engine not ready');
        return;
      }

      // Never play for the human: only move when it is actually black's (AI) turn
      if (useGameStore.getState().currentPlayer !== 'black') {
        return;
      }

      setIsAIThinking(true);

      try {
        const fenToUse = currentFen || boardFen;
        const depth = DIFFICULTY_DEPTHS[aiDifficulty];

        // Wait for both: minimax result and a minimum 500ms delay (feels less robotic)
        const [aiMove] = await Promise.all([
          aiEngineRef.current.getBestMove(fenToUse, depth),
          new Promise<void>((r) => setTimeout(r, 500)),
        ]);

        if (aiMove) {
          // Parse AI move (UCCI format from ffish)
          // Format: fromFile + fromRank + toFile + toRank
          // Examples: "a10a8" (from a10 to a8), "a1a2" (from a1 to a2)
          // Note: In Chinese chess, ranks are 1-10 (1 is bottom for black, 10 is top)
          // Our board: row 0 is top (black), row 9 is bottom (red)
          // So: rank 10 = row 0, rank 1 = row 9

          if (aiMove.length >= 4) {
            // Parse from position
            const fromFile = aiMove[0]; // a-i
            const fromCol = fromFile.charCodeAt(0) - 97; // a=0, b=1, etc.

            // Parse fromRank (can be 1-10, so 1 or 2 digits)
            let fromRankStr = '';
            let toFileIndex = 1;

            // Check if rank is 10 (two digits)
            if (aiMove.length >= 5 && aiMove[1] === '1' && aiMove[2] === '0') {
              fromRankStr = '10';
              toFileIndex = 3;
            } else {
              fromRankStr = aiMove[1];
              toFileIndex = 2;
            }

            const fromRank = parseInt(fromRankStr, 10);
            if (isNaN(fromRank) || fromRank < 1 || fromRank > 10) {
              console.error(
                'Invalid fromRank parsed:',
                fromRankStr,
                'from move:',
                aiMove
              );
              setIsAIThinking(false);
              return;
            }

            // Convert rank to row: rank 10 = row 0, rank 1 = row 9
            const fromRow = 10 - fromRank;

            // Parse to position
            const toFile = aiMove[toFileIndex];
            const toCol = toFile.charCodeAt(0) - 97;

            // Parse toRank (can be 1-10, so 1 or 2 digits)
            let toRankStr = '';
            const toRankStartIndex = toFileIndex + 1;
            if (toRankStartIndex < aiMove.length) {
              if (
                toRankStartIndex + 1 < aiMove.length &&
                aiMove[toRankStartIndex] === '1' &&
                aiMove[toRankStartIndex + 1] === '0'
              ) {
                toRankStr = '10';
              } else {
                toRankStr = aiMove[toRankStartIndex];
              }
            } else {
              console.error('Invalid AI move format: missing toRank', aiMove);
              setIsAIThinking(false);
              return;
            }

            const toRank = parseInt(toRankStr, 10);
            if (isNaN(toRank) || toRank < 1 || toRank > 10) {
              console.error(
                'Invalid toRank parsed:',
                toRankStr,
                'from move:',
                aiMove
              );
              setIsAIThinking(false);
              return;
            }

            // Convert rank to row: rank 10 = row 0, rank 1 = row 9
            const toRow = 10 - toRank;

            // Validate coordinates
            if (
              isNaN(fromRow) ||
              isNaN(fromCol) ||
              isNaN(toRow) ||
              isNaN(toCol) ||
              fromRow < 0 ||
              fromRow > 9 ||
              fromCol < 0 ||
              fromCol > 8 ||
              toRow < 0 ||
              toRow > 9 ||
              toCol < 0 ||
              toCol > 8
            ) {
              console.error('Invalid coordinates parsed:', {
                fromRow,
                fromCol,
                toRow,
                toCol,
                aiMove,
              });
              setIsAIThinking(false);
              return;
            }

            // Make move on board using the current FEN (not stale state)
            const currentBoard = parseFen(fenToUse);

            // Check if this is a capture move (piece exists at destination)
            const isCapture = !!currentBoard[toRow][toCol];

            if (isCapture) {
              // AI capture: only set pending capture. Do NOT update boardFen/addMove here.
              // ChessBoard will animate; when done, onAnimateCapture will apply the move and
              // setBoardFen. If we setBoardFen here, handleAnimateCapture would apply the move
              // again to the already-updated board and corrupt state (attacker piece disappears).
              setPendingCapture({
                fromRow,
                fromCol,
                toRow,
                toCol,
              });
              return;
            }

            const newBoard = makeMoveOnBoard(
              currentBoard,
              { row: fromRow, col: fromCol },
              { row: toRow, col: toCol }
            );
            const newFen = boardToFen(newBoard, 'red'); // Next player is red (human)

            // CRITICAL: Add move to history FIRST so ChessBoard can detect it for animation
            // This ensures the move is in moveHistory when the board state updates
            addMove(aiMove);

            // Update board state - this will trigger animation detection in ChessBoard
            // The ChessBoard component compares previousBoardRef with new board to detect moves
            setBoardFen(newFen);
            setCurrentPlayer('red');
          }
        } else {
          showToast('AI không thể đi. Có thể đã hết nước đi', 'info');
        }
      } catch (error) {
        console.error('AI move error:', error);
        showToast('Không thể lấy nước đi từ AI', 'error');
      } finally {
        setIsAIThinking(false);
      }
    },
    [
      mode,
      boardFen,
      aiDifficulty,
      setBoardFen,
      addMove,
      setCurrentPlayer,
      showToast,
    ]
  );

  // FIX DROP LAG: Watch for AI's turn and trigger with delay
  // This allows the browser to paint the drop animation before AI starts thinking
  // Must be defined AFTER makeAIMove to avoid "Cannot access before initialization" error
  useEffect(() => {
    // Only trigger when it's AI's turn, no animation, no pending capture, and "Ăn" not visible
    if (
      mode !== 'ai' ||
      status !== 'playing' ||
      currentPlayer !== 'black' ||
      isAIThinking ||
      isAnimating ||
      captureTextVisible ||
      pendingCapture !== null
    ) {
      return;
    }

    // Clear any existing timeout
    if (aiMoveTimeoutRef.current) {
      clearTimeout(aiMoveTimeoutRef.current);
      aiMoveTimeoutRef.current = null;
    }

    // FIX DROP LAG: Use setTimeout to yield control to browser
    // This allows the GSAP animation to start before AI blocks the main thread
    // Pass current boardFen to ensure we use the latest state
    const currentFen = boardFen;
    aiMoveTimeoutRef.current = setTimeout(() => {
      makeAIMove(currentFen);
    }, 650); // 650ms: after move+place animation (~550ms) so drop/sound stay smooth; AI no longer blocks main thread during drop

    return () => {
      if (aiMoveTimeoutRef.current) {
        clearTimeout(aiMoveTimeoutRef.current);
        aiMoveTimeoutRef.current = null;
      }
    };
  }, [
    mode,
    status,
    currentPlayer,
    isAIThinking,
    isAnimating,
    captureTextVisible,
    pendingCapture,
    boardFen,
    makeAIMove,
  ]);

  // Handle piece selection
  const handlePieceSelect = useCallback(
    (row: number, col: number) => {
      if (
        status !== 'playing' ||
        isAIThinking ||
        isAnimating ||
        captureTextVisible
      ) {
        return;
      }

      const board = parseFen(boardFen);
      const piece = board[row][col];

      if (!piece || piece.color !== currentPlayer) {
        return;
      }

      // If clicking the same piece, deselect it
      if (
        selectedPosition &&
        selectedPosition.row === row &&
        selectedPosition.col === col
      ) {
        setSelectedPosition(null);
        setValidMoves([]);
        return;
      }

      // Select piece and calculate valid moves (when in check, only moves that get out of check)
      const position = { row, col };
      let moves = getValidMoves(board, position);
      if (isInCheck(board, currentPlayer)) {
        moves = moves.filter(
          (to) =>
            !doesMoveLeaveKingInCheck(
              board,
              {
                from: position,
                to,
                piece,
              },
              currentPlayer
            )
        );
      }

      setSelectedPosition(position);
      setValidMoves(moves);
    },
    [
      boardFen,
      currentPlayer,
      status,
      isAIThinking,
      isAnimating,
      captureTextVisible,
      selectedPosition,
    ]
  );

  // Handle move execution
  const handleMove = useCallback(
    async (fromRow: number, fromCol: number, toRow: number, toCol: number) => {
      // Prevent moves during animation
      if (isAnimating || captureTextVisible) {
        return;
      }

      // Use selectedPosition if it exists, otherwise use provided coordinates
      const actualFromRow = selectedPosition?.row ?? fromRow;
      const actualFromCol = selectedPosition?.col ?? fromCol;

      const board = parseFen(boardFen);
      const fromPiece = board[actualFromRow][actualFromCol];

      if (!fromPiece) {
        console.error('No piece at from position!', {
          actualFromRow,
          actualFromCol,
        });
        return;
      }

      if (fromPiece.color !== currentPlayer) {
        console.error(
          'Piece at from position does not belong to current player!',
          {
            pieceColor: fromPiece.color,
            currentPlayer,
          }
        );
        return;
      }

      const move: Move = {
        from: { row: actualFromRow, col: actualFromCol },
        to: { row: toRow, col: toCol },
        piece: fromPiece,
        captured: board[toRow][toCol] || undefined,
      };

      if (!isValidMove(board, move)) {
        showToast('Nước đi không hợp lệ. Vui lòng chọn nước đi khác', 'error');
        return;
      }

      // Reject move if it would leave/put king in check (whether currently in check or not).
      if (doesMoveLeaveKingInCheck(board, move, currentPlayer)) {
        if (isInCheck(board, currentPlayer)) {
          bumpCheckPulse();
        }
        if (onBoardCenterMessage) {
          onBoardCenterMessage('Đi nước này sẽ mất tướng', 'error');
        } else {
          showToast('Đi nước này sẽ mất tướng', 'error');
        }
        return;
      }

      // OPTIMISTIC UI: Clear selection and valid moves after validation
      setSelectedPosition(null);
      setValidMoves([]);

      const isCapture = !!board[toRow][toCol];

      if (isCapture) {
        setIsAnimating(true);
        setPendingCapture({
          fromRow: actualFromRow,
          fromCol: actualFromCol,
          toRow,
          toCol,
        });
        return;
      }

      // REGULAR MOVE: Update state immediately so animation starts right away
      const newBoard = makeMoveOnBoard(
        board,
        { row: actualFromRow, col: actualFromCol },
        { row: toRow, col: toCol }
      );

      const nextPlayer = currentPlayer === 'red' ? 'black' : 'red';
      const newFen = boardToFen(newBoard, nextPlayer);

      const fromFile = String.fromCharCode(97 + actualFromCol);
      const fromRank = 10 - actualFromRow;
      const toFile = String.fromCharCode(97 + toCol);
      const toRank = 10 - toRow;
      const moveNotation = `${fromFile}${fromRank}${toFile}${toRank}`;

      addMove(moveNotation);
      setBoardFen(newFen);
    },
    [
      boardFen,
      currentPlayer,
      isAnimating,
      selectedPosition,
      mode,
      setBoardFen,
      addMove,
      setCurrentPlayer,
      makeAIMove,
      showToast,
      onBoardCenterMessage,
      gameSound,
    ]
  );

  // Handle capture animation completion
  const handleAnimateCapture = useCallback(
    async (
      fromRow: number,
      fromCol: number,
      toRow: number,
      toCol: number
    ): Promise<void> => {
      // This is called AFTER the animation completes
      // OPTIMISTIC UI: Clear selection immediately (already cleared, but ensure it's done)
      setSelectedPosition(null);
      setValidMoves([]);
      setIsAnimating(false);
      setPendingCapture(null); // Clear pending capture

      // OPTIMISTIC UI: Defer heavy game logic to next event loop tick
      // Update board first, then switch turn so the AI useEffect runs once with correct boardFen
      // (avoids race where effect runs on currentPlayer=black with stale boardFen then cleanup clears timeout)
      setTimeout(() => {
        // Use store state at run time so we get correct turn (closure can be stale after async animation)
        const state = useGameStore.getState();
        const board = parseFen(state.boardFen);
        // Idempotent: skip if this capture was already applied (handleAnimateCapture can run twice)
        if (!board[fromRow][fromCol] && board[toRow][toCol]) {
          return;
        }
        const newBoard = makeMoveOnBoard(
          board,
          { row: fromRow, col: fromCol },
          { row: toRow, col: toCol }
        );
        const nextPlayer = state.currentPlayer === 'red' ? 'black' : 'red';
        const newFen = boardToFen(newBoard, nextPlayer);

        // Make move notation
        const fromFile = String.fromCharCode(97 + fromCol);
        const fromRank = 10 - fromRow;
        const toFile = String.fromCharCode(97 + toCol);
        const toRank = 10 - toRow;
        const moveNotation = `${fromFile}${fromRank}${toFile}${toRank}`;

        // Update board first so when we flip turn the AI effect sees the new FEN
        setBoardFen(newFen);
        // Then flip turn (addMove updates currentPlayer) so AI useEffect runs once with correct state
        addMove(moveNotation);
      }, 10); // 10ms delay - enough for browser to repaint
    },
    [
      boardFen,
      currentPlayer,
      mode,
      setBoardFen,
      addMove,
      setCurrentPlayer,
      makeAIMove,
    ]
  );

  // Unified handler for clicking the board
  const handleSquareClick = useCallback(
    (row: number, col: number) => {
      if (
        status !== 'playing' ||
        isAIThinking ||
        isAnimating ||
        captureTextVisible
      ) {
        return;
      }

      // Only allow moves for human players (in AI mode, only red can move)
      if (mode === 'ai' && currentPlayer !== 'red') {
        return;
      }

      if (selectedPosition) {
        // Clear selection IMMEDIATELY before starting move (fixes double-click issue)
        const fromRow = selectedPosition.row;
        const fromCol = selectedPosition.col;
        setSelectedPosition(null);
        setValidMoves([]);

        // Start move (selection already cleared)
        handleMove(fromRow, fromCol, row, col);
      }
    },
    [
      status,
      isAIThinking,
      isAnimating,
      captureTextVisible,
      mode,
      currentPlayer,
      selectedPosition,
      handleMove,
    ]
  );

  // Handle piece click
  const handlePieceClick = useCallback(
    (row: number, col: number, piece: Piece | null) => {
      if (
        status !== 'playing' ||
        isAIThinking ||
        isAnimating ||
        captureTextVisible
      ) {
        return;
      }

      // Only allow moves for human players (in AI mode, only red can move)
      if (mode === 'ai' && currentPlayer !== 'red') {
        return;
      }

      if (!piece) {
        // Clicked empty square - try to move if piece is selected
        if (selectedPosition) {
          const fromRow = selectedPosition.row;
          const fromCol = selectedPosition.col;
          setSelectedPosition(null);
          setValidMoves([]);
          handleMove(fromRow, fromCol, row, col);
        }
        return;
      }

      // Check if piece belongs to current player
      if (piece.color !== currentPlayer) {
        // Clicked opponent's piece - try to capture if piece is selected
        if (selectedPosition) {
          const fromRow = selectedPosition.row;
          const fromCol = selectedPosition.col;
          setSelectedPosition(null);
          setValidMoves([]);
          handleMove(fromRow, fromCol, row, col);
        }
        return;
      }

      // Select piece
      handlePieceSelect(row, col);
    },
    [
      status,
      isAIThinking,
      isAnimating,
      captureTextVisible,
      mode,
      currentPlayer,
      selectedPosition,
      handleMove,
      handlePieceSelect,
    ]
  );

  // Restart game
  const restartGame = useCallback(() => {
    resetBoard();
    setSelectedPosition(null);
    setValidMoves([]);
    setIsAIThinking(false);
    setIsAnimating(false);
    setPendingCapture(null);
    if (aiEngineRef.current) {
      aiEngineRef.current.destroy();
      aiEngineRef.current = null;
    }
  }, [resetBoard]);

  // Undo move (basic implementation - can be enhanced later)
  const undoMove = useCallback(() => {
    // TODO: Implement undo functionality
    // This would require maintaining a move history stack
    showToast('Tính năng hoàn tác đang được phát triển', 'info');
  }, [showToast]);

  return {
    // State
    fen: boardFen,
    turn: currentPlayer,
    selectedPiece: selectedPosition,
    validMoves,
    isAIThinking,
    isAnimating,
    captureTextVisible,
    setCaptureTextVisible,
    pendingCapture,

    // Handlers
    handleSquareClick,
    handlePieceClick,
    handleAnimateCapture,
    restartGame,
    undoMove,
  };
}
