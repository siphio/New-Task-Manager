/**
 * Screen Spec Generator for UX Overhaul Skill
 * Generates per-screen implementation specifications
 */

import { PropagatedScreen } from '../04-propagation/propagation';
import { ScreenStates, StatesReport, GeneratedState } from '../05-states/states';
import { DesignTokens } from './token-extractor';
import { ComponentMapping, mapScreenTypeToComponents, ScreenType as ComponentScreenType } from './component-mapper';
import { AppUnderstanding } from '../01-capture/capture';
import { ImprovementPlan, ScreenImprovement } from '../02-audit/audit';

// ============================================================================
// Types
// ============================================================================

/**
 * Complete screen implementation specification
 */
export interface ScreenSpec {
  screenId: string;
  screenName: string;
  screenType: string;
  imagePath: string;
  layout: LayoutSpec;
  components: ComponentSpec[];
  states: StateSpec[];
  implementationNotes: string[];
  uxRequirements: string[];
  estimatedComplexity: 'low' | 'medium' | 'high';
}

/**
 * Layout specification
 */
export interface LayoutSpec {
  structure: string;
  mainAreas: string[];
  navigation: string;
  responsiveNotes: string[];
}

/**
 * Component specification
 */
export interface ComponentSpec {
  id: string;
  name: string;
  shadcnComponent: string;
  props: Record<string, string>;
  tokens: Record<string, string>;
  notes: string[];
}

/**
 * State specification
 */
export interface StateSpec {
  stateType: string;
  imagePath: string;
  description: string;
  triggerConditions: string[];
  components: string[];
}

// ============================================================================
// Layout Templates
// ============================================================================

/**
 * Layout templates by screen type
 */
const LAYOUT_TEMPLATES: Record<string, LayoutSpec> = {
  dashboard: {
    structure: 'header + sidebar + main content grid',
    mainAreas: ['header', 'sidebar navigation', 'metrics grid', 'charts area', 'activity feed'],
    navigation: 'sidebar with icon menu',
    responsiveNotes: ['Stack sidebar below header on mobile', 'Collapse to bottom navigation on mobile']
  },
  list: {
    structure: 'header + search/filter bar + scrollable list',
    mainAreas: ['header', 'search bar', 'filter controls', 'list items', 'pagination or infinite scroll'],
    navigation: 'back button or breadcrumbs',
    responsiveNotes: ['Full-width list items on mobile', 'Horizontal scroll for table views']
  },
  detail: {
    structure: 'header + hero section + content sections',
    mainAreas: ['header', 'hero/title area', 'main content', 'metadata sidebar', 'action buttons'],
    navigation: 'back button',
    responsiveNotes: ['Stack sidebar content below main on mobile']
  },
  form: {
    structure: 'header + form sections + action footer',
    mainAreas: ['header', 'form fields grouped by section', 'validation messages', 'submit/cancel buttons'],
    navigation: 'cancel/back button',
    responsiveNotes: ['Full-width inputs on mobile', 'Fixed footer for actions']
  },
  settings: {
    structure: 'header + settings categories + settings list',
    mainAreas: ['header', 'category navigation', 'settings sections', 'toggle controls'],
    navigation: 'back button or sidebar tabs',
    responsiveNotes: ['Full-width settings rows on mobile']
  },
  auth: {
    structure: 'centered card layout',
    mainAreas: ['logo/brand', 'form fields', 'submit button', 'secondary links'],
    navigation: 'minimal - links only',
    responsiveNotes: ['Full-screen card on mobile', 'Centered with max-width on desktop']
  },
  landing: {
    structure: 'hero + feature sections + CTA',
    mainAreas: ['navigation header', 'hero section', 'feature grid', 'testimonials', 'footer CTA'],
    navigation: 'top navigation bar',
    responsiveNotes: ['Stack sections vertically on mobile', 'Hamburger menu on mobile']
  },
  modal: {
    structure: 'overlay + centered dialog',
    mainAreas: ['dialog header', 'content area', 'action buttons'],
    navigation: 'close button',
    responsiveNotes: ['Full-screen sheet on mobile', 'Max-height with scroll on desktop']
  },
  empty: {
    structure: 'centered illustration + message',
    mainAreas: ['illustration', 'title', 'description', 'action button'],
    navigation: 'inherit from parent',
    responsiveNotes: ['Scale illustration appropriately']
  },
  error: {
    structure: 'centered error display',
    mainAreas: ['error icon', 'error title', 'error message', 'retry/home button'],
    navigation: 'home/retry buttons',
    responsiveNotes: ['Full-width on mobile']
  },
  generic: {
    structure: 'header + main content + footer',
    mainAreas: ['header', 'main content area', 'footer'],
    navigation: 'standard navigation',
    responsiveNotes: ['Responsive layout']
  }
};

