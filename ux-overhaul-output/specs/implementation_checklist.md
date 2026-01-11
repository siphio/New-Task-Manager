# TaskFlow UX Overhaul - Implementation Checklist

## Reference Images
Location: `ux-overhaul-output/selected-output/`

| Screen | Reference File |
|--------|---------------|
| Home | anchor-01-hero.png |
| Login | anchor-02-login.png |
| Task Drawer | anchor-03-task-drawer.png |
| Calendar | calendar-propagated.png |
| Analytics | analytics-propagated.png |
| Profile | anchor-06-profile.png |

---

## Phase 1: Design Tokens Setup

- [ ] Add Plus Jakarta Sans font (Google Fonts or local)
- [ ] Update CSS custom properties in `index.css`
- [ ] Copy tokens from `design_tokens.css`
- [ ] Update Tailwind config with new colors

---

## Phase 2: Global Component Updates

### Colors
- [ ] Update `--primary` to `#7c5cff`
- [ ] Update `--background` to `#1a1d23`
- [ ] Update `--card` to `#222830`
- [ ] Add category colors
- [ ] Add priority colors

### Typography
- [ ] Set font-family to Plus Jakarta Sans
- [ ] Verify heading hierarchy matches specs

### Border Radius
- [ ] Update to larger radius values (16-20px for cards)
- [ ] Ensure buttons use `radius-md` (12px)

### Shadows
- [ ] Add glow shadow utility class
- [ ] Apply glow to FAB and primary buttons

---

## Phase 3: Screen-by-Screen Updates

### Login Screen
- [ ] Update input field styling (purple focus border)
- [ ] Add glow effect to Sign In button
- [ ] Style "Continue as Guest" as outline button
- [ ] Verify spacing matches reference

### Home Dashboard
- [ ] Update Daily Goals card styling
- [ ] Add background track to progress ring
- [ ] Create/update empty state with illustration
- [ ] Position FAB correctly (bottom-right, above nav)
- [ ] Update bottom nav active state styling

### Task Drawer
- [ ] Update drawer appearance (rounded top corners)
- [ ] Style category chips (pill shape, colors)
- [ ] Update priority selector (segmented control)
- [ ] Add section labels (Task name, Category, Date, etc.)
- [ ] Style date picker input
- [ ] Update Notes textarea styling
- [ ] Style subtasks section

### Calendar
- [ ] Update day selector pills
- [ ] Style selected day (filled purple)
- [ ] Create empty state card with icon
- [ ] Add "Add a task" button in empty state
- [ ] Update header navigation arrows

### Analytics
- [ ] Update tab selector (underline style)
- [ ] Style stats card with progress ring
- [ ] Update Activity bar chart colors
- [ ] Style Category Breakdown with colored bullets
- [ ] Add proper spacing between sections

### Profile
- [ ] **IMPORTANT: Hide FAB on this screen**
- [ ] Style avatar circle (purple background)
- [ ] Update stats row styling
- [ ] Style settings list with dividers
- [ ] Update toggle switch
- [ ] Style "Upgrade to Pro" button
- [ ] Use neutral styling for Sign Out (not red)

---

## Phase 4: State Variants

### Loading States
- [ ] Create skeleton loading components
- [ ] Add shimmer animation effect
- [ ] Apply to Home, Calendar, Analytics

### Empty States
- [ ] Create empty state illustrations
- [ ] Add encouraging copy
- [ ] Include CTA buttons

### Error States
- [ ] Design error state UI
- [ ] Use coral accent (`#f87171`) for errors
- [ ] Add retry button

### With-Data States
- [ ] Test all screens with real data
- [ ] Verify layouts with varying content lengths

---

## Phase 5: Micro-Interactions

- [ ] Add press feedback to buttons (scale 0.95)
- [ ] Add press feedback to cards (scale 0.98)
- [ ] Animate FAB rotation on open drawer
- [ ] Add page transition animations
- [ ] Animate progress ring fill

---

## Phase 6: Quality Assurance

- [ ] Test on iPhone viewport (390x844)
- [ ] Verify all touch targets are 44px minimum
- [ ] Check color contrast (WCAG AA)
- [ ] Test with reduced motion preference
- [ ] Verify keyboard navigation
- [ ] Test screen reader compatibility

---

## Files to Update

### Styles
- `src/index.css` - Global CSS variables
- `tailwind.config.js` - Theme colors

### Components
- `src/shared/components/ui/button.tsx`
- `src/shared/components/ui/card.tsx`
- `src/shared/components/ui/input.tsx`
- `src/shared/components/PageContainer.tsx`
- `src/app/Layout.tsx` - Bottom nav

### Screens
- `src/features/auth/LoginScreen.tsx`
- `src/features/home/HomeScreen.tsx`
- `src/features/tasks/components/TaskDrawer.tsx`
- `src/features/calendar/CalendarScreen.tsx`
- `src/features/analytics/AnalyticsScreen.tsx`
- `src/features/profile/ProfileScreen.tsx`

---

## Estimated Effort

| Task | Effort |
|------|--------|
| Design tokens setup | 1-2 hours |
| Global components | 2-3 hours |
| Screen updates | 4-6 hours |
| State variants | 2-3 hours |
| Micro-interactions | 2-3 hours |
| QA & polish | 2-3 hours |
| **Total** | **13-20 hours** |
