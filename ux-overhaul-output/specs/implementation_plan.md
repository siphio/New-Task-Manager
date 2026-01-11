# UX Overhaul Implementation Plan

Transform TaskFlow from MVP styling to a polished, professional visual design with purple-blue theme, Plus Jakarta Sans typography, glow effects, and refined component styling.

## Quick Reference

| Screen | Reference File | Key Elements |
|--------|----------------|--------------|
| Home | `anchor-01-hero.png` | Progress ring with track, task cards, FAB glow |
| Login | `anchor-02-login.png` | Purple focus borders, glow button, outline guest |
| Task Drawer | `anchor-03-task-drawer.png` | Rounded top, pill chips, segmented priority |
| Calendar | `calendar-propagated.png` | Day pills, purple selected, empty state |
| Analytics | `analytics-propagated.png` | Tab underlines, large stats, purple bars |
| Profile | `anchor-06-profile.png` | Purple avatar, horizontal stats, NO FAB |

## Design Tokens

```css
/* Primary */
--primary: #7c5cff;
--background: #1a1d23;
--card: #222830;
--foreground: #e8ecf4;
--muted-foreground: #9ca3af;
--border: #3a3f4b;

/* Categories */
--category-work: #3b82f6;
--category-personal: #22c55e;
--category-team: #ec4899;
--category-self: #f59e0b;

/* Shadows */
--shadow-glow: 0 0 20px rgba(124, 92, 255, 0.3);
--shadow-glow-strong: 0 0 30px rgba(124, 92, 255, 0.4);
```

---

## PHASE 1: DESIGN TOKENS SETUP

### Task 1.1: Add Plus Jakarta Sans Font

**index.html** - Add to `<head>`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### Task 1.2: Update CSS Variables

**src/index.css** - Replace color variables:
```css
@theme {
  --color-primary: #7c5cff;
  --color-primary-foreground: #ffffff;
  --color-background: #1a1d23;
  --color-background-secondary: #222830;
  --color-background-tertiary: #2a2f38;
  --color-foreground: #e8ecf4;
  --color-muted: #3a3f4b;
  --color-muted-foreground: #9ca3af;
  --color-border: #3a3f4b;
  --color-ring: #7c5cff;

  --color-accent-primary: #7c5cff;
  --color-accent-success: #4ade80;
  --color-accent-warning: #fbbf24;
  --color-accent-error: #f87171;

  --color-category-work: #3b82f6;
  --color-category-personal: #22c55e;
  --color-category-team: #ec4899;
  --color-category-self: #f59e0b;

  --font-sans: 'Plus Jakarta Sans', system-ui, sans-serif;
  --shadow-glow: 0 0 20px rgba(124, 92, 255, 0.3);
  --shadow-glow-strong: 0 0 30px rgba(124, 92, 255, 0.4);

  --radius-sm: 0.5rem;
  --radius-md: 0.75rem;
  --radius-lg: 1rem;
  --radius-xl: 1.25rem;
  --radius-2xl: 1.5rem;
}
```

### Task 1.3: Add Glow Utilities

```css
.glow { box-shadow: var(--shadow-glow); }
.glow-strong { box-shadow: var(--shadow-glow-strong); }
.focus-glow:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px rgba(124, 92, 255, 0.2), var(--shadow-glow);
}
```

---

## PHASE 2: COMPONENT UPDATES

### Task 2.1: Button Component

**src/shared/components/ui/button.tsx**
```tsx
// Update default variant:
default: "bg-primary text-primary-foreground shadow-[0_0_20px_rgba(124,92,255,0.3)] hover:bg-primary/90",
```

### Task 2.2: Card Component

**src/shared/components/ui/card.tsx**
```tsx
className={cn("rounded-2xl bg-[#222830] text-card-foreground", className)}
```

### Task 2.3: Input Component

**src/shared/components/ui/input.tsx**
```tsx
className={cn(
  "flex h-12 w-full rounded-xl border border-[#3a3f4b] bg-[#2a2f38] px-4 py-3",
  "text-foreground placeholder:text-muted-foreground",
  "focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20",
  className
)}
```

### Task 2.4: Drawer Component

**src/shared/components/ui/drawer.tsx**
```tsx
// DrawerContent:
className={cn(
  "fixed inset-x-0 bottom-0 z-50 flex h-auto flex-col rounded-t-[20px] border-t border-[#3a3f4b] bg-[#222830]",
  className
)}
```

### Task 2.5: FAB Component

