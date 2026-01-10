# Feature: Phase 4 - Analytics & Polish

The following plan should be complete, but it's important that you validate documentation and codebase patterns before you start implementing.

Pay special attention to naming of existing utils, types, and models. Import from the right files etc.

## Feature Description

Phase 4 completes the TaskFlow PWA by implementing functional analytics with real data, enhancing the profile screen with working settings, and adding PWA capabilities for offline support and installability. This phase transforms placeholder UI from earlier phases into fully functional features with accurate statistics, streak tracking, category breakdowns, and user-configurable settings.

## User Story

As a productivity-minded user
I want to see accurate analytics about my task completion and configure my daily goals
So that I can track my progress, stay motivated with streaks, and customize my experience

## Problem Statement

Phases 1-3 created placeholder analytics and profile screens with hardcoded data. Users cannot:
- See real statistics about their task completion
- Track their productivity streaks
- View category breakdowns based on actual completed tasks
- Configure their daily goal or toggle settings
- Use the app offline or install it as a PWA

## Solution Statement

Implement fully functional analytics and profile screens:
- Create analyticsStore to calculate statistics from task data
- Replace hardcoded values with computed real data
- Add streak tracking logic with persistence
- Implement working settings (daily goal, notifications toggle)
- Configure PWA with manifest and service worker
- Add offline support via Zustand persistence (already in place)
- Ensure all animations polish the experience

## Feature Metadata

**Feature Type**: Enhancement (Make placeholders functional) + New Capability (PWA)
**Estimated Complexity**: Medium-High
**Primary Systems Affected**:
- `src/features/analytics/` - Rewrite with real data
- `src/features/profile/` - Add working settings
- `src/shared/store/` - New analyticsStore, update settingsStore
- `public/` - PWA manifest, icons
- `vite.config.ts` - PWA plugin configuration
**Dependencies**:
- New npm: `recharts` (via shadcn chart), `@vite-pwa/vite` (optional for full PWA)
- New shadcn: chart, switch, slider, card, separator

---

## CONTEXT REFERENCES

### Relevant Codebase Files - IMPORTANT: READ BEFORE IMPLEMENTING!

**Current Analytics (to enhance):**
- `src/features/analytics/AnalyticsScreen.tsx` (lines 1-89) - Placeholder with hardcoded data to replace
- `src/features/profile/ProfileScreen.tsx` (lines 1-94) - Placeholder settings to make functional

**Store Patterns:**
- `src/shared/store/taskStore.ts` (lines 1-162) - Task state + getCompletedTodayCount pattern
- `src/shared/store/authStore.ts` (lines 1-45) - Persist middleware pattern
- `src/shared/store/uiStore.ts` (lines 1-35) - Simple store without persist

**Component Patterns:**
- `src/features/home/components/DailyGoals.tsx` (lines 1-65) - Circular progress with SVG animation
- `src/shared/utils/categoryColors.ts` (lines 1-20) - Category colors + getCategoryColor util
- `src/styles/animations.ts` (lines 1-73) - Framer Motion variants

**Type Definitions:**
- `src/shared/types/task.ts` (lines 1-46) - Task, Category types

**Theme & Styling:**
- `src/styles/theme.ts` (lines 1-39) - Category colors
- `src/index.css` (lines 1-204) - CSS variables including chart colors

**Home Screen (uses daily goal):**
- `src/features/home/HomeScreen.tsx` (lines 1-32) - Passes dailyGoal prop (hardcoded 10)

**UI Mockups:**
- `ui-images/analytics-page.png` - Analytics design
- `ui-images/profile-page.png` - Profile design

**PRD Reference:**
- `.agents/PRD.md` (lines 940-1160) - Phase 4 requirements and Playwright tests

### New Files to Create

**Types:**
- `src/shared/types/analytics.ts` - Analytics-specific types (TimeFilter, CategoryStats, StreakData)

**Stores:**
- `src/shared/store/analyticsStore.ts` - Computed analytics with persistence for streak
- `src/shared/store/settingsStore.ts` - User settings (dailyGoal, notifications)

**Feature: Analytics:**
- `src/features/analytics/AnalyticsScreen.tsx` - Rewrite with real data
- `src/features/analytics/components/StatsCard.tsx` - Metric display component
- `src/features/analytics/components/ActivityChart.tsx` - Weekly bar chart
- `src/features/analytics/components/CategoryBreakdown.tsx` - Category progress bars
- `src/features/analytics/hooks/useAnalytics.ts` - Analytics calculations hook

**Feature: Profile:**
- `src/features/profile/components/SettingItem.tsx` - Reusable setting row
- `src/features/profile/components/DailyGoalPicker.tsx` - Goal selection modal
- `src/features/profile/components/SignOutDialog.tsx` - Confirmation dialog

**UI Components (shadcn):**
- `src/shared/components/ui/chart.tsx` - shadcn chart (recharts wrapper)
- `src/shared/components/ui/switch.tsx` - shadcn switch
- `src/shared/components/ui/slider.tsx` - shadcn slider
- `src/shared/components/ui/card.tsx` - shadcn card
- `src/shared/components/ui/separator.tsx` - shadcn separator

