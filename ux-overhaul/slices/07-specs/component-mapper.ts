/**
 * Component Mapper for UX Overhaul Skill
 * Maps screen types to shadcn/ui component recommendations
 */

// ============================================================================
// Types
// ============================================================================

/**
 * Available shadcn/ui components
 */
export type ShadcnComponent =
  | 'Button'
  | 'Input'
  | 'Label'
  | 'Card'
  | 'CardHeader'
  | 'CardTitle'
  | 'CardDescription'
  | 'CardContent'
  | 'CardFooter'
  | 'Table'
  | 'TableHeader'
  | 'TableBody'
  | 'TableRow'
  | 'TableHead'
  | 'TableCell'
  | 'Dialog'
  | 'DialogTrigger'
  | 'DialogContent'
  | 'DialogHeader'
  | 'DialogTitle'
  | 'DialogDescription'
  | 'DialogFooter'
  | 'Sheet'
  | 'SheetTrigger'
  | 'SheetContent'
  | 'Tabs'
  | 'TabsList'
  | 'TabsTrigger'
  | 'TabsContent'
  | 'Select'
  | 'SelectTrigger'
  | 'SelectContent'
  | 'SelectItem'
  | 'Checkbox'
  | 'RadioGroup'
  | 'RadioGroupItem'
  | 'Switch'
  | 'Textarea'
  | 'Badge'
  | 'Avatar'
  | 'AvatarImage'
  | 'AvatarFallback'
  | 'Separator'
  | 'ScrollArea'
  | 'Skeleton'
  | 'Alert'
  | 'AlertTitle'
  | 'AlertDescription'
  | 'Toast'
  | 'Progress'
  | 'Tooltip'
  | 'TooltipTrigger'
  | 'TooltipContent'
  | 'Popover'
  | 'PopoverTrigger'
  | 'PopoverContent'
  | 'DropdownMenu'
  | 'DropdownMenuTrigger'
  | 'DropdownMenuContent'
  | 'DropdownMenuItem'
  | 'NavigationMenu'
  | 'Breadcrumb'
  | 'Pagination'
  | 'Calendar'
  | 'DatePicker'
  | 'Form'
  | 'FormField'
  | 'FormItem'
  | 'FormLabel'
  | 'FormControl'
  | 'FormDescription'
  | 'FormMessage'
  | 'Accordion'
  | 'AccordionItem'
  | 'AccordionTrigger'
  | 'AccordionContent';

/**
 * Screen type for component mapping
 */
export type ScreenType =
  | 'dashboard'
  | 'list'
  | 'detail'
  | 'form'
  | 'settings'
  | 'auth'
  | 'landing'
  | 'modal'
  | 'empty'
  | 'error'
  | 'generic';

/**
 * Component mapping for a screen type
 */
export interface ComponentMapping {
  screenType: ScreenType;
  recommendedComponents: ShadcnComponent[];
  layoutPattern: string;
  notes: string[];
}

/**
 * Individual component recommendation
 */
export interface ComponentRecommendation {
  component: ShadcnComponent;
  usage: string;
  props: Record<string, string>;
  importFrom: string;
}

/**
 * Component import statement
 */
export interface ComponentImport {
  components: ShadcnComponent[];
  importPath: string;
}

// ============================================================================
// Component Mappings
// ============================================================================

/**
 * Predefined component mappings for each screen type
 */
