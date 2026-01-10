# TaskFlow PWA - Global Development Rules

## 1. Core Principles

- **Type Safety First**: Every function, component, and variable must be fully typed. No `any` types unless absolutely unavoidable.
- **Mobile-First Design**: All components must work on mobile viewports first, then scale up. Minimum touch targets: 44x44px.
- **Offline-First Architecture**: Local state via Zustand with persistence. Supabase sync is optional enhancement, not requirement.
- **Feature-Based Organization**: Code lives in feature folders, not by file type. Shared utilities go in `shared/`.
- **Clean Imports**: Use `@/` path alias for all imports. No relative paths beyond `./` or `../` within same feature.

## 2. Tech Stack

### Frontend
- **Framework**: React 19.2+ with TypeScript 5.9+
- **Build Tool**: Vite 7.3+
- **Styling**: Tailwind CSS 4.1+ with custom theme variables
- **UI Components**: shadcn/ui (new-york style) + Radix UI primitives
- **State Management**: Zustand 5+ with persist middleware
- **Routing**: React Router DOM 7+
- **Animations**: Framer Motion 12+
- **Icons**: Lucide React
- **Date Handling**: date-fns 4+
- **Backend**: Supabase (auth + database)

### Development Tools
- **Package Manager**: npm
- **Type Checking**: TypeScript strict mode
- **Path Aliases**: `@/*` → `./src/*`

## 3. Architecture

### Folder Structure
```
src/
├── app/                    # App-level setup
│   ├── providers/          # Context providers (Auth, Theme)
│   ├── Layout.tsx          # Main layout with navigation
│   └── Router.tsx          # Route definitions
├── features/               # Feature modules (self-contained)
│   ├── auth/               # Authentication feature
│   │   ├── components/     # Feature-specific components
│   │   └── LoginScreen.tsx # Screen component
│   ├── home/               # Home/dashboard feature
│   ├── tasks/              # Task management feature
│   ├── calendar/           # Calendar feature
│   ├── analytics/          # Analytics feature
│   └── profile/            # User profile feature
├── shared/                 # Shared code
│   ├── components/         # Shared UI components
│   │   └── ui/             # shadcn/ui components
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API/external services
│   ├── store/              # Zustand stores
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions
├── styles/                 # Global styles and theme
├── index.css               # Tailwind entry + CSS variables
└── main.tsx                # App entry point
```

### Layer Patterns
1. **Screens** (`*Screen.tsx`): Page-level components with routing
2. **Components** (`components/`): Reusable UI within features
3. **Stores** (`store/`): State management with Zustand
4. **Services** (`services/`): External API calls (Supabase)
5. **Types** (`types/`): Shared TypeScript interfaces

## 4. Code Style

### Naming Conventions

**Components**
```tsx
// PascalCase for components and types
export function TaskCard({ task, onPress }: TaskCardProps) { ... }

// Interface names match component + "Props"
interface TaskCardProps {
  task: Task;
  onPress?: () => void;
}
```

**Functions & Variables**
```tsx
// camelCase for functions and variables
const handleCheckboxClick = (e: React.MouseEvent) => { ... };
const isLoading = false;
const categoryColor = getCategoryColor(task.category);
```

**Stores**
```tsx
// useXxxStore for Zustand hooks
export const useTaskStore = create<TaskState>()(...);
export const useAuthStore = create<AuthState>()(...);
```

**Types**
```tsx
// PascalCase for types, use 'type' for unions, 'interface' for objects
export type Category = 'work' | 'personal' | 'team' | 'self-improvement';
export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  // ...
}
```

**Files**
- Components: `PascalCase.tsx` (e.g., `TaskCard.tsx`)
- Utilities: `camelCase.ts` (e.g., `categoryColors.ts`)
- Types: `camelCase.ts` in types folder (e.g., `task.ts`)
- Stores: `camelCase.ts` with `Store` suffix (e.g., `taskStore.ts`)

### CSS/Tailwind Conventions
```tsx
// Use cn() utility for conditional classes
import { cn } from '@/shared/utils';

<div className={cn(
  'p-4 bg-background-secondary rounded-xl',
  'flex items-start gap-3 cursor-pointer',
  task.completed && 'opacity-60'
)} />
```

### Custom Theme Variables
```css
/* Use semantic color names from theme */
bg-background          /* #0D1117 - main background */
bg-background-secondary /* #161B22 - cards, elevated surfaces */
bg-background-tertiary  /* #21262D - inputs, hover states */
text-text-primary      /* #F0F6FC - main text */
text-text-secondary    /* #8B949E - secondary text */
text-text-muted        /* #484F58 - disabled/muted text */
text-accent-primary    /* #0A84FF - primary actions */
text-accent-success    /* #2DA44E - success states */
text-accent-warning    /* #D29922 - warnings */
text-accent-error      /* #F85149 - errors, destructive */
```

## 5. State Management

