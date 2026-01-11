# Feature: UX Overhaul Phase 1 - Design Tokens & Foundation

The following plan should be complete, but validate documentation and codebase patterns before implementing.

Pay special attention to the existing CSS variable structure in `src/index.css` - it uses Tailwind CSS v4's `@theme` directive which differs from traditional CSS variables.

## Feature Description

Transform TaskFlow's visual design foundation by implementing a new purple-blue color scheme with Plus Jakarta Sans typography, glow effects, and refined design tokens. This phase establishes the foundational CSS variables and utilities that all subsequent UX overhaul phases depend on.

## User Story

As a TaskFlow user
I want a polished, modern visual design with cohesive purple-blue theme
So that the app feels premium and professional while remaining easy to use

## Problem Statement

The current MVP styling uses a blue accent (`#0A84FF`) with Inter font and lacks visual polish. The design doesn't have glow effects, uses inconsistent border radii, and the color palette doesn't convey the premium feel intended for the product.

## Solution Statement

Implement new design tokens including:
- Primary purple-blue color (`#7c5cff`) replacing blue accent
- Plus Jakarta Sans typography
- New background colors (`#1a1d23`, `#222830`, `#2a2f38`)
- Glow shadow utilities for CTAs and FAB
- Updated category colors and border radius scale

## Feature Metadata

**Feature Type**: Enhancement
**Estimated Complexity**: Medium
**Primary Systems Affected**: Global CSS, Theme Configuration
**Dependencies**: Google Fonts (Plus Jakarta Sans)

---

## CONTEXT REFERENCES

### Relevant Codebase Files - MUST READ BEFORE IMPLEMENTING

| File | Lines | Why |
|------|-------|-----|
| `src/index.css` | 1-204 | Current CSS structure with `@theme` directive - understand existing pattern |
| `index.html` | 1-19 | Add Google Fonts link here |
| `src/shared/utils/categoryColors.ts` | 1-20 | Category color definitions to update |
| `ux-overhaul-output/specs/design_tokens.json` | 1-157 | Source of truth for new token values |
| `ux-overhaul-output/specs/design_tokens.css` | 1-110 | Reference CSS format |

### New Files to Create

- None for Phase 1 (all changes are modifications to existing files)

### Files to Modify

| File | Changes |
|------|---------|
| `index.html` | Add Plus Jakarta Sans font link |
| `src/index.css` | Replace color variables, add glow utilities |
| `src/shared/utils/categoryColors.ts` | Update category hex values |

### Reference Images

| Screen | File | Key Visual Elements |
|--------|------|---------------------|
| Home | `ux-overhaul-output/selected-output/anchor-01-hero.png` | Purple progress ring, FAB glow |
| Login | `ux-overhaul-output/selected-output/anchor-02-login.png` | Purple borders, glow button |

### Relevant Documentation