const SCREEN_TYPE_MAPPINGS: Record<ScreenType, ComponentMapping> = {
  dashboard: {
    screenType: 'dashboard',
    recommendedComponents: [
      'Card', 'CardHeader', 'CardTitle', 'CardDescription', 'CardContent',
      'Tabs', 'TabsList', 'TabsTrigger', 'TabsContent',
      'Progress', 'Badge', 'Avatar', 'AvatarImage', 'AvatarFallback',
      'ScrollArea', 'Skeleton', 'DropdownMenu', 'DropdownMenuTrigger',
      'DropdownMenuContent', 'DropdownMenuItem'
    ],
    layoutPattern: 'Grid of cards with summary metrics and action areas',
    notes: [
      'Use Card components for each metric/summary block',
      'Consider Tabs for organizing different dashboard views',
      'Use Skeleton for loading states',
      'Badge for status indicators'
    ]
  },
  list: {
    screenType: 'list',
    recommendedComponents: [
      'Table', 'TableHeader', 'TableBody', 'TableRow', 'TableHead', 'TableCell',
      'Card', 'CardContent',
      'Input', 'Button', 'Badge',
      'Pagination', 'ScrollArea', 'Skeleton',
      'DropdownMenu', 'DropdownMenuTrigger', 'DropdownMenuContent', 'DropdownMenuItem',
      'Checkbox', 'Select', 'SelectTrigger', 'SelectContent', 'SelectItem'
    ],
    layoutPattern: 'Table or card grid with search/filter bar and pagination',
    notes: [
      'Use Table for dense data, Card grid for visual items',
      'Include search Input at top',
      'Add Pagination for large datasets',
      'Use Checkbox for multi-select operations',
      'DropdownMenu for row actions'
    ]
  },
  detail: {
    screenType: 'detail',
    recommendedComponents: [
      'Card', 'CardHeader', 'CardTitle', 'CardDescription', 'CardContent', 'CardFooter',
      'Tabs', 'TabsList', 'TabsTrigger', 'TabsContent',
      'Badge', 'Avatar', 'AvatarImage', 'AvatarFallback',
      'Separator', 'Button',
      'Tooltip', 'TooltipTrigger', 'TooltipContent',
      'Breadcrumb'
    ],
    layoutPattern: 'Header with title/metadata, content sections, action footer',
    notes: [
      'Use Card to group related information',
      'Tabs for organizing different aspects of the detail',
      'Breadcrumb for navigation context',
      'Button in CardFooter for primary actions'
    ]
  },
  form: {
    screenType: 'form',
    recommendedComponents: [
      'Form', 'FormField', 'FormItem', 'FormLabel', 'FormControl', 'FormDescription', 'FormMessage',
      'Input', 'Textarea', 'Label',
      'Select', 'SelectTrigger', 'SelectContent', 'SelectItem',
      'Checkbox', 'RadioGroup', 'RadioGroupItem', 'Switch',
      'Button', 'Calendar', 'DatePicker',
      'Card', 'CardHeader', 'CardTitle', 'CardContent', 'CardFooter'
    ],
    layoutPattern: 'Vertical form fields with labels, validation messages, and submit button',
    notes: [
      'Use Form component with react-hook-form integration',
      'Group related fields in Card sections',
      'Place primary action Button in CardFooter',
      'Use FormDescription for helper text',
      'Show FormMessage for validation errors'
    ]
  },
  settings: {
    screenType: 'settings',
    recommendedComponents: [
      'Tabs', 'TabsList', 'TabsTrigger', 'TabsContent',
      'Card', 'CardHeader', 'CardTitle', 'CardDescription', 'CardContent',
      'Switch', 'Select', 'SelectTrigger', 'SelectContent', 'SelectItem',
      'Input', 'Label', 'Button',
      'Separator', 'Accordion', 'AccordionItem', 'AccordionTrigger', 'AccordionContent',
      'Alert', 'AlertTitle', 'AlertDescription'
    ],
    layoutPattern: 'Tabbed or sectioned layout with toggle switches and save buttons',
    notes: [
      'Use Tabs for major setting categories',
      'Switch for boolean settings',
      'Accordion for collapsible advanced settings',
      'Alert for important notices or warnings',
      'Save Button at bottom of each section'
    ]
  },
  auth: {
    screenType: 'auth',
    recommendedComponents: [
      'Card', 'CardHeader', 'CardTitle', 'CardDescription', 'CardContent', 'CardFooter',
      'Form', 'FormField', 'FormItem', 'FormLabel', 'FormControl', 'FormMessage',
      'Input', 'Label', 'Button', 'Checkbox',
      'Separator', 'Alert', 'AlertDescription'
    ],
    layoutPattern: 'Centered card with logo, form fields, and action buttons',
    notes: [
      'Center Card on page with max-width',
      'Include logo/branding in CardHeader',
      'Checkbox for "Remember me"',
      'Alert for error messages',
      'Separator between form and social auth buttons'
    ]
  },
  landing: {
    screenType: 'landing',
    recommendedComponents: [
      'Button', 'Card', 'CardHeader', 'CardTitle', 'CardDescription', 'CardContent',
      'NavigationMenu', 'Badge',
      'Accordion', 'AccordionItem', 'AccordionTrigger', 'AccordionContent',
      'Avatar', 'AvatarImage', 'AvatarFallback',
      'Separator'
    ],
    layoutPattern: 'Hero section, feature cards, testimonials, CTA sections',
    notes: [
      'Large hero section with primary CTA Button',
      'Feature cards in grid layout',
      'Accordion for FAQ section',
      'NavigationMenu for site navigation',
      'Badge for highlighting features'
    ]
  },
  modal: {
    screenType: 'modal',
    recommendedComponents: [
      'Dialog', 'DialogTrigger', 'DialogContent', 'DialogHeader', 'DialogTitle', 'DialogDescription', 'DialogFooter',
      'Sheet', 'SheetTrigger', 'SheetContent',
      'Button', 'Input', 'Label',
      'ScrollArea', 'Separator'
    ],
    layoutPattern: 'Overlay dialog with header, scrollable content, and footer actions',
    notes: [
      'Use Dialog for centered modals',
      'Use Sheet for side panels',
      'DialogFooter for action buttons',
      'ScrollArea if content is long',
      'Always include close button'
    ]
  },
  empty: {
    screenType: 'empty',
    recommendedComponents: [
      'Card', 'CardHeader', 'CardTitle', 'CardDescription', 'CardContent',
      'Button'
    ],
    layoutPattern: 'Centered illustration/icon with message and action button',
    notes: [
      'Center content vertically and horizontally',
      'Include helpful illustration or icon',
      'Clear message explaining the empty state',
      'Primary action Button to resolve the state'
    ]
  },
  error: {
    screenType: 'error',
    recommendedComponents: [
      'Alert', 'AlertTitle', 'AlertDescription',
      'Card', 'CardHeader', 'CardTitle', 'CardDescription', 'CardContent',
      'Button'
    ],
    layoutPattern: 'Error alert or card with message and recovery actions',
    notes: [
      'Use Alert with destructive variant',
      'Clear error message without technical jargon',
      'Provide recovery actions (retry, go back, contact support)',
      'Consider including error code for support'
    ]
  },
  generic: {
    screenType: 'generic',
    recommendedComponents: [
      'Card', 'CardHeader', 'CardTitle', 'CardContent',
      'Button', 'Input', 'Label',
      'Separator', 'ScrollArea'
    ],
    layoutPattern: 'Flexible layout with cards and common UI elements',
    notes: [
      'Use Card to organize content sections',
      'Apply consistent spacing',
      'Follow established design patterns from other screens'
    ]
  }
};

