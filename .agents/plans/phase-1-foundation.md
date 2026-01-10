# Feature: Phase 1 - Foundation

The following plan should be complete, but it's important that you validate documentation and codebase patterns before you start implementing.

Pay special attention to naming of existing utils, types, and models. Import from the right files etc.

## Feature Description

Phase 1 establishes the foundational infrastructure for TaskFlow, a mobile-first PWA for personal productivity and task management. This phase sets up the project scaffolding with Vite + React + TypeScript, implements the dark theme design system with Tailwind CSS, creates the core navigation components (bottom nav + FAB), establishes routing for all 4 main screens, configures Zustand for state management, and connects Supabase for authentication.

## User Story

As a user
I want to access a polished, dark-themed mobile app with smooth navigation between Home, Calendar, Analytics, and Profile screens
So that I have a foundation for managing my tasks and productivity

## Problem Statement

The project currently has only UI mockups and a PRD. No application code exists. We need to bootstrap the entire frontend infrastructure with proper architecture, styling, authentication, and navigation before task management features can be built.

## Solution Statement

Create a complete Vite + React + TypeScript project following Vertical Slice Architecture (VSA). Implement the dark theme design system using Tailwind CSS with shadcn/ui components. Build responsive layout components with bottom navigation for mobile and a floating action button (FAB). Set up React Router for navigation, Zustand for global state, and Supabase for user authentication.

## Feature Metadata

**Feature Type**: New Capability (Project Foundation)
**Estimated Complexity**: High
**Primary Systems Affected**: All (new project scaffold)
**Dependencies**:
- Vite 5.x
- React 18.x
- TypeScript 5.x
- Tailwind CSS 4.x
- shadcn/ui components
- React Router v7
- Zustand
- Supabase JS client
- Framer Motion

---

## CONTEXT REFERENCES

### Relevant Codebase Files - IMPORTANT: READ BEFORE IMPLEMENTING!

- `.agents/PRD.md` (lines 1-200) - Why: Contains complete architecture, design system colors, and component requirements
- `.agents/PRD.md` (lines 369-410) - Why: Design system colors and breakpoints specification
- `.agents/PRD.md` (lines 442-558) - Why: Phase 1 deliverables and Playwright test specifications
- `ui-images/home-page.png` - Why: Visual reference for home screen layout and daily goals
- `ui-images/profile-page.png` - Why: Visual reference for profile screen and settings
- `ui-images/calander-page.png` - Why: Visual reference for calendar screen layout
- `ui-images/analytics-page.png` - Why: Visual reference for analytics screen layout
- `package.json` - Why: Current dependencies (shadcn already installed)

### New Files to Create

**Project Configuration:**
- `vite.config.ts` - Vite configuration with React, Tailwind, path aliases
- `tsconfig.json` - TypeScript configuration with path aliases
- `tsconfig.app.json` - App-specific TypeScript settings
- `tailwind.config.ts` - Tailwind configuration with custom theme
- `postcss.config.js` - PostCSS configuration for Tailwind
- `components.json` - shadcn/ui configuration
- `.env.example` - Environment variables template
- `.env.local` - Local environment variables (git-ignored)

**Source Files:**
- `src/main.tsx` - React entry point with providers
- `src/index.css` - Global styles with Tailwind imports
- `src/App.tsx` - Root app component with router
- `src/vite-env.d.ts` - Vite type declarations

**App Shell:**
- `src/app/Router.tsx` - React Router configuration
- `src/app/Layout.tsx` - Main layout with bottom nav
- `src/app/providers/ThemeProvider.tsx` - Dark theme provider
- `src/app/providers/AuthProvider.tsx` - Supabase auth context
- `src/app/providers/index.tsx` - Combined providers wrapper

**Shared Components:**
- `src/shared/components/BottomNav.tsx` - Mobile bottom navigation
- `src/shared/components/FAB.tsx` - Floating action button
- `src/shared/components/PageContainer.tsx` - Responsive page wrapper
- `src/shared/components/ui/` - shadcn/ui components (auto-generated)

**Store:**
- `src/shared/store/authStore.ts` - Authentication state
- `src/shared/store/uiStore.ts` - UI state (modals, navigation)
- `src/shared/store/index.ts` - Store exports

**Services:**
- `src/shared/services/supabase.ts` - Supabase client configuration

**Styles:**
- `src/styles/theme.ts` - Theme constants and utilities
- `src/styles/animations.ts` - Framer Motion animation variants

**Feature Screens (Placeholder):**
- `src/features/home/HomeScreen.tsx` - Home screen placeholder
- `src/features/calendar/CalendarScreen.tsx` - Calendar screen placeholder
- `src/features/analytics/AnalyticsScreen.tsx` - Analytics screen placeholder
- `src/features/profile/ProfileScreen.tsx` - Profile screen placeholder

**Auth Feature:**
- `src/features/auth/LoginScreen.tsx` - Login/signup screen
- `src/features/auth/components/AuthForm.tsx` - Authentication form

### Relevant Documentation - READ BEFORE IMPLEMENTING!

