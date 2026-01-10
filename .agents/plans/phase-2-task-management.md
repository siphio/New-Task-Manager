# Feature: Phase 2 - Task Management

The following plan should be complete, but it's important that you validate documentation and codebase patterns before you start implementing.

Pay special attention to naming of existing utils, types, and models. Import from the right files etc.

## Feature Description

Phase 2 implements complete task CRUD functionality for TaskFlow, including task creation modal, task cards, task details screen, task editing, subtask management, task completion flow, and the daily goals progress indicator. This phase transforms the placeholder home screen into a fully functional task management system with Supabase backend integration.

## User Story

As a productivity-minded user
I want to create, view, edit, and complete tasks with subtasks and categories
So that I can manage my daily work and track my progress toward goals

## Problem Statement

Phase 1 established the app infrastructure with placeholder data. Users cannot currently create, edit, or manage real tasks. The home screen shows static mock data, the FAB opens nothing, and there's no task persistence or progress tracking.

## Solution Statement

Implement a complete task management system with:
- Zustand `taskStore` for state management with Supabase sync
- Task service layer for CRUD operations
- Drawer-based task creation/editing modal (mobile-optimized bottom sheet)
- Task card components with category colors and completion checkbox
- Task details screen with subtask management
- Daily goals circular progress indicator connected to real data
- Animated task completion flow using existing Framer Motion variants

## Feature Metadata

**Feature Type**: New Capability (Core Feature Implementation)
**Estimated Complexity**: High
**Primary Systems Affected**:
- `src/shared/store/` - New taskStore
- `src/shared/services/` - Task service methods
- `src/features/home/` - Task list, daily goals
- `src/features/tasks/` - New feature slice (TaskForm, TaskCard, TaskDetails)
**Dependencies**:
- shadcn/ui: drawer, dialog, checkbox, input, label, select, alert-dialog
- Existing: Zustand, Supabase, Framer Motion, date-fns

---

## CONTEXT REFERENCES

### Relevant Codebase Files - IMPORTANT: READ BEFORE IMPLEMENTING!

**Store Patterns:**
- `src/shared/store/authStore.ts` (lines 1-44) - Why: Zustand persist pattern to follow for taskStore
- `src/shared/store/uiStore.ts` (lines 1-21) - Why: Simple Zustand pattern without persistence
- `src/shared/store/index.ts` - Why: Barrel export pattern

**Service Patterns:**
- `src/shared/services/supabase.ts` (lines 1-17) - Why: Supabase client singleton, add task methods here

**Component Patterns:**
- `src/shared/components/PageContainer.tsx` - Why: Page wrapper with animations
- `src/shared/components/FAB.tsx` - Why: Opens task modal via `openAddTaskModal()`
- `src/shared/components/ui/button.tsx` - Why: CVA button pattern with variants
- `src/shared/components/ui/progress.tsx` - Why: Progress component for daily goals

**Feature Screen Patterns:**
- `src/features/home/HomeScreen.tsx` (lines 1-92) - Why: Replace placeholder task list
- `src/features/profile/ProfileScreen.tsx` - Why: Settings list pattern to follow
- `src/features/auth/LoginScreen.tsx` - Why: Form handling pattern with loading states

**Auth Provider Pattern:**
- `src/app/providers/AuthProvider.tsx` (lines 1-120) - Why: Context + Zustand + Supabase integration pattern

**Animation Variants:**
- `src/styles/animations.ts` (lines 1-72) - Why: Use `modalVariants`, `taskCompleteVariants`, `slideUp`

**Theme Colors:**
- `src/styles/theme.ts` - Why: Category colors and spacing constants
- `src/index.css` (lines 16-19) - Why: CSS variables for category colors

**UI Mockups (Visual Reference):**
- `ui-images/home-page.png` - Home screen with daily goals and task cards
- `ui-images/add-task-page.png` - Task creation modal layout
- `ui-images/task-details.png` - Task details screen with subtasks
- `ui-images/editing-task.png` - Task editing modal
- `ui-images/editing-task-done.png` - Success toast after save

**PRD Reference:**
- `.agents/PRD.md` (lines 162-185) - Data model (Task, Subtask interfaces)
- `.agents/PRD.md` (lines 562-731) - Phase 2 deliverables and Playwright tests

### New Files to Create

**Types:**
- `src/shared/types/task.ts` - Task and Subtask interfaces

**Store:**
- `src/shared/store/taskStore.ts` - Task state management

**Services:**
- `src/shared/services/taskService.ts` - Supabase CRUD operations

**Feature: Tasks:**
- `src/features/tasks/index.ts` - Feature exports
- `src/features/tasks/components/TaskCard.tsx` - Task list item component
- `src/features/tasks/components/TaskForm.tsx` - Create/Edit task form
- `src/features/tasks/components/TaskDrawer.tsx` - Bottom sheet wrapper
- `src/features/tasks/components/SubtaskList.tsx` - Subtask checklist
- `src/features/tasks/components/CategoryPicker.tsx` - Category selection chips
- `src/features/tasks/components/PriorityPicker.tsx` - Priority selection
- `src/features/tasks/components/DatePicker.tsx` - Due date picker
- `src/features/tasks/TaskDetailsScreen.tsx` - Full task details view

**Feature: Home Updates:**
- `src/features/home/components/DailyGoals.tsx` - Circular progress component
- `src/features/home/components/TaskList.tsx` - Task list with filters

**UI Components (shadcn):**
- `src/shared/components/ui/drawer.tsx` - shadcn drawer
- `src/shared/components/ui/checkbox.tsx` - shadcn checkbox
- `src/shared/components/ui/input.tsx` - shadcn input
- `src/shared/components/ui/label.tsx` - shadcn label
- `src/shared/components/ui/select.tsx` - shadcn select
- `src/shared/components/ui/alert-dialog.tsx` - shadcn alert dialog
- `src/shared/components/ui/textarea.tsx` - shadcn textarea

