# TaskFlow Design System

Generated: 2026-01-11 | Viewport: Mobile (390x844)

## Overview

TaskFlow uses a modern dark theme with cool purple-blue accents. The design emphasizes clarity, ease of use, and a premium feel with soft shadows and rounded corners.

---

## Color Palette

### Primary Colors
| Name | Hex | Usage |
|------|-----|-------|
| Primary | `#7c5cff` | Primary actions, accents, FAB |
| Background | `#1a1d23` | Main app background |
| Card | `#222830` | Cards, elevated surfaces |
| Foreground | `#e8ecf4` | Primary text |
| Muted | `#9ca3af` | Secondary text, placeholders |

### Category Colors
| Category | Hex | Chip Style |
|----------|-----|------------|
| Work | `#3b82f6` | Filled when selected |
| Personal | `#22c55e` | Filled when selected |
| Team | `#ec4899` | Filled when selected |
| Self-improvement | `#f59e0b` | Filled when selected |

### Priority Colors
| Priority | Hex | Usage |
|----------|-----|-------|
| Low | `#6b7280` | Muted gray |
| Medium | `#7c5cff` | Primary purple |
| High | `#f87171` | Coral red |

---

## Typography

### Font Family
- **Primary**: Plus Jakarta Sans
- **Fallback**: system-ui, -apple-system, sans-serif
- **Monospace**: Roboto Mono

### Type Scale
| Name | Size | Weight | Usage |
|------|------|--------|-------|
| Page Title | 1.875rem (30px) | Bold | Screen headings |
| Section Title | 1.25rem (20px) | Semibold | Card headers |
| Body | 1rem (16px) | Regular | Primary content |
| Label | 0.875rem (14px) | Medium | Form labels, chips |
| Caption | 0.75rem (12px) | Regular | Helper text, timestamps |

---

## Spacing

Base unit: 4px

| Token | Value | Usage |
|-------|-------|-------|
| space-2 | 8px | Tight spacing, icon gaps |
| space-3 | 12px | Input padding |
| space-4 | 16px | Card padding, section gaps |
| space-6 | 24px | Section spacing |
| space-8 | 32px | Large gaps |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| radius-sm | 8px | Small elements, chips |
| radius-md | 12px | Inputs, buttons |
| radius-lg | 16px | Cards |
| radius-xl | 20px | Large cards, drawers |
| radius-full | 9999px | Pills, avatars, FAB |

---

## Shadows

| Name | Value | Usage |
|------|-------|-------|
| shadow-sm | `0 1px 2px 0 rgb(0 0 0 / 0.05)` | Subtle elevation |
| shadow-md | `0 4px 6px -1px rgb(0 0 0 / 0.1)` | Cards |
| shadow-glow | `0 0 20px rgba(124, 92, 255, 0.3)` | Primary buttons, FAB |

---

## Components

### Buttons

#### Primary Button
```css
background: var(--primary);
color: white;
border-radius: var(--radius-md);
padding: var(--space-3) var(--space-6);
font-weight: 600;
box-shadow: var(--shadow-glow);
```

#### Secondary Button (Outline)
```css
background: transparent;
color: var(--foreground);
border: 1px solid var(--border);
border-radius: var(--radius-md);
```

#### FAB (Floating Action Button)
```css
width: 56px;
height: 56px;
border-radius: 50%;
background: var(--primary);
box-shadow: var(--shadow-glow-strong);
position: fixed;
bottom: calc(var(--nav-height) + 16px);
right: 16px;
```

### Cards
```css
background: var(--card);
border-radius: var(--radius-xl);
padding: var(--space-4);
```

### Inputs
```css
background: var(--input);
border: 1px solid var(--border);
border-radius: var(--radius-md);
padding: var(--space-3);
color: var(--foreground);

/* Focus state */
border-color: var(--primary);
box-shadow: 0 0 0 2px rgba(124, 92, 255, 0.2);
```

### Chips/Pills
```css
/* Inactive */
background: transparent;
border: 1px solid var(--border);
border-radius: var(--radius-full);
padding: var(--space-2) var(--space-4);

/* Active */
background: var(--primary);
border-color: var(--primary);
color: white;
```

### Bottom Navigation
```css
height: var(--nav-height);
background: var(--background);
border-top: 1px solid var(--border);
display: flex;
justify-content: space-around;
align-items: center;
position: fixed;
bottom: 0;
left: 0;
right: 0;
```

---

## Screen-Specific Notes

### Home Dashboard
- Progress ring uses `--primary` color with background track
- Empty state should include friendly illustration
- FAB positioned bottom-right above nav

### Login
- Input fields have subtle purple border on focus
- "Continue as Guest" uses outline button style
- Sign In button has glow effect

### Task Drawer
- Opens as bottom sheet (drawer from bottom)
- Category chips wrap to 2 rows if needed
- Priority selector uses segmented control style
- Date picker shows human-friendly format

### Calendar
- Day selector uses pill-style buttons
- Selected day has filled purple background
- Empty state shown in card container with icon

### Analytics
- Tab selector uses underline style for active tab
- Large number display for task count
- Bar chart uses purple bars
- Category breakdown shows colored bullets

### Profile
- **No FAB on this screen**
- Avatar uses initials in purple circle
- Settings rows have chevron indicators
- Stats displayed in horizontal row
- Sign Out uses muted/neutral styling (not red)

---

## Animation Guidelines

- **Duration**: 200-300ms for micro-interactions
- **Easing**: ease-out for enters, ease-in for exits
- **FAB**: Scale transform on press (0.95)
- **Cards**: Subtle scale on tap (0.98)
- **Page transitions**: Slide from right (300ms)

---

## Accessibility

- Minimum touch target: 44x44px
- Color contrast: WCAG AA compliant
- Focus indicators: 2px ring with primary color
- Reduced motion: Respect prefers-reduced-motion