**src/shared/components/FAB.tsx**
```tsx
className={cn(
  'fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full',
  'bg-primary text-white flex items-center justify-center',
  'shadow-[0_0_30px_rgba(124,92,255,0.4)]',
  'hover:shadow-[0_0_40px_rgba(124,92,255,0.5)]',
  className
)}
```

### Task 2.6: Bottom Navigation

**src/shared/components/BottomNav.tsx**
```tsx
// Active state:
isActive ? 'text-primary' : 'text-muted-foreground'
```

---

## PHASE 3: SCREEN UPDATES

### Task 3.1: Login Screen

**src/features/auth/LoginScreen.tsx**
```tsx
// Sign In button:
<Button className="w-full bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(124,92,255,0.3)]">

// Guest button:
<Button variant="outline" className="w-full border-[#3a3f4b] text-foreground hover:bg-[#222830]">
```

### Task 3.2: Daily Goals

**src/features/home/components/DailyGoals.tsx**
```tsx
// Background track circle:
<circle cx="18" cy="18" r={radius} fill="none" stroke="currentColor" strokeWidth="3" className="text-[#3a3f4b]" />

// Progress circle:
<motion.circle ... strokeWidth="3" className="text-primary" />
```

### Task 3.3: Category Picker

**src/features/tasks/components/CategoryPicker.tsx**
```tsx
className={cn(
  'px-4 py-2 rounded-full text-sm font-medium transition-all border min-h-[40px]',
  isSelected
    ? 'text-white border-transparent'
    : 'text-muted-foreground border-[#3a3f4b] hover:border-muted-foreground'
)}
style={{ backgroundColor: isSelected ? color : 'transparent' }}
```

### Task 3.4: Priority Picker

**src/features/tasks/components/PriorityPicker.tsx**
```tsx
// Container:
<div className="flex gap-0 bg-[#2a2f38] rounded-xl p-1">
  <button className={cn(
    'flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all min-h-[44px]',
    isSelected ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
  )} />
</div>
```

### Task 3.5: Task Form Labels

**src/features/tasks/components/TaskForm.tsx**
```tsx
<div className="space-y-2">
  <label className="text-sm font-medium text-muted-foreground">Task Name</label>
  <Input ... />
</div>
```

### Task 3.6: Calendar Day Selector

**src/features/calendar/CalendarScreen.tsx**
```tsx
<button className={cn(
  'flex flex-col items-center p-3 rounded-xl transition-colors min-w-[48px]',
  isSelected ? 'bg-primary text-white'
    : isToday ? 'bg-primary/20 text-primary'
    : 'text-muted-foreground hover:bg-[#2a2f38]'
)}>
  <span className="text-xs font-medium">{day}</span>
  <span className="text-lg font-bold">{date}</span>
</button>
```

### Task 3.7: Calendar Empty State

```tsx
<div className="p-8 bg-[#222830] rounded-2xl text-center">
  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#2a2f38] flex items-center justify-center">
    <Calendar className="w-8 h-8 text-muted-foreground" />
  </div>
  <p className="text-foreground font-medium mb-2">No tasks scheduled</p>
  <p className="text-muted-foreground text-sm mb-4">Add a task to see it here</p>
  <Button className="bg-primary text-white shadow-[0_0_20px_rgba(124,92,255,0.3)]">
    <Plus className="w-4 h-4 mr-2" />Add a task
  </Button>
</div>
```

### Task 3.8: Analytics Tabs

**src/features/analytics/AnalyticsScreen.tsx**
```tsx
<TabsList className="w-full bg-transparent border-b border-[#3a3f4b] rounded-none p-0">
  <TabsTrigger
    className="flex-1 pb-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary text-muted-foreground bg-transparent"
  >
```

### Task 3.9: Analytics Stats

```tsx
<div className="p-6 bg-[#222830] rounded-2xl text-center">
  <div className="text-6xl font-bold text-primary mb-2">47</div>
  <p className="text-muted-foreground">Tasks Completed</p>
  <div className="flex justify-center gap-8 mt-6">
    <div className="text-center">
      <div className="flex items-center gap-1">
        <span className="text-xl font-bold text-foreground">12</span>
        <span className="text-amber-400">🔥</span>
      </div>
      <p className="text-xs text-muted-foreground">Day Streak</p>
    </div>
    <div className="text-center">
      <span className="text-xl font-bold text-foreground">85%</span>
      <p className="text-xs text-muted-foreground">Completion Rate</p>
    </div>
  </div>
</div>
```

### Task 3.10: Analytics Chart

