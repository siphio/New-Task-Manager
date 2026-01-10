# Product Requirements Document: TaskFlow

## 1. Executive Summary

TaskFlow is a **mobile-first, responsive Progressive Web App (PWA)** for personal productivity and task management. It combines to-do list functionality with intelligent calendar scheduling, progress analytics, and goal tracking.

**Core Differentiator:** Hybrid calendar system that accommodates both time-specific scheduled tasks (meetings, appointments) and flexible unscheduled tasks (to-dos with due dates but no specific time). This reflects how people actually work—some things need to happen at exact times, while others just need to get done "sometime today."

**MVP Goal:** Deliver a polished, responsive task management PWA with task CRUD operations, hybrid calendar view, basic analytics, and user profiles. The app should feel native on mobile devices with smooth touch-based interactions while remaining fully functional on desktop browsers.

---

## 2. Mission & Core Principles

### Mission Statement

Empower individuals to manage their time and tasks effortlessly by providing a flexible, intuitive system that adapts to how they actually work—not forcing rigid scheduling on every to-do item.

### Core Principles

1. **Flexibility First** — Users choose their level of scheduling granularity (timed vs. untimed tasks)
2. **Mobile-First, Desktop-Ready** — Optimized for touch interactions (tap, swipe, drag) while fully functional with mouse/keyboard on desktop
3. **Reduce Friction** — Task creation should be fast; scheduling should be optional
4. **Motivation Through Visibility** — Progress tracking, streaks, and analytics encourage consistent habits
5. **Clean & Focused** — Dark theme UI that's easy on the eyes and keeps focus on tasks

---

## 3. Target Users

### Primary Persona: "Productivity-Minded Professional"

- **Age:** 25-45
- **Technical Comfort:** Moderate to high (comfortable with mobile apps and web applications)
- **Context:** Knowledge workers, students, freelancers managing multiple responsibilities
- **Devices:** Primarily smartphone (iOS/Android), but also desktop browsers and tablets

### User Needs & Pain Points

| Need | Pain Point |
|------|------------|
| Quick task capture | Other apps require too many fields to create a task |
| Flexible scheduling | Forced to assign times to tasks that don't need them |
| Visual progress | Hard to see if they're actually being productive |
| Cross-device access | Native apps don't sync well or require subscriptions |
| Simple categories | Complex tagging systems are overwhelming |

### Secondary Personas

- **Students** managing assignments, study schedules, and personal tasks
- **Parents** balancing work tasks with family responsibilities
- **Hobbyists** tracking personal projects and self-improvement goals

---

## 4. MVP Scope

### In Scope (MVP v1.0)

**Core Task Management**
- Create tasks with title, description, category, priority, due date
- Optional time scheduling for tasks
- Subtasks (checklist items within tasks)
- Edit and delete tasks
- Mark tasks as complete
- Four preset categories: Work, Personal, Team, Self-improvement

**Calendar**
- Week view with day selection
- Hybrid display: scheduled tasks in time grid + unscheduled tasks in bottom section
- Task count badges per day
- Drag-and-drop to reorder/reschedule tasks
- Drag left/right to move tasks between days
- 30-minute time slot snapping

**Home Dashboard**
- Daily goals progress (circular progress indicator)
- Task list for current day
- Category-coded task cards

**Analytics**
- Tasks completed count
- Current streak tracking
- Completion rate percentage
- Category breakdown chart
- Time filter (Week/Month/Year)

**Profile & Settings**
- User profile with stats (total tasks, best streak, completion rate)
- Daily goal configuration
- Notification preferences toggle
- Sign out functionality

**Technical**
- Mobile-first responsive PWA
- Touch-optimized interactions (tap, swipe, long-press, drag)
- Desktop-compatible (mouse and keyboard support)
- Offline capability
- Installable on home screen
- Dark theme UI

### Out of Scope (Post-MVP)

- Month/Day views, recurring tasks, push notifications
- Custom categories, task sharing, calendar integrations
- Natural language input, widgets

### Now In Scope (via Supabase)

- ✅ Backend API — Supabase provides PostgreSQL + REST APIs
- ✅ User authentication — Supabase Auth (email/password, OAuth)
- ✅ Cloud sync — Data stored in Supabase cloud when deployed

---

## 5. User Stories

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| US-1 | Quick task creation with minimal fields | User creates task in <5 seconds with just title and category |
| US-2 | Optional time scheduling for meetings | User can toggle "Add Time" to assign specific time slot |
| US-3 | Subtasks for complex items | User can add/check off subtasks, progress shows X/Y |
| US-4 | Mark tasks complete | Completed tasks removed from list, counted in analytics |
| US-5 | View weekly schedule with task counts | Week view shows badges with task count per day |
| US-6 | Drag tasks to different time slots | Long-press + drag changes task time, snaps to 30-min |
| US-7 | Drag tasks between days | Horizontal drag moves task to different day |
| US-8 | Convert unscheduled to scheduled | Drag from "Due Today" section to time grid |
| US-9 | View completion statistics | Analytics shows count, streak, rate, category breakdown |
| US-10 | Set daily task goals | Configurable goal, circular progress on home screen |

---

## 6. Architecture

### Vertical Slice Architecture (VSA)

TaskFlow uses Vertical Slice Architecture to organize code by feature rather than by technical layer. Each feature contains all the code it needs—components, hooks, services, types.