// ============================================================================
// Main Generation
// ============================================================================

/**
 * Generates screen specification
 */
export function generateScreenSpec(
  screen: PropagatedScreen,
  tokens: DesignTokens,
  componentMappings: ComponentMapping[],
  statesReport?: StatesReport,
  improvementPlan?: ImprovementPlan
): ScreenSpec {
  const screenType = (screen.screenType || 'generic') as ComponentScreenType;
  const layout = inferLayoutSpec(screen);
  const mapping = componentMappings.find(m => m.screenType === screenType) ||
    mapScreenTypeToComponents(screenType);

  const components = generateComponentSpecs(screen, mapping, tokens);
  const states = statesReport ? generateStateSpecs(screen.screenId, statesReport) : [];
  const uxRequirements = improvementPlan ? extractUxRequirements(screen.screenId, improvementPlan) : [];
  const implementationNotes = generateImplementationNotes(screenType, layout);

  const spec: ScreenSpec = {
    screenId: screen.screenId,
    screenName: screen.screenName,
    screenType,
    imagePath: screen.propagatedPath,
    layout,
    components,
    states,
    implementationNotes,
    uxRequirements,
    estimatedComplexity: 'medium' // Placeholder
  };

  // Calculate actual complexity
  spec.estimatedComplexity = estimateComplexity(spec);

  return spec;
}

/**
 * Generates specs for all screens
 */
export function generateAllScreenSpecs(
  screens: PropagatedScreen[],
  tokens: DesignTokens,
  componentMappings: ComponentMapping[],
  statesReport?: StatesReport,
  improvementPlan?: ImprovementPlan
): ScreenSpec[] {
  return screens.map(screen =>
    generateScreenSpec(screen, tokens, componentMappings, statesReport, improvementPlan)
  );
}

// ============================================================================
// Layout Inference
// ============================================================================

/**
 * Infers layout specification from screen
 */
export function inferLayoutSpec(screen: PropagatedScreen): LayoutSpec {
  const screenType = screen.screenType || 'generic';
  const template = LAYOUT_TEMPLATES[screenType] || LAYOUT_TEMPLATES.generic;

  return {
    structure: template.structure,
    mainAreas: [...template.mainAreas],
    navigation: template.navigation,
    responsiveNotes: [...template.responsiveNotes]
  };
}

// ============================================================================
// Component Specs
// ============================================================================

/**
 * Generates component specifications
 */
export function generateComponentSpecs(
  screen: PropagatedScreen,
  mapping: ComponentMapping,
  tokens: DesignTokens
): ComponentSpec[] {
  const specs: ComponentSpec[] = [];

  for (const component of mapping.recommendedComponents) {
    const spec: ComponentSpec = {
      id: `${screen.screenId}-${component.toLowerCase()}`,
      name: component,
      shadcnComponent: component,
      props: getDefaultProps(component),
      tokens: getRelevantTokens(component, tokens),
      notes: getComponentNotes(component, screen.screenType || 'generic')
    };
    specs.push(spec);
  }

  return specs;
}

/**
 * Gets default props for a component
 */
function getDefaultProps(component: string): Record<string, string> {
  const propsMap: Record<string, Record<string, string>> = {
    Button: { variant: 'default', size: 'default' },
    Card: { className: 'shadow-md' },
    Input: { type: 'text' },
    Label: { htmlFor: 'input-id' },
    Table: { className: 'w-full' },
    Dialog: { modal: 'true' },
    Sheet: { side: 'right' },
    Tabs: { defaultValue: 'tab-1' },
    Avatar: { size: 'md' },
    Badge: { variant: 'default' },
    Checkbox: { id: 'checkbox-id' },
    RadioGroup: { defaultValue: 'option-1' },
    Select: { defaultValue: '' },
    Switch: { id: 'switch-id' },
    Skeleton: { className: 'h-4 w-full' },
    Toast: { variant: 'default' },
    Alert: { variant: 'default' },
    Progress: { value: '0' },
    Separator: { orientation: 'horizontal' },
    ScrollArea: { className: 'h-full' },
    Tooltip: { delayDuration: '0' },
    NavigationMenu: { className: 'w-full' },
    Menubar: { className: 'w-full' },
    DropdownMenu: { align: 'start' },
    Form: { className: 'space-y-4' },
    Calendar: { mode: 'single' },
    Command: { className: 'w-full' },
    Popover: { align: 'start' }
  };

  return propsMap[component] || {};
}

