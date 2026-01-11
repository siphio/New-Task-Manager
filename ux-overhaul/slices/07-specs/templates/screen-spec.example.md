# Dashboard Screen Specification

**Screen ID**: `screen-dashboard`
**Screen Type**: `dashboard`
**Image Path**: `generated/screens/dashboard-propagated.png`

---

## Layout

**Structure**: Responsive grid of cards with summary metrics and action areas

### Main Areas

- Header with navigation
- Metrics row (cards)
- Primary content area
- Quick actions sidebar

### Navigation

Bottom tab bar with 4 main sections

### Responsive Notes

- Mobile: Stack cards vertically
- Tablet: 2-column grid
- Desktop: 3-4 column grid

---

## Components

### 1. Header Card

- **shadcn/ui Component**: `Card`
- **Props**:
  - className: "bg-surface border border-border"
- **Tokens Applied**:
  - background: `var(--color-surface)`
  - border: `var(--color-border)`
  - borderRadius: `var(--radius-md)`
- **Notes**:
  - Contains app logo and user avatar
  - Consider using `CardHeader` for title section

### 2. Metric Card

- **shadcn/ui Component**: `Card`, `CardHeader`, `CardTitle`, `CardContent`
- **Props**:
  - className: "hover:shadow-md transition-shadow"
- **Tokens Applied**:
  - background: `var(--color-surface)`
  - shadow: `var(--shadow-sm)`
  - borderRadius: `var(--radius-lg)`
- **Notes**:
  - Use `Badge` component for status indicators
  - Include `Progress` component for completion metrics

### 3. Quick Actions

- **shadcn/ui Component**: `Button`
- **Props**:
  - variant: "default"
  - size: "lg"
- **Tokens Applied**:
  - background: `var(--color-primary)`
  - borderRadius: `var(--radius-md)`
- **Notes**:
  - Primary CTA should use default variant
  - Secondary actions use outline variant

### 4. Navigation Tabs

- **shadcn/ui Component**: `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`
- **Props**:
  - defaultValue: "overview"
- **Tokens Applied**:
  - activeBackground: `var(--color-primary)`
  - inactiveText: `var(--color-text-muted)`
- **Notes**:
  - Keep tab labels short (1-2 words)
  - Use icons alongside text for mobile

---

## States

### Loading State

- **Image Path**: `generated/screens/dashboard-loading.png`
- **Description**: Skeleton placeholders for all card content
- **Trigger Conditions**:
  - Initial page load
  - Data refresh
- **Components**:
  - `Skeleton` for metric values
  - `Skeleton` for chart areas

### Empty State

- **Image Path**: `generated/screens/dashboard-empty.png`
- **Description**: Friendly illustration with CTA to add first item
- **Trigger Conditions**:
  - New user with no data
  - All items deleted
- **Components**:
  - Illustration/Icon
  - Heading text
  - `Button` with primary action

### Error State

- **Image Path**: `generated/screens/dashboard-error.png`
- **Description**: Error message with retry action
- **Trigger Conditions**:
  - API failure
  - Network error
- **Components**:
  - `Alert` with destructive variant
  - `Button` for retry

---

## Implementation Notes

1. Use React Query or SWR for data fetching with built-in loading states
2. Implement skeleton loading for smooth UX during data fetches
3. Add pull-to-refresh on mobile viewport
4. Consider implementing optimistic updates for quick actions
5. Use CSS Grid for responsive card layout

---

## UX Requirements

- [ ] Metric cards should be tappable on mobile (navigate to detail)
- [ ] Loading states should maintain layout structure
- [ ] Empty state should guide users toward first action
- [ ] Quick actions should have loading indicators when processing
- [ ] Navigation should indicate current section

---

## Estimated Complexity

**Medium**

- Multiple component types
- State management for tabs
- Loading and error states required
- Responsive layout considerations