- [Vite + React + TypeScript + shadcn Setup](https://ui.shadcn.com/docs/installation/vite)
  - Complete setup guide for Vite with Tailwind and shadcn
  - Why: Official installation instructions

- [shadcn Dark Mode for Vite](https://ui.shadcn.com/docs/dark-mode/vite)
  - ThemeProvider implementation
  - Why: Required for dark theme toggle

- [React Router v7 Installation](https://reactrouter.com/start/declarative/installation)
  - Declarative routing setup
  - Why: Navigation between screens

- [Zustand Persist Middleware](https://zustand.docs.pmnd.rs/integrations/persisting-store-data)
  - State persistence patterns
  - Why: Persist auth state

- [Supabase Auth with React](https://supabase.com/docs/guides/auth/quickstarts/react)
  - Authentication setup
  - Why: User authentication implementation

### Patterns to Follow

**Naming Conventions:**
- Components: PascalCase (`BottomNav.tsx`, `FAB.tsx`)
- Hooks: camelCase with `use` prefix (`useAuth`, `useTheme`)
- Stores: camelCase with `Store` suffix (`authStore.ts`)
- Types/Interfaces: PascalCase with `I` prefix for interfaces (`IUser`, `ITask`)
- CSS classes: kebab-case via Tailwind utilities

**File Organization (Vertical Slice Architecture):**
```
src/
├── app/                    # Shell: App.tsx, Router.tsx, Layout.tsx, providers/
├── features/               # Feature slices (home, tasks, calendar, analytics, profile, auth)
│   └── [feature]/
│       ├── [Feature]Screen.tsx
│       ├── components/
│       ├── hooks/
│       └── types.ts
├── shared/                 # Reusable across features
│   ├── components/
│   ├── hooks/
│   ├── services/
│   ├── store/
│   └── utils/
├── styles/
└── main.tsx
```

**Error Handling Pattern:**
```typescript
try {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  // success handling
} catch (error) {
  console.error('Auth error:', error);
  // user-facing error handling
}
```

**Zustand Store Pattern:**
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
    }),
    { name: 'auth-storage' }
  )
);
```

**Design System Colors (from PRD):**
```typescript
const colors = {
  background: {
    primary: '#0D1117',    // Main background
    secondary: '#161B22',  // Card background
    tertiary: '#21262D',   // Elevated elements
  },
  accent: {
    primary: '#0A84FF',    // Primary blue
    success: '#2DA44E',    // Green (complete)
    warning: '#D29922',    // Amber
    error: '#F85149',      // Red (delete)
  },
  category: {
    work: '#0A84FF',
    personal: '#2DA44E',
    team: '#DB61A2',
    selfImprovement: '#D29922',
  },
  text: {
    primary: '#F0F6FC',
    secondary: '#8B949E',
    muted: '#484F58',
  }
};
```

---

## IMPLEMENTATION PLAN

### Phase 1.1: Project Scaffolding

Set up the Vite project with React and TypeScript, configure path aliases, and establish the basic file structure.

**Tasks:**
- Initialize Vite project with React + TypeScript template
- Configure TypeScript path aliases (@/)
- Set up directory structure following VSA
- Install core dependencies

### Phase 1.2: Styling Infrastructure

Configure Tailwind CSS with the dark theme design system and install shadcn/ui.

**Tasks:**
- Install and configure Tailwind CSS 4.x
- Create custom theme with PRD colors
- Initialize shadcn/ui
- Install required shadcn components (button, avatar, tabs, progress)

### Phase 1.3: Routing & Layout

Set up React Router v7 with the 4 main routes and create the responsive layout with bottom navigation.

**Tasks:**
- Install React Router v7
- Create route configuration
- Build Layout component with bottom nav
- Create FAB component
- Build placeholder screens

### Phase 1.4: State Management

Configure Zustand stores for authentication and UI state.

**Tasks:**
- Install Zustand
- Create auth store with persistence
- Create UI store for modals/navigation state
- Set up store exports

### Phase 1.5: Authentication

Connect Supabase and implement the authentication flow.

**Tasks:**
- Install Supabase client
- Create Supabase service configuration
- Build AuthProvider context
- Create LoginScreen with form
- Implement protected routes
- Handle session persistence

### Phase 1.6: Polish & Testing

Add animations, ensure responsive design, and validate all screens.

**Tasks:**
- Install Framer Motion
- Add page transition animations
- Ensure touch targets meet 44x44px minimum
- Test responsive breakpoints (mobile, tablet, desktop)
- Add data-testid attributes for Playwright

---

## STEP-BY-STEP TASKS

IMPORTANT: Execute every task in order, top to bottom. Each task is atomic and independently testable.

---

### Task 1: CREATE Project with Vite

**IMPLEMENT**: Initialize new Vite project with React + TypeScript
```bash
npm create vite@latest . -- --template react-ts
```

**GOTCHA**: Run in project root directory, will use existing package.json
**VALIDATE**: `ls src/main.tsx` should exist

---

### Task 2: UPDATE package.json dependencies

**IMPLEMENT**: Install all required dependencies

```bash
npm install react-router-dom@latest zustand @supabase/supabase-js framer-motion lucide-react clsx tailwind-merge date-fns
```

```bash
npm install -D tailwindcss @tailwindcss/vite postcss autoprefixer @types/node
```

**PATTERN**: Keep dependencies minimal, add as needed
**VALIDATE**: `npm list react-router-dom zustand @supabase/supabase-js`

---

### Task 3: CREATE tsconfig.json with path aliases

**IMPLEMENT**: Configure TypeScript with @ path alias

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**VALIDATE**: TypeScript should resolve `@/` imports

---

### Task 4: CREATE tsconfig.node.json

**IMPLEMENT**: Node-specific TypeScript config for Vite

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

**VALIDATE**: No TypeScript errors in vite.config.ts

---

### Task 5: CREATE vite.config.ts

**IMPLEMENT**: Configure Vite with React, Tailwind, and path aliases

```typescript
import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
})
```

**VALIDATE**: `npm run dev` should start without errors

---

### Task 6: CREATE src/index.css with Tailwind

**IMPLEMENT**: Global styles with Tailwind and CSS variables for theme

```css
@import "tailwindcss";