/**
 * Gets relevant tokens for a component
 */
function getRelevantTokens(component: string, tokens: DesignTokens): Record<string, string> {
  const baseTokens: Record<string, string> = {
    'border-radius': tokens.borderRadius.md,
    'font-family': tokens.typography.fontFamily
  };

  const componentTokens: Record<string, Record<string, string>> = {
    Button: {
      ...baseTokens,
      'background': tokens.colors.primary,
      'color': '#FFFFFF',
      'hover-background': tokens.colors.secondary
    },
    Card: {
      ...baseTokens,
      'background': tokens.colors.surface,
      'border': tokens.colors.border,
      'shadow': tokens.shadows.md
    },
    Input: {
      ...baseTokens,
      'border': tokens.colors.border,
      'focus-ring': tokens.colors.primary
    },
    Alert: {
      ...baseTokens,
      'background': tokens.colors.surface,
      'border': tokens.colors.border
    }
  };

  return componentTokens[component] || baseTokens;
}

/**
 * Gets notes for a component
 */
function getComponentNotes(component: string, screenType: string): string[] {
  const notes: string[] = [];

  if (component === 'Button' && screenType === 'form') {
    notes.push('Use variant="default" for primary submit action');
    notes.push('Use variant="outline" for secondary cancel action');
  }

  if (component === 'Skeleton' && screenType === 'list') {
    notes.push('Match skeleton dimensions to actual list item layout');
    notes.push('Use animation for loading indication');
  }

  if (component === 'Form') {
    notes.push('Implement client-side validation');
    notes.push('Show inline error messages');
  }

  return notes;
}

// ============================================================================
// State Specs
// ============================================================================

/**
 * Generates state specifications from states report
 */
export function generateStateSpecs(screenId: string, statesReport: StatesReport): StateSpec[] {
  const screenStates = statesReport.screens.find(s => s.screenId === screenId);
  if (!screenStates) return [];

  return screenStates.states.map(state => ({
    stateType: state.stateType,
    imagePath: state.statePath,
    description: getStateDescription(state.stateType),
    triggerConditions: getStateTriggers(state.stateType),
    components: getStateComponents(state.stateType)
  }));
}

/**
 * Gets description for a state type
 */
function getStateDescription(stateType: string): string {
  const descriptions: Record<string, string> = {
    loading: 'Display while data is being fetched. Use skeleton elements to preserve layout.',
    empty: 'Display when no data is available. Include helpful message and action.',
    error: 'Display when an error occurs. Show error message and recovery options.',
    success: 'Display after successful action. Show confirmation and next steps.'
  };
  return descriptions[stateType] || 'State variant';
}

/**
 * Gets trigger conditions for a state
 */
function getStateTriggers(stateType: string): string[] {
  const triggers: Record<string, string[]> = {
    loading: ['Initial page load', 'Data refetch', 'Form submission'],
    empty: ['No data returned from API', 'Empty search results', 'No items created yet'],
    error: ['API request failed', 'Network error', 'Validation error'],
    success: ['Form submitted successfully', 'Item created/updated', 'Action completed']
  };
  return triggers[stateType] || [];
}

/**
 * Gets components used in a state
 */
function getStateComponents(stateType: string): string[] {
  const components: Record<string, string[]> = {
    loading: ['Skeleton', 'Progress'],
    empty: ['Card', 'Button'],
    error: ['Alert', 'Button'],
    success: ['Alert', 'Button', 'Badge']
  };
  return components[stateType] || [];
}

// ============================================================================
// UX Requirements
// ============================================================================

/**
 * Extracts UX requirements for a screen
 */
export function extractUxRequirements(
  screenId: string,
  improvementPlan: ImprovementPlan
): string[] {
  const requirements: string[] = [];

  // Add global improvements
  for (const improvement of improvementPlan.globalImprovements.slice(0, 3)) {
    requirements.push(improvement.promptText);
  }

  // Add screen-specific improvements
  const screenImprovement = improvementPlan.screenImprovements.find(
    s => s.screenId === screenId
  );

  if (screenImprovement) {
    for (const improvement of screenImprovement.improvements.slice(0, 3)) {
      if (!requirements.includes(improvement.promptText)) {
        requirements.push(improvement.promptText);
      }
    }
  }

  return requirements;
}

// ============================================================================
// Complexity Estimation
// ============================================================================

/**
 * Estimates implementation complexity
 */
