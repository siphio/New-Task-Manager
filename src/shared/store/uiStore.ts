import { create } from 'zustand';

interface UIState {
  isAddTaskModalOpen: boolean;
  activeNavItem: 'home' | 'calendar' | 'analytics' | 'profile';
  isMobileNavVisible: boolean;
  openAddTaskModal: () => void;
  closeAddTaskModal: () => void;
  setActiveNavItem: (item: UIState['activeNavItem']) => void;
  setMobileNavVisible: (visible: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isAddTaskModalOpen: false,
  activeNavItem: 'home',
  isMobileNavVisible: true,
  openAddTaskModal: () => set({ isAddTaskModalOpen: true }),
  closeAddTaskModal: () => set({ isAddTaskModalOpen: false }),
  setActiveNavItem: (activeNavItem) => set({ activeNavItem }),
  setMobileNavVisible: (isMobileNavVisible) => set({ isMobileNavVisible }),
}));