```tsx
// Bar color:
<div className="flex-1 bg-primary rounded-t" style={{ height: `${height}%` }} />
```

### Task 3.11: Category Colors

```tsx
const categoryBreakdown = [
  { name: 'Work', percent: 40, color: '#3b82f6' },
  { name: 'Personal', percent: 30, color: '#22c55e' },
  { name: 'Team', percent: 20, color: '#ec4899' },
  { name: 'Self-improvement', percent: 10, color: '#f59e0b' },
];
```

### Task 3.12: Profile Avatar

**src/features/profile/ProfileScreen.tsx**
```tsx
<AvatarFallback className="bg-primary text-white text-xl font-bold">
  {initials}
</AvatarFallback>
```

### Task 3.13: Profile Stats

```tsx
<div className="flex justify-around py-4 px-2 bg-[#222830] rounded-2xl">
  {stats.map((stat) => (
    <div key={stat.label} className="text-center">
      <div className="text-2xl font-bold text-foreground">{stat.value}</div>
      <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
    </div>
  ))}
</div>
```

### Task 3.14: Profile Settings

```tsx
<div className="bg-[#222830] rounded-2xl overflow-hidden divide-y divide-[#3a3f4b]">
  {settingsItems.map((item) => (
    <button className="w-full flex items-center justify-between p-4 hover:bg-[#2a2f38] transition-colors">
      ...
    </button>
  ))}
</div>
```

### Task 3.15: Sign Out Button

```tsx
<button className="w-full mt-4 p-4 text-muted-foreground hover:text-foreground flex items-center justify-center gap-2">
  <LogOut className="w-5 h-5" />Sign Out
</button>
```

### Task 3.16: Hide FAB on Profile

**src/app/Layout.tsx**
```tsx
import { useLocation } from 'react-router-dom';

const location = useLocation();
const showFAB = location.pathname !== '/profile';

return (
  <div className="min-h-screen bg-background">
    <Outlet />
    {showFAB && <FAB />}
    <BottomNav />
    <TaskDrawer />
  </div>
);
```

---

## PHASE 4: STATE VARIANTS

### Task 4.1: Skeleton Component

**src/shared/components/Skeleton.tsx**
```tsx
import { cn } from '@/shared/utils';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-lg bg-[#2a2f38]', className)} />;
}
```

### Task 4.2: Loading State

```tsx
if (isLoading) {
  return (
    <PageContainer>
      <div className="pt-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="space-y-3">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      </div>
    </PageContainer>
  );
}
```

### Task 4.3: Empty State Component

**src/shared/components/EmptyState.tsx**
```tsx
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="p-8 bg-[#222830] rounded-2xl text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#2a2f38] flex items-center justify-center text-muted-foreground">
        {icon}
      </div>
      <h3 className="text-foreground font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm mb-4">{description}</p>
      {action && (
        <Button onClick={action.onClick} className="bg-primary text-white shadow-[0_0_20px_rgba(124,92,255,0.3)]">
          {action.label}
        </Button>
      )}
    </div>
  );
}
```

---

## PHASE 5: MICRO-INTERACTIONS

### Task 5.1: Button Press Feedback

```tsx
<motion.button whileTap={{ scale: 0.95 }} transition={{ duration: 0.1 }} ...>
```

### Task 5.2: Card Press Feedback

```tsx
<motion.div whileTap={{ scale: 0.98 }} transition={{ duration: 0.1 }} ...>
```

### Task 5.3: FAB Rotation

```tsx
const { isTaskDrawerOpen } = useUIStore();

<motion.button animate={{ rotate: isTaskDrawerOpen ? 45 : 0 }} transition={{ duration: 0.2 }} ...>
  <Plus className="w-6 h-6" />
</motion.button>
```

### Task 5.4: Progress Ring Animation

```tsx
<motion.circle
  initial={{ strokeDashoffset: circumference }}
  animate={{ strokeDashoffset }}
  transition={{ duration: 0.5, ease: 'easeOut' }}
/>
```

---

## PHASE 6: QUALITY ASSURANCE

### Responsive Testing

| Viewport | Size |
|----------|------|
| iPhone SE | 375x667 |
| iPhone 14 | 390x844 |
| iPad | 768x1024 |
| Desktop | 1280x800 |

### Touch Target Verification

Minimum 44x44px for: nav items, FAB, checkboxes, chips, buttons, inputs, settings items.

### Color Contrast (WCAG AA)

