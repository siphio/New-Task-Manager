# Feature: Phase 3 - Calendar

The following plan should be complete, but it's important that you validate documentation and codebase patterns before you start implementing.

Pay special attention to naming of existing utils, types, and models. Import from the right files etc.

## Feature Description

Phase 3 implements the hybrid calendar system for TaskFlow - a week view calendar that displays both scheduled tasks (positioned in a time grid) and unscheduled tasks (in a "Due Today" section). Users can drag tasks vertically to change times, horizontally to change days, and drag unscheduled tasks onto the time grid to schedule them. The calendar supports week navigation and shows task count badges per day.

## User Story

As a productivity-minded user
I want to view and schedule my tasks in a visual calendar
So that I can manage my time effectively and see my day at a glance

## Problem Statement

Phase 2 created task management functionality but tasks can only be viewed in a simple list. Users cannot visualize their schedule, see when they have free time, or easily schedule tasks to specific time slots. The calendar screen is currently a placeholder with static data.

## Solution Statement

Implement a hybrid calendar system with:
- Week view with day selection and navigation
- Time grid (8AM-10PM with 30-minute slots)
- Positioned scheduled task blocks (color-coded by category)
- Unscheduled tasks section ("Due Today")
- Drag-and-drop to reschedule tasks (time and day changes)
- Drag unscheduled tasks to time grid to schedule them
- Overlap handling for conflicting tasks
- Current time indicator line

## Feature Metadata

**Feature Type**: New Capability (Core Feature Implementation)
**Estimated Complexity**: High
**Primary Systems Affected**:
- `src/features/calendar/` - Complete rewrite
- `src/shared/store/` - Calendar state (selected date, week)
- `src/shared/types/` - Calendar-specific types
**Dependencies**:
- Existing: Framer Motion (drag gestures), date-fns, Zustand
- New shadcn: scroll-area, tooltip

---

## CONTEXT REFERENCES

### Relevant Codebase Files - IMPORTANT: READ BEFORE IMPLEMENTING!

**Store Patterns:**
- `src/shared/store/taskStore.ts` (lines 1-162) - Why: Task state + updateTask for scheduledTime
- `src/shared/store/uiStore.ts` (lines 1-35) - Why: UI state pattern to follow for calendar state

**Component Patterns:**
- `src/shared/components/PageContainer.tsx` (lines 1-36) - Why: Page wrapper with animations
- `src/features/tasks/components/TaskCard.tsx` (lines 1-107) - Why: Task display + category colors pattern
- `src/features/home/components/TaskList.tsx` (lines 1-42) - Why: AnimatePresence list pattern

**Animation Patterns:**
- `src/styles/animations.ts` (lines 1-73) - Why: Existing animation variants + springConfig

**Type Definitions:**
- `src/shared/types/task.ts` (lines 1-46) - Why: Task interface with scheduledTime field

**Theme & Styling:**
- `src/styles/theme.ts` (lines 1-39) - Why: Category colors, spacing constants
- `src/index.css` (lines 1-85) - Why: CSS variables, touch targets, safe areas

**Current Calendar (to replace):**
- `src/features/calendar/CalendarScreen.tsx` (lines 1-63) - Why: Placeholder to completely rewrite

**UI Mockups (Visual Reference):**
- `ui-images/calander-page.png` - Calendar design with week header, time grid, task blocks

**PRD Reference:**
- `.agents/PRD.md` (lines 735-937) - Phase 3 deliverables and Playwright tests

### New Files to Create

**Types:**
- `src/shared/types/calendar.ts` - Calendar-specific types (TimeSlot, DayColumn, etc.)

**Store:**
- `src/shared/store/calendarStore.ts` - Selected date, week navigation state

**Feature: Calendar:**
- `src/features/calendar/CalendarScreen.tsx` - Main screen (rewrite)
- `src/features/calendar/components/WeekHeader.tsx` - Month/year + navigation
- `src/features/calendar/components/DayColumns.tsx` - 7-day week strip
- `src/features/calendar/components/TimeGrid.tsx` - Scrollable time slots
- `src/features/calendar/components/TimeSlot.tsx` - Individual 30-min slot
- `src/features/calendar/components/ScheduledTaskBlock.tsx` - Draggable task in grid
- `src/features/calendar/components/UnscheduledSection.tsx` - "Due Today" section
- `src/features/calendar/components/UnscheduledTaskItem.tsx` - Draggable task item
- `src/features/calendar/components/CurrentTimeIndicator.tsx` - Red line for current time
- `src/features/calendar/components/EmptyDayState.tsx` - Empty state UI
- `src/features/calendar/hooks/useDragToSchedule.ts` - Drag logic hook
- `src/features/calendar/hooks/useWeekDates.ts` - Week date calculations
- `src/features/calendar/utils/timeUtils.ts` - Time grid calculations
- `src/features/calendar/index.ts` - Feature exports