// ============================================================================
// Main Functions
// ============================================================================

/**
 * Gets component mapping for a screen type
 */
export function mapScreenTypeToComponents(screenType: ScreenType): ComponentMapping {
  return SCREEN_TYPE_MAPPINGS[screenType] || SCREEN_TYPE_MAPPINGS.generic;
}

/**
 * Gets all component mappings
 */
export function getAllComponentMappings(): ComponentMapping[] {
  return Object.values(SCREEN_TYPE_MAPPINGS);
}

/**
 * Gets detailed component recommendations for a screen type
 */
export function getComponentRecommendations(screenType: ScreenType): ComponentRecommendation[] {
  const mapping = mapScreenTypeToComponents(screenType);
  return mapping.recommendedComponents.map(component => ({
    component,
    usage: getComponentUsage(component),
    props: suggestComponentProps(component),
    importFrom: getComponentImportPath(component)
  }));
}

/**
 * Gets layout pattern for a screen type
 */
export function getLayoutPatternForScreenType(screenType: ScreenType): string {
  const mapping = mapScreenTypeToComponents(screenType);
  return mapping.layoutPattern;
}

/**
 * Generates import statements for components
 */
export function formatComponentImports(components: ShadcnComponent[]): string {
  // Group components by their import paths
  const importGroups = groupComponentsByImport(components);

  const imports: string[] = [];
  for (const [path, comps] of Object.entries(importGroups)) {
    imports.push(`import { ${comps.join(', ')} } from '${path}';`);
  }

  return imports.join('\n');
}