### Zustand Store Pattern
```tsx
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ExampleState {
  // State
  items: Item[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setItems: (items: Item[]) => void;
  addItem: (item: Item) => void;
  setLoading: (loading: boolean) => void;

  // Selectors (computed values)
  getItemById: (id: string) => Item | undefined;
}

export const useExampleStore = create<ExampleState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      error: null,

      setItems: (items) => set({ items }),
      addItem: (item) => set((state) => ({ items: [item, ...state.items] })),
      setLoading: (isLoading) => set({ isLoading }),

      getItemById: (id) => get().items.find((i) => i.id === id),
    }),
    {
      name: 'taskflow-example', // localStorage key
      partialize: (state) => ({ items: state.items }), // Only persist items
    }
  )
);
```

### Store Usage
```tsx
// Direct state access
const { tasks, isLoading } = useTaskStore();

// Actions
const { addTask, updateTask, deleteTask } = useTaskStore();

// Selectors (call as functions)
const task = useTaskStore().getTaskById(id);
```

## 6. Component Patterns

### Screen Component Pattern
```tsx
import { PageContainer } from '@/shared/components';
import { useAuth } from '@/app/providers';

export function FeatureScreen() {
  const { user } = useAuth();

  return (
    <PageContainer>
      {/* Screen content */}
    </PageContainer>
  );
}
```

### Feature Component Pattern
```tsx
import { motion } from 'framer-motion';
import { cn } from '@/shared/utils';
import { useTaskStore } from '@/shared/store';

interface ComponentProps {
  item: ItemType;
  onPress?: () => void;
}

export function FeatureComponent({ item, onPress }: ComponentProps) {
  const { action } = useTaskStore();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    action(item.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('p-4 bg-background-secondary rounded-xl')}
      onClick={onPress}
      data-testid={`component-${item.id}`}
    >
      {/* Content */}
    </motion.div>
  );
}
```

### Form Component Pattern
```tsx
import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';

export function FormComponent({ onSuccess }: { onSuccess?: () => void }) {
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) {
      setError('Field is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Perform action
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        data-testid="form-input"
      />
      {error && <p className="text-accent-error text-sm">{error}</p>}
      <Button type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Submit'}
      </Button>
    </form>
  );
}
```

## 7. Service Layer Pattern

### Supabase Service Pattern
```tsx
import { supabase } from './supabase';
import { Item, UpdateItemInput } from '@/shared/types';

// Check for guest/offline mode
const isGuestMode = () => {
  const authStore = localStorage.getItem('taskflow-auth');
  if (!authStore) return true;
  try {
    const parsed = JSON.parse(authStore);
    return parsed.state?.user?.id === 'guest-user' || !parsed.state?.isAuthenticated;
  } catch {
    return true;
  }
};

export const itemService = {
  async getItems(userId: string): Promise<Item[]> {
    if (isGuestMode()) return []; // Local store handles offline

    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(mapDbItemToItem);
  },

  async createItem(item: Item): Promise<Item> {
    if (isGuestMode()) return item;

    const { data, error } = await supabase
      .from('items')
      .insert(mapItemToDbItem(item))
      .select()
      .single();

    if (error) throw error;
    return mapDbItemToItem(data);
  },
};

// Database column mapping (snake_case ↔ camelCase)
function mapDbItemToItem(dbItem: Record<string, unknown>): Item {
  return {
    id: dbItem.id as string,
    userId: dbItem.user_id as string,
    createdAt: dbItem.created_at as string,
    // ...
  };
}
```

## 8. Testing (Data Attributes)

### Test ID Convention
```tsx
// Use data-testid for test automation
<button data-testid="task-checkbox-{id}" />
<input data-testid="task-title-input" />
<div data-testid="task-card-{id}" />
<button data-testid="create-task-button" />
```

### Pattern
- Interactive elements: `{action}-{element}` (e.g., `create-task-button`)
- Dynamic elements: `{type}-{id}` (e.g., `task-card-123`)
- Form inputs: `{field}-input` (e.g., `task-title-input`)

## 9. Development Commands

```bash
# Install dependencies
npm install

# Start development server (port 5173)
npm run dev

# Type check and build for production
npm run build

# Run ESLint
npm run lint

# Preview production build
npm run preview

# Add shadcn/ui component
npx shadcn@latest add [component-name]
```

## 10. AI Coding Assistant Instructions

1. **Read first**: Always read existing files before modifying. Understand context before suggesting changes.
2. **Follow patterns**: Match existing code style in this file. Use existing components, utilities, and patterns.
3. **Use path aliases**: Always import with `@/` prefix, never relative paths beyond the current feature.
4. **Type everything**: Provide explicit TypeScript types. No implicit `any`. Use existing types from `@/shared/types`.
5. **Mobile-first**: Ensure all new UI works on mobile. Use Tailwind responsive prefixes (sm:, md:, lg:).
6. **Use Zustand stores**: For any shared state, use existing stores or create new ones following the established pattern.
7. **Check theme variables**: Use semantic colors from the theme (text-accent-primary, bg-background-secondary, etc.).
8. **Add test IDs**: Include `data-testid` attributes on interactive elements for testing.
9. **Handle loading/error**: All async operations need loading states and error handling with user feedback.
10. **Keep it minimal**: Don't add features, abstractions, or "improvements" beyond what was explicitly requested.