**UI Components (shadcn):**
- `src/shared/components/ui/scroll-area.tsx` - shadcn scroll-area
- `src/shared/components/ui/tooltip.tsx` - shadcn tooltip

### Relevant Documentation

- [Framer Motion Drag](https://motion.dev/docs/react-gestures)
  - Drag gesture: `drag`, `dragConstraints`, `onDragEnd`
  - Why: Core drag-and-drop implementation

- [date-fns Week Functions](https://date-fns.org/docs/startOfWeek)
  - `startOfWeek`, `endOfWeek`, `eachDayOfInterval`, `addWeeks`
  - Why: Week navigation and date calculations

- [shadcn Scroll Area](https://ui.shadcn.com/docs/components/scroll-area)
  - Scrollable container with custom scrollbar
  - Why: Time grid needs vertical scrolling

- [shadcn Tooltip](https://ui.shadcn.com/docs/components/tooltip)
  - Hover tooltips for task previews
  - Why: Show task details on hover (desktop)

### Patterns to Follow

**Naming Conventions:**
- Components: PascalCase (`WeekHeader.tsx`, `TimeGrid.tsx`)
- Hooks: camelCase with use prefix (`useDragToSchedule.ts`)
- Utils: camelCase (`timeUtils.ts`)
- Types: PascalCase (`TimeSlot`, `DayColumn`)
- Test IDs: kebab-case with prefix (`day-column-wed`, `time-slot-09:00`)

**Framer Motion Drag Pattern:**
```typescript
<motion.div
  drag="y"                    // or "x" or true for both
  dragConstraints={constraintsRef}
  dragElastic={0.1}
  onDragEnd={(event, info) => {
    // info.point.x, info.point.y for drop position
    // Calculate new time/day from position
  }}
  whileDrag={{ scale: 1.05, zIndex: 50 }}
>
  {/* content */}
</motion.div>
```

**Time Grid Calculation Pattern:**
```typescript
const HOUR_HEIGHT = 60;  // pixels per hour
const SLOT_HEIGHT = 30;  // pixels per 30-min slot
const START_HOUR = 8;    // 8AM
const END_HOUR = 22;     // 10PM

const getTopPosition = (time: Date): number => {
  const hours = time.getHours() - START_HOUR;
  const minutes = time.getMinutes();
  return (hours * HOUR_HEIGHT) + (minutes / 60 * HOUR_HEIGHT);
};

const getTaskHeight = (start: Date, end: Date): number => {
  const durationMs = end.getTime() - start.getTime();
  const durationHours = durationMs / (1000 * 60 * 60);
  return Math.max(durationHours * HOUR_HEIGHT, SLOT_HEIGHT);
};
```

**Store Pattern (from uiStore.ts):**
```typescript
import { create } from 'zustand';

interface CalendarState {
  selectedDate: Date;
  weekStart: Date;
  setSelectedDate: (date: Date) => void;
  goToNextWeek: () => void;
  goToPrevWeek: () => void;
  goToToday: () => void;
}

export const useCalendarStore = create<CalendarState>((set, get) => ({
  selectedDate: new Date(),
  weekStart: startOfWeek(new Date(), { weekStartsOn: 1 }),
  // ... actions
}));
```

**Category Color Pattern (from TaskCard.tsx):**
```typescript
import { getCategoryColor } from '@/shared/utils';

const categoryColor = getCategoryColor(task.category);
style={{ backgroundColor: categoryColor }}
```

---

## IMPLEMENTATION PLAN

### Phase 3.1: Types & Store Foundation

Set up TypeScript types and calendar store.

**Tasks:**
- Define calendar-specific types
- Create calendarStore with date selection and week navigation
- Update store barrel exports

### Phase 3.2: Install shadcn Components

Install required UI components.

**Tasks:**
- Install scroll-area and tooltip from shadcn

### Phase 3.3: Utility Functions

Create time grid calculation utilities.

**Tasks:**
- Time-to-position calculations
- Position-to-time calculations
- Week date generation

### Phase 3.4: Week Header & Navigation

Build week header with month/year display and navigation.

**Tasks:**
- WeekHeader component with month/year
- Navigation arrows (prev/next week)
- Today button

### Phase 3.5: Day Columns

Build the 7-day week strip.

**Tasks:**
- DayColumns component
- Day selection state
- Task count badges per day
- Current day highlight

### Phase 3.6: Time Grid

Build the scrollable time grid.

**Tasks:**
- TimeGrid container with scroll-area
- TimeSlot components (30-min intervals)
- Time labels (8AM - 10PM)
- Current time indicator

### Phase 3.7: Scheduled Task Blocks

Build draggable task blocks for the time grid.

**Tasks:**
- ScheduledTaskBlock component
- Position calculation based on scheduledTime
- Drag constraints and behavior
- Category color coding

### Phase 3.8: Unscheduled Section

Build the "Due Today" section.

**Tasks:**
- UnscheduledSection component
- UnscheduledTaskItem (draggable)
- Task count display
- Empty state

### Phase 3.9: Drag-and-Drop Logic

Implement all drag interactions.

**Tasks:**
- Vertical drag (time change)
- Horizontal drag (day change)
- Drag from unscheduled to grid (schedule task)
- Drop zone detection
- Task update on drop

### Phase 3.10: Overlap Handling

Handle overlapping tasks.

**Tasks:**
- Detect overlaps
- Side-by-side display (50% width each)
- Conflict warning indicator

### Phase 3.11: Integration & Polish

Wire everything together.

**Tasks:**
- CalendarScreen composition
- Empty day state
- Loading states
- Touch optimization

---

## STEP-BY-STEP TASKS

IMPORTANT: Execute every task in order, top to bottom. Each task is atomic and independently testable.

---

### Task 1: CREATE src/shared/types/calendar.ts

**IMPLEMENT**: Define calendar-specific types

```typescript
export interface TimeSlot {
  hour: number;
  minute: number;  // 0 or 30
  label: string;   // "9:00 AM"
}

export interface DayColumn {
  date: Date;
  dayName: string;    // "Mon"
  dayNumber: number;  // 20
  isToday: boolean;
  isSelected: boolean;
  taskCount: number;
}

export interface ScheduledBlock {
  taskId: string;
  top: number;      // pixels from grid top
  height: number;   // pixels
  left: number;     // percentage (0, 50 for overlap)
  width: number;    // percentage (100, 50 for overlap)
}

export const CALENDAR_CONFIG = {
  START_HOUR: 8,
  END_HOUR: 22,
  HOUR_HEIGHT: 60,
  SLOT_HEIGHT: 30,
  SLOT_MINUTES: 30,
} as const;
```

**PATTERN**: Types in dedicated file
**VALIDATE**: `npx tsc --noEmit` passes

---

### Task 2: UPDATE src/shared/types/index.ts

**IMPLEMENT**: Add calendar type exports

```typescript
export * from './task';
export * from './calendar';
```

**VALIDATE**: Can import from `@/shared/types`

---

### Task 3: CREATE src/shared/store/calendarStore.ts

**IMPLEMENT**: Calendar state management

```typescript
import { create } from 'zustand';
import { startOfWeek, addWeeks, isSameDay } from 'date-fns';

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
```

**PATTERN**: MIRROR `uiStore.ts` simple store pattern
**VALIDATE**: Store exports correctly

---

### Task 4: UPDATE src/shared/store/index.ts

**IMPLEMENT**: Add calendarStore export

```typescript
export { useAuthStore } from './authStore';
export { useUIStore } from './uiStore';
export { useTaskStore } from './taskStore';
export { useCalendarStore } from './calendarStore';
```

**VALIDATE**: Can import `useCalendarStore` from `@/shared/store`

---

### Task 5: RUN shadcn component installation

**IMPLEMENT**: Install scroll-area and tooltip

```bash
npx shadcn@latest add scroll-area tooltip
```

**VALIDATE**: `ls src/shared/components/ui` shows scroll-area.tsx and tooltip.tsx

---

### Task 6: CREATE src/features/calendar/utils/timeUtils.ts

**IMPLEMENT**: Time grid calculation utilities

```typescript
import { CALENDAR_CONFIG } from '@/shared/types';
import { format, setHours, setMinutes, isSameDay, parseISO } from 'date-fns';

const { START_HOUR, END_HOUR, HOUR_HEIGHT, SLOT_HEIGHT, SLOT_MINUTES } = CALENDAR_CONFIG;

export function generateTimeSlots() {
  const slots = [];
  for (let hour = START_HOUR; hour < END_HOUR; hour++) {
    slots.push({
      hour,
      minute: 0,
      label: format(setHours(setMinutes(new Date(), 0), hour), 'h a'),
    });
    slots.push({
      hour,
      minute: 30,
      label: '',
    });
  }
  return slots;
}

export function getTopPosition(time: Date | string): number {
  const date = typeof time === 'string' ? parseISO(time) : time;
  const hours = date.getHours() - START_HOUR;
  const minutes = date.getMinutes();
  return Math.max(0, (hours * HOUR_HEIGHT) + (minutes / 60 * HOUR_HEIGHT));
}

export function getTaskHeight(start: Date | string, end: Date | string): number {
  const startDate = typeof start === 'string' ? parseISO(start) : start;
  const endDate = typeof end === 'string' ? parseISO(end) : end;
  const durationMs = endDate.getTime() - startDate.getTime();
  const durationHours = durationMs / (1000 * 60 * 60);
  return Math.max(durationHours * HOUR_HEIGHT, SLOT_HEIGHT);
}

export function positionToTime(y: number, baseDate: Date): { start: Date; end: Date } {
  const totalMinutes = (y / HOUR_HEIGHT) * 60;
  const snappedMinutes = Math.round(totalMinutes / SLOT_MINUTES) * SLOT_MINUTES;
  const hours = Math.floor(snappedMinutes / 60) + START_HOUR;
  const minutes = snappedMinutes % 60;

  const start = setMinutes(setHours(baseDate, hours), minutes);
  const end = setMinutes(setHours(baseDate, hours), minutes + 30);

  return { start, end };
}

export function formatTimeRange(start: Date | string, end: Date | string): string {
  const startDate = typeof start === 'string' ? parseISO(start) : start;
  const endDate = typeof end === 'string' ? parseISO(end) : end;
  return `${format(startDate, 'h:mm a')} - ${format(endDate, 'h:mm a')}`;
}

export function getGridHeight(): number {
  return (END_HOUR - START_HOUR) * HOUR_HEIGHT;
}

export function getCurrentTimePosition(): number | null {
  const now = new Date();
  const hours = now.getHours();
  if (hours < START_HOUR || hours >= END_HOUR) return null;
  return getTopPosition(now);
}
```

**PATTERN**: Pure utility functions
**VALIDATE**: Functions export correctly, no type errors

---

### Task 7: CREATE src/features/calendar/hooks/useWeekDates.ts

**IMPLEMENT**: Week date calculations hook

```typescript
import { useMemo } from 'react';
import { eachDayOfInterval, addDays, format, isSameDay, isToday } from 'date-fns';
import { useCalendarStore, useTaskStore } from '@/shared/store';
import { DayColumn } from '@/shared/types';

export function useWeekDates(): DayColumn[] {
  const { weekStart, selectedDate } = useCalendarStore();
  const { tasks } = useTaskStore();

  return useMemo(() => {
    const weekEnd = addDays(weekStart, 6);
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return days.map((date) => {
      const dayTasks = tasks.filter((t) => {
        const taskDate = new Date(t.dueDate);
        return isSameDay(taskDate, date) && !t.completed;
      });

      return {
        date,
        dayName: format(date, 'EEE'),
        dayNumber: date.getDate(),
        isToday: isToday(date),
        isSelected: isSameDay(date, selectedDate),
        taskCount: dayTasks.length,
      };
    });
  }, [weekStart, selectedDate, tasks]);
}
```

**PATTERN**: Custom hook with memoization
**VALIDATE**: Hook exports correctly

---

### Task 8: CREATE src/features/calendar/components/WeekHeader.tsx

**IMPLEMENT**: Month/year header with navigation

```typescript
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { useCalendarStore } from '@/shared/store';
import { Button } from '@/shared/components/ui/button';

export function WeekHeader() {
  const { weekStart, goToNextWeek, goToPrevWeek, goToToday } = useCalendarStore();

  return (
    <div className="flex items-center justify-between mb-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={goToPrevWeek}
        data-testid="prev-week-button"
        aria-label="Previous week"
      >
        <ChevronLeft className="w-5 h-5" />
      </Button>

      <button
        onClick={goToToday}
        className="text-xl font-bold text-text-primary hover:text-accent-primary transition-colors"
        data-testid="week-header-title"
      >
        {format(weekStart, 'MMMM yyyy')}
      </button>

      <Button
        variant="ghost"
        size="icon"
        onClick={goToNextWeek}
        data-testid="next-week-button"
        aria-label="Next week"
      >
        <ChevronRight className="w-5 h-5" />
      </Button>
    </div>
  );
}
```

**PATTERN**: Simple stateless component using store
**VALIDATE**: Component renders, navigation works

---

### Task 9: CREATE src/features/calendar/components/DayColumns.tsx

**IMPLEMENT**: 7-day week strip with selection

```typescript
import { motion } from 'framer-motion';
import { useCalendarStore } from '@/shared/store';
import { useWeekDates } from '../hooks/useWeekDates';
import { cn } from '@/shared/utils';

export function DayColumns() {
  const { setSelectedDate } = useCalendarStore();
  const days = useWeekDates();

  return (
    <div className="grid grid-cols-7 gap-1 mb-4">
      {days.map((day) => (
        <button
          key={day.date.toISOString()}
          onClick={() => setSelectedDate(day.date)}
          className={cn(
            'relative flex flex-col items-center py-2 px-1 rounded-lg transition-colors',
            day.isSelected
              ? 'bg-accent-primary text-white'
              : day.isToday
              ? 'bg-accent-primary/20 text-accent-primary'
              : 'text-text-secondary hover:bg-background-tertiary'
          )}
          data-testid={`day-column-${day.dayName.toLowerCase()}`}
        >
          <span className="text-xs font-medium">{day.dayName}</span>
          <span className="text-lg font-semibold">{day.dayNumber}</span>

          {day.taskCount > 0 && !day.isSelected && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -bottom-1 w-5 h-5 flex items-center justify-center text-[10px] font-medium bg-accent-primary text-white rounded-full"
            >
              {day.taskCount > 9 ? '9+' : day.taskCount}
            </motion.span>
          )}
        </button>
      ))}
    </div>
  );
}
```

**PATTERN**: Grid layout with selection state
**VALIDATE**: Day selection works, badges display

---

### Task 10: CREATE src/features/calendar/components/CurrentTimeIndicator.tsx

**IMPLEMENT**: Current time line in grid

```typescript
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getCurrentTimePosition } from '../utils/timeUtils';
import { isToday } from 'date-fns';
import { useCalendarStore } from '@/shared/store';

export function CurrentTimeIndicator() {
  const { selectedDate } = useCalendarStore();
  const [position, setPosition] = useState<number | null>(null);

  useEffect(() => {
    if (!isToday(selectedDate)) {
      setPosition(null);
      return;
    }

    const updatePosition = () => {
      setPosition(getCurrentTimePosition());
    };

    updatePosition();
    const interval = setInterval(updatePosition, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [selectedDate]);

  if (position === null) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute left-0 right-0 z-20 pointer-events-none"
      style={{ top: position }}
      data-testid="current-time-indicator"
    >
      <div className="flex items-center">
        <div className="w-2 h-2 rounded-full bg-accent-error" />
        <div className="flex-1 h-0.5 bg-accent-error" />
      </div>
    </motion.div>
  );
}
```

**PATTERN**: Time-based updates with cleanup
**VALIDATE**: Line appears at current time when viewing today

---

### Task 11: CREATE src/features/calendar/components/ScheduledTaskBlock.tsx

**IMPLEMENT**: Draggable task block in time grid

```typescript
import { useRef } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Task } from '@/shared/types';
import { CALENDAR_CONFIG } from '@/shared/types';
import { getCategoryColor, cn } from '@/shared/utils';
import { useTaskStore } from '@/shared/store';
import { getTopPosition, getTaskHeight, positionToTime, formatTimeRange } from '../utils/timeUtils';

interface ScheduledTaskBlockProps {
  task: Task;
  gridRef: React.RefObject<HTMLDivElement>;
  index: number;
  overlapCount: number;
  overlapIndex: number;
}

export function ScheduledTaskBlock({
  task,
  gridRef,
  index,
  overlapCount,
  overlapIndex,
}: ScheduledTaskBlockProps) {
  const navigate = useNavigate();
  const { updateTask } = useTaskStore();
  const categoryColor = getCategoryColor(task.category);

  if (!task.scheduledTime) return null;

  const top = getTopPosition(task.scheduledTime.start);
  const height = getTaskHeight(task.scheduledTime.start, task.scheduledTime.end);
  const width = overlapCount > 1 ? `${100 / overlapCount}%` : '100%';
  const left = overlapCount > 1 ? `${(100 / overlapCount) * overlapIndex}%` : '0';

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!gridRef.current) return;

    const gridRect = gridRef.current.getBoundingClientRect();
    const newY = top + info.offset.y;
    const clampedY = Math.max(0, Math.min(newY, gridRect.height - height));

    const baseDate = new Date(task.dueDate);
    const { start, end } = positionToTime(clampedY, baseDate);

    updateTask(task.id, {
      scheduledTime: {
        start: start.toISOString(),
        end: end.toISOString(),
      },
    });
  };

  const handleClick = (e: React.MouseEvent) => {
    if (e.defaultPrevented) return;
    navigate(`/tasks/${task.id}`);
  };

  return (
    <motion.div
      drag="y"
      dragConstraints={gridRef}
      dragElastic={0}
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      whileDrag={{ scale: 1.02, zIndex: 50, boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
      className={cn(
        'absolute rounded-lg p-2 cursor-grab active:cursor-grabbing overflow-hidden',
        'border-l-4 bg-background-secondary hover:bg-background-tertiary transition-colors'
      )}
      style={{
        top,
        height: Math.max(height, CALENDAR_CONFIG.SLOT_HEIGHT),
        width,
        left,
        borderLeftColor: categoryColor,
      }}
      data-testid={`scheduled-task-${index}`}
    >
      <div className="text-sm font-medium text-text-primary truncate">
        {task.title}
      </div>
      {height >= 50 && (
        <div className="text-xs text-text-secondary mt-0.5">
          {formatTimeRange(task.scheduledTime.start, task.scheduledTime.end)}
        </div>
      )}
    </motion.div>
  );
}
```

**PATTERN**: Framer Motion drag with constraints
**VALIDATE**: Tasks drag vertically, update on drop

---

### Task 12: CREATE src/features/calendar/components/TimeSlot.tsx

**IMPLEMENT**: Individual time slot in grid

```typescript
import { TimeSlot as TimeSlotType } from '@/shared/types';
import { cn } from '@/shared/utils';

interface TimeSlotProps {
  slot: TimeSlotType;
  onDrop?: (hour: number, minute: number) => void;
}

export function TimeSlot({ slot, onDrop }: TimeSlotProps) {
  const isHourStart = slot.minute === 0;

  return (
    <div
      className={cn(
        'h-[30px] border-b border-background-tertiary/50 relative',
        isHourStart && 'border-b-background-tertiary'
      )}
      data-testid={`time-slot-${String(slot.hour).padStart(2, '0')}:${String(slot.minute).padStart(2, '0')}`}
    >
      {isHourStart && (
        <span className="absolute -top-2 -left-14 w-12 text-right text-xs text-text-muted">
          {slot.label}
        </span>
      )}
    </div>
  );
}
```

**PATTERN**: Simple presentational component
**VALIDATE**: Time labels display correctly

---

### Task 13: CREATE src/features/calendar/components/TimeGrid.tsx

**IMPLEMENT**: Scrollable time grid container

```typescript
import { useRef, useMemo } from 'react';
import { isSameDay } from 'date-fns';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { useTaskStore, useCalendarStore } from '@/shared/store';
import { TimeSlot } from './TimeSlot';
import { ScheduledTaskBlock } from './ScheduledTaskBlock';
import { CurrentTimeIndicator } from './CurrentTimeIndicator';
import { generateTimeSlots, getGridHeight } from '../utils/timeUtils';
import { Task } from '@/shared/types';

function detectOverlaps(tasks: Task[]): Map<string, { count: number; index: number }> {
  const overlaps = new Map<string, { count: number; index: number }>();

  tasks.forEach((task, i) => {
    if (!task.scheduledTime) return;
    const start1 = new Date(task.scheduledTime.start).getTime();
    const end1 = new Date(task.scheduledTime.end).getTime();

    let overlapGroup: string[] = [task.id];

    tasks.forEach((other, j) => {
      if (i === j || !other.scheduledTime) return;
      const start2 = new Date(other.scheduledTime.start).getTime();
      const end2 = new Date(other.scheduledTime.end).getTime();

      if (start1 < end2 && end1 > start2) {
        overlapGroup.push(other.id);
      }
    });

    const uniqueGroup = [...new Set(overlapGroup)].sort();
    const index = uniqueGroup.indexOf(task.id);
    overlaps.set(task.id, { count: uniqueGroup.length, index });
  });

  return overlaps;
}

export function TimeGrid() {
  const gridRef = useRef<HTMLDivElement>(null);
  const { selectedDate } = useCalendarStore();
  const { tasks } = useTaskStore();

  const slots = useMemo(() => generateTimeSlots(), []);

  const scheduledTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (!t.scheduledTime || t.completed) return false;
      const taskDate = new Date(t.dueDate);
      return isSameDay(taskDate, selectedDate);
    });
  }, [tasks, selectedDate]);

  const overlaps = useMemo(() => detectOverlaps(scheduledTasks), [scheduledTasks]);

  return (
    <div className="bg-background-secondary rounded-xl overflow-hidden">
      <ScrollArea className="h-[400px]">
        <div
          ref={gridRef}
          className="relative ml-14 mr-2"
          style={{ height: getGridHeight() }}
        >
          {/* Time slots (background) */}
          <div className="absolute inset-0">
            {slots.map((slot) => (
              <TimeSlot key={`${slot.hour}:${slot.minute}`} slot={slot} />
            ))}
          </div>

          {/* Current time indicator */}
          <CurrentTimeIndicator />

          {/* Scheduled tasks */}
          {scheduledTasks.map((task, index) => {
            const overlap = overlaps.get(task.id) || { count: 1, index: 0 };
            return (
              <ScheduledTaskBlock
                key={task.id}
                task={task}
                gridRef={gridRef}
                index={index}
                overlapCount={overlap.count}
                overlapIndex={overlap.index}
              />
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
```

**PATTERN**: Composite component with overlap detection
**VALIDATE**: Time grid scrolls, tasks display correctly

---

### Task 14: CREATE src/features/calendar/components/UnscheduledTaskItem.tsx

**IMPLEMENT**: Draggable task in unscheduled section

```typescript
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GripVertical } from 'lucide-react';
import { Task } from '@/shared/types';
import { getCategoryColor, cn } from '@/shared/utils';

interface UnscheduledTaskItemProps {
  task: Task;
  index: number;
}

export function UnscheduledTaskItem({ task, index }: UnscheduledTaskItemProps) {
  const navigate = useNavigate();
  const categoryColor = getCategoryColor(task.category);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg',
        'bg-background-tertiary hover:bg-background-tertiary/80',
        'cursor-pointer transition-colors'
      )}
      onClick={() => navigate(`/tasks/${task.id}`)}
      data-testid={`unscheduled-task-${index}`}
    >
      <GripVertical className="w-4 h-4 text-text-muted flex-shrink-0" />

      <div
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: categoryColor }}
      />

      <span className="text-sm text-text-primary truncate flex-1">
        {task.title}
      </span>

      {task.priority === 'high' && (
        <span className="text-xs px-1.5 py-0.5 rounded bg-accent-error/20 text-accent-error flex-shrink-0">
          High
        </span>
      )}
    </motion.div>
  );
}
```

**PATTERN**: List item with navigation
**VALIDATE**: Items render, clicking navigates to task

---

### Task 15: CREATE src/features/calendar/components/UnscheduledSection.tsx

**IMPLEMENT**: "Due Today" section with unscheduled tasks

```typescript
import { useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { isSameDay } from 'date-fns';
import { CalendarX2 } from 'lucide-react';
import { useTaskStore, useCalendarStore } from '@/shared/store';
import { UnscheduledTaskItem } from './UnscheduledTaskItem';

export function UnscheduledSection() {
  const { selectedDate } = useCalendarStore();
  const { tasks } = useTaskStore();

  const unscheduledTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (t.scheduledTime || t.completed) return false;
      const taskDate = new Date(t.dueDate);
      return isSameDay(taskDate, selectedDate);
    });
  }, [tasks, selectedDate]);

  if (unscheduledTasks.length === 0) return null;

  return (
    <div className="mt-4" data-testid="unscheduled-section">
      <div className="flex items-center gap-2 mb-3">
        <CalendarX2 className="w-4 h-4 text-text-secondary" />
        <h3 className="text-sm font-medium text-text-secondary">
          Due Today ({unscheduledTasks.length})
        </h3>
      </div>

      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {unscheduledTasks.map((task, index) => (
            <UnscheduledTaskItem
              key={task.id}
              task={task}
              index={index}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
```

**PATTERN**: Filtered list with AnimatePresence
**VALIDATE**: Unscheduled tasks display, count is correct

---

### Task 16: CREATE src/features/calendar/components/EmptyDayState.tsx

**IMPLEMENT**: Empty state when no tasks

```typescript
import { Calendar, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/shared/components/ui/button';
import { useUIStore } from '@/shared/store';

export function EmptyDayState() {
  const { openAddTaskModal } = useUIStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-12 text-center"
    >
      <div className="w-16 h-16 rounded-full bg-background-tertiary flex items-center justify-center mb-4">
        <Calendar className="w-8 h-8 text-text-muted" />
      </div>

      <h3 className="text-lg font-medium text-text-primary mb-2">
        No scheduled tasks
      </h3>

      <p className="text-sm text-text-secondary mb-4">
        Drag tasks here to schedule them
      </p>

      <Button
        onClick={openAddTaskModal}
        className="bg-accent-primary hover:bg-accent-primary/90"
        data-testid="schedule-task-button"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add a task
      </Button>
    </motion.div>
  );
}
```

**PATTERN**: Empty state with call-to-action
**VALIDATE**: Displays when no tasks, button opens modal

---

### Task 17: CREATE src/features/calendar/index.ts

**IMPLEMENT**: Feature exports

```typescript
export { CalendarScreen } from './CalendarScreen';
```

**VALIDATE**: Export works correctly

---

### Task 18: UPDATE src/features/calendar/CalendarScreen.tsx

**IMPLEMENT**: Compose all calendar components

```typescript
import { useMemo } from 'react';
import { isSameDay } from 'date-fns';
import { PageContainer } from '@/shared/components/PageContainer';
import { useTaskStore, useCalendarStore } from '@/shared/store';
import { WeekHeader } from './components/WeekHeader';
import { DayColumns } from './components/DayColumns';
import { TimeGrid } from './components/TimeGrid';
import { UnscheduledSection } from './components/UnscheduledSection';
import { EmptyDayState } from './components/EmptyDayState';

export function CalendarScreen() {
  const { selectedDate } = useCalendarStore();
  const { tasks } = useTaskStore();

  const dayTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (t.completed) return false;
      const taskDate = new Date(t.dueDate);
      return isSameDay(taskDate, selectedDate);
    });
  }, [tasks, selectedDate]);

  const hasScheduledTasks = dayTasks.some((t) => t.scheduledTime);
  const hasUnscheduledTasks = dayTasks.some((t) => !t.scheduledTime);
  const isEmpty = dayTasks.length === 0;

  return (
    <PageContainer>
      <div className="pt-6 space-y-4" data-testid="calendar-screen">
        <WeekHeader />
        <DayColumns />

        {isEmpty ? (
          <EmptyDayState />
        ) : (
          <>
            {(hasScheduledTasks || !hasUnscheduledTasks) && <TimeGrid />}
            <UnscheduledSection />
          </>
        )}
      </div>
    </PageContainer>
  );
}
```

**PATTERN**: Composed feature screen
**VALIDATE**: Calendar renders with all sections

---

### Task 19: UPDATE src/app/Router.tsx (if needed)

**IMPLEMENT**: Verify calendar route exists

The route should already exist from Phase 1. Verify `/calendar` maps to `CalendarScreen`.

**VALIDATE**: Navigate to `/calendar` shows updated screen

---

### Task 20: RUN final validation

**IMPLEMENT**: Run all validation commands

```bash
npx tsc --noEmit
npm run dev
```

**VALIDATE**:
- No TypeScript errors
- App starts successfully
- Calendar screen renders
- Week navigation works
- Day selection highlights correctly
- Time grid scrolls
- Scheduled tasks display in correct positions
- Unscheduled tasks show in bottom section
- Task count badges appear on days with tasks
- Current time indicator shows when viewing today

---

## TESTING STRATEGY

### Unit Tests

- `calendarStore.test.ts` - Date navigation, selection
- `timeUtils.test.ts` - Position calculations, time conversions
- `useWeekDates.test.ts` - Week generation, task counting

### Integration Tests (Playwright - from PRD)

Reference PRD tests TEST 3.1 through TEST 3.13:
- Week view layout validation
- Day selection
- Time grid display
- Scheduled vs unscheduled tasks
- Week navigation
- Empty day state
- Responsive layouts (mobile/desktop)

### Manual Testing Checklist

- [ ] Calendar screen loads without errors
- [ ] Week header shows current month/year
- [ ] Navigation arrows change weeks
- [ ] Clicking day selects it (blue highlight)
- [ ] Today has special styling
- [ ] Task count badges appear on days
- [ ] Time grid shows 8AM-10PM
- [ ] Time labels visible on left
- [ ] Scheduled tasks appear at correct time
- [ ] Tasks color-coded by category
- [ ] Dragging task vertically changes time
- [ ] Unscheduled section shows tasks without time
- [ ] Current time indicator appears when viewing today
- [ ] Empty state shows when no tasks
- [ ] "+ Add a task" button opens drawer

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

1. Open http://localhost:5173/calendar
2. Verify week header shows month/year
3. Click prev/next arrows - weeks change
4. Click on a day - it becomes selected
5. Create task with scheduled time (use task drawer)
6. Verify task appears in time grid
7. Drag task up/down - time changes
8. Create task without scheduled time
9. Verify it appears in "Due Today" section
10. Select a day with no tasks
11. Verify empty state displays
12. Click "+ Add a task" button
13. Verify task drawer opens

---

## ACCEPTANCE CRITERIA

- [ ] WeekHeader shows month/year with navigation
- [ ] DayColumns show 7 days with selection
- [ ] Task count badges display on days with tasks
- [ ] TimeGrid displays 8AM-10PM with 30-min slots
- [ ] ScheduledTaskBlock positions correctly
- [ ] Vertical drag changes task time
- [ ] UnscheduledSection shows tasks without time
- [ ] CurrentTimeIndicator shows when viewing today
- [ ] EmptyDayState displays when no tasks
- [ ] Overlap handling (side-by-side display)
- [ ] Category colors applied correctly
- [ ] Week navigation works (prev/next)
- [ ] Day selection updates displayed tasks
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
- [ ] Calendar CRUD operations work
- [ ] Drag-and-drop functional
- [ ] All acceptance criteria met

---

## NOTES

### Design Decisions

1. **Framer Motion over dnd-kit**: Using Framer Motion's built-in drag gestures for simpler implementation. More complex drag scenarios (cross-day, unscheduled to grid) would benefit from dnd-kit in future.

2. **Vertical Drag Only (Phase 1)**: Starting with vertical drag for time changes. Horizontal drag for day changes and drag-from-unscheduled are more complex - can be added as enhancement.

3. **30-minute Snapping**: All times snap to 30-minute intervals for simplicity. PRD specifies this as requirement.

4. **Overlap Detection**: Simple pairwise overlap detection. For MVP, tasks overlap side-by-side at 50% width each.

5. **No Drag from Unscheduled (Deferred)**: The drag-from-unscheduled-to-grid feature requires more complex drop zone detection. For MVP, users can edit task to add scheduled time.

### Potential Risks

1. **Touch Drag Performance**: Framer Motion drag on mobile may need tuning. Monitor for jank.

2. **Scroll + Drag Conflict**: ScrollArea may conflict with vertical drag. May need to disable scroll during drag.

3. **Time Zone Issues**: Using local time for all calculations. Be careful with ISO string parsing.

4. **Long Tasks**: Tasks spanning 3+ hours may overflow visible area. May need special handling.

### Future Enhancements (Post-MVP)

1. Horizontal drag between days
2. Drag unscheduled task to time grid
3. Conflict resolution UI (merge, reschedule)
4. Multi-day task support
5. Resize task duration by dragging edges

### Dependencies Used

No new dependencies needed - using existing:
- framer-motion (drag gestures)
- date-fns (date calculations)
- shadcn scroll-area, tooltip