@theme {
  --color-background: #0D1117;
  --color-background-secondary: #161B22;
  --color-background-tertiary: #21262D;

  --color-accent-primary: #0A84FF;
  --color-accent-success: #2DA44E;
  --color-accent-warning: #D29922;
  --color-accent-error: #F85149;

  --color-category-work: #0A84FF;
  --color-category-personal: #2DA44E;
  --color-category-team: #DB61A2;
  --color-category-self: #D29922;

  --color-text-primary: #F0F6FC;
  --color-text-secondary: #8B949E;
  --color-text-muted: #484F58;

  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
}

body {
  @apply bg-background text-text-primary font-sans antialiased;
  min-height: 100dvh;
}

/* Ensure touch targets are minimum 44x44px */
button, a, [role="button"] {
  min-height: 44px;
  min-width: 44px;
}

/* Custom scrollbar for dark theme */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--color-background-secondary);
}

::-webkit-scrollbar-thumb {
  background: var(--color-background-tertiary);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-muted);
}
```

**PATTERN**: Use CSS variables for theme colors, reference via Tailwind utilities
**VALIDATE**: Styles should apply when app runs

---

### Task 7: CREATE directory structure

**IMPLEMENT**: Create VSA folder structure

```bash
mkdir -p src/app/providers
mkdir -p src/features/home/components
mkdir -p src/features/calendar/components
mkdir -p src/features/analytics/components
mkdir -p src/features/profile/components
mkdir -p src/features/auth/components
mkdir -p src/shared/components/ui
mkdir -p src/shared/hooks
mkdir -p src/shared/services
mkdir -p src/shared/store
mkdir -p src/shared/utils
mkdir -p src/styles
```

**VALIDATE**: `ls src/features` should show all feature directories

---

### Task 8: RUN shadcn init

**IMPLEMENT**: Initialize shadcn/ui in the project

```bash
npx shadcn@latest init -d
```

When prompted:
- Style: Default
- Base color: Neutral
- CSS variables: Yes

**GOTCHA**: The `-d` flag uses defaults, may need manual config adjustment
**VALIDATE**: `components.json` should be created

---

### Task 9: UPDATE components.json for custom paths

**IMPLEMENT**: Configure shadcn to use our directory structure

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/index.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/shared/components",
    "utils": "@/shared/utils",
    "ui": "@/shared/components/ui",
    "lib": "@/shared/utils",
    "hooks": "@/shared/hooks"
  },
  "iconLibrary": "lucide"
}
```

**VALIDATE**: shadcn add commands should install to correct directories

---

### Task 10: ADD shadcn components

**IMPLEMENT**: Install required UI components

```bash
npx shadcn@latest add button avatar tabs progress
```

**IMPORTS**: Components will be in `src/shared/components/ui/`
**VALIDATE**: `ls src/shared/components/ui` should show component files

---

### Task 11: CREATE src/shared/utils/cn.ts

**IMPLEMENT**: Utility function for merging Tailwind classes

```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**PATTERN**: Standard shadcn utility pattern
**VALIDATE**: Import should work in components

---

### Task 12: CREATE src/styles/theme.ts

**IMPLEMENT**: Theme constants matching PRD design system

```typescript
export const theme = {
  colors: {
    background: {
      primary: '#0D1117',
      secondary: '#161B22',
      tertiary: '#21262D',
    },
    accent: {
      primary: '#0A84FF',
      success: '#2DA44E',
      warning: '#D29922',
      error: '#F85149',
    },
    category: {
      work: '#0A84FF',
      personal: '#2DA44E',
      team: '#DB61A2',
      selfImprovement: '#D29922',
    },
    text: {
      primary: '#F0F6FC',
      secondary: '#8B949E',
      muted: '#484F58',
    },
  },
  breakpoints: {
    mobile: 640,
    tablet: 768,
    desktop: 1024,
  },
  spacing: {
    touchTarget: 44,
    touchTargetLarge: 48,
    touchGap: 8,
  },
} as const;

export type Theme = typeof theme;
```

**PATTERN**: Export as const for type safety
**VALIDATE**: Types should be inferred correctly

---

### Task 13: CREATE src/styles/animations.ts

**IMPLEMENT**: Framer Motion animation variants

```typescript
import { Variants } from "framer-motion";

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const slideUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

export const slideDown: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
};

export const modalVariants: Variants = {
  initial: { opacity: 0, y: "100%" },
  animate: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", damping: 25, stiffness: 300 }
  },
  exit: {
    opacity: 0,
    y: "100%",
    transition: { duration: 0.2 }
  },
};

export const fabVariants: Variants = {
  initial: { scale: 0, rotate: -180 },
  animate: {
    scale: 1,
    rotate: 0,
    transition: { type: "spring", damping: 15, stiffness: 300 }
  },
  tap: { scale: 0.9 },
  hover: { scale: 1.1 },
};

export const taskCompleteVariants: Variants = {
  initial: { scale: 1, opacity: 1 },
  exit: {
    scale: 0.8,
    opacity: 0,
    transition: { duration: 0.2 }
  },
};

export const pageTransition = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.2 },
};

