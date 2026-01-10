import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  dailyGoal: number;
  notificationsEnabled: boolean;
  bestStreak: number;

  setDailyGoal: (goal: number) => void;
  toggleNotifications: () => void;
  updateBestStreak: (streak: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      dailyGoal: 10,
      notificationsEnabled: true,
      bestStreak: 0,

      setDailyGoal: (dailyGoal) => set({ dailyGoal }),

      toggleNotifications: () =>
        set((state) => ({ notificationsEnabled: !state.notificationsEnabled })),

      updateBestStreak: (streak) => {
        if (streak > get().bestStreak) {
          set({ bestStreak: streak });
        }
      },
    }),
    {
      name: 'taskflow-settings',
    }
  )
);