export function estimateComplexity(spec: ScreenSpec): 'low' | 'medium' | 'high' {
  let score = 0;

  // Factor in number of components
  score += spec.components.length * 2;

  // Factor in number of states
  score += spec.states.length * 3;

  // Factor in UX requirements
  score += spec.uxRequirements.length * 2;

  // Factor in screen type complexity
  const complexScreenTypes = ['dashboard', 'form', 'list'];
  if (complexScreenTypes.includes(spec.screenType)) {
    score += 5;
  }

  // Determine complexity level
  if (score <= 10) return 'low';
  if (score <= 20) return 'medium';
  return 'high';
}

// ============================================================================
// Implementation Notes
// ============================================================================

/**
 * Generates implementation notes
 */
function generateImplementationNotes(screenType: string, layout: LayoutSpec): string[] {
  const notes: string[] = [];

  notes.push(`Implement ${layout.structure}`);

  if (layout.navigation !== 'minimal - links only') {
    notes.push(`Include ${layout.navigation}`);
  }

  // Add screen-type specific notes
  const typeNotes: Record<string, string[]> = {
    dashboard: ['Implement data fetching for metrics', 'Add refresh functionality'],
    list: ['Implement pagination or infinite scroll', 'Add search/filter functionality'],
    form: ['Implement form validation', 'Handle submission states'],
    auth: ['Implement secure form handling', 'Handle authentication errors'],
    detail: ['Implement data fetching', 'Handle loading and error states']
  };

  if (typeNotes[screenType]) {
    notes.push(...typeNotes[screenType]);
  }

  // Add responsive notes
  if (layout.responsiveNotes.length > 0) {
    notes.push(`Responsive: ${layout.responsiveNotes[0]}`);
  }

  return notes;
}

// ============================================================================
// Markdown Formatting
// ============================================================================

/**
 * Formats screen spec as markdown
 */
export function formatScreenSpecAsMarkdown(spec: ScreenSpec, _tokens?: DesignTokens): string {
  const lines: string[] = [
    `# ${spec.screenName}`,
    '',
    `**Screen ID**: ${spec.screenId}`,
    `**Type**: ${spec.screenType}`,
    `**Complexity**: ${spec.estimatedComplexity}`,
    `**Reference Image**: \`${spec.imagePath}\``,
    '',
    '## Layout',
    '',
    `**Structure**: ${spec.layout.structure}`,
    '',
    '### Main Areas',
    '',
    ...spec.layout.mainAreas.map(area => `- ${area}`),
    '',
    `**Navigation**: ${spec.layout.navigation}`,
    '',
    '### Responsive Notes',
    '',
    ...spec.layout.responsiveNotes.map(note => `- ${note}`),
    '',
    '## Components',
    ''
  ];

  for (const component of spec.components) {
    lines.push(`### ${component.name}`);
    lines.push('');
    lines.push(`**shadcn/ui**: \`${component.shadcnComponent}\``);
    lines.push('');
    if (Object.keys(component.props).length > 0) {
      lines.push('**Props**:');
      lines.push('```tsx');
      lines.push(`<${component.shadcnComponent}`);
      for (const [key, value] of Object.entries(component.props)) {
        lines.push(`  ${key}="${value}"`);
      }
      lines.push('/>');
      lines.push('```');
      lines.push('');
    }
    if (component.notes.length > 0) {
      lines.push('**Notes**:');
      for (const note of component.notes) {
        lines.push(`- ${note}`);
      }
      lines.push('');
    }
  }

  if (spec.states.length > 0) {
    lines.push('## States');
    lines.push('');
    for (const state of spec.states) {
      lines.push(`### ${state.stateType}`);
      lines.push('');
      lines.push(state.description);
      lines.push('');
      if (state.imagePath) {
        lines.push(`**Reference**: \`${state.imagePath}\``);
        lines.push('');
      }
      lines.push('**Triggers**:');
      for (const trigger of state.triggerConditions) {
        lines.push(`- ${trigger}`);
      }
      lines.push('');
      lines.push('**Components**: ' + state.components.join(', '));
      lines.push('');
    }
  }

  if (spec.uxRequirements.length > 0) {
    lines.push('## UX Requirements');
    lines.push('');
    for (const req of spec.uxRequirements) {
      lines.push(`- ${req}`);
    }
    lines.push('');
  }

  if (spec.implementationNotes.length > 0) {
    lines.push('## Implementation Notes');
    lines.push('');
    for (const note of spec.implementationNotes) {
      lines.push(`- ${note}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}
