import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task, CreateTaskInput, UpdateTaskInput, Subtask } from '@/shared/types';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  selectedTaskId: string | null;

  // Actions
  setTasks: (tasks: Task[]) => void;
  addTask: (input: CreateTaskInput, userId: string) => Task;
  updateTask: (id: string, input: UpdateTaskInput) => void;
  deleteTask: (id: string) => void;
  toggleTaskComplete: (id: string) => void;
  toggleSubtaskComplete: (taskId: string, subtaskId: string) => void;
  addSubtask: (taskId: string, title: string) => void;
  removeSubtask: (taskId: string, subtaskId: string) => void;
  setSelectedTaskId: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Selectors
  getTaskById: (id: string) => Task | undefined;
  getTodaysTasks: () => Task[];
  getCompletedTodayCount: () => number;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      isLoading: false,
      error: null,
      selectedTaskId: null,

      setTasks: (tasks) => set({ tasks }),

      addTask: (input, userId) => {
        const now = new Date().toISOString();
        const newTask: Task = {
          id: uuidv4(),
          ...input,
          subtasks: (input.subtasks || []).map(s => ({ ...s, id: uuidv4() })),
          completed: false,
          createdAt: now,
          updatedAt: now,
          userId,
        };
        set((state) => ({ tasks: [newTask, ...state.tasks] }));
        return newTask;
      },

      updateTask: (id, input) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { ...task, ...input, updatedAt: new Date().toISOString() }
              : task
          ),
        }));
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }));
      },

      toggleTaskComplete: (id) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? {
                  ...task,
                  completed: !task.completed,
                  completedAt: !task.completed ? new Date().toISOString() : undefined,
                  updatedAt: new Date().toISOString(),
                }
              : task
          ),
        }));
      },

      toggleSubtaskComplete: (taskId, subtaskId) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  subtasks: task.subtasks.map((s) =>
                    s.id === subtaskId ? { ...s, completed: !s.completed } : s
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : task
          ),
        }));
      },

      addSubtask: (taskId, title) => {
        const newSubtask: Subtask = {
          id: uuidv4(),
          title,
          completed: false,
        };
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  subtasks: [...task.subtasks, newSubtask],
                  updatedAt: new Date().toISOString(),
                }
              : task
          ),
        }));
      },

      removeSubtask: (taskId, subtaskId) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  subtasks: task.subtasks.filter((s) => s.id !== subtaskId),
                  updatedAt: new Date().toISOString(),
                }
              : task
          ),
        }));
      },

      setSelectedTaskId: (id) => set({ selectedTaskId: id }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      getTaskById: (id) => get().tasks.find((t) => t.id === id),

      getTodaysTasks: () => {
        // Compare date portion only (YYYY-MM-DD) to avoid timezone issues
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        return get().tasks.filter(
          (t) => t.dueDate.split('T')[0] === todayStr && !t.completed
        );
      },

      getCompletedTodayCount: () => {
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        return get().tasks.filter(
          (t) => t.completedAt && t.completedAt.split('T')[0] === todayStr
        ).length;
      },
    }),
    {
      name: 'taskflow-tasks',
      partialize: (state) => ({ tasks: state.tasks }),
    }
  )
);