### Relevant Documentation

- [shadcn Drawer](https://ui.shadcn.com/docs/components/drawer)
  - Mobile-friendly bottom sheet component using vaul
  - Why: Primary modal for task creation/editing on mobile

- [shadcn Dialog](https://ui.shadcn.com/docs/components/dialog)
  - Modal dialog for desktop
  - Why: Fallback for larger screens

- [shadcn Checkbox](https://ui.shadcn.com/docs/components/checkbox)
  - Accessible checkbox component
  - Why: Task completion and subtask checkboxes

- [Supabase CRUD with JavaScript](https://supabase.com/docs/reference/javascript/insert)
  - Insert, update, delete, select operations
  - Why: Task service implementation

- [Framer Motion AnimatePresence](https://motion.dev/docs/react-animate-presence)
  - Exit animations for list items
  - Why: Task completion and removal animations

- [Zustand with TypeScript](https://zustand.docs.pmnd.rs/guides/typescript)
  - Typed store patterns
  - Why: taskStore type safety

### Patterns to Follow

**Naming Conventions:**
- Components: PascalCase (`TaskCard.tsx`, `TaskForm.tsx`)
- Stores: camelCase with Store suffix (`taskStore.ts`)
- Services: camelCase with Service suffix (`taskService.ts`)
- Types: PascalCase (`Task`, `Subtask`, `Category`)
- Test IDs: kebab-case with descriptive prefix (`task-card-{id}`, `task-title-input`)

**Zustand Store Pattern (from authStore.ts):**
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  // ... state
  addTask: (task: Task) => void;
  // ... actions
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      isLoading: false,
      addTask: (task) => set((state) => ({
        tasks: [...state.tasks, task]
      })),
    }),
    { name: 'taskflow-tasks' }
  )
);
```

**Supabase Service Pattern:**
```typescript
import { supabase } from './supabase';
import { Task } from '@/shared/types/task';

export const taskService = {
  async getTasks(userId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },
  // ... other methods
};
```

**Category Colors (from theme.ts and index.css):**
```typescript
const categoryColors = {
  work: '#0A84FF',       // Blue
  personal: '#2DA44E',   // Green
  team: '#DB61A2',       // Pink
  'self-improvement': '#D29922', // Yellow
};
```

**Form Component Pattern (from LoginScreen.tsx):**
```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);
  setLoading(true);
  try {
    // ... operation
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

**Animation Pattern (from animations.ts):**
```typescript
<AnimatePresence mode="popLayout">
  {tasks.map((task) => (
    <motion.div
      key={task.id}
      variants={taskCompleteVariants}
      initial="initial"
      exit="exit"
      layout
    >
      <TaskCard task={task} />
    </motion.div>
  ))}
</AnimatePresence>
```

---

## IMPLEMENTATION PLAN

### Phase 2.1: Types & Store Foundation

Set up TypeScript interfaces and Zustand task store.

**Tasks:**
- Define Task and Subtask interfaces
- Create taskStore with CRUD actions
- Add store to barrel exports
- Update uiStore with task-related modal states

### Phase 2.2: Install shadcn Components

Install required UI components from shadcn registry.

**Tasks:**
- Install drawer, checkbox, input, label, select, alert-dialog, textarea
- Verify component installation in ui/ directory

### Phase 2.3: Task Service Layer

Create Supabase service functions for task operations.

**Tasks:**
- Create taskService with CRUD methods
- Handle guest mode (localStorage fallback)
- Add error handling and type safety

### Phase 2.4: Task Card Component

Build the task card for displaying tasks in lists.

**Tasks:**
- Create TaskCard with category indicator, title, checkbox
- Add completion animation
- Add tap handler for details navigation

### Phase 2.5: Task Form & Drawer

Build the task creation/editing modal.

**Tasks:**
- Create CategoryPicker chips component
- Create PriorityPicker component
- Create DatePicker component
- Create TaskForm with all fields
- Create TaskDrawer wrapper with animations
- Connect FAB to open drawer

### Phase 2.6: Subtask Management

Implement subtask list with add/remove/toggle functionality.

**Tasks:**
- Create SubtaskList component
- Add subtask input field
- Handle subtask completion state

### Phase 2.7: Task Details Screen

Build full task details view with editing capability.

**Tasks:**
- Create TaskDetailsScreen
- Add routing for /tasks/:id
- Implement edit mode toggle
- Add delete confirmation dialog

### Phase 2.8: Daily Goals & Home Screen

Connect home screen to real task data.

**Tasks:**
- Create DailyGoals circular progress component
- Create TaskList component with AnimatePresence
- Update HomeScreen to use taskStore
- Add task completion handlers

### Phase 2.9: Integration & Polish

Final integration and animations.

**Tasks:**
- Add loading states and skeletons
- Implement optimistic updates
- Add success/error toasts
- Test all flows end-to-end

---

## STEP-BY-STEP TASKS

IMPORTANT: Execute every task in order, top to bottom. Each task is atomic and independently testable.

---

### Task 1: CREATE src/shared/types/task.ts

**IMPLEMENT**: Define Task and Subtask interfaces matching PRD data model

```typescript
export type Category = 'work' | 'personal' | 'team' | 'self-improvement';
export type Priority = 'low' | 'medium' | 'high';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: Category;
  priority: Priority;
  dueDate: string; // ISO date string
  scheduledTime?: {
    start: string; // ISO datetime
    end: string;   // ISO datetime
  };
  subtasks: Subtask[];
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  category: Category;
  priority: Priority;
  dueDate: string;
  scheduledTime?: {
    start: string;
    end: string;
  };
  subtasks?: Omit<Subtask, 'id'>[];
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
  completed?: boolean;
  subtasks?: Subtask[];
}
```

**PATTERN**: Types in dedicated file, export from shared/types/
**VALIDATE**: `npx tsc --noEmit` passes

---

### Task 2: CREATE src/shared/types/index.ts

**IMPLEMENT**: Barrel export for types

```typescript
export * from './task';
```

**VALIDATE**: Can import types via `@/shared/types`

---

### Task 3: CREATE src/shared/store/taskStore.ts

**IMPLEMENT**: Zustand store for task state management

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task, CreateTaskInput, UpdateTaskInput, Subtask } from '@/shared/types';
import { v4 as uuidv4 } from 'uuid';

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
        const today = new Date().toISOString().split('T')[0];
        return get().tasks.filter(
          (t) => t.dueDate.split('T')[0] === today && !t.completed
        );
      },

      getCompletedTodayCount: () => {
        const today = new Date().toISOString().split('T')[0];
        return get().tasks.filter(
          (t) => t.completedAt?.split('T')[0] === today
        ).length;
      },
    }),
    {
      name: 'taskflow-tasks',
      partialize: (state) => ({ tasks: state.tasks }),
    }
  )
);
```

**PATTERN**: MIRROR `authStore.ts` persist pattern
**IMPORTS**: Add `uuid` package: `npm install uuid @types/uuid`
**VALIDATE**: Store exports correctly, `npm run dev` runs without errors

---

### Task 4: UPDATE src/shared/store/index.ts

**IMPLEMENT**: Add taskStore export

```typescript
export { useAuthStore } from './authStore';
export { useUIStore } from './uiStore';
export { useTaskStore } from './taskStore';
```

**VALIDATE**: Can import `useTaskStore` from `@/shared/store`

---

### Task 5: UPDATE src/shared/store/uiStore.ts

**IMPLEMENT**: Add task drawer state

```typescript
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
```

**PATTERN**: Extend existing store with drawer state
**VALIDATE**: UI store functions work correctly

---

### Task 6: RUN npm install uuid and shadcn components

**IMPLEMENT**: Install required dependencies

```bash
npm install uuid
npm install -D @types/uuid
npx shadcn@latest add drawer checkbox input label select alert-dialog textarea
```

**GOTCHA**: Drawer requires `vaul` package, shadcn installs it automatically
**VALIDATE**: `ls src/shared/components/ui` shows new component files

---

### Task 7: CREATE src/shared/services/taskService.ts

**IMPLEMENT**: Task CRUD service with Supabase

```typescript
import { supabase } from './supabase';
import { Task, CreateTaskInput, UpdateTaskInput } from '@/shared/types';