- [Plus Jakarta Sans on Google Fonts](https://fonts.google.com/specimen/Plus+Jakarta+Sans)
  - Font weights needed: 400, 500, 600, 700
- [Tailwind CSS v4 Theme Configuration](https://tailwindcss.com/docs/theme)
  - Using `@theme` directive for CSS variables

---

## DESIGN TOKEN VALUES

### Color Palette (New vs Old)

| Token | Old Value | New Value |
|-------|-----------|-----------|
| Primary/Accent | `#0A84FF` | `#7c5cff` |
| Background | `#0D1117` | `#1a1d23` |
| Background Secondary | `#161B22` | `#222830` |
| Background Tertiary | `#21262D` | `#2a2f38` |
| Text Primary | `#F0F6FC` | `#e8ecf4` |
| Text Secondary | `#8B949E` | `#9ca3af` |
| Text Muted | `#484F58` | `#3a3f4b` |
| Border | N/A | `#3a3f4b` |
| Success | `#2DA44E` | `#4ade80` |
| Warning | `#D29922` | `#fbbf24` |
| Error | `#F85149` | `#f87171` |

### Category Colors (New)

| Category | Old | New |
|----------|-----|-----|
| Work | `#0A84FF` | `#3b82f6` |
| Personal | `#2DA44E` | `#22c55e` |
| Team | `#DB61A2` | `#ec4899` |
| Self-improvement | `#D29922` | `#f59e0b` |

### Shadow Tokens (New)

```css
--shadow-glow: 0 0 20px rgba(124, 92, 255, 0.3);
--shadow-glow-strong: 0 0 30px rgba(124, 92, 255, 0.4);
```

---

## IMPLEMENTATION PLAN

### Phase 1.1: Font Setup
Add Plus Jakarta Sans via Google Fonts CDN link in index.html.

### Phase 1.2: CSS Variable Migration
Replace the `@theme` block in index.css with new color tokens, maintaining Tailwind v4 compatibility.

### Phase 1.3: Glow Utilities
Add utility classes for glow effects and focus states.

### Phase 1.4: Category Colors Update
Update the categoryColors utility file with new hex values.

### Phase 1.5: Theme Color Meta Tag
Update the theme-color meta tag to match new background.

---

## STEP-BY-STEP TASKS

### Task 1: ADD Plus Jakarta Sans Font to index.html

**File**: `index.html`

**IMPLEMENT**: Add Google Fonts preconnect and font link tags in `<head>` before the viewport meta tag.

**INSERT** after line 5 (after icon link):
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
```

**ALSO UPDATE** line 9: Change theme-color from `#0D1117` to `#1a1d23`:
```html
<meta name="theme-color" content="#1a1d23" />
```

**GOTCHA**: The preconnect links must come before the font link for optimal performance.

**VALIDATE**:
```bash
grep -n "Plus Jakarta Sans" index.html && grep -n "1a1d23" index.html
```

---

### Task 2: UPDATE @theme Block in index.css

**File**: `src/index.css`

**IMPLEMENT**: Replace the `@theme` block (lines 6-26) with new design tokens.

**PATTERN**: Maintain Tailwind v4 `@theme` directive structure.

**REPLACE** lines 6-26 with:
```css
@theme {
  /* Primary Colors */
  --color-primary: #7c5cff;
  --color-primary-foreground: #ffffff;

  /* Backgrounds */
  --color-background: #1a1d23;
  --color-background-secondary: #222830;
  --color-background-tertiary: #2a2f38;

  /* Text Colors */
  --color-foreground: #e8ecf4;
  --color-muted-foreground: #9ca3af;
  --color-text-primary: #e8ecf4;
  --color-text-secondary: #9ca3af;
  --color-text-muted: #6b7280;

  /* Semantic Colors */
  --color-accent-primary: #7c5cff;
  --color-accent-success: #4ade80;
  --color-accent-warning: #fbbf24;
  --color-accent-error: #f87171;

  /* Category Colors */
  --color-category-work: #3b82f6;
  --color-category-personal: #22c55e;
  --color-category-team: #ec4899;
  --color-category-self: #f59e0b;

  /* Borders & Input */
  --color-border: #3a3f4b;
  --color-muted: #3a3f4b;
  --color-input: #2a2f38;
  --color-ring: #7c5cff;

  /* Typography */
  --font-sans: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;

  /* Shadows */
  --shadow-glow: 0 0 20px rgba(124, 92, 255, 0.3);
  --shadow-glow-strong: 0 0 30px rgba(124, 92, 255, 0.4);
}
```

**GOTCHA**: Keep the `--color-` prefix for Tailwind v4 compatibility.

**VALIDATE**:
```bash
grep -c "7c5cff" src/index.css
```
Expected: At least 4 occurrences (primary, accent-primary, ring, in shadow rgba)

---

### Task 3: UPDATE Body Styles in index.css

**File**: `src/index.css`

**IMPLEMENT**: Update the body styles (around line 28-31) to use new token names.

**REPLACE** body block with:
```css
body {
  @apply bg-background text-foreground font-sans antialiased;
  min-height: 100dvh;
}
```

**VALIDATE**:
```bash
grep "bg-background text-foreground" src/index.css
```

---

### Task 4: UPDATE Focus Visible Styles in index.css

**File**: `src/index.css`

**IMPLEMENT**: Update focus-visible styles (around line 72-75) to use new primary color.

**REPLACE**:
```css
:focus-visible {
  outline: 2px solid var(--color-accent-primary);
  outline-offset: 2px;
}
```

**ALSO ADD** new focus-glow utility after focus-visible:
```css
.focus-glow:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px rgba(124, 92, 255, 0.2), var(--shadow-glow);
}
```

**VALIDATE**:
```bash
grep "focus-glow" src/index.css
```

---

### Task 5: ADD Glow Utility Classes in index.css

**File**: `src/index.css`

**IMPLEMENT**: Add glow utility classes after the reduced motion media query (after line 84).

**INSERT** after `@media (prefers-reduced-motion: reduce)` block:
```css
/* Glow Utilities */
.glow {
  box-shadow: var(--shadow-glow);
}

.glow-strong {
  box-shadow: var(--shadow-glow-strong);
}

.glow-hover:hover {
  box-shadow: 0 0 40px rgba(124, 92, 255, 0.5);
}
```

**VALIDATE**:
```bash
grep -c "glow" src/index.css
```
Expected: At least 5 occurrences

---

### Task 6: UPDATE :root CSS Variables in index.css

**File**: `src/index.css`

**IMPLEMENT**: Update the `:root` block (lines 127-160) with new values for shadcn compatibility.

**CRITICAL**: These oklch values must be converted to match our hex colors for shadcn/ui components.

**REPLACE** `:root` block with:
```css
:root {
  --radius: 0.75rem;
  --background: #1a1d23;
  --foreground: #e8ecf4;
  --card: #222830;
  --card-foreground: #e8ecf4;
  --popover: #222830;
  --popover-foreground: #e8ecf4;
  --primary: #7c5cff;
  --primary-foreground: #ffffff;
  --secondary: #2a2f38;
  --secondary-foreground: #e8ecf4;
  --muted: #3a3f4b;
  --muted-foreground: #9ca3af;
  --accent: #7c5cff;
  --accent-foreground: #ffffff;
  --destructive: #f87171;
  --border: #3a3f4b;
  --input: #2a2f38;
  --ring: #7c5cff;
  --chart-1: #7c5cff;
  --chart-2: #3b82f6;
  --chart-3: #22c55e;
  --chart-4: #ec4899;
  --chart-5: #f59e0b;
  --sidebar: #222830;
  --sidebar-foreground: #e8ecf4;
  --sidebar-primary: #7c5cff;
  --sidebar-primary-foreground: #ffffff;
  --sidebar-accent: #2a2f38;
  --sidebar-accent-foreground: #e8ecf4;
  --sidebar-border: #3a3f4b;
  --sidebar-ring: #7c5cff;
}
```

**GOTCHA**: Remove the oklch() values entirely - use direct hex for consistency.

**VALIDATE**:
```bash
grep "oklch" src/index.css | wc -l
```
Expected: 0 (all oklch values should be removed from :root)

---

### Task 7: UPDATE .dark CSS Variables in index.css

**File**: `src/index.css`

**IMPLEMENT**: Update the `.dark` block (lines 162-194) to match the :root (since app is always dark).

**REPLACE** `.dark` block with:
```css
.dark {
  --background: #1a1d23;
  --foreground: #e8ecf4;
  --card: #222830;
  --card-foreground: #e8ecf4;
  --popover: #222830;
  --popover-foreground: #e8ecf4;
  --primary: #7c5cff;
  --primary-foreground: #ffffff;
  --secondary: #2a2f38;
  --secondary-foreground: #e8ecf4;
  --muted: #3a3f4b;
  --muted-foreground: #9ca3af;
  --accent: #7c5cff;
  --accent-foreground: #ffffff;
  --destructive: #f87171;
  --border: #3a3f4b;
  --input: #2a2f38;
  --ring: #7c5cff;
  --chart-1: #7c5cff;
  --chart-2: #3b82f6;
  --chart-3: #22c55e;
  --chart-4: #ec4899;
  --chart-5: #f59e0b;
  --sidebar: #222830;
  --sidebar-foreground: #e8ecf4;
  --sidebar-primary: #7c5cff;
  --sidebar-primary-foreground: #ffffff;
  --sidebar-accent: #2a2f38;
  --sidebar-accent-foreground: #e8ecf4;
  --sidebar-border: #3a3f4b;
  --sidebar-ring: #7c5cff;
}
```

**VALIDATE**:
```bash
grep "7c5cff" src/index.css | wc -l
```
Expected: At least 10 occurrences

---

### Task 8: UPDATE Category Colors Utility

**File**: `src/shared/utils/categoryColors.ts`

**IMPLEMENT**: Update the hex color values to match new design tokens.

**REPLACE** entire file with:
```typescript
import { Category } from '@/shared/types';

export const categoryColors: Record<Category, string> = {
  work: '#3b82f6',
  personal: '#22c55e',
  team: '#ec4899',
  'self-improvement': '#f59e0b',
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

**VALIDATE**:
```bash
grep "3b82f6" src/shared/utils/categoryColors.ts
```

---

### Task 9: VERIFY Scrollbar Styles in index.css

**File**: `src/index.css`

**IMPLEMENT**: Update scrollbar colors to use new variables (around lines 39-56).

**REPLACE** scrollbar styles with:
```css
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
  background: var(--color-muted-foreground);
}
```

**VALIDATE**:
```bash
grep "scrollbar-track" src/index.css
```

---

## TESTING STRATEGY

### Visual Verification

After implementing all tasks:

1. **Start dev server**: `npm run dev`
2. **Open browser**: Navigate to `http://localhost:5173`
3. **Verify colors**:
   - Background should be `#1a1d23` (darker charcoal)
   - Cards should be `#222830` (slightly lighter)
   - Primary buttons/accents should be purple `#7c5cff`
4. **Verify typography**:
   - Font should be Plus Jakarta Sans (check in DevTools > Computed Styles)
5. **Compare with references**:
   - `anchor-01-hero.png` for home screen
   - `anchor-02-login.png` for login screen

### Automated Checks

```bash
# Type check
npx tsc --noEmit

# Build test
npm run build

# Lint
npm run lint
```

---

## VALIDATION COMMANDS

### Level 1: Syntax & Build

```bash
# TypeScript type check
npx tsc --noEmit

# Production build
npm run build
```

**Expected**: Both commands exit with code 0

### Level 2: Token Verification

```bash
# Verify primary color is present
grep -r "7c5cff" src/ --include="*.css" --include="*.ts" | wc -l

# Verify old blue is removed from theme
grep -r "0A84FF" src/index.css | wc -l

# Verify font is configured
grep "Plus Jakarta Sans" src/index.css

# Verify glow utilities exist
grep -c "glow" src/index.css
```

**Expected**:
- Primary color: ≥10 occurrences
- Old blue in index.css: 0 occurrences
- Font: 1 occurrence
- Glow: ≥5 occurrences

### Level 3: Visual Verification (Manual)

```bash
npm run dev
```

Open `http://localhost:5173` and verify:
- [ ] Background is dark charcoal (#1a1d23)
- [ ] Cards are slightly lighter (#222830)
- [ ] Primary accent is purple (#7c5cff)
- [ ] Font is Plus Jakarta Sans
- [ ] Navigation active state is purple

---

## ACCEPTANCE CRITERIA

### Design Tokens
- [x] Plus Jakarta Sans font loaded from Google Fonts
- [x] Primary color is `#7c5cff`
- [x] Background is `#1a1d23`
- [x] Card background is `#222830`
- [x] Input background is `#2a2f38`
- [x] Border color is `#3a3f4b`
- [x] Glow shadow utilities available

### Category Colors
- [x] Work: `#3b82f6`
- [x] Personal: `#22c55e`
- [x] Team: `#ec4899`
- [x] Self-improvement: `#f59e0b`

### Build & Type Safety
- [x] TypeScript compiles with no errors
- [x] Production build succeeds
- [x] ESLint passes

---

## COMPLETION CHECKLIST

- [ ] Task 1: Font link added to index.html
- [ ] Task 2: @theme block updated in index.css
- [ ] Task 3: Body styles updated
- [ ] Task 4: Focus-visible styles updated
- [ ] Task 5: Glow utilities added
- [ ] Task 6: :root variables updated
- [ ] Task 7: .dark variables updated
- [ ] Task 8: Category colors updated
- [ ] Task 9: Scrollbar styles verified

### Validation
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` succeeds
- [ ] Visual verification matches reference images
- [ ] All acceptance criteria met

---

## NOTES

### Breaking Changes
- The primary accent color changes from blue to purple - all UI elements using `accent-primary` or `primary` will change color
- Category colors are updated - existing task cards will show new colors

### Dependencies for Next Phases
This phase must be completed before:
- Phase 2 (Component Updates) - relies on new color variables
- Phase 3 (Screen Updates) - relies on glow utilities
- Phase 4 (State Variants) - relies on background colors

### Rollback Strategy
If issues arise, revert changes to:
- `index.html` - remove font links, restore theme-color
- `src/index.css` - restore original @theme and :root blocks
- `src/shared/utils/categoryColors.ts` - restore original hex values

---

*Version 1.0 | Created 2026-01-11*
