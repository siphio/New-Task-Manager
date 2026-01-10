import { create } from 'zustand';

interface UIState {
  isAddTaskModalOpen: boolean;
  isTaskDrawerOpen: boolean;
  editingTaskId: string | null;
  activeNavItem: 'home' | 'calendar' | 'analytics' | 'profile';
  isMobileNavVisible: boolean;

  openAddTaskModal: () => void;
  closeAddTaskModal: () => void;
  openTaskDrawer: (taskId?: string) => void;
  closeTaskDrawer: () => void;
  setActiveNavItem: (item: UIState['activeNavItem']) => void;
  setMobileNavVisible: (visible: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isAddTaskModalOpen: false,
  isTaskDrawerOpen: false,
  editingTaskId: null,
  activeNavItem: 'home',
  isMobileNavVisible: true,

  openAddTaskModal: () => set({ isTaskDrawerOpen: true, editingTaskId: null }),
  closeAddTaskModal: () => set({ isTaskDrawerOpen: false, editingTaskId: null }),
  openTaskDrawer: (taskId) => set({
    isTaskDrawerOpen: true,
    editingTaskId: taskId || null
  }),
  closeTaskDrawer: () => set({ isTaskDrawerOpen: false, editingTaskId: null }),
  setActiveNavItem: (activeNavItem) => set({ activeNavItem }),
  setMobileNavVisible: (isMobileNavVisible) => set({ isMobileNavVisible }),
}));
