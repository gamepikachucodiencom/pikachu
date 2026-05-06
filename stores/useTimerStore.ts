'use client';

import { create } from 'zustand';

interface PikachuTimerState {
  timeLeft: number;
  maxTime: number; // Cần thiết để vẽ thanh tiến độ (Progress bar)
  level: number;
  isRunning: boolean;
  intervalId: NodeJS.Timeout | null;
}

interface PikachuTimerActions {
  initGameTimer: (level: number) => void;
  startGameTimer: () => void;
  pauseGameTimer: () => void;
  addBonusTime: (bonusSeconds: number) => void; // Hàm bơm máu khi nối đúng
  tick: () => void;
  clearTimer: () => void;
}

type PikachuTimerStore = PikachuTimerState & PikachuTimerActions;

// Hàm tính thời gian theo Cửa (Level)
const getInitialTime = (level: number) => {
  const baseTime = 600; // Cửa 1: 10 phút (600 giây)
  const timeReduction = (level - 1) * 30; // Mỗi cửa giảm 30 giây
  return Math.max(baseTime - timeReduction, 60); // Tối thiểu luôn chừa lại 60 giây
};

export const useTimerStore = create<PikachuTimerStore>()((set, get) => ({
  timeLeft: 600,
  maxTime: 600,
  level: 1,
  isRunning: false,
  intervalId: null,

  initGameTimer: (level: number) => {
    const { clearTimer } = get();
    clearTimer();

    const initialTime = getInitialTime(level);
    set({
      level,
      timeLeft: initialTime,
      maxTime: initialTime,
      isRunning: false,
    });
  },

  startGameTimer: () => {
    const state = get();
    if (state.isRunning) return;

    const intervalId = setInterval(() => {
      get().tick();
    }, 1000);

    set({ isRunning: true, intervalId });
  },

  pauseGameTimer: () => {
    const { intervalId } = get();
    if (intervalId) clearInterval(intervalId);
    set({ isRunning: false, intervalId: null });
  },

  // BƠM MÁU: Cộng thời gian nhưng không được vượt quá maxTime của cửa đó
  addBonusTime: (bonusSeconds: number) => {
    const { timeLeft, maxTime } = get();
    const newTime = Math.min(timeLeft + bonusSeconds, maxTime);
    set({ timeLeft: newTime });
  },

  tick: () => {
    const { timeLeft, clearTimer } = get();
    if (timeLeft <= 0) {
      clearTimer();
      return;
    }
    set({ timeLeft: timeLeft - 1 });
  },

  clearTimer: () => {
    const { intervalId } = get();
    if (intervalId) clearInterval(intervalId);
    set({ intervalId: null, isRunning: false });
  },
}));
