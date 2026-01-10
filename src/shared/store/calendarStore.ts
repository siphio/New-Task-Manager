import { create } from 'zustand';
import { startOfWeek, addWeeks } from 'date-fns';

interface CalendarState {
  selectedDate: Date;
  weekStart: Date;

  setSelectedDate: (date: Date) => void;
  goToNextWeek: () => void;
  goToPrevWeek: () => void;
  goToToday: () => void;
}

export const useCalendarStore = create<CalendarState>((set) => ({
  selectedDate: new Date(),
  weekStart: startOfWeek(new Date(), { weekStartsOn: 1 }),

  setSelectedDate: (date) => set({ selectedDate: date }),

  goToNextWeek: () => set((state) => ({
    weekStart: addWeeks(state.weekStart, 1),
  })),

  goToPrevWeek: () => set((state) => ({
    weekStart: addWeeks(state.weekStart, -1),
  })),

  goToToday: () => {
    const today = new Date();
    set({
      selectedDate: today,
      weekStart: startOfWeek(today, { weekStartsOn: 1 }),
    });
  },
}));