```
src/
├── app/                    # Shell: App.tsx, Router.tsx, Layout.tsx, providers/
├── features/               # Feature slices
│   ├── home/              # HomeScreen, DailyGoals, TaskList, Greeting
│   ├── tasks/             # TaskCard, TaskForm, TaskDetails, SubtaskList
│   ├── calendar/          # CalendarScreen, WeekView, TimeGrid, DragOverlay
│   ├── analytics/         # AnalyticsScreen, ProgressChart, StreakCounter
│   └── profile/           # ProfileScreen, UserStats, SettingsList
├── shared/                # Reusable: components/, hooks/, services/, store/, utils/
├── styles/                # index.css, theme.ts, animations.ts
└── main.tsx
```

**Rules:**
- Features import from `shared/`, never cross-import between features
- Features communicate via Zustand store
- If 2+ features need something, move it to `shared/`

---

## 7. Data Model

```typescript
interface Task {
  id: string;
  title: string;
  description?: string;
  category: 'work' | 'personal' | 'team' | 'self-improvement';
  priority: 'low' | 'medium' | 'high';
  dueDate: Date;
  scheduledTime?: { start: Date; end: Date };
  subtasks: Subtask[];
  completed: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}
```

---

## 8. Technology Stack

### Core Framework
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.x | UI framework |
| TypeScript | 5.x | Type safety |
| Vite | 5.x | Build tool & dev server |
| Zustand | latest | Global state management |
| React Query | latest | Data fetching & caching |

### UI & Styling
| Technology | Purpose |
|------------|---------|
| Tailwind CSS | Utility-first styling |
| shadcn/ui | Component library (via SHAD-CN MCP) |
| Framer Motion | Animations & gestures |
| Headless UI | Accessible component primitives |

### Backend & Storage
| Technology | Purpose |
|------------|---------|
| Supabase | PostgreSQL database, authentication, real-time |
| Supabase CLI | Local development, schema migrations |
| localStorage | Simple client-side preferences |

**Supabase Development Strategy:**
1. **Local Development** — Use Supabase CLI to run PostgreSQL locally
2. **Schema Migrations** — Version-controlled database migrations
3. **Cloud Deployment** — Push validated schema to Supabase cloud when ready

### PWA & Utilities
| Technology | Purpose |
|------------|---------|
| Vite PWA Plugin | Service worker, manifest |
| Workbox | Offline caching strategies |
| date-fns | Date manipulation |
| uuid | Unique ID generation |
| react-hot-toast | Toast notifications |

### Development Tools
| Tool | Purpose |
|------|---------|
| ESLint | Code linting |
| Prettier | Code formatting |
| Vitest | Unit testing |
| Playwright | E2E testing |

---

## 9. MCP Servers (AI-Assisted Development)

This project leverages **Model Context Protocol (MCP) servers** for AI-assisted development, enabling seamless integration with Claude Code.

| MCP Server | Purpose |
|------------|---------|
| **SHAD-CN** | Component library — search, browse, install shadcn/ui components |
| **Archon** | RAG knowledge base + project/task management |
| **Playwright** | Post-implementation validation — automated browser testing |

### 9.1 SHAD-CN MCP Server

**Purpose:** Access the shadcn/ui component registry for consistent, accessible UI components.

**Available Tools:**
- `search_items_in_registries(query)` — Search for components by name
- `view_items_in_registries(items)` — View component source and dependencies
- `get_item_examples_from_registries(query)` — Find usage examples and demos
- `get_add_command_for_items(items)` — Get CLI install commands
- `get_audit_checklist()` — Verify component integration

**When to Use:**
- Before implementing any UI component, search for existing shadcn components
- When adding new interactive elements (buttons, modals, forms, etc.)
- To ensure consistent styling and accessibility

**Workflow Example:**
```
1. Need a button component
2. search_items_in_registries("button") → finds @shadcn/button
3. view_items_in_registries(["@shadcn/button"]) → view source
4. get_item_examples_from_registries("button-demo") → see usage patterns
5. get_add_command_for_items(["@shadcn/button"]) → get install command
6. Run: npx shadcn@latest add button
7. get_audit_checklist() → verify installation
```

### 9.2 Archon MCP Server

**Purpose:** Query technology documentation and manage project tasks.

**RAG Knowledge Base Tools:**
- `rag_get_available_sources()` — List indexed documentation sources
- `rag_search_knowledge_base(query, source_id)` — Semantic search for concepts
- `rag_search_code_examples(query, source_id)` — Find code patterns
- `rag_read_full_page(page_id)` — Read complete documentation pages

**Project Management Tools:**
- `find_projects()` / `manage_project(action, ...)` — Project CRUD
- `find_tasks()` / `manage_task(action, ...)` — Task tracking
- `find_documents()` / `manage_document(action, ...)` — Store specs/notes

**Task Status Flow:** `todo` → `doing` → `review` → `done`

**When to Use:**
- Before implementing a feature, search documentation for best practices
- Track implementation progress with task management
- Store design decisions and notes in project documents

**Workflow Example:**
```
1. Starting new task
2. find_tasks(filter_by="status", filter_value="todo") → get next task
3. manage_task("update", task_id="...", status="doing") → mark in progress
4. rag_search_knowledge_base("framer motion drag gesture") → research
5. rag_search_code_examples("react drag and drop") → find patterns
6. Implement feature based on documentation
7. manage_task("update", task_id="...", status="review") → ready for validation
```

### 9.3 Playwright MCP Server

**Purpose:** Automated browser testing to validate implementations after each phase.

**Core Tools:**
- `browser_navigate(url)` — Navigate to a URL
- `browser_click(selector)` — Click an element
- `browser_type(selector, text)` — Type text into an input
- `browser_screenshot()` — Capture current page state
- `browser_snapshot()` — Get accessibility tree snapshot
- `browser_press_key(key)` — Press keyboard keys
- `browser_select_option(selector, value)` — Select dropdown options
- `browser_hover(selector)` — Hover over elements
- `browser_drag(source, target)` — Drag and drop elements