- Primary text (#e8ecf4) on background (#1a1d23) ✓
- Secondary text (#9ca3af) on background (#1a1d23) ✓
- White text on primary (#7c5cff) ✓

### Keyboard Navigation

- Tab order logical
- Focus indicators visible (purple ring)
- Enter/Space activates buttons
- Escape closes modals

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## VALIDATION COMMANDS

```bash
npx tsc --noEmit          # Type check
npm run dev               # Dev server
npm run build             # Production build
```

---

## ACCEPTANCE CRITERIA

### Design Tokens
- [ ] Plus Jakarta Sans loaded
- [ ] Primary #7c5cff, Background #1a1d23, Card #222830
- [ ] Glow shadows working

### Components
- [ ] Button glow, Card rounded-2xl, Input purple focus
- [ ] Drawer rounded top, FAB strong glow, Nav purple active

### Screens Match References
- [ ] Login → `anchor-02-login.png`
- [ ] Home → `anchor-01-hero.png`
- [ ] Task Drawer → `anchor-03-task-drawer.png`
- [ ] Calendar → `calendar-propagated.png`
- [ ] Analytics → `analytics-propagated.png`
- [ ] Profile → `anchor-06-profile.png` (NO FAB)

### Interactions
- [ ] Button scale 0.95, Card scale 0.98
- [ ] FAB rotation, Progress animation
- [ ] Page transitions smooth

### Quality
- [ ] Touch targets 44px+
- [ ] WCAG AA contrast
- [ ] Keyboard accessible
- [ ] No TS/console errors

---

## FILES MODIFIED

| File | Changes |
|------|---------|
| `index.html` | Font link |
| `src/index.css` | CSS variables, utilities |
| `src/shared/components/ui/button.tsx` | Glow variant |
| `src/shared/components/ui/card.tsx` | Rounded, bg |
| `src/shared/components/ui/input.tsx` | Purple focus |
| `src/shared/components/ui/drawer.tsx` | Rounded top |
| `src/shared/components/FAB.tsx` | Glow effect |
| `src/shared/components/BottomNav.tsx` | Active state |
| `src/features/auth/LoginScreen.tsx` | Button styling |
| `src/features/home/components/DailyGoals.tsx` | Progress ring |
| `src/features/tasks/components/CategoryPicker.tsx` | Pill chips |
| `src/features/tasks/components/PriorityPicker.tsx` | Segmented |
| `src/features/tasks/components/TaskForm.tsx` | Labels |
| `src/features/calendar/CalendarScreen.tsx` | Day selector, empty |
| `src/features/analytics/AnalyticsScreen.tsx` | Tabs, stats, chart |
| `src/features/profile/ProfileScreen.tsx` | Avatar, settings |
| `src/app/Layout.tsx` | FAB visibility |

---

## COMPLETION CHECKLIST

### Phase 1: Design Tokens
- [ ] 1.1 Font added
- [ ] 1.2 CSS variables updated
- [ ] 1.3 Glow utilities added

### Phase 2: Components
- [ ] 2.1 Button glow
- [ ] 2.2 Card styling
- [ ] 2.3 Input focus
- [ ] 2.4 Drawer corners
- [ ] 2.5 FAB glow
- [ ] 2.6 Nav active

### Phase 3: Screens
- [ ] 3.1 Login
- [ ] 3.2 Daily Goals
- [ ] 3.3 Category Picker
- [ ] 3.4 Priority Picker
- [ ] 3.5 Task Form labels
- [ ] 3.6 Calendar day selector
- [ ] 3.7 Calendar empty state
- [ ] 3.8 Analytics tabs
- [ ] 3.9 Analytics stats
- [ ] 3.10 Analytics chart
- [ ] 3.11 Category colors
- [ ] 3.12 Profile avatar
- [ ] 3.13 Profile stats
- [ ] 3.14 Profile settings
- [ ] 3.15 Sign Out neutral
- [ ] 3.16 Hide FAB on Profile

### Phase 4: States
- [ ] 4.1 Skeleton component
- [ ] 4.2 Loading states
- [ ] 4.3 Empty states

### Phase 5: Interactions
- [ ] 5.1 Button press
- [ ] 5.2 Card press
- [ ] 5.3 FAB rotation
- [ ] 5.4 Progress animation

### Phase 6: QA
- [ ] 6.1 Mobile viewport
- [ ] 6.2 Touch targets
- [ ] 6.3 Contrast
- [ ] 6.4 Reduced motion
- [ ] 6.5 Keyboard nav

---

*Version 2.1 | Generated 2026-01-11*