export const springConfig = {
  type: "spring",
  damping: 20,
  stiffness: 300,
};
```

**PATTERN**: Export reusable animation variants
**VALIDATE**: Can be imported and used with Framer Motion

---

### Task 14: CREATE src/shared/services/supabase.ts

**IMPLEMENT**: Supabase client configuration

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase credentials not found. Running in demo mode without authentication.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'http://localhost:54321',
  supabaseAnonKey || 'demo-key'
);

export type SupabaseClient = typeof supabase;
```

**GOTCHA**: Handle missing env vars gracefully for local dev
**VALIDATE**: No runtime errors when env vars are missing

---

### Task 15: CREATE .env.example

**IMPLEMENT**: Environment variables template

```env
# Supabase Configuration
# Get these from your Supabase project dashboard
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your-anon-key

# App Configuration
VITE_APP_NAME=TaskFlow
VITE_APP_VERSION=1.0.0
```

**GOTCHA**: Never commit actual keys, use .env.local
**VALIDATE**: File exists at project root

---

### Task 16: CREATE .env.local

**IMPLEMENT**: Local environment variables (git-ignored)

```env
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
VITE_APP_NAME=TaskFlow
VITE_APP_VERSION=1.0.0
```

**GOTCHA**: This is the default Supabase local dev key
**VALIDATE**: App should read these values at runtime

---

### Task 17: UPDATE .gitignore

**IMPLEMENT**: Add environment files to gitignore

```gitignore
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Environment files
.env
.env.local
.env.*.local

# Supabase
supabase/.branches
supabase/.temp
```

**VALIDATE**: `git status` should not show .env.local

---

### Task 18: CREATE src/shared/store/authStore.ts

**IMPLEMENT**: Authentication state store with Zustand

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      isLoading: true,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setSession: (session) => set({
        session,
        user: session?.user ?? null,
        isAuthenticated: !!session
      }),
      setLoading: (isLoading) => set({ isLoading }),
      signOut: () => set({
        user: null,
        session: null,
        isAuthenticated: false
      }),
    }),
    {
      name: 'taskflow-auth',
      partialize: (state) => ({
        // Only persist minimal auth state
        isAuthenticated: state.isAuthenticated
      }),
    }
  )
);
```

**PATTERN**: Zustand with persist middleware
**VALIDATE**: Store should persist to localStorage

---

### Task 19: CREATE src/shared/store/uiStore.ts

**IMPLEMENT**: UI state store for modals and navigation

```typescript
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
```

**PATTERN**: Simple Zustand store without persistence
**VALIDATE**: Store updates should trigger re-renders

---

### Task 20: CREATE src/shared/store/index.ts

**IMPLEMENT**: Store exports

```typescript
export { useAuthStore } from './authStore';
export { useUIStore } from './uiStore';
```

**VALIDATE**: All stores importable from single location

---

### Task 21: CREATE src/app/providers/ThemeProvider.tsx

**IMPLEMENT**: Dark theme provider (always dark for MVP)

```typescript
import { createContext, useContext, useEffect, ReactNode } from 'react';

type Theme = 'dark' | 'light' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
}