**When to Use:**
- After completing implementation for each phase
- Before marking tasks as "done"
- To verify all user flows work correctly
- To capture visual evidence of working features

**Validation Workflow:**
```
1. Implementation complete
2. manage_task("update", task_id="...", status="review")
3. Run Playwright MCP validation tests for the phase
4. Execute all test scenarios, capture screenshots
5. If all pass → manage_task("update", task_id="...", status="done")
6. If failures → Fix issues, re-run validation
```

---

## 10. Security Configuration

### Security Scope (via Supabase)

**In Scope:**
- ✅ JWT authentication via Supabase Auth
- ✅ Row Level Security (RLS) — users only access their own data
- ✅ API security — automatic authentication handling
- ✅ Session management — secure token refresh
- ✅ HTTPS encryption in transit
- ✅ Input sanitization, XSS prevention

**Environment Configuration:**
```env
VITE_APP_NAME=TaskFlow
VITE_APP_VERSION=1.0.0

# Supabase (Local Development)
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your-anon-key

# Supabase (Production)
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your-production-anon-key
```

---

## 11. Design System

### Colors
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
    warning: '#D29922',    // Amber (conflicts)
    error: '#F85149',      // Red (delete)
  },
  category: {
    work: '#0A84FF',       // Blue
    personal: '#2DA44E',   // Green
    team: '#DB61A2',       // Pink
    selfImprovement: '#D29922', // Yellow
  },
  text: {
    primary: '#F0F6FC',    // Primary text
    secondary: '#8B949E',  // Secondary text
    muted: '#484F58',      // Disabled/hint
  }
};
```

### Breakpoints
| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | <640px | Single column, bottom nav, FAB |
| Tablet | 768px+ | Wider content area |
| Desktop | 1024px+ | Max-width container, hover states |

### Touch Targets
- Minimum: 44x44px
- Recommended: 48x48px
- Spacing between targets: 8px minimum

### Animations
| Interaction | Animation |
|-------------|-----------|
| Modal open | Slide up + fade (300ms) |
| Modal close | Slide down + fade (200ms) |
| Task complete | Scale down + fade (200ms) |
| Drag start | Scale up (1.05) + shadow |
| Drag release | Spring settle (300ms) |

---

## 12. Success Criteria

### Functional Requirements
- Task creation in <5 seconds
- Week view loads in <1 second
- Drag-and-drop <16ms frame time
- Installable PWA, works offline

### Quality Targets
| Metric | Target |
|--------|--------|
| First Contentful Paint | <1.5s |
| Time to Interactive | <3s |
| Lighthouse Performance | >90 |
| Lighthouse Accessibility | >95 |
| Bundle size (gzipped) | <150KB |

---

## 13. Implementation Phases

### Phase 1: Foundation

**Goal:** Set up project infrastructure and core UI components

**Deliverables:**
- Project scaffolding (Vite + React + TypeScript)
- Tailwind CSS with dark theme
- Bottom navigation component
- FAB (Floating Action Button) component
- Basic routing (4 screens: Home, Calendar, Analytics, Profile)
- Zustand store setup
- Supabase connection and auth setup
- Responsive layout components

**MCP Server Usage:**

**SHAD-CN MCP — Component Setup:**
```
1. search_items_in_registries("button") → find button component
2. get_add_command_for_items(["@shadcn/button"]) → install
3. search_items_in_registries("navigation") → find nav components
4. search_items_in_registries("avatar") → for profile
5. get_audit_checklist() → verify all components installed
```

**Archon MCP — Research & Planning:**
```
1. rag_search_knowledge_base("vite react typescript setup")
2. rag_search_knowledge_base("tailwind dark theme configuration")
3. rag_search_knowledge_base("zustand store patterns")
4. rag_search_knowledge_base("supabase auth react")
5. rag_search_code_examples("react router protected routes")
```

**Archon MCP — Task Tracking:**
```
1. manage_task("create", title="Scaffold Vite project", status="todo")
2. manage_task("create", title="Configure Tailwind dark theme", status="todo")
3. manage_task("create", title="Create BottomNav component", status="todo")
4. manage_task("create", title="Create FAB component", status="todo")
5. manage_task("create", title="Setup routing", status="todo")
6. manage_task("create", title="Setup Zustand store", status="todo")
7. manage_task("create", title="Connect Supabase auth", status="todo")
```

**Playwright MCP — Validation Tests:**

```
TEST 1.1: Authentication Flow
─────────────────────────────
1. browser_navigate("http://localhost:5173")
2. browser_screenshot() → Verify login/signup screen renders
3. browser_type("[data-testid='email-input']", "test@example.com")
4. browser_type("[data-testid='password-input']", "testpassword123")
5. browser_click("[data-testid='login-button']")
6. browser_screenshot() → Verify redirect to Home screen
7. browser_snapshot() → Verify accessibility tree

TEST 1.2: Navigation Between Screens
────────────────────────────────────
1. browser_click("[data-testid='nav-home']")
2. browser_screenshot() → Verify Home screen renders
3. browser_click("[data-testid='nav-calendar']")
4. browser_screenshot() → Verify Calendar screen renders
5. browser_click("[data-testid='nav-analytics']")
6. browser_screenshot() → Verify Analytics screen renders
7. browser_click("[data-testid='nav-profile']")
8. browser_screenshot() → Verify Profile screen renders
9. browser_snapshot() → Verify all nav items accessible

