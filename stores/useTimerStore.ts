'use client';

import { create } from 'zustand';

export type TimerPlayer = 'red' | 'black';

interface TimerState {
  // Time remaining in seconds for each player
  redTime: number;
  blackTime: number;
  // Which player's timer is currently running (null if paused)
  activePlayer: TimerPlayer | null;
  // Initial time setting (in seconds)
  initialTime: number;
  // Increment per move (in seconds, optional)
  increment: number;
  // Is the game timer running?
  isRunning: boolean;
  // Interval ID for the countdown
  intervalId: NodeJS.Timeout | null;
  // Has any player run out of time?
  timeoutPlayer: TimerPlayer | null;
}

interface TimerActions {
  // Initialize timer with settings
  initTimer: (initialTime: number, increment?: number) => void;
  // Start the timer for a specific player
  startTimer: (player: TimerPlayer) => void;
  // Switch to the other player's timer (with increment)
  switchPlayer: () => void;
  // Pause the timer
  pauseTimer: () => void;
  // Resume the timer
  resumeTimer: () => void;
  // Reset to initial state
  resetTimer: () => void;
  // Get formatted time string (MM:SS)
  getFormattedTime: (player: TimerPlayer) => string;
  // Tick function (internal, called by interval)
  tick: () => void;
}

type TimerStore = TimerState & TimerActions;

// Default 10 minutes per player
const DEFAULT_TIME = 10 * 60;

export const useTimerStore = create<TimerStore>()((set, get) => ({
  // Initial state
  redTime: DEFAULT_TIME,
  blackTime: DEFAULT_TIME,
  activePlayer: null,
  initialTime: DEFAULT_TIME,
  increment: 0,
  isRunning: false,
  intervalId: null,
  timeoutPlayer: null,

  // Initialize timer with settings
  initTimer: (initialTime: number, increment: number = 0) => {
    const state = get();
    // Clear any existing interval
    if (state.intervalId) {
      clearInterval(state.intervalId);
    }

    set({
      redTime: initialTime,
      blackTime: initialTime,
      initialTime,
      increment,
      activePlayer: null,
      isRunning: false,
      intervalId: null,
      timeoutPlayer: null,
    });
  },

  // Start the timer for a specific player
  startTimer: (player: TimerPlayer) => {
    const state = get();

    // Clear any existing interval
    if (state.intervalId) {
      clearInterval(state.intervalId);
    }

    // Create new interval
    const intervalId = setInterval(() => {
      get().tick();
    }, 1000);

    set({
      activePlayer: player,
      isRunning: true,
      intervalId,
    });
  },

  // Switch to the other player's timer (called after a move)
  switchPlayer: () => {
    const state = get();

    if (!state.activePlayer || !state.isRunning) return;

    const currentPlayer = state.activePlayer;
    const nextPlayer: TimerPlayer = currentPlayer === 'red' ? 'black' : 'red';

    // Add increment to current player's time
    const currentTimeKey = currentPlayer === 'red' ? 'redTime' : 'blackTime';
    const newTime = state[currentTimeKey] + state.increment;

    set({
      [currentTimeKey]: newTime,
      activePlayer: nextPlayer,
    });
  },

  // Pause the timer
  pauseTimer: () => {
    const state = get();

    if (state.intervalId) {
      clearInterval(state.intervalId);
    }

    set({
      isRunning: false,
      intervalId: null,
    });
  },

  // Resume the timer
  resumeTimer: () => {
    const state = get();

    if (!state.activePlayer || state.isRunning) return;

    // Create new interval
    const intervalId = setInterval(() => {
      get().tick();
    }, 1000);

    set({
      isRunning: true,
      intervalId,
    });
  },

  // Reset to initial state
  resetTimer: () => {
    const state = get();

    // Clear any existing interval
    if (state.intervalId) {
      clearInterval(state.intervalId);
    }

    set({
      redTime: state.initialTime,
      blackTime: state.initialTime,
      activePlayer: null,
      isRunning: false,
      intervalId: null,
      timeoutPlayer: null,
    });
  },

  // Get formatted time string (MM:SS)
  getFormattedTime: (player: TimerPlayer) => {
    const state = get();
    const time = player === 'red' ? state.redTime : state.blackTime;

    const minutes = Math.floor(time / 60);
    const seconds = time % 60;

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  },

  // Tick function (decrement active player's time)
  tick: () => {
    const state = get();

    if (!state.activePlayer || !state.isRunning) return;

    const timeKey = state.activePlayer === 'red' ? 'redTime' : 'blackTime';
    const currentTime = state[timeKey];

    if (currentTime <= 0) {
      // Time's up!
      if (state.intervalId) {
        clearInterval(state.intervalId);
      }
      set({
        [timeKey]: 0,
        isRunning: false,
        intervalId: null,
        timeoutPlayer: state.activePlayer,
      });
      return;
    }

    set({
      [timeKey]: currentTime - 1,
    });
  },
}));