// Check if we're in guest/demo mode
const isGuestMode = () => {
  const authStore = localStorage.getItem('taskflow-auth');
  if (!authStore) return true;
  const parsed = JSON.parse(authStore);
  return parsed.state?.user?.id === 'guest-user';
};

export const taskService = {
  async getTasks(userId: string): Promise<Task[]> {
    if (isGuestMode()) {
      // In guest mode, tasks are managed entirely in Zustand store
      return [];
    }

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createTask(task: Task): Promise<Task> {
    if (isGuestMode()) {
      // Guest mode: task already created in store
      return task;
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        id: task.id,
        title: task.title,
        description: task.description,
        category: task.category,
        priority: task.priority,
        due_date: task.dueDate,
        scheduled_start: task.scheduledTime?.start,
        scheduled_end: task.scheduledTime?.end,
        subtasks: task.subtasks,
        completed: task.completed,
        completed_at: task.completedAt,
        created_at: task.createdAt,
        updated_at: task.updatedAt,
        user_id: task.userId,
      })
      .select()
      .single();

    if (error) throw error;
    return mapDbTaskToTask(data);
  },

  async updateTask(id: string, input: UpdateTaskInput): Promise<void> {
    if (isGuestMode()) return;

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.category !== undefined) updateData.category = input.category;
    if (input.priority !== undefined) updateData.priority = input.priority;
    if (input.dueDate !== undefined) updateData.due_date = input.dueDate;
    if (input.scheduledTime !== undefined) {
      updateData.scheduled_start = input.scheduledTime?.start;
      updateData.scheduled_end = input.scheduledTime?.end;
    }
    if (input.subtasks !== undefined) updateData.subtasks = input.subtasks;
    if (input.completed !== undefined) {
      updateData.completed = input.completed;
      updateData.completed_at = input.completed ? new Date().toISOString() : null;
    }

    const { error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;
  },

  async deleteTask(id: string): Promise<void> {
    if (isGuestMode()) return;

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// Helper to map database columns to Task interface
function mapDbTaskToTask(dbTask: Record<string, unknown>): Task {
  return {
    id: dbTask.id as string,
    title: dbTask.title as string,
    description: dbTask.description as string | undefined,
    category: dbTask.category as Task['category'],
    priority: dbTask.priority as Task['priority'],
    dueDate: dbTask.due_date as string,
    scheduledTime: dbTask.scheduled_start ? {
      start: dbTask.scheduled_start as string,
      end: dbTask.scheduled_end as string,
    } : undefined,
    subtasks: (dbTask.subtasks as Task['subtasks']) || [],
    completed: dbTask.completed as boolean,
    completedAt: dbTask.completed_at as string | undefined,
    createdAt: dbTask.created_at as string,
    updatedAt: dbTask.updated_at as string,
    userId: dbTask.user_id as string,
  };
}
```

**PATTERN**: Service handles guest mode gracefully
**VALIDATE**: Service exports without errors

---

### Task 8: CREATE src/shared/utils/categoryColors.ts

**IMPLEMENT**: Category color mapping utility

```typescript
import { Category } from '@/shared/types';

export const categoryColors: Record<Category, string> = {
  work: '#0A84FF',
  personal: '#2DA44E',
  team: '#DB61A2',
  'self-improvement': '#D29922',
};

export const categoryLabels: Record<Category, string> = {
  work: 'Work',
  personal: 'Personal',
  team: 'Team',
  'self-improvement': 'Self-improvement',
};

export const getCategoryColor = (category: Category): string => {
  return categoryColors[category] || categoryColors.work;
};
```

**VALIDATE**: Utility exports correctly

---

### Task 9: UPDATE src/shared/utils/index.ts

**IMPLEMENT**: Export new utilities

```typescript
export { cn } from './cn';
export { categoryColors, categoryLabels, getCategoryColor } from './categoryColors';
```

**VALIDATE**: Can import from `@/shared/utils`

---

### Task 10: CREATE src/features/tasks/components/CategoryPicker.tsx

**IMPLEMENT**: Category selection chips component

```typescript
import { Category } from '@/shared/types';
import { categoryColors, categoryLabels } from '@/shared/utils';
import { cn } from '@/shared/utils';

interface CategoryPickerProps {
  value: Category;
  onChange: (category: Category) => void;
}

const categories: Category[] = ['work', 'personal', 'team', 'self-improvement'];

export function CategoryPicker({ value, onChange }: CategoryPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => {
        const isSelected = value === category;
        const color = categoryColors[category];

        return (
          <button
            key={category}
            type="button"
            onClick={() => onChange(category)}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
              'border-2 min-h-[36px]',
              isSelected
                ? 'text-white'
                : 'text-text-secondary border-background-tertiary hover:border-text-muted'
            )}
            style={{
              backgroundColor: isSelected ? color : 'transparent',
              borderColor: isSelected ? color : undefined,
            }}
            data-testid={`category-${category}`}
          >
            {categoryLabels[category]}
          </button>
        );
      })}
    </div>
  );
}
```

**PATTERN**: Chip selection with dynamic colors
**VALIDATE**: Component renders without errors

---

### Task 11: CREATE src/features/tasks/components/PriorityPicker.tsx

**IMPLEMENT**: Priority selection component

```typescript
import { Priority } from '@/shared/types';
import { cn } from '@/shared/utils';