TEST 1.3: Dark Theme Consistency
────────────────────────────────
1. browser_navigate("http://localhost:5173")
2. browser_screenshot() → Capture Home screen
3. browser_click("[data-testid='nav-calendar']")
4. browser_screenshot() → Capture Calendar screen
5. browser_click("[data-testid='nav-analytics']")
6. browser_screenshot() → Capture Analytics screen
7. browser_click("[data-testid='nav-profile']")
8. browser_screenshot() → Capture Profile screen
9. Verify all screenshots show:
   - Background color #0D1117
   - Text color #F0F6FC
   - Card backgrounds #161B22

TEST 1.4: Responsive Layout - Mobile (375x667)
──────────────────────────────────────────────
1. Set viewport to 375x667 (iPhone SE)
2. browser_navigate("http://localhost:5173")
3. browser_screenshot() → Capture mobile layout
4. Verify bottom navigation is visible and fixed
5. Verify FAB is visible in bottom-right corner
6. Verify single-column layout
7. Verify touch targets are minimum 44x44px
8. browser_snapshot() → Verify mobile accessibility

TEST 1.5: Responsive Layout - Tablet (768x1024)
───────────────────────────────────────────────
1. Set viewport to 768x1024 (iPad)
2. browser_navigate("http://localhost:5173")
3. browser_screenshot() → Capture tablet layout
4. Verify wider content area
5. Verify bottom navigation adapts
6. Verify touch targets are 48px minimum
7. browser_snapshot() → Verify tablet accessibility

TEST 1.6: Responsive Layout - Desktop (1280x800)
────────────────────────────────────────────────
1. Set viewport to 1280x800 (Desktop)
2. browser_navigate("http://localhost:5173")
3. browser_screenshot() → Capture desktop layout
4. Verify max-width container is centered
5. browser_hover("[data-testid='nav-home']")
6. browser_screenshot() → Verify hover state appears
7. Verify all interactive elements have hover states
8. browser_snapshot() → Verify desktop accessibility
```

---

### Phase 2: Task Management

**Goal:** Complete task CRUD functionality

**Deliverables:**
- Task creation modal/form
- Task card component
- Task details screen
- Task editing screen
- Subtask management
- Task completion flow
- Home screen with task list
- Daily goals progress indicator

**MCP Server Usage:**

**SHAD-CN MCP — Component Setup:**
```
1. search_items_in_registries("dialog") → for task modal
2. search_items_in_registries("form") → for task form
3. search_items_in_registries("input") → for text inputs
4. search_items_in_registries("select") → for category/priority
5. search_items_in_registries("checkbox") → for subtasks
6. search_items_in_registries("card") → for task cards
7. search_items_in_registries("progress") → for daily goals
8. get_item_examples_from_registries("form-demo") → form patterns
9. get_add_command_for_items(["@shadcn/dialog", "@shadcn/form", ...])
```

**Archon MCP — Research & Planning:**
```
1. rag_search_knowledge_base("react hook form validation")
2. rag_search_knowledge_base("zustand async actions")
3. rag_search_knowledge_base("supabase insert update delete")
4. rag_search_code_examples("optimistic ui updates react")
5. rag_search_code_examples("circular progress indicator")
```

**Archon MCP — Task Tracking:**
```
1. manage_task("create", title="Create TaskForm component", status="todo")
2. manage_task("create", title="Create TaskCard component", status="todo")
3. manage_task("create", title="Create TaskDetails screen", status="todo")
4. manage_task("create", title="Create TaskEditForm component", status="todo")
5. manage_task("create", title="Implement subtask management", status="todo")
6. manage_task("create", title="Implement task completion", status="todo")
7. manage_task("create", title="Create DailyGoals component", status="todo")
8. manage_task("create", title="Build Home screen task list", status="todo")
```

**Playwright MCP — Validation Tests:**

```
TEST 2.1: Task Creation - Quick Task
────────────────────────────────────
1. browser_navigate("http://localhost:5173")
2. browser_click("[data-testid='fab-button']")
3. browser_screenshot() → Verify modal opens with slide-up animation
4. browser_type("[data-testid='task-title-input']", "Buy groceries")
5. browser_click("[data-testid='category-personal']")
6. browser_screenshot() → Verify category chip is selected (green)
7. browser_click("[data-testid='create-task-button']")
8. browser_screenshot() → Verify modal closes
9. Verify task "Buy groceries" appears in task list
10. Verify task has green Personal category badge

TEST 2.2: Task Creation - Full Fields
─────────────────────────────────────
1. browser_click("[data-testid='fab-button']")
2. browser_type("[data-testid='task-title-input']", "Quarterly Review Prep")
3. browser_click("[data-testid='category-work']")
4. browser_click("[data-testid='priority-high']")
5. browser_click("[data-testid='due-date-picker']")
6. browser_click("[data-testid='date-option-tomorrow']")
7. browser_click("[data-testid='add-time-toggle']")
8. browser_click("[data-testid='time-picker-start']")
9. browser_select_option("[data-testid='time-picker-start']", "09:00")
10. browser_type("[data-testid='task-notes-input']", "Prepare slides")
11. browser_screenshot() → Verify all fields populated
12. browser_click("[data-testid='create-task-button']")
13. browser_screenshot() → Verify task created with all details

TEST 2.3: Task Details View
───────────────────────────
1. browser_click("[data-testid='task-card-0']")
2. browser_screenshot() → Verify details screen opens
3. Verify task title is displayed prominently
4. Verify category badge is visible with correct color
5. Verify due date is displayed
6. Verify priority badge is visible
7. Verify "Edit Task" button is present
8. Verify "Mark Complete" button is present
9. browser_snapshot() → Verify details screen accessibility

