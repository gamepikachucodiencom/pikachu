import { create } from 'zustand';
import type { Notification } from './types';

export type GameModeModalInitialMode = 'ai' | 'online' | 'co-up' | 'standard';

interface UIStore {
  // Modals
  isSettingsModalOpen: boolean;
  isShopModalOpen: boolean;
  isGameOverModalOpen: boolean;
  isInviteModalOpen: boolean;
  gameModeModalOpen: boolean;
  gameModeModalInitialMode: GameModeModalInitialMode;

  // Notifications
  notifications: Notification[];

  // Sidebar
  isSidebarOpen: boolean;

  // Loading states
  isPageLoading: boolean;

  // Sound (shared with useSoundManager / useGameSound)
  soundMuted: boolean;
  setSoundMuted: (muted: boolean) => void;

  // Actions - Modals
  openSettingsModal: () => void;
  closeSettingsModal: () => void;
  openShopModal: () => void;
  closeShopModal: () => void;
  openGameOverModal: () => void;
  closeGameOverModal: () => void;
  openInviteModal: () => void;
  closeInviteModal: () => void;
  openGameModeModal: (initialMode?: GameModeModalInitialMode) => void;
  closeGameModeModal: () => void;

  // Actions - Notifications
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;

  // Actions - Sidebar
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Actions - Loading
  setPageLoading: (loading: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  // Initial state
  isSettingsModalOpen: false,
  isShopModalOpen: false,
  isGameOverModalOpen: false,
  isInviteModalOpen: false,
  gameModeModalOpen: false,
  gameModeModalInitialMode: 'standard',
  notifications: [],
  isSidebarOpen: false,
  isPageLoading: false,
  soundMuted: false,
  setSoundMuted: (muted: boolean) => {
    set({ soundMuted: muted });
    if (typeof window !== 'undefined') {
      localStorage.setItem('game_sounds_muted', String(muted));
    }
  },

  // Modal actions
  openSettingsModal: () => set({ isSettingsModalOpen: true }),
  closeSettingsModal: () => set({ isSettingsModalOpen: false }),
  openShopModal: () => set({ isShopModalOpen: true }),
  closeShopModal: () => set({ isShopModalOpen: false }),
  openGameOverModal: () => set({ isGameOverModalOpen: true }),
  closeGameOverModal: () => set({ isGameOverModalOpen: false }),
  openInviteModal: () => set({ isInviteModalOpen: true }),
  closeInviteModal: () => set({ isInviteModalOpen: false }),
  openGameModeModal: (initialMode = 'standard') =>
    set({ gameModeModalOpen: true, gameModeModalInitialMode: initialMode }),
  closeGameModeModal: () => set({ gameModeModalOpen: false }),

  // Notification actions
  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        {
          ...notification,
          id: `${Date.now()}-${Math.random()}`,
        },
      ],
    })),

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  clearNotifications: () => set({ notifications: [] }),

  // Sidebar actions
  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),

  // Loading actions
  setPageLoading: (loading) => set({ isPageLoading: loading }),
}));