/**
 * Groups components by their import path
 */
export function groupComponentsByImport(components: ShadcnComponent[]): Record<string, ShadcnComponent[]> {
  const groups: Record<string, ShadcnComponent[]> = {};

  for (const component of components) {
    const path = getComponentImportPath(component);
    if (!groups[path]) {
      groups[path] = [];
    }
    groups[path].push(component);
  }

  return groups;
}

/**
 * Gets suggested props for a component
 */
export function suggestComponentProps(component: ShadcnComponent): Record<string, string> {
  const propsMap: Record<string, Record<string, string>> = {
    Button: {
      variant: '"default" | "destructive" | "outline" | "secondary" | "ghost" | "link"',
      size: '"default" | "sm" | "lg" | "icon"',
      disabled: 'boolean',
      asChild: 'boolean'
    },
    Input: {
      type: '"text" | "email" | "password" | "number" | "search"',
      placeholder: 'string',
      disabled: 'boolean',
      className: 'string'
    },
    Card: {
      className: 'string'
    },
    Badge: {
      variant: '"default" | "secondary" | "destructive" | "outline"'
    },
    Alert: {
      variant: '"default" | "destructive"'
    },
    Switch: {
      checked: 'boolean',
      onCheckedChange: '(checked: boolean) => void',
      disabled: 'boolean'
    },
    Select: {
      value: 'string',
      onValueChange: '(value: string) => void',
      disabled: 'boolean'
    },
    Checkbox: {
      checked: 'boolean',
      onCheckedChange: '(checked: boolean) => void',
      disabled: 'boolean'
    },
    Dialog: {
      open: 'boolean',
      onOpenChange: '(open: boolean) => void'
    },
    Sheet: {
      open: 'boolean',
      onOpenChange: '(open: boolean) => void'
    },
    Tabs: {
      value: 'string',
      onValueChange: '(value: string) => void',
      defaultValue: 'string'
    },
    Progress: {
      value: 'number',
      max: 'number'
    },
    Avatar: {
      className: 'string'
    },
    Skeleton: {
      className: 'string'
    },
    ScrollArea: {
      className: 'string'
    },
    Separator: {
      orientation: '"horizontal" | "vertical"'
    },
    Tooltip: {
      delayDuration: 'number'
    },
    Pagination: {
      className: 'string'
    }
  };

  return propsMap[component] || {};
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Gets the import path for a component
 */
function getComponentImportPath(component: ShadcnComponent): string {
  // Map component to its UI package path
  const componentToPath: Record<string, string> = {
    // Button
    Button: '@/components/ui/button',

    // Input/Form
    Input: '@/components/ui/input',
    Label: '@/components/ui/label',
    Textarea: '@/components/ui/textarea',
    Checkbox: '@/components/ui/checkbox',
    RadioGroup: '@/components/ui/radio-group',
    RadioGroupItem: '@/components/ui/radio-group',
    Switch: '@/components/ui/switch',
    Select: '@/components/ui/select',
    SelectTrigger: '@/components/ui/select',
    SelectContent: '@/components/ui/select',
    SelectItem: '@/components/ui/select',

    // Card
    Card: '@/components/ui/card',
    CardHeader: '@/components/ui/card',
    CardTitle: '@/components/ui/card',
    CardDescription: '@/components/ui/card',
    CardContent: '@/components/ui/card',
    CardFooter: '@/components/ui/card',

    // Table
    Table: '@/components/ui/table',
    TableHeader: '@/components/ui/table',
    TableBody: '@/components/ui/table',
    TableRow: '@/components/ui/table',
    TableHead: '@/components/ui/table',
    TableCell: '@/components/ui/table',

    // Dialog
    Dialog: '@/components/ui/dialog',
    DialogTrigger: '@/components/ui/dialog',
    DialogContent: '@/components/ui/dialog',
    DialogHeader: '@/components/ui/dialog',
    DialogTitle: '@/components/ui/dialog',
    DialogDescription: '@/components/ui/dialog',
    DialogFooter: '@/components/ui/dialog',

    // Sheet
    Sheet: '@/components/ui/sheet',
    SheetTrigger: '@/components/ui/sheet',
    SheetContent: '@/components/ui/sheet',

    // Tabs
    Tabs: '@/components/ui/tabs',
    TabsList: '@/components/ui/tabs',
    TabsTrigger: '@/components/ui/tabs',
    TabsContent: '@/components/ui/tabs',

    // Other components
    Badge: '@/components/ui/badge',
    Avatar: '@/components/ui/avatar',
    AvatarImage: '@/components/ui/avatar',
    AvatarFallback: '@/components/ui/avatar',
    Separator: '@/components/ui/separator',
    ScrollArea: '@/components/ui/scroll-area',
    Skeleton: '@/components/ui/skeleton',
    Alert: '@/components/ui/alert',
    AlertTitle: '@/components/ui/alert',
    AlertDescription: '@/components/ui/alert',
    Toast: '@/components/ui/toast',
    Progress: '@/components/ui/progress',
    Tooltip: '@/components/ui/tooltip',
    TooltipTrigger: '@/components/ui/tooltip',
    TooltipContent: '@/components/ui/tooltip',
    Popover: '@/components/ui/popover',
    PopoverTrigger: '@/components/ui/popover',
    PopoverContent: '@/components/ui/popover',
    DropdownMenu: '@/components/ui/dropdown-menu',
    DropdownMenuTrigger: '@/components/ui/dropdown-menu',
    DropdownMenuContent: '@/components/ui/dropdown-menu',
    DropdownMenuItem: '@/components/ui/dropdown-menu',
    NavigationMenu: '@/components/ui/navigation-menu',
    Breadcrumb: '@/components/ui/breadcrumb',
    Pagination: '@/components/ui/pagination',
    Calendar: '@/components/ui/calendar',
    DatePicker: '@/components/ui/date-picker',
    Form: '@/components/ui/form',
    FormField: '@/components/ui/form',
    FormItem: '@/components/ui/form',
    FormLabel: '@/components/ui/form',
    FormControl: '@/components/ui/form',
    FormDescription: '@/components/ui/form',
    FormMessage: '@/components/ui/form',
    Accordion: '@/components/ui/accordion',
    AccordionItem: '@/components/ui/accordion',
    AccordionTrigger: '@/components/ui/accordion',
    AccordionContent: '@/components/ui/accordion'
  };

  return componentToPath[component] || '@/components/ui/' + toKebabCase(component);
}

/**
 * Gets usage description for a component
 */
function getComponentUsage(component: ShadcnComponent): string {
  const usageMap: Record<string, string> = {
    Button: 'Primary and secondary actions, form submissions, navigation triggers',
    Input: 'Text input fields for forms and search',
    Label: 'Form field labels with accessibility support',
    Textarea: 'Multi-line text input for longer content',
    Card: 'Container for grouped content with consistent styling',
    CardHeader: 'Header section of a card containing title and description',
    CardTitle: 'Main heading within a card header',
    CardDescription: 'Secondary text within a card header',
    CardContent: 'Main content area of a card',
    CardFooter: 'Footer section of a card, typically for actions',
    Table: 'Data tables with sortable columns and row actions',
    TableHeader: 'Container for table column headers',
    TableBody: 'Container for table data rows',
    TableRow: 'Individual row in a table',
    TableHead: 'Header cell in a table',
    TableCell: 'Data cell in a table',
    Dialog: 'Modal dialogs for focused interactions',
    DialogTrigger: 'Element that triggers the dialog to open',
    DialogContent: 'Container for dialog content',
    DialogHeader: 'Header section of a dialog',
    DialogTitle: 'Title of a dialog',
    DialogDescription: 'Description text in a dialog',
    DialogFooter: 'Footer section with action buttons',
    Sheet: 'Side panel overlay for secondary navigation or details',
    SheetTrigger: 'Element that triggers the sheet to open',
    SheetContent: 'Container for sheet content',
    Tabs: 'Tabbed interface for organizing content sections',
    TabsList: 'Container for tab triggers',
    TabsTrigger: 'Individual tab button',
    TabsContent: 'Content panel for each tab',
    Select: 'Dropdown selection for predefined options',
    SelectTrigger: 'Element that triggers the select dropdown',
    SelectContent: 'Container for select options',
    SelectItem: 'Individual option in a select',
    Checkbox: 'Boolean selection for forms and filters',
    RadioGroup: 'Single selection from multiple options',
    RadioGroupItem: 'Individual radio option',
    Switch: 'Toggle control for on/off states',
    Badge: 'Status indicators and labels',
    Avatar: 'User profile images with fallback',
    AvatarImage: 'Image element within an avatar',
    AvatarFallback: 'Fallback content when image fails to load',
    Separator: 'Visual divider between content sections',
    ScrollArea: 'Scrollable container with custom scrollbars',
    Skeleton: 'Loading placeholder for content',
    Alert: 'Informational or warning messages',
    AlertTitle: 'Title of an alert',
    AlertDescription: 'Description text in an alert',
    Toast: 'Temporary notification messages',
    Progress: 'Progress indicator for loading or completion',
    Tooltip: 'Contextual information on hover',
    TooltipTrigger: 'Element that triggers the tooltip',
    TooltipContent: 'Content displayed in the tooltip',
    Popover: 'Floating content triggered by click',
    PopoverTrigger: 'Element that triggers the popover',
    PopoverContent: 'Content displayed in the popover',
    DropdownMenu: 'Contextual menu with multiple actions',
    DropdownMenuTrigger: 'Element that triggers the dropdown',
    DropdownMenuContent: 'Container for dropdown items',
    DropdownMenuItem: 'Individual action in a dropdown',
    NavigationMenu: 'Primary navigation component',
    Breadcrumb: 'Navigation trail showing current location',
    Pagination: 'Page navigation for lists and tables',
    Calendar: 'Date selection calendar',
    DatePicker: 'Date input with calendar popup',
    Form: 'Form container with validation support',
    FormField: 'Individual form field wrapper',
    FormItem: 'Container for form field elements',
    FormLabel: 'Label for a form field',
    FormControl: 'Control element wrapper',
    FormDescription: 'Help text for a form field',
    FormMessage: 'Validation error message',
    Accordion: 'Collapsible content sections',
    AccordionItem: 'Individual accordion section',
    AccordionTrigger: 'Element that toggles accordion section',
    AccordionContent: 'Content within an accordion section'
  };

  return usageMap[component] || `${component} component from shadcn/ui`;
}

/**
 * Converts string to kebab-case
 */
function toKebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Gets unique components from multiple screen types
 */
export function getUniqueComponentsForScreenTypes(screenTypes: ScreenType[]): ShadcnComponent[] {
  const componentSet = new Set<ShadcnComponent>();

  for (const screenType of screenTypes) {
    const mapping = mapScreenTypeToComponents(screenType);
    for (const component of mapping.recommendedComponents) {
      componentSet.add(component);
    }
  }

  return Array.from(componentSet);
}

/**
 * Gets all available screen types
 */
export function getAllScreenTypes(): ScreenType[] {
  return Object.keys(SCREEN_TYPE_MAPPINGS) as ScreenType[];
}

/**
 * Checks if a component is recommended for a screen type
 */
export function isComponentRecommendedForScreen(
  component: ShadcnComponent,
  screenType: ScreenType
): boolean {
  const mapping = mapScreenTypeToComponents(screenType);
  return mapping.recommendedComponents.includes(component);
}

/**
 * Gets screen types that use a specific component
 */
export function getScreenTypesUsingComponent(component: ShadcnComponent): ScreenType[] {
  return getAllScreenTypes().filter(screenType =>
    isComponentRecommendedForScreen(component, screenType)
  );
}
