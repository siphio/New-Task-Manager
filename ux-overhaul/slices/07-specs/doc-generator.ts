/**
 * Documentation Generator for UX Overhaul Skill
 * Generates design system documentation in markdown format
 */

import {
  DesignTokens,
  ColorTokens,
  TypographyTokens,
  SpacingTokens,
  BorderRadiusTokens,
  ShadowTokens
} from './token-extractor';
import { StyleConfig } from '../03-anchoring/anchoring';

// ============================================================================
// Types
// ============================================================================

/**
 * Complete design system documentation
 */
export interface DesignSystemDoc {
  title: string;
  generatedAt: string;
  sections: DocSection[];
  fullMarkdown: string;
}

/**
 * Single documentation section
 */
export interface DocSection {
  id: string;
  title: string;
  content: string;
}

/**
 * Color swatch for display
 */
export interface ColorSwatch {
  name: string;
  hex: string;
  usage: string;
}

// ============================================================================
// Main Generation
// ============================================================================

/**
 * Generates complete design system documentation
 */
export function generateDesignSystemDoc(
  tokens: DesignTokens,
  styleConfig: StyleConfig
): DesignSystemDoc {
  const generatedAt = new Date().toISOString();

  const sections: DocSection[] = [
    generateOverviewSection(styleConfig),
    generateColorSection(tokens.colors),
    generateTypographySection(tokens.typography),
    generateSpacingSection(tokens.spacing),
    generateBorderRadiusSection(tokens.borderRadius),
    generateShadowSection(tokens.shadows),
    generateComponentGuidelines(styleConfig)
  ];

  const fullMarkdown = compileMarkdown({
    title: `${styleConfig.styleDirection} Design System`,
    generatedAt,
    sections,
    fullMarkdown: '' // Will be filled
  });

  return {
    title: `${styleConfig.styleDirection} Design System`,
    generatedAt,
    sections,
    fullMarkdown
  };
}

// ============================================================================
// Section Generators
// ============================================================================

/**
 * Generates overview section
 */
function generateOverviewSection(styleConfig: StyleConfig): DocSection {
  const content = `
This design system defines the visual language for the application following a **${styleConfig.styleDirection}** aesthetic.

**Target Viewport**: ${styleConfig.viewport}
**Border Style**: ${styleConfig.borderRadius}
**Shadow Style**: ${styleConfig.shadowStyle}

## Design Principles

1. **Consistency**: Use tokens from this system for all UI elements
2. **Hierarchy**: Use size and color to establish visual hierarchy
3. **Accessibility**: Ensure sufficient color contrast (WCAG AA minimum)
4. **Simplicity**: Prefer fewer variations with clear purpose
`.trim();

  return {
    id: 'overview',
    title: 'Overview',
    content
  };
}

/**
 * Generates color palette section
 */
export function generateColorSection(colors: ColorTokens): DocSection {
  const swatches: ColorSwatch[] = [
    { name: 'Primary', hex: colors.primary, usage: 'Main brand color, primary actions' },
    { name: 'Secondary', hex: colors.secondary, usage: 'Secondary actions, accents' },
    { name: 'Accent', hex: colors.accent, usage: 'Highlights, focus states' },
    { name: 'Background', hex: colors.background, usage: 'Page backgrounds' },
    { name: 'Surface', hex: colors.surface, usage: 'Cards, elevated elements' },
    { name: 'Text', hex: colors.text, usage: 'Primary text content' },
    { name: 'Text Muted', hex: colors.textMuted, usage: 'Secondary text, captions' },
    { name: 'Border', hex: colors.border, usage: 'Borders, dividers' },
    { name: 'Error', hex: colors.error, usage: 'Error states, destructive actions' },
    { name: 'Success', hex: colors.success, usage: 'Success states, confirmations' },
    { name: 'Warning', hex: colors.warning, usage: 'Warning states, cautions' }
  ];

  const swatchesMarkdown = swatches
    .map(s => formatColorSwatch(s))
    .join('\n\n');

  const cssVariables = swatches
    .map(s => `--color-${toKebabCase(s.name)}: ${s.hex};`)
    .join('\n');

  const content = `
${swatchesMarkdown}

### CSS Variables

\`\`\`css
:root {
${cssVariables.split('\n').map(line => '  ' + line).join('\n')}
}
\`\`\`

### Usage in Code

\`\`\`tsx
// Tailwind classes
<div className="bg-primary text-white">Primary Button</div>
<div className="bg-background text-foreground">Card</div>
<div className="text-muted-foreground">Secondary text</div>

// CSS custom properties
.custom-element {
  background-color: var(--color-primary);
  color: var(--color-text);
}
\`\`\`
`.trim();

  return {
    id: 'colors',
    title: 'Color Palette',
    content
  };
}