TEST 2.4: Subtask Management
────────────────────────────
1. browser_click("[data-testid='task-card-0']")
2. browser_click("[data-testid='edit-task-button']")
3. browser_click("[data-testid='add-subtask-button']")
4. browser_type("[data-testid='subtask-input-0']", "Gather Q4 metrics")
5. browser_click("[data-testid='add-subtask-button']")
6. browser_type("[data-testid='subtask-input-1']", "Create slides")
7. browser_click("[data-testid='add-subtask-button']")
8. browser_type("[data-testid='subtask-input-2']", "Schedule meeting")
9. browser_click("[data-testid='save-changes-button']")
10. browser_screenshot() → Verify subtasks saved (shows 0/3)
11. browser_click("[data-testid='subtask-checkbox-0']")
12. browser_screenshot() → Verify progress shows 1/3
13. browser_click("[data-testid='subtask-checkbox-1']")
14. browser_screenshot() → Verify progress shows 2/3

TEST 2.5: Task Editing
──────────────────────
1. browser_click("[data-testid='task-card-0']")
2. browser_click("[data-testid='edit-task-button']")
3. browser_screenshot() → Verify edit form has existing data
4. browser_type("[data-testid='task-title-input']", " - Updated")
5. browser_click("[data-testid='priority-medium']")
6. browser_click("[data-testid='save-changes-button']")
7. browser_screenshot() → Verify success toast appears
8. Verify task title now shows "- Updated" suffix
9. Verify priority badge changed to medium (amber)

TEST 2.6: Task Deletion
───────────────────────
1. browser_click("[data-testid='task-card-0']")
2. browser_click("[data-testid='edit-task-button']")
3. browser_click("[data-testid='delete-task-button']")
4. browser_screenshot() → Verify confirmation dialog appears
5. browser_click("[data-testid='confirm-delete-button']")
6. browser_screenshot() → Verify task removed from list
7. Verify task no longer appears in home screen

TEST 2.7: Task Completion
─────────────────────────
1. browser_click("[data-testid='task-card-0']")
2. browser_click("[data-testid='mark-complete-button']")
3. browser_screenshot() → Capture completion animation
4. Verify scale-down + fade animation plays
5. browser_navigate("http://localhost:5173/analytics")
6. browser_screenshot() → Verify completed count increased
7. Verify task counted in analytics

TEST 2.8: Daily Goals Progress
──────────────────────────────
1. browser_navigate("http://localhost:5173")
2. browser_screenshot() → Capture initial progress (0/10)
3. Create and complete task #1
4. browser_screenshot() → Verify progress shows 1/10 (10%)
5. Create and complete task #2
6. browser_screenshot() → Verify progress shows 2/10 (20%)
7. Create and complete task #3
8. browser_screenshot() → Verify progress shows 3/10 (30%)
9. Verify circular progress indicator animates
10. Verify "X/10 tasks" label updates correctly