**PWA (optional - can be deferred):**
- `public/manifest.json` - PWA manifest
- `public/icons/` - App icons (192x192, 512x512)

### Relevant Documentation

- [Recharts Bar Chart](https://recharts.org/en-US/api/BarChart)
  - Bar, BarChart, XAxis, CartesianGrid components
  - Why: Activity chart implementation

- [shadcn Chart](https://ui.shadcn.com/docs/components/chart)
  - ChartContainer, ChartConfig, ChartTooltip
  - Why: Recharts wrapper with theming

- [shadcn Switch](https://ui.shadcn.com/docs/components/switch)
  - Toggle component for settings
  - Why: Notifications toggle

- [shadcn Slider](https://ui.shadcn.com/docs/components/slider)
  - Range input for goal picker
  - Why: Daily goal selection

- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/guide/)
  - PWA configuration for Vite
  - Why: Optional full PWA support

### Patterns to Follow

**Analytics Calculation Pattern:**
```typescript
// Calculate stats from task store
const getCompletedInRange = (tasks: Task[], startDate: Date, endDate: Date) => {
  return tasks.filter(t => {
    if (!t.completedAt) return false;
    const completedDate = new Date(t.completedAt);
    return completedDate >= startDate && completedDate <= endDate;
  });
};
```

**Streak Calculation Pattern:**
```typescript
// Check if user completed daily goal on a date
const hasCompletedGoalOnDate = (tasks: Task[], date: Date, dailyGoal: number) => {
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);
  const completed = tasks.filter(t => {
    if (!t.completedAt) return false;
    const completedDate = new Date(t.completedAt);
    return completedDate >= dayStart && completedDate <= dayEnd;
  }).length;
  return completed >= dailyGoal;
};

// Calculate current streak
const calculateStreak = (tasks: Task[], dailyGoal: number): number => {
  let streak = 0;
  let currentDate = new Date();

  // Check today first
  if (hasCompletedGoalOnDate(tasks, currentDate, dailyGoal)) {
    streak = 1;
    currentDate = subDays(currentDate, 1);
  }

  // Check previous days
  while (hasCompletedGoalOnDate(tasks, currentDate, dailyGoal)) {
    streak++;
    currentDate = subDays(currentDate, 1);
  }

  return streak;
};
```

**Settings Store Pattern (with persist):**
```typescript
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
      toggleNotifications: () => set(s => ({ notificationsEnabled: !s.notificationsEnabled })),
      updateBestStreak: (streak) => {
        if (streak > get().bestStreak) {
          set({ bestStreak: streak });
        }
      },
    }),
    { name: 'taskflow-settings' }
  )
);
```

**Chart Config Pattern (from shadcn):**
```typescript
const chartConfig = {
  work: { label: 'Work', color: '#0A84FF' },
  personal: { label: 'Personal', color: '#2DA44E' },
  team: { label: 'Team', color: '#DB61A2' },
  'self-improvement': { label: 'Self-improvement', color: '#D29922' },
} satisfies ChartConfig;
```

---

## IMPLEMENTATION PLAN

### Phase 4.1: Types & Settings Store

Set up TypeScript types and settings store with persistence.

**Tasks:**
- Define analytics types (TimeFilter, CategoryStats)
- Create settingsStore with dailyGoal, notifications, bestStreak
- Update store barrel exports

### Phase 4.2: Install shadcn Components

Install required UI components from shadcn registry.

**Tasks:**
- Install chart (includes recharts), switch, slider, card, separator

### Phase 4.3: Analytics Calculations

Create analytics hook with real calculations.

**Tasks:**
- useAnalytics hook for computed stats
- Tasks completed (filtered by time range)
- Completion rate calculation
- Current streak calculation
- Category breakdown percentages
- Weekly activity data

### Phase 4.4: Analytics Components

Build analytics visualization components.

**Tasks:**
- StatsCard for metric display
- ActivityChart with recharts BarChart
- CategoryBreakdown with progress bars

### Phase 4.5: Analytics Screen Integration

Compose analytics screen with real data.

**Tasks:**
- Replace hardcoded AnalyticsScreen
- Time filter functionality (week/month/year)
- Connect all components to useAnalytics

### Phase 4.6: Profile Settings Components

Build working settings components.

**Tasks:**
- SettingItem reusable component
- DailyGoalPicker with slider
- SignOutDialog with confirmation
- Working notifications toggle

### Phase 4.7: Profile Screen Integration

Update profile with real stats and working settings.

**Tasks:**
- Connect stats to analyticsStore
- Wire up settings to settingsStore
- Make daily goal picker functional
- Add sign out confirmation

### Phase 4.8: Home Screen Integration

Update home to use settings store for daily goal.

**Tasks:**
- Read dailyGoal from settingsStore
- Update DailyGoals component

### Phase 4.9: PWA Setup (Simplified)

Add basic PWA manifest for installability.

**Tasks:**
- Create manifest.json
- Add app icons
- Update index.html with manifest link
- Test installability

---

## STEP-BY-STEP TASKS

IMPORTANT: Execute every task in order, top to bottom. Each task is atomic and independently testable.

---

### Task 1: CREATE src/shared/types/analytics.ts

**IMPLEMENT**: Define analytics-specific types

```typescript
export type TimeFilter = 'week' | 'month' | 'year';

export interface CategoryStats {
  category: string;
  count: number;
  percentage: number;
  color: string;
}

export interface DayActivity {
  day: string;      // 'Mon', 'Tue', etc.
  date: string;     // ISO date for reference
  count: number;    // Tasks completed
}

export interface AnalyticsData {
  tasksCompleted: number;
  completionRate: number;
  currentStreak: number;
  categoryBreakdown: CategoryStats[];
  weeklyActivity: DayActivity[];
}
```

**PATTERN**: Types in dedicated file
**VALIDATE**: `npx tsc --noEmit` passes

---

### Task 2: UPDATE src/shared/types/index.ts

**IMPLEMENT**: Add analytics type exports

```typescript
export * from './task';
export * from './calendar';
export * from './analytics';
```

**VALIDATE**: Can import from `@/shared/types`

---

### Task 3: CREATE src/shared/store/settingsStore.ts

**IMPLEMENT**: User settings with persistence

```typescript
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
```

**PATTERN**: MIRROR `authStore.ts` persist pattern
**VALIDATE**: Store exports correctly

---

### Task 4: UPDATE src/shared/store/index.ts

**IMPLEMENT**: Add settingsStore export

```typescript
export { useAuthStore } from './authStore';
export { useUIStore } from './uiStore';
export { useTaskStore } from './taskStore';
export { useCalendarStore } from './calendarStore';
export { useSettingsStore } from './settingsStore';
```

**VALIDATE**: Can import `useSettingsStore` from `@/shared/store`

---

### Task 5: RUN shadcn component installation

**IMPLEMENT**: Install chart, switch, slider, card, separator

```bash
npx shadcn@latest add chart switch slider card separator
```

**VALIDATE**: `ls src/shared/components/ui` shows new components
**GOTCHA**: chart installs recharts as dependency - verify in package.json

---

### Task 6: CREATE src/features/analytics/hooks/useAnalytics.ts

**IMPLEMENT**: Analytics calculations hook

```typescript
import { useMemo } from 'react';
import {
  startOfWeek, endOfWeek, startOfMonth, endOfMonth,
  startOfYear, endOfYear, subDays, startOfDay, endOfDay,
  eachDayOfInterval, format, isWithinInterval
} from 'date-fns';
import { useTaskStore, useSettingsStore } from '@/shared/store';
import { TimeFilter, AnalyticsData, CategoryStats, DayActivity } from '@/shared/types';
import { categoryColors, categoryLabels } from '@/shared/utils';
import { Category, Task } from '@/shared/types';

function getDateRange(filter: TimeFilter): { start: Date; end: Date } {
  const now = new Date();
  switch (filter) {
    case 'week':
      return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
    case 'month':
      return { start: startOfMonth(now), end: endOfMonth(now) };
    case 'year':
      return { start: startOfYear(now), end: endOfYear(now) };
  }
}

function getCompletedInRange(tasks: Task[], start: Date, end: Date): Task[] {
  return tasks.filter(t => {
    if (!t.completedAt) return false;
    const completedDate = new Date(t.completedAt);
    return isWithinInterval(completedDate, { start, end });
  });
}

function hasCompletedGoalOnDate(tasks: Task[], date: Date, dailyGoal: number): boolean {
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);
  const completed = tasks.filter(t => {
    if (!t.completedAt) return false;
    const completedDate = new Date(t.completedAt);
    return isWithinInterval(completedDate, { start: dayStart, end: dayEnd });
  }).length;
  return completed >= dailyGoal;
}

function calculateStreak(tasks: Task[], dailyGoal: number): number {
  let streak = 0;
  let currentDate = new Date();

  // Check if today's goal is met
  if (hasCompletedGoalOnDate(tasks, currentDate, dailyGoal)) {
    streak = 1;
    currentDate = subDays(currentDate, 1);
  } else {
    // Check yesterday (streak continues if missed today but hit yesterday)
    currentDate = subDays(currentDate, 1);
    if (!hasCompletedGoalOnDate(tasks, currentDate, dailyGoal)) {
      return 0;
    }
    streak = 1;
    currentDate = subDays(currentDate, 1);
  }

  // Count consecutive days
  while (hasCompletedGoalOnDate(tasks, currentDate, dailyGoal)) {
    streak++;
    currentDate = subDays(currentDate, 1);
  }

  return streak;
}

export function useAnalytics(filter: TimeFilter): AnalyticsData {
  const { tasks } = useTaskStore();
  const { dailyGoal, updateBestStreak } = useSettingsStore();

  return useMemo(() => {
    const { start, end } = getDateRange(filter);
    const completedTasks = getCompletedInRange(tasks, start, end);

    // Tasks completed count
    const tasksCompleted = completedTasks.length;

    // Completion rate (completed / total created in range)
    const allTasksInRange = tasks.filter(t => {
      const createdDate = new Date(t.createdAt);
      return isWithinInterval(createdDate, { start, end });
    });
    const completionRate = allTasksInRange.length > 0
      ? Math.round((completedTasks.length / allTasksInRange.length) * 100)
      : 0;

    // Current streak
    const currentStreak = calculateStreak(tasks, dailyGoal);
    updateBestStreak(currentStreak);

    // Category breakdown
    const categoryCounts: Record<string, number> = {};
    const categories: Category[] = ['work', 'personal', 'team', 'self-improvement'];
    categories.forEach(cat => { categoryCounts[cat] = 0; });

    completedTasks.forEach(t => {
      categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
    });

    const totalCompleted = completedTasks.length || 1; // Avoid division by zero
    const categoryBreakdown: CategoryStats[] = categories.map(cat => ({
      category: categoryLabels[cat],
      count: categoryCounts[cat],
      percentage: Math.round((categoryCounts[cat] / totalCompleted) * 100),
      color: categoryColors[cat],
    }));

    // Weekly activity (last 7 days for week, or aggregate for month/year)
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

    const weeklyActivity: DayActivity[] = weekDays.map(day => {
      const dayStart = startOfDay(day);
      const dayEnd = endOfDay(day);
      const count = tasks.filter(t => {
        if (!t.completedAt) return false;
        const completedDate = new Date(t.completedAt);
        return isWithinInterval(completedDate, { start: dayStart, end: dayEnd });
      }).length;

      return {
        day: format(day, 'EEE'),
        date: day.toISOString(),
        count,
      };
    });

    return {
      tasksCompleted,
      completionRate,
      currentStreak,
      categoryBreakdown,
      weeklyActivity,
    };
  }, [tasks, filter, dailyGoal, updateBestStreak]);
}
```

**PATTERN**: Custom hook with memoization
**IMPORTS**: date-fns for date calculations
**VALIDATE**: Hook compiles without errors

---

### Task 7: CREATE src/features/analytics/components/StatsCard.tsx

**IMPLEMENT**: Metric display component

```typescript
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/shared/utils';

interface StatsCardProps {
  icon?: LucideIcon;
  value: string | number;
  label: string;
  suffix?: string;
  className?: string;
  accentColor?: string;
}

export function StatsCard({
  icon: Icon,
  value,
  label,
  suffix,
  className,
  accentColor = 'text-accent-primary'
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'bg-background-secondary rounded-xl p-4 text-center',
        className
      )}
    >
      {Icon && (
        <div className="flex justify-center mb-2">
          <Icon className={cn('w-6 h-6', accentColor)} />
        </div>
      )}
      <div className="flex items-baseline justify-center gap-1">
        <span className={cn('text-3xl font-bold', accentColor)}>
          {value}
        </span>
        {suffix && (
          <span className="text-text-secondary text-sm">{suffix}</span>
        )}
      </div>
      <p className="text-text-secondary text-sm mt-1">{label}</p>
    </motion.div>
  );
}
```

**PATTERN**: Simple presentational component
**VALIDATE**: Component renders correctly

---

### Task 8: CREATE src/features/analytics/components/ActivityChart.tsx

**IMPLEMENT**: Weekly bar chart using recharts

```typescript
'use client';

import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/shared/components/ui/chart';
import { DayActivity } from '@/shared/types';

interface ActivityChartProps {
  data: DayActivity[];
}

const chartConfig = {
  count: {
    label: 'Tasks',
    color: 'var(--color-accent-primary)',
  },
} satisfies ChartConfig;

export function ActivityChart({ data }: ActivityChartProps) {
  return (
    <div className="bg-background-secondary rounded-xl p-4">
      <h2 className="text-lg font-semibold text-text-primary mb-4">Activity</h2>
      <ChartContainer config={chartConfig} className="h-[180px] w-full">
        <BarChart data={data} accessibilityLayer>
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
          />
          <YAxis hide />
          <ChartTooltip
            content={<ChartTooltipContent />}
            cursor={{ fill: 'var(--color-background-tertiary)' }}
          />
          <Bar
            dataKey="count"
            fill="var(--color-accent-primary)"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
```

**PATTERN**: shadcn chart with ChartContainer
**IMPORTS**: recharts components
**VALIDATE**: Chart renders with mock data

---

### Task 9: CREATE src/features/analytics/components/CategoryBreakdown.tsx

**IMPLEMENT**: Category progress bars

```typescript
import { motion } from 'framer-motion';
import { CategoryStats } from '@/shared/types';

interface CategoryBreakdownProps {
  data: CategoryStats[];
}

export function CategoryBreakdown({ data }: CategoryBreakdownProps) {
  return (
    <div className="bg-background-secondary rounded-xl p-4">
      <h2 className="text-lg font-semibold text-text-primary mb-4">
        Category Breakdown
      </h2>
      <div className="space-y-4">
        {data.map((cat, index) => (
          <div key={cat.category} className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: cat.color }}
            />
            <span className="flex-1 text-text-primary text-sm">
              {cat.category}
            </span>
            <div className="w-24 h-2 bg-background-tertiary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${cat.percentage}%` }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="h-full rounded-full"
                style={{ backgroundColor: cat.color }}
              />
            </div>
            <span className="text-sm text-text-secondary w-10 text-right">
              {cat.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**PATTERN**: Animated progress bars with Framer Motion
**VALIDATE**: Progress bars animate on mount

---

### Task 10: UPDATE src/features/analytics/AnalyticsScreen.tsx

**IMPLEMENT**: Replace placeholder with real data

```typescript
import { useState } from 'react';
import { Flame, CheckCircle2, TrendingUp } from 'lucide-react';
import { PageContainer } from '@/shared/components/PageContainer';
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { TimeFilter } from '@/shared/types';
import { useAnalytics } from './hooks/useAnalytics';
import { StatsCard } from './components/StatsCard';
import { ActivityChart } from './components/ActivityChart';
import { CategoryBreakdown } from './components/CategoryBreakdown';

export function AnalyticsScreen() {
  const [filter, setFilter] = useState<TimeFilter>('week');
  const analytics = useAnalytics(filter);

  return (
    <PageContainer>
      <div className="pt-6 space-y-6" data-testid="analytics-screen">
        <h1 className="text-2xl font-bold text-text-primary">Your Progress</h1>

        {/* Time Filter Tabs */}
        <Tabs
          value={filter}
          onValueChange={(v) => setFilter(v as TimeFilter)}
        >
          <TabsList className="grid w-full grid-cols-3 bg-background-secondary">
            <TabsTrigger value="week" data-testid="filter-week">Week</TabsTrigger>
            <TabsTrigger value="month" data-testid="filter-month">Month</TabsTrigger>
            <TabsTrigger value="year" data-testid="filter-year">Year</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Main Stats Card */}
        <div className="bg-background-secondary rounded-2xl p-6">
          <div className="text-center">
            <span className="text-5xl font-bold text-accent-primary">
              {analytics.tasksCompleted}
            </span>
            <p className="text-text-secondary mt-2">Tasks Completed</p>
          </div>
          <div className="flex justify-center gap-8 mt-4">
            <div className="flex items-center gap-2 text-center">
              <Flame className="w-5 h-5 text-accent-warning" />
              <span className="text-lg font-semibold text-text-primary">
                {analytics.currentStreak} day streak
              </span>
            </div>
            <div className="flex items-center gap-2 text-center">
              <TrendingUp className="w-5 h-5 text-accent-success" />
              <span className="text-lg font-semibold text-text-primary">
                {analytics.completionRate}%
              </span>
              <span className="text-text-secondary">rate</span>
            </div>
          </div>
        </div>

        {/* Activity Chart */}
        <ActivityChart data={analytics.weeklyActivity} />

        {/* Category Breakdown */}
        <CategoryBreakdown data={analytics.categoryBreakdown} />
      </div>
    </PageContainer>
  );
}
```

**PATTERN**: Composed screen with hooks
**VALIDATE**: Analytics shows real data from tasks

---

### Task 11: CREATE src/features/profile/components/SettingItem.tsx

**IMPLEMENT**: Reusable setting row component

```typescript
import { LucideIcon, ChevronRight } from 'lucide-react';
import { Switch } from '@/shared/components/ui/switch';
import { cn } from '@/shared/utils';

interface SettingItemProps {
  icon: LucideIcon;
  label: string;
  value?: string;
  hasToggle?: boolean;
  toggleValue?: boolean;
  onToggle?: () => void;
  onClick?: () => void;
  testId?: string;
  isFirst?: boolean;
}

export function SettingItem({
  icon: Icon,
  label,
  value,
  hasToggle,
  toggleValue,
  onToggle,
  onClick,
  testId,
  isFirst = false,
}: SettingItemProps) {
  const handleClick = () => {
    if (hasToggle && onToggle) {
      onToggle();
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'w-full flex items-center justify-between p-4',
        'hover:bg-background-tertiary transition-colors',
        !isFirst && 'border-t border-background-tertiary'
      )}
      data-testid={testId}
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-text-secondary" />
        <span className="text-text-primary">{label}</span>
      </div>

      {hasToggle ? (
        <Switch
          checked={toggleValue}
          onCheckedChange={onToggle}
          onClick={(e) => e.stopPropagation()}
        />
      ) : value ? (
        <span className="text-text-secondary">{value}</span>
      ) : (
        <ChevronRight className="w-5 h-5 text-text-muted" />
      )}
    </button>
  );
}
```

**PATTERN**: Flexible setting row
**VALIDATE**: Toggle and click work correctly

---

### Task 12: CREATE src/features/profile/components/DailyGoalPicker.tsx

**IMPLEMENT**: Goal selection with slider

```typescript
import { useState } from 'react';
import { Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Slider } from '@/shared/components/ui/slider';
import { Button } from '@/shared/components/ui/button';
import { useSettingsStore } from '@/shared/store';

interface DailyGoalPickerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DailyGoalPicker({ isOpen, onClose }: DailyGoalPickerProps) {
  const { dailyGoal, setDailyGoal } = useSettingsStore();
  const [tempGoal, setTempGoal] = useState(dailyGoal);

  const handleSave = () => {
    setDailyGoal(tempGoal);
    onClose();
  };

  const goalOptions = [5, 10, 15, 20, 25];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed inset-x-4 bottom-24 z-50 bg-background-secondary rounded-2xl p-6 max-w-md mx-auto"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-accent-primary/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-accent-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-primary">Daily Goal</h3>
                <p className="text-sm text-text-secondary">Tasks to complete each day</p>
              </div>
            </div>

            {/* Goal Display */}
            <div className="text-center mb-6">
              <span className="text-5xl font-bold text-accent-primary">{tempGoal}</span>
              <span className="text-xl text-text-secondary ml-2">tasks</span>
            </div>

            {/* Quick Select Buttons */}
            <div className="flex justify-center gap-2 mb-6">
              {goalOptions.map((goal) => (
                <button
                  key={goal}
                  onClick={() => setTempGoal(goal)}
                  className={cn(
                    'w-12 h-12 rounded-full font-medium transition-colors',
                    tempGoal === goal
                      ? 'bg-accent-primary text-white'
                      : 'bg-background-tertiary text-text-secondary hover:text-text-primary'
                  )}
                  data-testid={`goal-option-${goal}`}
                >
                  {goal}
                </button>
              ))}
            </div>

            {/* Slider */}
            <Slider
              value={[tempGoal]}
              onValueChange={(v) => setTempGoal(v[0])}
              min={1}
              max={30}
              step={1}
              className="mb-6"
            />

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-accent-primary hover:bg-accent-primary/90"
                onClick={handleSave}
              >
                Save
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Import cn
import { cn } from '@/shared/utils';
```

**PATTERN**: Modal with slider
**GOTCHA**: Import cn utility
**VALIDATE**: Goal picker opens, slider works, saves correctly

---

### Task 13: CREATE src/features/profile/components/SignOutDialog.tsx

**IMPLEMENT**: Confirmation dialog for sign out

```typescript
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';

interface SignOutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function SignOutDialog({ isOpen, onClose, onConfirm }: SignOutDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-background-secondary border-background-tertiary">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-text-primary">Sign out?</AlertDialogTitle>
          <AlertDialogDescription className="text-text-secondary">
            You'll need to sign in again to access your tasks. Your data will be saved.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            className="bg-background-tertiary text-text-primary hover:bg-background-tertiary/80"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-accent-error text-white hover:bg-accent-error/90"
            data-testid="confirm-sign-out"
          >
            Sign out
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

**PATTERN**: AlertDialog for confirmations
**VALIDATE**: Dialog opens and closes correctly

---

### Task 14: UPDATE src/features/profile/ProfileScreen.tsx

**IMPLEMENT**: Connect to stores and make settings functional

```typescript
import { useState } from 'react';
import { PageContainer } from '@/shared/components/PageContainer';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { useAuth } from '@/app/providers';
import { useSettingsStore, useTaskStore } from '@/shared/store';
import { useAnalytics } from '@/features/analytics/hooks/useAnalytics';
import { Bell, Target, FolderOpen, RefreshCw, LogOut } from 'lucide-react';
import { SettingItem } from './components/SettingItem';
import { DailyGoalPicker } from './components/DailyGoalPicker';
import { SignOutDialog } from './components/SignOutDialog';

export function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { dailyGoal, notificationsEnabled, toggleNotifications, bestStreak } = useSettingsStore();
  const { tasks } = useTaskStore();
  const analytics = useAnalytics('year');

  const [isGoalPickerOpen, setIsGoalPickerOpen] = useState(false);
  const [isSignOutOpen, setIsSignOutOpen] = useState(false);

  const displayName = user?.email?.split('@')[0] || 'User';
  const initials = displayName.slice(0, 2).toUpperCase();

  // Calculate total completed tasks (all time)
  const totalCompleted = tasks.filter(t => t.completed).length;

  const handleSignOut = async () => {
    setIsSignOutOpen(false);
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

        {/* Stats Row - Real Data */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="text-center" data-testid="stat-total-tasks">
            <span className="text-2xl font-bold text-text-primary">{totalCompleted}</span>
            <p className="text-xs text-text-secondary mt-1">Total Tasks</p>
          </div>
          <div className="text-center" data-testid="stat-best-streak">
            <span className="text-2xl font-bold text-text-primary">{bestStreak}</span>
            <p className="text-xs text-text-secondary mt-1">Best Streak</p>
          </div>
          <div className="text-center" data-testid="stat-completion-rate">
            <span className="text-2xl font-bold text-text-primary">{analytics.completionRate}%</span>
            <p className="text-xs text-text-secondary mt-1">Rate</p>
          </div>
        </div>

        {/* Settings List */}
        <div className="bg-background-secondary rounded-xl overflow-hidden">
          <SettingItem
            icon={Bell}
            label="Notifications"
            hasToggle
            toggleValue={notificationsEnabled}
            onToggle={toggleNotifications}
            testId="notifications-toggle"
            isFirst
          />
          <SettingItem
            icon={Target}
            label="Daily Goal"
            value={`${dailyGoal} tasks`}
            onClick={() => setIsGoalPickerOpen(true)}
            testId="setting-daily-goal"
          />
          <SettingItem
            icon={FolderOpen}
            label="Categories"
            testId="setting-categories"
          />
          <SettingItem
            icon={RefreshCw}
            label="Sync & Backup"
            testId="setting-sync"
          />
        </div>

        {/* Upgrade Banner */}
        <button className="w-full mt-6 p-4 bg-accent-warning/20 rounded-xl flex items-center justify-center gap-2 text-accent-warning font-medium">
          Upgrade to Pro
        </button>

        {/* Sign Out */}
        <button
          onClick={() => setIsSignOutOpen(true)}
          className="w-full mt-4 p-4 text-accent-error flex items-center justify-center gap-2"
          data-testid="sign-out-button"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>

      {/* Modals */}
      <DailyGoalPicker
        isOpen={isGoalPickerOpen}
        onClose={() => setIsGoalPickerOpen(false)}
      />
      <SignOutDialog
        isOpen={isSignOutOpen}
        onClose={() => setIsSignOutOpen(false)}
        onConfirm={handleSignOut}
      />
    </PageContainer>
  );
}
```

**PATTERN**: Screen with modals and store integration
**VALIDATE**: Settings update and persist on refresh

---

### Task 15: UPDATE src/features/home/HomeScreen.tsx

**IMPLEMENT**: Use dailyGoal from settingsStore

```typescript
import { PageContainer } from '@/shared/components/PageContainer';
import { useAuth } from '@/app/providers';
import { useSettingsStore } from '@/shared/store';
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
  const { dailyGoal } = useSettingsStore();
  const greeting = getGreeting();
  const displayName = user?.email?.split('@')[0] || user?.user_metadata?.name || 'User';

  return (
    <PageContainer>
      <div className="pt-6 space-y-6" data-testid="home-screen">
        <h1 className="text-2xl font-bold text-text-primary">
          {greeting}, {displayName}
        </h1>

        <DailyGoals dailyGoal={dailyGoal} />

        <TaskList />
      </div>
    </PageContainer>
  );
}
```

**PATTERN**: Read from settings store
**VALIDATE**: Home shows updated daily goal after changing in profile

---

### Task 16: CREATE public/manifest.json

**IMPLEMENT**: PWA manifest for installability

```json
{
  "name": "TaskFlow",
  "short_name": "TaskFlow",
  "description": "Personal task management and productivity app",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0D1117",
  "theme_color": "#0A84FF",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

**VALIDATE**: manifest.json accessible at /manifest.json

---

### Task 17: CREATE public/icons (placeholder)

**IMPLEMENT**: Create icon placeholders (can be replaced later)

Create the folder structure:
```
public/
  icons/
    icon-192.png (192x192 placeholder)
    icon-512.png (512x512 placeholder)
```

For now, create simple placeholder icons or use an online generator like:
- https://realfavicongenerator.net/
- Create simple blue squares with "TF" text

**VALIDATE**: Icons exist in public/icons/

---

### Task 18: UPDATE index.html

**IMPLEMENT**: Add manifest link and meta tags

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />

    <!-- PWA Meta Tags -->
    <meta name="theme-color" content="#0A84FF" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="TaskFlow" />

    <!-- Manifest -->
    <link rel="manifest" href="/manifest.json" />

    <!-- Apple Touch Icon -->
    <link rel="apple-touch-icon" href="/icons/icon-192.png" />

    <title>TaskFlow</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**VALIDATE**: Manifest loads in browser DevTools > Application

---

### Task 19: CREATE src/features/analytics/index.ts

**IMPLEMENT**: Feature exports

```typescript
export { AnalyticsScreen } from './AnalyticsScreen';
export { useAnalytics } from './hooks/useAnalytics';
```

**VALIDATE**: Exports work correctly

---

### Task 20: RUN final validation

**IMPLEMENT**: Run all validation commands

```bash
npx tsc --noEmit
npm run build
npm run dev
```

**VALIDATE**:
- No TypeScript errors
- Build completes successfully
- App starts on port 5173
- Analytics shows real data from tasks
- Time filter (Week/Month/Year) changes displayed data
- Streak calculation works
- Category breakdown shows correct percentages
- Profile stats show real numbers
- Daily goal picker opens and saves
- Notifications toggle persists state
- Sign out shows confirmation dialog
- Home screen uses daily goal from settings
- Manifest loads (check DevTools > Application > Manifest)

---

## TESTING STRATEGY

### Unit Tests

- `useAnalytics.test.ts` - Calculation accuracy for all metrics
- `settingsStore.test.ts` - Persistence and state updates
- `streak calculation` - Edge cases (missed days, today incomplete)

### Integration Tests (Playwright - from PRD)

Reference PRD tests TEST 4.1 through TEST 4.19:
- Analytics screen layout
- Tasks completed accuracy
- Streak tracking
- Completion rate calculation
- Category breakdown chart
- Time filter
- Profile screen layout
- Profile stats accuracy
- Daily goal setting
- Notifications toggle
- Sign out flow
- PWA installability
- Offline support

### Manual Testing Checklist

- [ ] Analytics loads without errors
- [ ] Tasks Completed shows real count
- [ ] Streak shows correct consecutive days
- [ ] Completion rate is calculated correctly
- [ ] Activity chart shows weekly data
- [ ] Category breakdown matches completed tasks
- [ ] Time filter changes data range
- [ ] Profile shows real stats
- [ ] Daily goal picker opens
- [ ] Slider changes goal value
- [ ] Saving goal updates home screen
- [ ] Notifications toggle persists
- [ ] Sign out shows confirmation
- [ ] Confirming sign out redirects to login
- [ ] PWA manifest loads
- [ ] App can be installed (check browser prompt)

---

## VALIDATION COMMANDS

### Level 1: Type Checking

```bash
npx tsc --noEmit
```

**Expected**: No TypeScript errors

### Level 2: Build

```bash
npm run build
```

**Expected**: Build completes, dist/ folder created

### Level 3: Development Server

```bash
npm run dev
```

**Expected**: Server starts on port 5173, no console errors

### Level 4: Manual Validation

1. Open http://localhost:5173/analytics
2. Verify real numbers (not hardcoded 47, 12, 85%)
3. Create and complete a task
4. Verify analytics update
5. Open http://localhost:5173/profile
6. Click Daily Goal
7. Change goal to 15
8. Go to Home - verify shows "/15 tasks"
9. Toggle Notifications
10. Refresh page - verify setting persisted
11. Click Sign Out
12. Verify confirmation dialog
13. Open DevTools > Application > Manifest
14. Verify manifest loads

---

## ACCEPTANCE CRITERIA

- [ ] Analytics shows real tasks completed count
- [ ] Streak calculates consecutive days meeting daily goal
- [ ] Completion rate = completed / created * 100
- [ ] Category breakdown percentages sum to 100%
- [ ] Activity chart shows last 7 days data
- [ ] Time filter (Week/Month/Year) affects all metrics
- [ ] Profile stats match analytics data
- [ ] Daily goal picker saves to store
- [ ] Daily goal persists across sessions
- [ ] Home screen uses dailyGoal from settings
- [ ] Notifications toggle persists
- [ ] Sign out shows confirmation dialog
- [ ] PWA manifest loads correctly
- [ ] App icons configured
- [ ] All data-testid attributes added
- [ ] No TypeScript errors
- [ ] No console errors

---

## COMPLETION CHECKLIST

- [ ] All 20 tasks completed in order
- [ ] Each task validation passed
- [ ] Development server runs without errors
- [ ] TypeScript compiles without errors
- [ ] Build completes successfully
- [ ] Analytics shows real data
- [ ] Settings persist correctly
- [ ] PWA manifest configured
- [ ] All acceptance criteria met

---

## NOTES

### Design Decisions

1. **No External Charts Library Initially**: Using simple CSS bars for category breakdown, recharts via shadcn for activity chart. This keeps bundle size small while providing good visuals.

2. **Streak Logic**: Streak continues if user missed today but completed yesterday. This prevents "broken streak at 11 PM" frustration.

3. **Best Streak Tracking**: Stored in settingsStore with persistence. Updates automatically when current streak exceeds best.

4. **Simplified PWA**: Using basic manifest.json without Vite PWA plugin for simplicity. Full offline support relies on Zustand localStorage persistence. Service worker can be added later.

5. **No Chart for Month/Year**: Weekly activity chart always shows last 7 days regardless of filter. Filter affects the stats counts only. Full date-range charts would be post-MVP.

### Potential Risks

1. **Recharts Bundle Size**: recharts adds ~80KB gzipped. Monitor total bundle size.

2. **Date Calculation Edge Cases**: Timezone issues with streak calculation. Test across day boundaries.

3. **Slider Accessibility**: Ensure slider works with keyboard navigation.

4. **PWA on iOS**: iOS has PWA limitations. Test Add to Home Screen flow.

### Future Enhancements (Post-MVP)

1. Full Vite PWA plugin with service worker
2. Push notifications
3. Export data to CSV
4. Custom goal per category
5. Monthly/yearly charts with date ranges
6. Heatmap calendar visualization
7. Achievement badges
8. Data sync with Supabase