/**
 * Generates typography section
 */
export function generateTypographySection(typography: TypographyTokens): DocSection {
  const fontSizes = Object.entries(typography.fontSize)
    .map(([key, value]) => `| ${key} | ${value} |`)
    .join('\n');

  const fontWeights = Object.entries(typography.fontWeight)
    .map(([key, value]) => `| ${key} | ${value} |`)
    .join('\n');

  const lineHeights = Object.entries(typography.lineHeight)
    .map(([key, value]) => `| ${key} | ${value} |`)
    .join('\n');

  const content = `
### Font Family

**Primary**: \`${typography.fontFamily}\`
**Monospace**: \`${typography.fontFamilyMono}\`

### Font Sizes

| Name | Value |
|------|-------|
${fontSizes}

### Font Weights

| Name | Value |
|------|-------|
${fontWeights}

### Line Heights

| Name | Value |
|------|-------|
${lineHeights}

### Usage Examples

\`\`\`tsx
// Heading
<h1 className="text-4xl font-semibold leading-tight">Page Title</h1>

// Body text
<p className="text-base font-normal leading-normal">Body content</p>

// Small text
<span className="text-sm text-muted-foreground">Caption text</span>
\`\`\`

### CSS Variables

\`\`\`css
.heading {
  font-family: var(--font-family);
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-tight);
}
\`\`\`
`.trim();

  return {
    id: 'typography',
    title: 'Typography',
    content
  };
}

/**
 * Generates spacing section
 */
export function generateSpacingSection(spacing: SpacingTokens): DocSection {
  const scaleEntries = Object.entries(spacing.scale)
    .filter(([key]) => !key.includes('.'))
    .slice(0, 10)
    .map(([key, value]) => `| ${key} | ${value} |`)
    .join('\n');

  const content = `
**Base Unit**: ${spacing.base}

### Spacing Scale

| Name | Value |
|------|-------|
${scaleEntries}

### Usage Guidelines

- Use spacing tokens consistently for margins, padding, and gaps
- Prefer the scale values over arbitrary pixel values
- For layouts, use larger scale values (4+)
- For component internals, use smaller scale values (1-3)

### Usage Examples

\`\`\`tsx
// Tailwind classes
<div className="p-4 m-2 gap-3">Padded and spaced</div>
<div className="space-y-4">Vertical stack</div>

// CSS custom properties
.card {
  padding: var(--spacing-4);
  margin-bottom: var(--spacing-6);
}
\`\`\`
`.trim();

  return {
    id: 'spacing',
    title: 'Spacing',
    content
  };
}

/**
 * Generates border radius section
 */
export function generateBorderRadiusSection(borderRadius: BorderRadiusTokens): DocSection {
  const radii = Object.entries(borderRadius)
    .map(([key, value]) => `| ${key} | ${value} |`)
    .join('\n');

  const content = `
### Border Radius Scale

| Name | Value |
|------|-------|
${radii}

### Usage Guidelines

- **none**: Sharp corners for data tables, code blocks
- **sm**: Subtle rounding for inputs, badges
- **md**: Default for cards, buttons
- **lg**: Feature cards, hero sections
- **full**: Pills, avatars, circular buttons

### Usage Examples

\`\`\`tsx
// Tailwind classes
<button className="rounded-md">Button</button>
<div className="rounded-lg">Card</div>
<span className="rounded-full">Avatar</span>

// CSS custom properties
.button {
  border-radius: var(--radius-md);
}
\`\`\`
`.trim();

  return {
    id: 'border-radius',
    title: 'Border Radius',
    content
  };
}