export function ThemeProvider({
  children,
  defaultTheme = 'dark'
}: ThemeProviderProps) {
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(defaultTheme);
  }, [defaultTheme]);

  const value: ThemeContextType = {
    theme: defaultTheme,
    setTheme: () => {
      // For MVP, always dark theme
      // Future: implement theme switching
    },
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
```

**PATTERN**: Context provider pattern from shadcn docs
**VALIDATE**: Dark class should be applied to html element

---

### Task 22: CREATE src/app/providers/AuthProvider.tsx

**IMPLEMENT**: Supabase authentication provider

```typescript
import { createContext, useContext, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/shared/services/supabase';
import { useAuthStore } from '@/shared/store';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const {
    user,
    session,
    isLoading,
    isAuthenticated,
    setSession,
    setLoading,
    signOut: clearAuth
  } = useAuthStore();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [setSession, setLoading]);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    clearAuth();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isAuthenticated,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

**PATTERN**: Supabase auth state with Zustand store sync
**VALIDATE**: Auth state should update on login/logout

---

### Task 23: CREATE src/app/providers/index.tsx

**IMPLEMENT**: Combined providers wrapper

```typescript
import { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './ThemeProvider';
import { AuthProvider } from './AuthProvider';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="dark">
        <AuthProvider>
          {children}
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export { useTheme } from './ThemeProvider';
export { useAuth } from './AuthProvider';
```

**PATTERN**: Nest providers in dependency order
**VALIDATE**: All contexts accessible from app components

---

### Task 24: CREATE src/shared/components/BottomNav.tsx

**IMPLEMENT**: Mobile bottom navigation component

```typescript
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Calendar, BarChart3, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/shared/utils/cn';
import { useUIStore } from '@/shared/store';

const navItems = [
  { path: '/', icon: Home, label: 'Home', id: 'home' as const },
  { path: '/calendar', icon: Calendar, label: 'Calendar', id: 'calendar' as const },
  { path: '/analytics', icon: BarChart3, label: 'Analytics', id: 'analytics' as const },
  { path: '/profile', icon: User, label: 'Profile', id: 'profile' as const },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setActiveNavItem, isMobileNavVisible } = useUIStore();

  if (!isMobileNavVisible) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-background-secondary border-t border-background-tertiary safe-area-pb"
      data-testid="bottom-nav"
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => {
                navigate(item.path);
                setActiveNavItem(item.id);
              }}
              className={cn(
                'relative flex flex-col items-center justify-center w-16 h-12 rounded-lg transition-colors',
                'hover:bg-background-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:ring-offset-background',
                isActive ? 'text-accent-primary' : 'text-text-secondary'
              )}
              data-testid={`nav-${item.id}`}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs mt-1">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent-primary"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
```

**PATTERN**: Active state with Framer Motion layoutId for smooth indicator
**GOTCHA**: Use safe-area-pb for iOS home indicator
**VALIDATE**: Navigation should work between all 4 screens

---

### Task 25: CREATE src/shared/components/FAB.tsx

**IMPLEMENT**: Floating Action Button component

```typescript
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useUIStore } from '@/shared/store';
import { fabVariants } from '@/styles/animations';
import { cn } from '@/shared/utils/cn';

interface FABProps {
  className?: string;
}

export function FAB({ className }: FABProps) {
  const { openAddTaskModal } = useUIStore();

  return (
    <motion.button
      variants={fabVariants}
      initial="initial"
      animate="animate"
      whileTap="tap"
      whileHover="hover"
      onClick={openAddTaskModal}
      className={cn(
        'fixed bottom-20 right-4 z-40',
        'w-14 h-14 rounded-full',
        'bg-accent-primary text-white',
        'flex items-center justify-center',
        'shadow-lg shadow-accent-primary/25',
        'focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:ring-offset-background',
        'md:bottom-8 md:right-8',
        className
      )}
      data-testid="fab-button"
      aria-label="Add new task"
    >
      <Plus className="w-6 h-6" />
    </motion.button>
  );
}
```

**PATTERN**: Framer Motion for animations, positioned above bottom nav on mobile
**VALIDATE**: FAB should open add task modal on click

---

### Task 26: CREATE src/shared/components/PageContainer.tsx

**IMPLEMENT**: Responsive page wrapper component

```typescript
import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { pageTransition } from '@/styles/animations';
import { cn } from '@/shared/utils/cn';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  title?: string;
}

export function PageContainer({ children, className, title }: PageContainerProps) {
  return (
    <motion.main
      initial={pageTransition.initial}
      animate={pageTransition.animate}
      exit={pageTransition.exit}
      transition={pageTransition.transition}
      className={cn(
        'min-h-screen pb-20 px-4 pt-safe',
        'max-w-lg mx-auto',
        'md:max-w-2xl md:pb-8',
        'lg:max-w-4xl',
        className
      )}
    >
      {title && (
        <h1 className="text-2xl font-bold text-text-primary mb-6 pt-4">
          {title}
        </h1>
      )}
      {children}
    </motion.main>
  );
}
```

**PATTERN**: Consistent padding for bottom nav, responsive max-width
**VALIDATE**: Content should not overlap with bottom nav

---

### Task 27: CREATE src/app/Layout.tsx

**IMPLEMENT**: Main app layout with navigation

```typescript
import { Outlet } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { BottomNav } from '@/shared/components/BottomNav';
import { FAB } from '@/shared/components/FAB';

export function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        <Outlet />
      </AnimatePresence>
      <FAB />
      <BottomNav />
    </div>
  );
}
```

**PATTERN**: Outlet for nested routes, FAB above BottomNav
**VALIDATE**: Layout renders on all protected routes

---

### Task 28: CREATE src/features/home/HomeScreen.tsx

**IMPLEMENT**: Home screen placeholder with greeting

```typescript
import { PageContainer } from '@/shared/components/PageContainer';
import { useAuth } from '@/app/providers';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function HomeScreen() {
  const { user } = useAuth();
  const greeting = getGreeting();
  const displayName = user?.email?.split('@')[0] || 'User';

  return (
    <PageContainer>
      <div className="pt-6" data-testid="home-screen">
        <h1 className="text-2xl font-bold text-text-primary">
          {greeting}, {displayName}
        </h1>

        {/* Daily Goals Progress - Placeholder */}
        <div className="mt-6 p-6 bg-background-secondary rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-background-tertiary"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray="100"
                  strokeDashoffset="20"
                  strokeLinecap="round"
                  className="text-accent-primary"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-text-primary">
                80%
              </span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Daily Goals</h2>
              <p className="text-sm text-text-secondary">8/10 tasks</p>
            </div>
          </div>
        </div>

        {/* Task List Placeholder */}
        <div className="mt-6 space-y-3">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Today's Tasks</h2>
          {[
            { title: 'Quarterly Review Prep', category: 'work' },
            { title: 'Grocery Shopping', category: 'personal' },
            { title: 'Design Sprint Sync', category: 'team' },
            { title: 'Read 30 pages', category: 'self' },
          ].map((task, i) => (
            <div
              key={i}
              className="p-4 bg-background-secondary rounded-xl flex items-center gap-3"
              data-testid={`task-card-${i}`}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor:
                    task.category === 'work' ? '#0A84FF' :
                    task.category === 'personal' ? '#2DA44E' :
                    task.category === 'team' ? '#DB61A2' :
                    '#D29922'
                }}
              />
              <span className="text-text-primary">{task.title}</span>
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
```

**PATTERN**: Static placeholder data, will be replaced in Phase 2
**VALIDATE**: Home screen renders with greeting and placeholder tasks

---

### Task 29: CREATE src/features/calendar/CalendarScreen.tsx

**IMPLEMENT**: Calendar screen placeholder

```typescript
import { PageContainer } from '@/shared/components/PageContainer';

export function CalendarScreen() {
  const today = new Date();
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <PageContainer>
      <div className="pt-6" data-testid="calendar-screen">
        {/* Month Header */}
        <div className="flex items-center justify-between mb-6">
          <button className="p-2 text-text-secondary hover:text-text-primary" data-testid="prev-week-button">
            &lt;
          </button>
          <h1 className="text-xl font-bold text-text-primary">
            {today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h1>
          <button className="p-2 text-text-secondary hover:text-text-primary" data-testid="next-week-button">
            &gt;
          </button>
        </div>

        {/* Week View */}
        <div className="grid grid-cols-7 gap-2 mb-6">
          {weekDays.map((day, i) => {
            const date = new Date(today);
            date.setDate(today.getDate() - today.getDay() + i + 1);
            const isToday = date.toDateString() === today.toDateString();

            return (
              <button
                key={day}
                className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                  isToday
                    ? 'bg-accent-primary text-white'
                    : 'text-text-secondary hover:bg-background-tertiary'
                }`}
                data-testid={`day-column-${day.toLowerCase()}`}
              >
                <span className="text-xs">{day}</span>
                <span className="text-lg font-semibold">{date.getDate()}</span>
              </button>
            );
          })}
        </div>

        {/* Time Grid Placeholder */}
        <div className="bg-background-secondary rounded-xl p-4">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Schedule</h2>
          <div className="space-y-2">
            {['9AM', '10AM', '11AM', '12PM', '1PM', '2PM'].map((time) => (
              <div key={time} className="flex items-center gap-4 py-2 border-b border-background-tertiary">
                <span className="text-xs text-text-muted w-12">{time}</span>
                <div className="flex-1 h-12 rounded bg-background-tertiary/50" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
```

**PATTERN**: Static week view, will be enhanced in Phase 3
**VALIDATE**: Calendar screen renders with week days

---

### Task 30: CREATE src/features/analytics/AnalyticsScreen.tsx

**IMPLEMENT**: Analytics screen placeholder

```typescript
import { PageContainer } from '@/shared/components/PageContainer';
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';

export function AnalyticsScreen() {
  return (
    <PageContainer>
      <div className="pt-6" data-testid="analytics-screen">
        <h1 className="text-2xl font-bold text-text-primary mb-6">Your Progress</h1>

        {/* Time Filter Tabs */}
        <Tabs defaultValue="week" className="mb-6">
          <TabsList className="grid w-full grid-cols-3 bg-background-secondary">
            <TabsTrigger value="week" data-testid="filter-week">Week</TabsTrigger>
            <TabsTrigger value="month" data-testid="filter-month">Month</TabsTrigger>
            <TabsTrigger value="year" data-testid="filter-year">Year</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Stats Cards */}
        <div className="bg-background-secondary rounded-2xl p-6 mb-6">
          <div className="text-center">
            <span className="text-5xl font-bold text-accent-primary">47</span>
            <p className="text-text-secondary mt-2">Tasks Completed</p>
          </div>
          <div className="flex justify-center gap-8 mt-4">
            <div className="text-center">
              <span className="text-lg font-semibold text-text-primary">12 day streak</span>
              <span className="text-accent-warning ml-1">🔥</span>
            </div>
            <div className="text-center">
              <span className="text-lg font-semibold text-text-primary">85%</span>
              <span className="text-text-secondary ml-1">completion rate</span>
            </div>
          </div>
        </div>

        {/* Activity Chart Placeholder */}
        <div className="bg-background-secondary rounded-xl p-4 mb-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Activity</h2>
          <div className="flex items-end justify-between h-32 gap-2">
            {[40, 60, 45, 80, 65, 90, 70].map((height, i) => (
              <div
                key={i}
                className="flex-1 bg-accent-primary rounded-t"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-text-muted">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-background-secondary rounded-xl p-4">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Category Breakdown</h2>
          {[
            { name: 'Work', percent: 40, color: '#0A84FF' },
            { name: 'Personal', percent: 30, color: '#2DA44E' },
            { name: 'Team', percent: 20, color: '#DB61A2' },
            { name: 'Self-improvement', percent: 10, color: '#D29922' },
          ].map((cat) => (
            <div key={cat.name} className="flex items-center gap-3 mb-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: cat.color }}
              />
              <span className="flex-1 text-text-primary">{cat.name}</span>
              <div className="w-24 h-2 bg-background-tertiary rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${cat.percent}%`, backgroundColor: cat.color }}
                />
              </div>
              <span className="text-sm text-text-secondary w-10 text-right">{cat.percent}%</span>
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
```

**PATTERN**: Static charts, will be replaced with real data in Phase 4
**VALIDATE**: Analytics screen renders with placeholder data

---

### Task 31: CREATE src/features/profile/ProfileScreen.tsx

**IMPLEMENT**: Profile screen placeholder

```typescript
import { PageContainer } from '@/shared/components/PageContainer';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { useAuth } from '@/app/providers';
import { Bell, Target, FolderOpen, RefreshCw, LogOut, ChevronRight } from 'lucide-react';

export function ProfileScreen() {
  const { user, signOut } = useAuth();
  const displayName = user?.email?.split('@')[0] || 'User';
  const initials = displayName.slice(0, 2).toUpperCase();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <PageContainer>
      <div className="pt-6" data-testid="profile-screen">
        {/* Profile Header */}
        <div className="flex flex-col items-center mb-8">
          <Avatar className="w-20 h-20 mb-4">
            <AvatarImage src="" alt={displayName} />
            <AvatarFallback className="bg-accent-primary text-white text-xl">
              {initials}
            </AvatarFallback>
          </Avatar>
          <h1 className="text-xl font-bold text-text-primary">{displayName}</h1>
          <button className="text-sm text-accent-primary mt-1">Edit Profile</button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Tasks', value: '156' },
            { label: 'Best Streak', value: '12' },
            { label: 'Rate', value: '89%' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <span className="text-2xl font-bold text-text-primary">{stat.value}</span>
              <p className="text-xs text-text-secondary mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Settings List */}
        <div className="bg-background-secondary rounded-xl overflow-hidden">
          {[
            { icon: Bell, label: 'Notifications', hasToggle: true, testId: 'notifications-toggle' },
            { icon: Target, label: 'Daily Goal', value: '10 tasks', testId: 'setting-daily-goal' },
            { icon: FolderOpen, label: 'Categories', testId: 'setting-categories' },
            { icon: RefreshCw, label: 'Sync & Backup', testId: 'setting-sync' },
          ].map((item, i) => (
            <button
              key={item.label}
              className={`w-full flex items-center justify-between p-4 hover:bg-background-tertiary transition-colors ${
                i !== 0 ? 'border-t border-background-tertiary' : ''
              }`}
              data-testid={item.testId}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5 text-text-secondary" />
                <span className="text-text-primary">{item.label}</span>
              </div>
              {item.hasToggle ? (
                <div className="w-10 h-6 bg-accent-primary rounded-full relative">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                </div>
              ) : item.value ? (
                <span className="text-text-secondary">{item.value}</span>
              ) : (
                <ChevronRight className="w-5 h-5 text-text-muted" />
              )}
            </button>
          ))}
        </div>

        {/* Upgrade Banner */}
        <button className="w-full mt-6 p-4 bg-accent-warning/20 rounded-xl flex items-center justify-center gap-2 text-accent-warning font-medium">
          Upgrade to Pro ⭐
        </button>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className="w-full mt-4 p-4 text-accent-error flex items-center justify-center gap-2"
          data-testid="sign-out-button"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </PageContainer>
  );
}
```

**PATTERN**: Static settings, will connect to real data in Phase 4
**VALIDATE**: Profile screen renders with settings list

---

### Task 32: CREATE src/features/auth/LoginScreen.tsx

**IMPLEMENT**: Login/signup screen

```typescript
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/app/providers';
import { Button } from '@/shared/components/ui/button';
import { fadeIn } from '@/styles/animations';

export function LoginScreen() {
  const { isAuthenticated, isLoading, signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = isSignUp
      ? await signUp(email, password)
      : await signIn(email, password);

    if (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  return (
    <motion.div
      variants={fadeIn}
      initial="initial"
      animate="animate"
      className="min-h-screen bg-background flex flex-col items-center justify-center px-6"
      data-testid="login-screen"
    >
      <div className="w-full max-w-sm">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">TaskFlow</h1>
          <p className="text-text-secondary">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm text-text-secondary mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-background-secondary border border-background-tertiary rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary"
              placeholder="you@example.com"
              required
              data-testid="email-input"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-text-secondary mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-background-secondary border border-background-tertiary rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary"
              placeholder="••••••••"
              required
              minLength={6}
              data-testid="password-input"
            />
          </div>

          {error && (
            <p className="text-accent-error text-sm">{error}</p>
          )}

          <Button
            type="submit"
            className="w-full bg-accent-primary hover:bg-accent-primary/90 text-white py-3"
            disabled={loading}
            data-testid="login-button"
          >
            {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </Button>
        </form>

        {/* Toggle */}
        <p className="text-center mt-6 text-text-secondary">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-accent-primary hover:underline"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>

        {/* Demo Mode Notice */}
        <p className="text-center mt-8 text-xs text-text-muted">
          Demo mode: Use any email/password to test
        </p>
      </div>
    </motion.div>
  );
}
```

**PATTERN**: Form with loading/error states, redirect on auth
**VALIDATE**: Login form submits and shows errors

---

### Task 33: CREATE src/app/Router.tsx

**IMPLEMENT**: React Router configuration with protected routes

```typescript
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/app/providers';
import { Layout } from './Layout';
import { LoginScreen } from '@/features/auth/LoginScreen';
import { HomeScreen } from '@/features/home/HomeScreen';
import { CalendarScreen } from '@/features/calendar/CalendarScreen';
import { AnalyticsScreen } from '@/features/analytics/AnalyticsScreen';
import { ProfileScreen } from '@/features/profile/ProfileScreen';

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
        <Route path="/calendar" element={<CalendarScreen />} />
        <Route path="/analytics" element={<AnalyticsScreen />} />
        <Route path="/profile" element={<ProfileScreen />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
```

**PATTERN**: Protected routes wrapper with loading state
**VALIDATE**: Unauthenticated users redirect to login

---

### Task 34: CREATE src/App.tsx

**IMPLEMENT**: Root app component

```typescript
import { Router } from './app/Router';

function App() {
  return <Router />;
}

export default App;
```

**VALIDATE**: App renders router

---

### Task 35: UPDATE src/main.tsx

**IMPLEMENT**: React entry point with providers

```typescript
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Providers } from './app/providers';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers>
      <App />
    </Providers>
  </StrictMode>
);
```

**VALIDATE**: `npm run dev` should start app without errors

---

### Task 36: UPDATE index.html

**IMPLEMENT**: Update HTML template with meta tags

```html
<!DOCTYPE html>
<html lang="en" class="dark">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="theme-color" content="#0D1117" />
    <meta name="description" content="TaskFlow - Personal productivity and task management PWA" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <title>TaskFlow</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**PATTERN**: PWA-ready meta tags, dark class on html
**VALIDATE**: Meta tags visible in browser dev tools

---

### Task 37: ADD safe area CSS utilities

**IMPLEMENT**: Add to src/index.css for iOS safe areas

```css
/* Add after existing styles */

/* Safe area utilities for iOS */
.pt-safe {
  padding-top: env(safe-area-inset-top);
}

.pb-safe {
  padding-bottom: env(safe-area-inset-bottom);
}

.safe-area-pb {
  padding-bottom: max(16px, env(safe-area-inset-bottom));
}

/* Focus visible styles */
:focus-visible {
  outline: 2px solid var(--color-accent-primary);
  outline-offset: 2px;
}

/* Reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**VALIDATE**: Safe areas work on iOS devices/simulator

---

### Task 38: RUN final validation

**IMPLEMENT**: Run all validation commands

```bash
npm run dev
```

**VALIDATE**:
- App starts on http://localhost:5173
- Login screen renders
- Can navigate between all 4 screens after login
- Bottom navigation works
- FAB button visible
- Dark theme applied
- No console errors

---

## TESTING STRATEGY

### Unit Tests (Post-Phase 1)

Unit tests will be added in a separate testing setup task. For now, ensure:
- All components render without errors
- Navigation works between screens
- Auth flow completes

### Integration Tests (Playwright - from PRD)

Reference PRD tests TEST 1.1 through TEST 1.6 for:
- Authentication flow
- Navigation between screens
- Dark theme consistency
- Responsive layouts (mobile, tablet, desktop)

### Manual Testing Checklist

- [ ] Login screen renders with form
- [ ] Can enter email and password
- [ ] Login redirects to home screen
- [ ] Bottom nav shows 4 items (Home, Calendar, Analytics, Profile)
- [ ] FAB button visible above bottom nav
- [ ] Can navigate to all 4 screens
- [ ] Active nav item is highlighted
- [ ] Profile screen shows sign out button
- [ ] Sign out returns to login screen
- [ ] Dark theme colors match PRD spec

---

## VALIDATION COMMANDS

### Level 1: Development Server

```bash
npm run dev
```
**Expected**: Server starts on port 5173, no errors

### Level 2: Type Checking

```bash
npx tsc --noEmit
```
**Expected**: No TypeScript errors

### Level 3: Build

```bash
npm run build
```
**Expected**: Build completes, dist/ folder created

### Level 4: Preview Build

```bash
npm run preview
```
**Expected**: Production build runs without errors

### Level 5: Manual Validation

1. Open http://localhost:5173
2. Verify login screen renders
3. Enter any email/password and sign in
4. Verify home screen with greeting
5. Navigate through all 4 screens
6. Verify FAB is visible
7. Sign out from profile screen

---

## ACCEPTANCE CRITERIA

- [ ] Vite + React + TypeScript project scaffolded
- [ ] Tailwind CSS configured with dark theme colors from PRD
- [ ] shadcn/ui initialized with button, avatar, tabs, progress components
- [ ] React Router v7 configured with 4 main routes
- [ ] Zustand stores created for auth and UI state
- [ ] Supabase client configured (works in demo mode without credentials)
- [ ] Login screen with email/password form
- [ ] Protected routes redirect unauthenticated users
- [ ] Bottom navigation with 4 items (Home, Calendar, Analytics, Profile)
- [ ] FAB positioned above bottom nav on mobile
- [ ] All placeholder screens render correctly
- [ ] Page transitions animate smoothly
- [ ] Touch targets minimum 44x44px
- [ ] Responsive layout works on mobile (375px), tablet (768px), desktop (1280px)
- [ ] All data-testid attributes added for Playwright tests
- [ ] No TypeScript errors
- [ ] No console errors

---

## COMPLETION CHECKLIST

- [ ] All 38 tasks completed in order
- [ ] Each task validation passed
- [ ] Development server runs without errors
- [ ] TypeScript compiles without errors
- [ ] Build completes successfully
- [ ] All 4 screens render with placeholders
- [ ] Navigation works between all screens
- [ ] Auth flow works (login/logout)
- [ ] Dark theme colors match PRD specification
- [ ] Responsive layout verified on 3 breakpoints
- [ ] All acceptance criteria met

---

## NOTES

### Design Decisions

1. **Always Dark Theme**: MVP uses dark theme only. Light theme toggle deferred to post-MVP.

2. **Demo Mode Auth**: App works without Supabase credentials for local development. When env vars are missing, it logs a warning but continues to function.

3. **Placeholder Data**: All screens have static placeholder data that will be replaced with real data in subsequent phases.

4. **Tailwind CSS 4.x**: Using latest Tailwind with @theme for CSS variables instead of tailwind.config.js.

5. **React Router v7**: Using declarative routing mode (not framework mode) for simplicity.

### Potential Risks

1. **Supabase Local Dev**: May need Supabase CLI for full local development. Demo mode works for initial development.

2. **iOS Safe Areas**: Need to test on actual iOS devices or simulator to verify safe area handling.

3. **Framer Motion Bundle Size**: Monitor bundle size; may need to tree-shake unused features.

### Dependencies Added

```json
{
  "dependencies": {
    "react-router-dom": "^7.x",
    "zustand": "^5.x",
    "@supabase/supabase-js": "^2.x",
    "framer-motion": "^11.x",
    "lucide-react": "^0.x",
    "clsx": "^2.x",
    "tailwind-merge": "^2.x",
    "date-fns": "^3.x"
  },
  "devDependencies": {
    "tailwindcss": "^4.x",
    "@tailwindcss/vite": "^4.x",
    "@types/node": "^22.x"
  }
}
```