TEST 2.9: Home Screen Task List
───────────────────────────────
1. browser_navigate("http://localhost:5173")
2. browser_screenshot() → Verify task list renders
3. Verify greeting shows correct time of day
4. Verify tasks show title and category badge
5. Verify category colors are correct:
   - Work = Blue (#0A84FF)
   - Personal = Green (#2DA44E)
   - Team = Pink (#DB61A2)
   - Self-improvement = Yellow (#D29922)
6. Verify only today's tasks are shown
7. browser_snapshot() → Verify list accessibility
```

---

### Phase 3: Calendar

**Goal:** Implement hybrid calendar with drag-and-drop

**Deliverables:**
- Week view layout (responsive)
- Day selection and schedule display
- Time grid component (8AM - 10PM)
- Unscheduled tasks section
- Scheduled task blocks (color-coded)
- Drag-and-drop (vertical - time change)
- Drag-and-drop (horizontal - day change)
- Edge case handling (overlaps, long tasks)

**MCP Server Usage:**

**SHAD-CN MCP — Component Setup:**
```
1. search_items_in_registries("calendar") → calendar primitives
2. search_items_in_registries("scroll-area") → for time grid
3. search_items_in_registries("badge") → for task count badges
4. search_items_in_registries("tooltip") → for task previews
5. get_item_examples_from_registries("calendar-demo")
```

**Archon MCP — Research & Planning:**
```
1. rag_search_knowledge_base("framer motion drag gesture")
2. rag_search_knowledge_base("react dnd kit calendar")
3. rag_search_code_examples("time grid component react")
4. rag_search_code_examples("week view calendar")
5. rag_search_knowledge_base("touch drag and drop mobile")
```

**Archon MCP — Task Tracking:**
```
1. manage_task("create", title="Create WeekView component", status="todo")
2. manage_task("create", title="Create WeekHeader component", status="todo")
3. manage_task("create", title="Create TimeGrid component", status="todo")
4. manage_task("create", title="Create ScheduledTask component", status="todo")
5. manage_task("create", title="Create UnscheduledSection component", status="todo")
6. manage_task("create", title="Implement vertical drag (time)", status="todo")
7. manage_task("create", title="Implement horizontal drag (day)", status="todo")
8. manage_task("create", title="Handle overlapping tasks", status="todo")
9. manage_task("create", title="Handle long tasks display", status="todo")
```

**Playwright MCP — Validation Tests:**

```
TEST 3.1: Week View Layout
──────────────────────────
1. browser_navigate("http://localhost:5173/calendar")
2. browser_screenshot() → Verify week view renders
3. Verify month/year header displays (e.g., "January 2025")
4. Verify navigation arrows (< >) are present
5. Verify 7 day columns visible (Mon-Sun)
6. Verify day letters shown (M T W T F S S)
7. Verify date numbers shown (20 21 22 23 24 25 26)
8. Verify current day is highlighted with accent color
9. Verify task count badges show on days with tasks
10. browser_snapshot() → Verify calendar accessibility

TEST 3.2: Day Selection
───────────────────────
1. browser_navigate("http://localhost:5173/calendar")
2. browser_click("[data-testid='day-column-wed']")
3. browser_screenshot() → Verify Wednesday is selected
4. Verify day schedule panel shows "Wednesday [date]"
5. Verify schedule updates to show Wednesday's tasks
6. browser_click("[data-testid='day-column-fri']")
7. browser_screenshot() → Verify Friday is selected
8. Verify schedule updates to show Friday's tasks

TEST 3.3: Time Grid Display
───────────────────────────
1. browser_navigate("http://localhost:5173/calendar")
2. browser_screenshot() → Verify time grid renders
3. Verify time labels: 8AM, 9AM, 10AM... through 10PM
4. Verify 30-minute grid lines are visible
5. Verify time grid is scrollable
6. Verify current time indicator line (if viewing today)
7. browser_snapshot() → Verify time grid accessibility

TEST 3.4: Scheduled vs Unscheduled Tasks
────────────────────────────────────────
1. Create task with scheduled time (9AM-9:30AM)
2. Create task without scheduled time (due today)
3. browser_navigate("http://localhost:5173/calendar")
4. browser_screenshot() → Verify layout
5. Verify scheduled task appears in time grid at 9AM slot
6. Verify scheduled task is color-coded by category
7. Verify scheduled task shows title
8. browser_screenshot() → Verify unscheduled section
9. Verify "Due Today (X)" section at bottom
10. Verify unscheduled task appears in list format
11. Verify unscheduled section shows task count

TEST 3.5: Drag-and-Drop - Time Change (Desktop)
───────────────────────────────────────────────
1. browser_navigate("http://localhost:5173/calendar")
2. Create scheduled task at 9AM
3. browser_screenshot() → Verify task at 9AM slot
4. browser_drag("[data-testid='scheduled-task-0']", "[data-testid='time-slot-14:00']")
5. browser_screenshot() → Verify task moved to 2PM slot
6. browser_click("[data-testid='scheduled-task-0']")
7. Verify task details show 2:00 PM - 2:30 PM
8. Verify original 9AM slot is now empty

TEST 3.6: Drag-and-Drop - Day Change (Desktop)
──────────────────────────────────────────────
1. browser_navigate("http://localhost:5173/calendar")
2. Create scheduled task on Monday at 10AM
3. browser_screenshot() → Verify task on Monday
4. browser_drag("[data-testid='scheduled-task-0']", "[data-testid='day-column-wed']")
5. browser_screenshot() → Verify task moved to Wednesday
6. browser_click("[data-testid='day-column-wed']")
7. Verify task appears in Wednesday's schedule at 10AM
8. browser_click("[data-testid='day-column-mon']")
9. Verify Monday's 10AM slot is now empty

TEST 3.7: Schedule Unscheduled Task
───────────────────────────────────
1. browser_navigate("http://localhost:5173/calendar")
2. Create unscheduled task (due today, no time)
3. Verify task appears in "Due Today" section
4. browser_drag("[data-testid='unscheduled-task-0']", "[data-testid='time-slot-10:00']")
5. browser_screenshot() → Verify task now in time grid
6. Verify task appears at 10AM slot with correct color
7. Verify task removed from "Due Today" section
8. browser_click("[data-testid='scheduled-task-0']")
9. Verify task now has time 10:00 AM - 10:30 AM

TEST 3.8: Overlapping Tasks
───────────────────────────
1. Create task #1 scheduled at 9AM-10AM
2. Create task #2 scheduled at 9AM-9:30AM
3. browser_navigate("http://localhost:5173/calendar")
4. browser_screenshot() → Verify overlapping display
5. Verify both tasks shown side-by-side (50% width each)
6. Verify amber conflict warning indicator appears
7. browser_click("[data-testid='conflict-warning']")
8. browser_screenshot() → Verify conflict details shown
9. Verify can click each task individually

TEST 3.9: Long Task Display
───────────────────────────
1. Create task with 3-hour duration (1PM - 4PM)
2. browser_navigate("http://localhost:5173/calendar")
3. browser_screenshot() → Verify long task display
4. Verify task block spans from 1PM to 4PM slots
5. Verify task shows time range "1:00 PM - 4:00 PM"
6. Verify duration badge shows "3h"
7. Verify all 1PM-4PM time slots show as occupied
8. Verify cannot drag other tasks to occupied slots

TEST 3.10: Week Navigation
──────────────────────────
1. browser_navigate("http://localhost:5173/calendar")
2. browser_screenshot() → Capture current week dates
3. browser_click("[data-testid='next-week-button']")
4. browser_screenshot() → Verify next week displayed
5. Verify dates incremented by 7 days
6. Verify month header updates if crossing months
7. browser_click("[data-testid='prev-week-button']")
8. browser_screenshot() → Verify back to original week
9. Verify dates match original

TEST 3.11: Empty Day State
──────────────────────────
1. browser_navigate("http://localhost:5173/calendar")
2. Select a day with no tasks
3. browser_screenshot() → Verify empty state
4. Verify "No scheduled tasks" message displays
5. Verify calendar/empty icon shown
6. Verify "+ Schedule a task" quick action button
7. Verify drag hint text: "Drag tasks here to schedule"
8. browser_click("[data-testid='schedule-task-button']")
9. Verify FAB modal opens

TEST 3.12: Responsive Calendar - Mobile (375x667)
─────────────────────────────────────────────────
1. Set viewport to 375x667 (iPhone SE)
2. browser_navigate("http://localhost:5173/calendar")
3. browser_screenshot() → Verify mobile layout
4. Verify week header is compact (single row)
5. Verify day columns fit horizontally
6. Verify time grid is vertically scrollable
7. Verify task blocks are minimum 48px height
8. Verify touch-friendly sizing

TEST 3.13: Responsive Calendar - Desktop (1280x800)
───────────────────────────────────────────────────
1. Set viewport to 1280x800 (Desktop)
2. browser_navigate("http://localhost:5173/calendar")
3. browser_screenshot() → Verify desktop layout
4. Verify wider time slots
5. Verify more task details visible
6. browser_hover("[data-testid='scheduled-task-0']")
7. browser_screenshot() → Verify hover state
8. Verify cursor changes to "grab" on draggable tasks
9. browser_snapshot() → Verify desktop accessibility
```

---

### Phase 4: Analytics & Polish

**Goal:** Complete analytics, profile, PWA features, and polish

**Deliverables:**
- Analytics screen with charts
- Streak tracking logic
- Category breakdown visualization
- Profile screen with stats
- Settings functionality
- PWA manifest and service worker
- Offline support
- Animations and haptic feedback
- Performance optimization

**MCP Server Usage:**

**SHAD-CN MCP — Component Setup:**
```
1. search_items_in_registries("chart") → for analytics charts
2. search_items_in_registries("tabs") → for time filters
3. search_items_in_registries("switch") → for toggles
4. search_items_in_registries("slider") → for goal picker
5. search_items_in_registries("separator") → for sections
6. get_item_examples_from_registries("chart-demo")
```

**Archon MCP — Research & Planning:**
```
1. rag_search_knowledge_base("recharts react charts")
2. rag_search_knowledge_base("vite pwa plugin configuration")
3. rag_search_knowledge_base("workbox offline strategies")
4. rag_search_knowledge_base("framer motion animations")
5. rag_search_code_examples("streak calculation algorithm")
```

**Archon MCP — Task Tracking:**
```
1. manage_task("create", title="Create ProgressChart component", status="todo")
2. manage_task("create", title="Create StreakCounter component", status="todo")
3. manage_task("create", title="Create CategoryBreakdown component", status="todo")
4. manage_task("create", title="Create ProfileScreen", status="todo")
5. manage_task("create", title="Create SettingsList component", status="todo")
6. manage_task("create", title="Configure PWA manifest", status="todo")
7. manage_task("create", title="Setup service worker", status="todo")
8. manage_task("create", title="Add animations", status="todo")
9. manage_task("create", title="Performance optimization", status="todo")
```

**Playwright MCP — Validation Tests:**

```
TEST 4.1: Analytics Screen Layout
─────────────────────────────────
1. browser_navigate("http://localhost:5173/analytics")
2. browser_screenshot() → Verify analytics screen renders
3. Verify "Tasks Completed" metric card displays
4. Verify "Current Streak" metric card displays
5. Verify "Completion Rate" percentage displays
6. Verify activity bar chart renders
7. Verify category breakdown chart renders
8. Verify time filter tabs (Week/Month/Year)
9. browser_snapshot() → Verify accessibility

TEST 4.2: Tasks Completed Accuracy
──────────────────────────────────
1. browser_navigate("http://localhost:5173/analytics")
2. Note initial "Tasks Completed" count
3. browser_navigate("http://localhost:5173")
4. Create and complete 5 tasks
5. browser_navigate("http://localhost:5173/analytics")
6. browser_screenshot() → Verify count increased by 5

TEST 4.3: Streak Tracking
─────────────────────────
1. browser_navigate("http://localhost:5173/analytics")
2. browser_screenshot() → Capture current streak
3. Complete daily goal (10 tasks)
4. browser_screenshot() → Verify streak incremented
5. Verify flame/fire icon indicator

TEST 4.4: Completion Rate Calculation
─────────────────────────────────────
1. Create 10 tasks total
2. Complete 7 tasks
3. browser_navigate("http://localhost:5173/analytics")
4. browser_screenshot() → Verify 70% completion rate
5. Verify percentage calculation accurate

TEST 4.5: Category Breakdown Chart
──────────────────────────────────
1. Create: 3 Work, 2 Personal, 1 Team, 1 Self-improvement
2. Complete all tasks
3. browser_navigate("http://localhost:5173/analytics")
4. browser_screenshot() → Verify category chart
5. Verify Work (blue) shows highest
6. Verify category colors match design spec

TEST 4.6: Time Filter
─────────────────────
1. browser_navigate("http://localhost:5173/analytics")
2. browser_screenshot() → Verify "Week" active
3. browser_click("[data-testid='filter-month']")
4. browser_screenshot() → Verify monthly data
5. browser_click("[data-testid='filter-year']")
6. browser_screenshot() → Verify yearly data

TEST 4.7: Profile Screen Layout
───────────────────────────────
1. browser_navigate("http://localhost:5173/profile")
2. browser_screenshot() → Verify profile renders
3. Verify user avatar/name displayed
4. Verify stats: Total Tasks, Best Streak, Completion Rate
5. Verify settings list renders
6. browser_snapshot() → Verify accessibility

TEST 4.8: Profile Stats Accuracy
────────────────────────────────
1. browser_navigate("http://localhost:5173/profile")
2. browser_screenshot() → Capture stats
3. Verify "Total Tasks" matches completed count
4. Verify "Best Streak" shows highest achieved
5. Verify "Completion Rate" matches analytics

TEST 4.9: Daily Goal Setting
────────────────────────────
1. browser_navigate("http://localhost:5173/profile")
2. browser_click("[data-testid='setting-daily-goal']")
3. browser_screenshot() → Verify picker opens
4. browser_click("[data-testid='goal-option-15']")
5. browser_screenshot() → Verify goal = 15
6. browser_navigate("http://localhost:5173")
7. Verify home shows "/15 tasks"

TEST 4.10: Notifications Toggle
───────────────────────────────
1. browser_navigate("http://localhost:5173/profile")
2. browser_screenshot() → Capture toggle state
3. browser_click("[data-testid='notifications-toggle']")
4. browser_screenshot() → Verify state changed
5. Refresh page
6. Verify setting persisted

TEST 4.11: Sign Out Flow
────────────────────────
1. browser_navigate("http://localhost:5173/profile")
2. browser_click("[data-testid='sign-out-button']")
3. browser_screenshot() → Verify confirmation
4. browser_click("[data-testid='confirm-sign-out']")
5. browser_screenshot() → Verify login screen
6. Verify session cleared

TEST 4.12: PWA Installability
─────────────────────────────
1. browser_navigate("http://localhost:5173")
2. Verify manifest.json loads
3. Verify service worker registered
4. Verify app icons available
5. browser_screenshot() → Capture install prompt

TEST 4.13: Offline Support
──────────────────────────
1. browser_navigate("http://localhost:5173")
2. Create a task (online)
3. Simulate offline mode
4. browser_navigate("http://localhost:5173")
5. browser_screenshot() → Verify app loads
6. Verify existing tasks display
7. Verify offline indicator shown

TEST 4.14: Modal Animation
──────────────────────────
1. browser_navigate("http://localhost:5173")
2. browser_click("[data-testid='fab-button']")
3. browser_screenshot() → Verify slide-up animation
4. browser_click("[data-testid='modal-close']")
5. browser_screenshot() → Verify slide-down animation

TEST 4.15: Task Completion Animation
────────────────────────────────────
1. browser_navigate("http://localhost:5173")
2. browser_click("[data-testid='task-card-0']")
3. browser_click("[data-testid='mark-complete-button']")
4. browser_screenshot() → Capture animation
5. Verify scale-down + fade

TEST 4.16: Drag Animation
─────────────────────────
1. browser_navigate("http://localhost:5173/calendar")
2. Start dragging a task
3. browser_screenshot() → Verify scale-up + shadow
4. Release task
5. browser_screenshot() → Verify spring settle

TEST 4.17: Performance
──────────────────────
1. Clear browser cache
2. browser_navigate("http://localhost:5173")
3. Measure First Contentful Paint (target: <1.5s)
4. Measure Time to Interactive (target: <3s)
5. browser_screenshot() → Verify loaded

TEST 4.18: Responsive Profile - Mobile
──────────────────────────────────────
1. Set viewport to 375x667
2. browser_navigate("http://localhost:5173/profile")
3. browser_screenshot() → Verify mobile layout
4. Verify stats row stacks appropriately
5. Verify settings list touch-friendly

TEST 4.19: Keyboard Accessibility
─────────────────────────────────
1. browser_navigate("http://localhost:5173")
2. browser_press_key("Tab")
3. browser_screenshot() → Verify focus visible
4. browser_press_key("Tab") multiple times
5. browser_press_key("Enter") → Activate element
6. Verify all elements keyboard accessible
7. browser_snapshot() → Full accessibility check
```

---

## 14. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Drag performance on mobile | CSS transforms (GPU), throttle 60fps, memo components |
| iOS PWA limitations | Design without push notifications, storage warnings |
| Data loss | Supabase cloud sync, consider manual export |
| Scope creep | Strict MVP adherence, backlog everything else |
| State inconsistency | Single source of truth (Zustand), optimistic updates |
| Touch/mouse parity | Unified gesture library (Framer Motion), test both |

---

## 15. Future Considerations

**v1.1:** Day/Month views, recurring tasks, calendar integrations
**v1.2:** Real-time sync, task sharing
**v1.3:** Push notifications, NLP input, smart scheduling
**v1.4:** Custom categories, light theme, widgets

**Premium:** Unlimited history, advanced analytics, custom themes, API access

---

## Appendix

### Screen Inventory
| Screen | Entry | Actions |
|--------|-------|---------|
| Home | Launch, nav | View tasks, FAB |
| Calendar | Nav | View week, drag, FAB |
| Analytics | Nav | Filter, view stats |
| Profile | Nav | Settings, sign out |
| Add Task | FAB | Create task |
| Task Details | Tap card | View, complete, edit |
| Edit Task | Edit button | Modify, delete |

### Category Colors
| Category | Hex |
|----------|-----|
| Work | #0A84FF |
| Personal | #2DA44E |
| Team | #DB61A2 |
| Self-improvement | #D29922 |

### Priority Styling
| Priority | Background | Text |
|----------|------------|------|
| Low | #21262D | #8B949E |
| Medium | #D29922 (20%) | #D29922 |
| High | #F85149 (20%) | #F85149 |

---

*Document Version: 1.5*
*Last Updated: January 2025*

**Changelog:**
- v1.5: Added Playwright MCP validation tests (47 tests); detailed MCP server usage per phase
- v1.4: Replaced IndexedDB with Supabase; added auth and RLS
- v1.3: Added MCP servers (SHAD-CN, Archon); added shadcn/ui
- v1.2: Vertical Slice Architecture
- v1.1: Responsive design, touch/mouse parity