/**
 * Generates shadow section
 */
export function generateShadowSection(shadows: ShadowTokens): DocSection {
  const shadowEntries = Object.entries(shadows)
    .map(([key, value]) => {
      const displayValue = value === 'none' ? 'none' : value.substring(0, 40) + '...';
      return `| ${key} | \`${displayValue}\` |`;
    })
    .join('\n');

  const content = `
### Shadow Scale

| Name | Value |
|------|-------|
${shadowEntries}

### Usage Guidelines

- **none**: Flat design elements, disabled states
- **sm**: Subtle elevation for dropdowns, tooltips
- **md**: Standard elevation for cards, popovers
- **lg**: Higher elevation for modals, dialogs
- **xl**: Maximum elevation for floating elements

### Usage Examples

\`\`\`tsx
// Tailwind classes
<div className="shadow-md">Standard card</div>
<div className="shadow-lg">Modal dialog</div>

// CSS custom properties
.card {
  box-shadow: var(--shadow-md);
}

.modal {
  box-shadow: var(--shadow-xl);
}
\`\`\`
`.trim();

  return {
    id: 'shadows',
    title: 'Shadows',
    content
  };
}

/**
 * Generates component guidelines section
 */
export function generateComponentGuidelines(styleConfig: StyleConfig): DocSection {
  const content = `
### General Guidelines

1. **Use shadcn/ui components** as the foundation
2. **Apply tokens consistently** via CSS variables or Tailwind
3. **Maintain visual hierarchy** through size and color
4. **Test interactions** across all supported viewports

### Button Guidelines

\`\`\`tsx
// Primary button
<Button variant="default">Primary Action</Button>

// Secondary button
<Button variant="secondary">Secondary Action</Button>

// Destructive button
<Button variant="destructive">Delete</Button>
\`\`\`

### Card Guidelines

\`\`\`tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
\`\`\`

### Form Guidelines

\`\`\`tsx
<form>
  <div className="space-y-4">
    <div className="space-y-2">
      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" />
    </div>
    <Button type="submit">Submit</Button>
  </div>
</form>
\`\`\`

### Responsive Considerations

- **Mobile** (${styleConfig.viewport === 'mobile' ? 'primary target' : 'responsive'}): Touch-friendly targets, stacked layouts
- **Desktop**: Hover states, side-by-side layouts, keyboard navigation
`.trim();

  return {
    id: 'component-guidelines',
    title: 'Component Guidelines',
    content
  };
}

// ============================================================================
// Formatting
// ============================================================================

/**
 * Formats a color swatch as markdown
 */
export function formatColorSwatch(swatch: ColorSwatch): string {
  return `### ${swatch.name}

**Hex**: \`${swatch.hex}\`
**Usage**: ${swatch.usage}`;
}

/**
 * Compiles all sections into full markdown document
 */
export function compileMarkdown(doc: DesignSystemDoc): string {
  const lines: string[] = [
    `# ${doc.title}`,
    '',
    `*Generated: ${doc.generatedAt}*`,
    '',
    '## Table of Contents',
    '',
    ...doc.sections.map(s => `- [${s.title}](#${s.id})`),
    '',
    '---',
    ''
  ];

  for (const section of doc.sections) {
    lines.push(`## ${section.title}`);
    lines.push('');
    lines.push(section.content);
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  return lines.join('\n');
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * Converts string to kebab-case
 */
function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/\s+/g, '-')
    .toLowerCase();
}

/**
 * Gets section by ID
 */
export function getSectionById(doc: DesignSystemDoc, id: string): DocSection | undefined {
  return doc.sections.find(s => s.id === id);
}

/**
 * Gets all section IDs
 */
export function getSectionIds(doc: DesignSystemDoc): string[] {
  return doc.sections.map(s => s.id);
}