interface PriorityPickerProps {
  value: Priority;
  onChange: (priority: Priority) => void;
}

const priorities: { value: Priority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const priorityStyles: Record<Priority, { bg: string; text: string; selected: string }> = {
  low: {
    bg: 'bg-background-tertiary',
    text: 'text-text-secondary',
    selected: 'bg-text-muted text-text-primary',
  },
  medium: {
    bg: 'bg-accent-warning/20',
    text: 'text-accent-warning',
    selected: 'bg-accent-warning text-white',
  },
  high: {
    bg: 'bg-accent-error/20',
    text: 'text-accent-error',
    selected: 'bg-accent-error text-white',
  },
};

export function PriorityPicker({ value, onChange }: PriorityPickerProps) {
  return (
    <div className="flex gap-2">
      {priorities.map((priority) => {
        const isSelected = value === priority.value;
        const styles = priorityStyles[priority.value];

        return (
          <button
            key={priority.value}
            type="button"
            onClick={() => onChange(priority.value)}
            className={cn(
              'flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all min-h-[44px]',
              isSelected ? styles.selected : `${styles.bg} ${styles.text}`
            )}
            data-testid={`priority-${priority.value}`}
          >
            {priority.label}
          </button>
        );
      })}
    </div>
  );
}
```

**PATTERN**: Follows PRD priority styling
**VALIDATE**: Component renders correctly

---

### Task 12: CREATE src/features/tasks/components/SubtaskList.tsx

**IMPLEMENT**: Subtask checklist component

```typescript
import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { Subtask } from '@/shared/types';
import { cn } from '@/shared/utils';

interface SubtaskListProps {
  subtasks: Subtask[];
  onToggle: (id: string) => void;
  onAdd: (title: string) => void;
  onRemove: (id: string) => void;
  readOnly?: boolean;
}

export function SubtaskList({
  subtasks,
  onToggle,
  onAdd,
  onRemove,
  readOnly = false
}: SubtaskListProps) {
  const [newSubtask, setNewSubtask] = useState('');

  const handleAdd = () => {
    if (newSubtask.trim()) {
      onAdd(newSubtask.trim());
      setNewSubtask('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const completedCount = subtasks.filter(s => s.completed).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text-primary">Subtasks</span>
        {subtasks.length > 0 && (
          <span className="text-sm text-text-secondary">
            {completedCount}/{subtasks.length}
          </span>
        )}
      </div>

      <div className="space-y-2">
        {subtasks.map((subtask) => (
          <div
            key={subtask.id}
            className="flex items-center gap-3 group"
          >
            <Checkbox
              id={`subtask-${subtask.id}`}
              checked={subtask.completed}
              onCheckedChange={() => onToggle(subtask.id)}
              disabled={readOnly}
              data-testid={`subtask-checkbox-${subtask.id}`}
            />
            <label
              htmlFor={`subtask-${subtask.id}`}
              className={cn(
                'flex-1 text-sm cursor-pointer',
                subtask.completed
                  ? 'text-text-muted line-through'
                  : 'text-text-primary'
              )}
            >
              {subtask.title}
            </label>
            {!readOnly && (
              <button
                type="button"
                onClick={() => onRemove(subtask.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-text-muted hover:text-accent-error transition-all"
                aria-label="Remove subtask"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      {!readOnly && (
        <div className="flex gap-2">
          <Input
            value={newSubtask}
            onChange={(e) => setNewSubtask(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a subtask..."
            className="flex-1 bg-background-tertiary border-none"
            data-testid="subtask-input"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleAdd}
            disabled={!newSubtask.trim()}
            data-testid="add-subtask-button"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
```

**PATTERN**: List with inline add form
**VALIDATE**: Subtask toggle and add work correctly

---

### Task 13: CREATE src/features/tasks/components/TaskForm.tsx

**IMPLEMENT**: Task creation and editing form

```typescript
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { CategoryPicker } from './CategoryPicker';
import { PriorityPicker } from './PriorityPicker';
import { SubtaskList } from './SubtaskList';
import { Task, CreateTaskInput, Category, Priority, Subtask } from '@/shared/types';
import { useTaskStore, useUIStore } from '@/shared/store';
import { useAuth } from '@/app/providers';
import { v4 as uuidv4 } from 'uuid';

interface TaskFormProps {
  task?: Task;
  onSuccess?: () => void;
}

export function TaskForm({ task, onSuccess }: TaskFormProps) {
  const { user } = useAuth();
  const { addTask, updateTask } = useTaskStore();
  const { closeTaskDrawer } = useUIStore();

  const isEditing = !!task;

  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [category, setCategory] = useState<Category>(task?.category || 'work');
  const [priority, setPriority] = useState<Priority>(task?.priority || 'medium');
  const [dueDate, setDueDate] = useState(
    task?.dueDate?.split('T')[0] || format(new Date(), 'yyyy-MM-dd')
  );
  const [subtasks, setSubtasks] = useState<Subtask[]>(task?.subtasks || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isEditing && task) {
        updateTask(task.id, {
          title: title.trim(),
          description: description.trim() || undefined,
          category,
          priority,
          dueDate: new Date(dueDate).toISOString(),
          subtasks,
        });
      } else {
        const input: CreateTaskInput = {
          title: title.trim(),
          description: description.trim() || undefined,
          category,
          priority,
          dueDate: new Date(dueDate).toISOString(),
          subtasks: subtasks.map(s => ({ title: s.title, completed: s.completed })),
        };
        addTask(input, user?.id || 'guest-user');
      }

      closeTaskDrawer();
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const handleSubtaskToggle = (id: string) => {
    setSubtasks(prev =>
      prev.map(s => s.id === id ? { ...s, completed: !s.completed } : s)
    );
  };

  const handleSubtaskAdd = (title: string) => {
    setSubtasks(prev => [...prev, { id: uuidv4(), title, completed: false }]);
  };

  const handleSubtaskRemove = (id: string) => {
    setSubtasks(prev => prev.filter(s => s.id !== id));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task name..."
          className="text-lg bg-transparent border-none px-0 placeholder:text-text-muted focus-visible:ring-0"
          data-testid="task-title-input"
          autoFocus
        />
      </div>

      {/* Category */}
      <div className="space-y-2">
        <CategoryPicker value={category} onChange={setCategory} />
      </div>

      {/* Due Date */}
      <div className="space-y-2">
        <Label className="text-text-secondary">Due Date</Label>
        <div className="relative">
          <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <Input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="pl-10 bg-background-tertiary border-none"
            data-testid="due-date-picker"
          />
        </div>
      </div>

      {/* Priority */}
      <div className="space-y-2">
        <PriorityPicker value={priority} onChange={setPriority} />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add notes..."
          className="bg-background-tertiary border-none resize-none min-h-[80px]"
          data-testid="task-notes-input"
        />
      </div>

      {/* Subtasks */}
      <SubtaskList
        subtasks={subtasks}
        onToggle={handleSubtaskToggle}
        onAdd={handleSubtaskAdd}
        onRemove={handleSubtaskRemove}
      />

      {error && (
        <p className="text-accent-error text-sm">{error}</p>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={loading || !title.trim()}
        className="w-full bg-accent-primary hover:bg-accent-primary/90 text-white"
        data-testid="create-task-button"
      >
        {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Task'}
      </Button>
    </form>
  );
}
```

**PATTERN**: MIRROR LoginScreen form handling pattern
**VALIDATE**: Form renders and submits correctly

---

### Task 14: CREATE src/features/tasks/components/TaskDrawer.tsx

**IMPLEMENT**: Bottom sheet wrapper for task form

```typescript
import { useEffect } from 'react';
import { X } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from '@/shared/components/ui/drawer';
import { TaskForm } from './TaskForm';
import { useUIStore, useTaskStore } from '@/shared/store';

export function TaskDrawer() {
  const { isTaskDrawerOpen, editingTaskId, closeTaskDrawer } = useUIStore();
  const { getTaskById } = useTaskStore();

  const task = editingTaskId ? getTaskById(editingTaskId) : undefined;
  const isEditing = !!task;

  return (
    <Drawer open={isTaskDrawerOpen} onOpenChange={(open) => !open && closeTaskDrawer()}>
      <DrawerContent className="bg-background-secondary border-background-tertiary max-h-[90vh]">
        <DrawerHeader className="flex items-center justify-between border-b border-background-tertiary pb-4">
          <DrawerTitle className="text-text-primary">
            {isEditing ? 'Edit Task' : 'New Task'}
          </DrawerTitle>
          <DrawerClose asChild>
            <button
              className="p-2 text-text-secondary hover:text-text-primary transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </DrawerClose>
        </DrawerHeader>
        <div className="p-4 overflow-y-auto">
          <TaskForm task={task} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
```

**PATTERN**: shadcn Drawer with custom styling
**VALIDATE**: Drawer opens and closes correctly

---

### Task 15: CREATE src/features/tasks/components/TaskCard.tsx

**IMPLEMENT**: Task list item component

```typescript
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Task } from '@/shared/types';
import { getCategoryColor } from '@/shared/utils';
import { cn } from '@/shared/utils';
import { useTaskStore } from '@/shared/store';
import { format, isToday, isTomorrow, isPast } from 'date-fns';

interface TaskCardProps {
  task: Task;
  onPress?: () => void;
}

export function TaskCard({ task, onPress }: TaskCardProps) {
  const { toggleTaskComplete } = useTaskStore();
  const categoryColor = getCategoryColor(task.category);

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleTaskComplete(task.id);
  };

  const formatDueDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d');
  };

  const isDueSoon = isPast(new Date(task.dueDate)) && !task.completed;

  const subtaskProgress = task.subtasks.length > 0
    ? `${task.subtasks.filter(s => s.completed).length}/${task.subtasks.length}`
    : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className={cn(
        'p-4 bg-background-secondary rounded-xl',
        'flex items-start gap-3 cursor-pointer',
        'hover:bg-background-tertiary/50 transition-colors',
        task.completed && 'opacity-60'
      )}
      onClick={onPress}
      data-testid={`task-card-${task.id}`}
    >
      {/* Checkbox */}
      <button
        onClick={handleCheckboxClick}
        className={cn(
          'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0 mt-0.5',
          task.completed
            ? 'bg-accent-success border-accent-success'
            : 'border-text-muted hover:border-accent-primary'
        )}
        data-testid={`task-checkbox-${task.id}`}
      >
        {task.completed && <Check className="w-4 h-4 text-white" />}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className={cn(
            'font-medium text-text-primary truncate',
            task.completed && 'line-through text-text-muted'
          )}>
            {task.title}
          </h3>
          {subtaskProgress && (
            <span className="text-xs text-text-secondary shrink-0">
              {subtaskProgress}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 mt-1">
          {/* Category indicator */}
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: categoryColor }}
          />

          {/* Due date */}
          <span className={cn(
            'text-xs',
            isDueSoon ? 'text-accent-error' : 'text-text-secondary'
          )}>
            {formatDueDate(task.dueDate)}
          </span>

          {/* Priority badge */}
          {task.priority === 'high' && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-accent-error/20 text-accent-error">
              High
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
```

**PATTERN**: Animated card with checkbox interaction
**VALIDATE**: Card renders with correct styling

---

### Task 16: CREATE src/features/tasks/index.ts

**IMPLEMENT**: Feature exports

```typescript
export { TaskCard } from './components/TaskCard';
export { TaskForm } from './components/TaskForm';
export { TaskDrawer } from './components/TaskDrawer';
export { CategoryPicker } from './components/CategoryPicker';
export { PriorityPicker } from './components/PriorityPicker';
export { SubtaskList } from './components/SubtaskList';
```

**VALIDATE**: All components export correctly

---

### Task 17: CREATE src/features/home/components/DailyGoals.tsx

**IMPLEMENT**: Circular progress component for daily goals

```typescript
import { motion } from 'framer-motion';
import { useTaskStore } from '@/shared/store';

interface DailyGoalsProps {
  dailyGoal?: number;
}

export function DailyGoals({ dailyGoal = 10 }: DailyGoalsProps) {
  const { getCompletedTodayCount } = useTaskStore();
  const completedCount = getCompletedTodayCount();

  const progress = Math.min(completedCount / dailyGoal, 1);
  const percentage = Math.round(progress * 100);

  // SVG circle calculations
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="p-6 bg-background-secondary rounded-2xl">
      <div className="flex items-center gap-4">
        <div className="relative w-20 h-20">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            {/* Background circle */}
            <circle
              cx="18"
              cy="18"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-background-tertiary"
            />
            {/* Progress circle */}
            <motion.circle
              cx="18"
              cy="18"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="text-accent-primary"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-text-primary">
            {percentage}%
          </span>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Daily Goals</h2>
          <p className="text-sm text-text-secondary">
            {completedCount}/{dailyGoal} tasks
          </p>
        </div>
      </div>
    </div>
  );
}
```

**PATTERN**: Animated SVG progress with store data
**VALIDATE**: Progress updates when tasks complete

---

### Task 18: CREATE src/features/home/components/TaskList.tsx

**IMPLEMENT**: Animated task list component

```typescript
import { AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { TaskCard } from '@/features/tasks';
import { useTaskStore } from '@/shared/store';
import { Task } from '@/shared/types';

interface TaskListProps {
  tasks?: Task[];
  title?: string;
  emptyMessage?: string;
}

export function TaskList({
  tasks: propTasks,
  title = "Today's Tasks",
  emptyMessage = "No tasks for today. Tap + to add one!"
}: TaskListProps) {
  const navigate = useNavigate();
  const { getTodaysTasks } = useTaskStore();

  const tasks = propTasks || getTodaysTasks();

  const handleTaskPress = (taskId: string) => {
    navigate(`/tasks/${taskId}`);
  };

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-text-primary">{title}</h2>

      {tasks.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-text-secondary">{emptyMessage}</p>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onPress={() => handleTaskPress(task.id)}
            />
          ))}
        </AnimatePresence>
      )}
    </div>
  );
}
```

**PATTERN**: AnimatePresence for exit animations
**VALIDATE**: List renders with animations

---

### Task 19: UPDATE src/features/home/HomeScreen.tsx

**IMPLEMENT**: Replace placeholder with real task data

```typescript
import { PageContainer } from '@/shared/components/PageContainer';
import { useAuth } from '@/app/providers';
import { DailyGoals } from './components/DailyGoals';
import { TaskList } from './components/TaskList';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function HomeScreen() {
  const { user } = useAuth();
  const greeting = getGreeting();
  const displayName = user?.email?.split('@')[0] || user?.user_metadata?.name || 'User';

  return (
    <PageContainer>
      <div className="pt-6 space-y-6" data-testid="home-screen">
        <h1 className="text-2xl font-bold text-text-primary">
          {greeting}, {displayName}
        </h1>

        <DailyGoals dailyGoal={10} />

        <TaskList />
      </div>
    </PageContainer>
  );
}
```

**PATTERN**: Composable components
**VALIDATE**: Home screen shows real tasks

---

### Task 20: CREATE src/features/tasks/TaskDetailsScreen.tsx

**IMPLEMENT**: Full task details view

```typescript
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2, Calendar, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { PageContainer } from '@/shared/components/PageContainer';
import { Button } from '@/shared/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/components/ui/alert-dialog';
import { SubtaskList } from './components/SubtaskList';
import { useTaskStore, useUIStore } from '@/shared/store';
import { getCategoryColor, categoryLabels } from '@/shared/utils';
import { cn } from '@/shared/utils';

export function TaskDetailsScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getTaskById, toggleTaskComplete, deleteTask, toggleSubtaskComplete } = useTaskStore();
  const { openTaskDrawer } = useUIStore();

  const task = id ? getTaskById(id) : undefined;

  if (!task) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <p className="text-text-secondary">Task not found</p>
          <Button variant="ghost" onClick={() => navigate('/')} className="mt-4">
            Go Home
          </Button>
        </div>
      </PageContainer>
    );
  }

  const categoryColor = getCategoryColor(task.category);

  const handleEdit = () => {
    openTaskDrawer(task.id);
  };

  const handleDelete = () => {
    deleteTask(task.id);
    navigate('/');
  };

  const handleComplete = () => {
    toggleTaskComplete(task.id);
  };

  const priorityBadge = {
    low: { bg: 'bg-background-tertiary', text: 'text-text-secondary' },
    medium: { bg: 'bg-accent-warning/20', text: 'text-accent-warning' },
    high: { bg: 'bg-accent-error/20', text: 'text-accent-error' },
  }[task.priority];

  return (
    <PageContainer>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-2"
        data-testid="task-details-screen"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 text-text-secondary hover:text-text-primary"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold text-text-primary">Task Details</h1>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="p-2 -mr-2 text-text-secondary hover:text-accent-error">
                <Trash2 className="w-5 h-5" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-background-secondary border-background-tertiary">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-text-primary">Delete Task?</AlertDialogTitle>
                <AlertDialogDescription className="text-text-secondary">
                  This action cannot be undone. This will permanently delete the task.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-background-tertiary text-text-primary border-none">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-accent-error text-white"
                  data-testid="confirm-delete-button"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Task Content */}
        <div className="space-y-6">
          {/* Title & Category */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: categoryColor }}
              />
              <span className="text-sm text-text-secondary">
                {categoryLabels[task.category]}
              </span>
            </div>
            <h2 className={cn(
              'text-2xl font-bold text-text-primary',
              task.completed && 'line-through opacity-60'
            )}>
              {task.title}
            </h2>
          </div>

          {/* Due Date & Priority */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-text-secondary">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
            </div>
            <span className={cn('text-xs px-2 py-1 rounded', priorityBadge.bg, priorityBadge.text)}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </span>
          </div>

          {/* Description */}
          {task.description && (
            <div className="p-4 bg-background-secondary rounded-xl">
              <h3 className="text-sm font-medium text-text-secondary mb-2">Description</h3>
              <p className="text-text-primary">{task.description}</p>
            </div>
          )}

          {/* Subtasks */}
          {task.subtasks.length > 0 && (
            <div className="p-4 bg-background-secondary rounded-xl">
              <SubtaskList
                subtasks={task.subtasks}
                onToggle={(subtaskId) => toggleSubtaskComplete(task.id, subtaskId)}
                onAdd={() => {}}
                onRemove={() => {}}
                readOnly
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1 border-background-tertiary"
              onClick={handleEdit}
              data-testid="edit-task-button"
            >
              <Pencil className="w-4 h-4 mr-2" />
              Edit Task
            </Button>
            <Button
              className={cn(
                'flex-1',
                task.completed
                  ? 'bg-background-tertiary text-text-primary'
                  : 'bg-accent-success text-white'
              )}
              onClick={handleComplete}
              data-testid="mark-complete-button"
            >
              {task.completed ? 'Mark Incomplete' : 'Mark Complete'}
            </Button>
          </div>
        </div>
      </motion.div>
    </PageContainer>
  );
}
```

**PATTERN**: Detail view with edit and delete
**VALIDATE**: Task details display correctly

---

### Task 21: UPDATE src/app/Router.tsx

**IMPLEMENT**: Add task details route

```typescript
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/app/providers';
import { Layout } from './Layout';
import { LoginScreen } from '@/features/auth/LoginScreen';
import { HomeScreen } from '@/features/home/HomeScreen';
import { CalendarScreen } from '@/features/calendar/CalendarScreen';
import { AnalyticsScreen } from '@/features/analytics/AnalyticsScreen';
import { ProfileScreen } from '@/features/profile/ProfileScreen';
import { TaskDetailsScreen } from '@/features/tasks/TaskDetailsScreen';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export function Router() {
  return (
    <Routes>
      <Route path="/login" element={<LoginScreen />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<HomeScreen />} />
        <Route path="/tasks/:id" element={<TaskDetailsScreen />} />
        <Route path="/calendar" element={<CalendarScreen />} />
        <Route path="/analytics" element={<AnalyticsScreen />} />
        <Route path="/profile" element={<ProfileScreen />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
```

**PATTERN**: Nested route for task details
**VALIDATE**: Navigation to task details works

---

### Task 22: UPDATE src/app/Layout.tsx

**IMPLEMENT**: Add TaskDrawer to layout

```typescript
import { Outlet } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { BottomNav } from '@/shared/components/BottomNav';
import { FAB } from '@/shared/components/FAB';
import { TaskDrawer } from '@/features/tasks';

export function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        <Outlet />
      </AnimatePresence>
      <FAB />
      <BottomNav />
      <TaskDrawer />
    </div>
  );
}
```

**PATTERN**: Global drawer in layout
**VALIDATE**: TaskDrawer opens when FAB clicked

---

### Task 23: RUN final validation

**IMPLEMENT**: Run all validation commands

```bash
npx tsc --noEmit
npm run dev
```

**VALIDATE**:
- No TypeScript errors
- App starts successfully
- Can create tasks via FAB
- Tasks appear in home screen
- Task completion works with animation
- Daily goals progress updates
- Task details screen works
- Edit and delete tasks work

---

## TESTING STRATEGY

### Unit Tests (Post-Implementation)

- `taskStore.test.ts` - Store actions and selectors
- `TaskCard.test.tsx` - Render and interaction tests
- `TaskForm.test.tsx` - Form validation and submission

### Integration Tests (Playwright - from PRD)

Reference PRD tests TEST 2.1 through TEST 2.9:
- Task creation flow (quick task, full fields)
- Task details view
- Subtask management
- Task editing
- Task deletion with confirmation
- Task completion animation
- Daily goals progress
- Home screen task list

### Manual Testing Checklist

- [ ] FAB opens task drawer
- [ ] Can create task with title only
- [ ] Can create task with all fields
- [ ] Category chips select correctly
- [ ] Priority buttons select correctly
- [ ] Due date picker works
- [ ] Subtasks can be added/removed
- [ ] Task appears in home screen after creation
- [ ] Task card shows category color
- [ ] Checkbox toggles completion
- [ ] Completed task shows strikethrough
- [ ] Tap task opens details screen
- [ ] Edit button opens form with data
- [ ] Delete shows confirmation dialog
- [ ] Daily goals progress updates
- [ ] Tasks persist after refresh (Zustand)

---

## VALIDATION COMMANDS

### Level 1: Type Checking

```bash
npx tsc --noEmit
```

**Expected**: No TypeScript errors

### Level 2: Development Server

```bash
npm run dev
```

**Expected**: Server starts on port 5173, no console errors

### Level 3: Build

```bash
npm run build
```

**Expected**: Build completes, dist/ folder created

### Level 4: Manual Validation

1. Open http://localhost:5173
2. Login or continue as guest
3. Click FAB (+) button
4. Verify task drawer opens
5. Create task with title "Test Task"
6. Select "Personal" category
7. Click "Create Task"
8. Verify task appears in home screen
9. Click checkbox to complete task
10. Verify animation and progress update
11. Click task to open details
12. Verify all task data displays
13. Click Edit, modify title
14. Click Save Changes
15. Verify changes persist
16. Delete task via trash icon

---

## ACCEPTANCE CRITERIA

- [ ] Task types defined (Task, Subtask, Category, Priority)
- [ ] taskStore created with CRUD actions
- [ ] taskService handles Supabase operations
- [ ] shadcn components installed (drawer, checkbox, input, etc.)
- [ ] TaskDrawer opens via FAB
- [ ] TaskForm creates tasks with validation
- [ ] TaskCard displays with category colors
- [ ] Task completion toggles with animation
- [ ] Subtask management works
- [ ] TaskDetailsScreen displays full task
- [ ] Edit mode pre-fills form
- [ ] Delete confirmation dialog works
- [ ] DailyGoals shows real progress
- [ ] TaskList with AnimatePresence
- [ ] Route /tasks/:id works
- [ ] Tasks persist in Zustand storage
- [ ] Guest mode works without Supabase
- [ ] All data-testid attributes added
- [ ] No TypeScript errors
- [ ] No console errors

---

## COMPLETION CHECKLIST

- [ ] All 23 tasks completed in order
- [ ] Each task validation passed
- [ ] Development server runs without errors
- [ ] TypeScript compiles without errors
- [ ] Build completes successfully
- [ ] Task CRUD operations work
- [ ] Animations smooth and performant
- [ ] Guest mode tested
- [ ] All acceptance criteria met

---

## NOTES

### Design Decisions

1. **Drawer over Dialog**: Using shadcn Drawer (vaul) for mobile-first bottom sheet experience. More natural for touch interactions.

2. **Local-First with Sync**: Tasks stored in Zustand with localStorage persistence. Supabase sync is optional - app works offline/in guest mode.

3. **Optimistic Updates**: Store updates immediately, service sync is fire-and-forget. Better UX for mobile.

4. **No Form Library**: Using controlled inputs instead of react-hook-form for simplicity. Form is straightforward enough.

5. **UUID for IDs**: Using uuid package for client-generated IDs. Enables offline task creation.

### Potential Risks

1. **Drawer z-index**: May need adjustment if overlapping with other modals. Test thoroughly.

2. **Animation Performance**: AnimatePresence with many items may lag on low-end devices. Consider virtualization for 100+ tasks.

3. **Date Handling**: Using ISO strings consistently. Be careful with timezone issues.

4. **Guest Mode Limits**: LocalStorage has ~5MB limit. Warn users if approaching limit.

### Dependencies Added

```json
{
  "dependencies": {
    "uuid": "^9.x",
    "vaul": "^1.x"  // Added via shadcn drawer
  },
  "devDependencies": {
    "@types/uuid": "^9.x"
  }
}
```
