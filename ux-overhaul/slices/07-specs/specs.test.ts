/**
 * Tests for Specs Phase (Developer Handoff)
 */

import {
  createSpecsConfig,
  buildSpecsReport,
  generateSpecsSummary,
  getSpecsSummary,
  getSpecsStatusLine,
  SpecsSummary
} from './specs';

import {
  DesignTokens,
  ColorTokens,
  extractDesignTokens,
  extractColorTokens,
  formatTokensAsCSS,
  formatTokensAsJSON,
  isValidHexColor,
  getColorTokenKeys,
  mapBorderRadius,
  mapShadowTokens
} from './token-extractor';

import {
  generateDesignSystemDoc,
  generateColorSection,
  DesignSystemDoc
} from './doc-generator';

import {
  ScreenSpec,
  inferLayoutSpec,
  estimateComplexity,
  formatScreenSpecAsMarkdown
} from './screen-spec-generator';

import {
  mapScreenTypeToComponents,
  getAllComponentMappings,
  formatComponentImports,
  suggestComponentProps,
  getAllScreenTypes,
  ScreenType
} from './component-mapper';

import {
  calculateImplementationOrder,
  formatImplementationChecklist,
  ImplementationOrder,
  ImplementationPhase
} from './implementation-order';

import {
  validateSpecs,
  validateDesignTokens,
  calculateCompletenessScore,
  SpecsReport,
  SpecsValidationResult
} from './validators/specs-validator';

// ============================================================================
// Config Tests
// ============================================================================

describe('createSpecsConfig', () => {
  it('should create config with defaults', () => {
    const config = createSpecsConfig('./output');
    expect(config.outputDir).toBe('./output');
    expect(config.viewport).toBe('mobile');
    expect(config.outputFormats).toEqual(['json', 'css']);
    expect(config.generateMarkdown).toBe(true);
    expect(config.generateChecklist).toBe(true);
  });

  it('should create config with custom options', () => {
    const config = createSpecsConfig('./output', {
      viewport: 'desktop',
      outputFormats: ['json', 'css', 'tailwind'],
      generateMarkdown: false
    });
    expect(config.viewport).toBe('desktop');
    expect(config.outputFormats).toContain('tailwind');
    expect(config.generateMarkdown).toBe(false);
  });

  it('should create config with partial options', () => {
    const config = createSpecsConfig('./output', {
      viewport: 'tablet'
    });
    expect(config.viewport).toBe('tablet');
    expect(config.outputFormats).toEqual(['json', 'css']); // Default
    expect(config.generateMarkdown).toBe(true); // Default
  });
});

// ============================================================================
// Token Extraction Tests
// ============================================================================

describe('extractColorTokens', () => {
  it('should extract all color tokens from palette', () => {
    const palette = createMockColorPalette();
    const tokens = extractColorTokens(palette);

    expect(tokens.primary).toBe('#3B82F6');
    expect(tokens.secondary).toBe('#6366F1');
    expect(tokens.accent).toBe('#10B981');
    expect(tokens.background).toBe('#FFFFFF');
    expect(tokens.text).toBe('#111827');
    expect(tokens.error).toBe('#EF4444');
    expect(tokens.success).toBe('#10B981');
    expect(tokens.warning).toBe('#F59E0B');
  });

  it('should use defaults for missing colors', () => {
    const palette = {
      primary: '#FF0000'
    };
    const tokens = extractColorTokens(palette as any);

    expect(tokens.primary).toBe('#FF0000');
    expect(tokens.background).toBe('#FFFFFF'); // Default
    expect(tokens.text).toBe('#111827'); // Default
  });
});

describe('mapBorderRadius', () => {
  it('should map none style correctly', () => {
    const radii = mapBorderRadius('none');
    expect(radii.none).toBe('0px');
    expect(radii.sm).toBe('0px');
    expect(radii.md).toBe('0px');
    expect(radii.lg).toBe('0px');
  });

  it('should map rounded style correctly', () => {
    const radii = mapBorderRadius('rounded');
    expect(radii.none).toBe('0px');
    expect(radii.sm).toBe('4px');
    expect(radii.md).toBe('8px');
    expect(radii.lg).toBe('12px');
    expect(radii.full).toBe('9999px');
  });

  it('should map pill style correctly', () => {
    const radii = mapBorderRadius('pill');
    expect(radii.sm).toBe('8px');
    expect(radii.md).toBe('16px');
    expect(radii.lg).toBe('24px');
  });
});

describe('mapShadowTokens', () => {
  it('should map none style to no shadows', () => {
    const shadows = mapShadowTokens('none');
    expect(shadows.none).toBe('none');
    expect(shadows.sm).toBe('none');
    expect(shadows.md).toBe('none');
  });

  it('should map medium style with shadows', () => {
    const shadows = mapShadowTokens('medium');
    expect(shadows.none).toBe('none');
    expect(shadows.sm).toContain('rgb');
    expect(shadows.md).toContain('rgb');
    expect(shadows.lg).toContain('rgb');
  });
});

describe('isValidHexColor', () => {
  it('should validate correct hex colors', () => {
    expect(isValidHexColor('#3B82F6')).toBe(true);
    expect(isValidHexColor('#ffffff')).toBe(true);
    expect(isValidHexColor('#000000')).toBe(true);
  });

  it('should reject invalid hex colors', () => {
    expect(isValidHexColor('3B82F6')).toBe(false);
    expect(isValidHexColor('#3B82F')).toBe(false);
    expect(isValidHexColor('#GGGGGG')).toBe(false);
    expect(isValidHexColor('rgb(0,0,0)')).toBe(false);
  });
});

describe('getColorTokenKeys', () => {
  it('should return all expected color keys', () => {
    const keys = getColorTokenKeys();
    expect(keys).toContain('primary');
    expect(keys).toContain('secondary');
    expect(keys).toContain('accent');
    expect(keys).toContain('background');
    expect(keys).toContain('text');
    expect(keys).toContain('error');
    expect(keys).toContain('success');
    expect(keys).toContain('warning');
  });
});

describe('formatTokensAsCSS', () => {
  it('should format tokens as CSS custom properties', () => {
    const tokens = createMockDesignTokens();
    const css = formatTokensAsCSS(tokens);

    expect(css).toContain(':root {');
    expect(css).toContain('--color-primary:');
    expect(css).toContain('--font-family:');
    expect(css).toContain('--spacing-base:');
    expect(css).toContain('--radius-md:');
    expect(css).toContain('--shadow-md:');
    expect(css).toContain('}');
  });
});

describe('formatTokensAsJSON', () => {
  it('should format tokens as valid JSON', () => {
    const tokens = createMockDesignTokens();
    const json = formatTokensAsJSON(tokens);
    const parsed = JSON.parse(json);

    expect(parsed.colors).toBeDefined();
    expect(parsed.typography).toBeDefined();
    expect(parsed.spacing).toBeDefined();
    expect(parsed.borderRadius).toBeDefined();
    expect(parsed.shadows).toBeDefined();
  });
});

// ============================================================================
// Documentation Tests
// ============================================================================

describe('generateDesignSystemDoc', () => {
  it('should generate complete documentation', () => {
    const tokens = createMockDesignTokens();
    const styleConfig = createMockStyleConfig();
    const doc = generateDesignSystemDoc(tokens, styleConfig);

    expect(doc.title).toContain('Modern');
    expect(doc.generatedAt).toBeDefined();
    expect(doc.sections.length).toBeGreaterThan(0);
    expect(doc.fullMarkdown).toContain('#');
  });

  it('should include all expected sections', () => {
    const tokens = createMockDesignTokens();
    const styleConfig = createMockStyleConfig();
    const doc = generateDesignSystemDoc(tokens, styleConfig);

    const sectionIds = doc.sections.map(s => s.id);
    expect(sectionIds).toContain('overview');
    expect(sectionIds).toContain('colors');
    expect(sectionIds).toContain('typography');
    expect(sectionIds).toContain('spacing');
  });
});

describe('generateColorSection', () => {
  it('should generate color palette section', () => {
    const colors = createMockColorTokens();
    const section = generateColorSection(colors);

    expect(section.id).toBe('colors');
    expect(section.title).toBe('Color Palette');
    expect(section.content).toContain('#3B82F6');
    expect(section.content).toContain('Primary');
    expect(section.content).toContain('CSS Variables');
  });
});

// ============================================================================
// Screen Spec Tests
// ============================================================================

describe('inferLayoutSpec', () => {
  it('should infer dashboard layout', () => {
    const mockScreen = createMockPropagatedScreen('dashboard');
    const layout = inferLayoutSpec(mockScreen);
    expect(layout.structure).toContain('grid');
    expect(layout.mainAreas.length).toBeGreaterThan(0);
    expect(layout.responsiveNotes).toBeDefined();
  });

  it('should infer list layout', () => {
    const mockScreen = createMockPropagatedScreen('list');
    const layout = inferLayoutSpec(mockScreen);
    expect(layout.structure.toLowerCase()).toContain('list');
    expect(layout.navigation).toBeDefined();
  });

  it('should infer form layout', () => {
    const mockScreen = createMockPropagatedScreen('form');
    const layout = inferLayoutSpec(mockScreen);
    expect(layout.structure.toLowerCase()).toContain('form');
  });

  it('should handle unknown screen type', () => {
    const mockScreen = createMockPropagatedScreen('unknown' as any);
    const layout = inferLayoutSpec(mockScreen);
    expect(layout.structure).toBeDefined();
    expect(layout.mainAreas.length).toBeGreaterThan(0);
  });
});

describe('estimateComplexity', () => {
  it('should estimate low complexity for simple screens', () => {
    const spec = createMockScreenSpec('dashboard', 2);
    const complexity = estimateComplexity(spec);
    expect(complexity).toBe('low');
  });

  it('should estimate medium complexity for moderate screens', () => {
    const spec = createMockScreenSpec('list', 5);
    const complexity = estimateComplexity(spec);
    expect(complexity).toBe('medium');
  });

  it('should estimate high complexity for complex screens', () => {
    const spec = createMockScreenSpec('form', 10);
    spec.states = [
      { stateType: 'loading', description: 'Loading state', imagePath: '', triggerConditions: [], components: [] },
      { stateType: 'error', description: 'Error state', imagePath: '', triggerConditions: [], components: [] },
      { stateType: 'empty', description: 'Empty state', imagePath: '', triggerConditions: [], components: [] }
    ];
    const complexity = estimateComplexity(spec);
    expect(complexity).toBe('high');
  });
});

describe('formatScreenSpecAsMarkdown', () => {
  it('should format spec as markdown', () => {
    const spec = createMockScreenSpec('dashboard', 3);
    const tokens = createMockDesignTokens();
    const markdown = formatScreenSpecAsMarkdown(spec, tokens);

    expect(markdown).toContain('# ');
    expect(markdown).toContain('dashboard');
    expect(markdown).toContain('## Layout');
    expect(markdown).toContain('## Components');
  });
});

// ============================================================================
// Component Mapper Tests
// ============================================================================

describe('mapScreenTypeToComponents', () => {
  it('should map dashboard to appropriate components', () => {
    const mapping = mapScreenTypeToComponents('dashboard');
    expect(mapping.screenType).toBe('dashboard');
    expect(mapping.recommendedComponents).toContain('Card');
    expect(mapping.recommendedComponents).toContain('Tabs');
    expect(mapping.layoutPattern).toBeDefined();
  });

  it('should map list to table components', () => {
    const mapping = mapScreenTypeToComponents('list');
    expect(mapping.recommendedComponents).toContain('Table');
    expect(mapping.recommendedComponents).toContain('Pagination');
  });

  it('should map form to form components', () => {
    const mapping = mapScreenTypeToComponents('form');
    expect(mapping.recommendedComponents).toContain('Form');
    expect(mapping.recommendedComponents).toContain('Input');
    expect(mapping.recommendedComponents).toContain('Button');
  });

  it('should map auth to appropriate components', () => {
    const mapping = mapScreenTypeToComponents('auth');
    expect(mapping.recommendedComponents).toContain('Card');
    expect(mapping.recommendedComponents).toContain('Input');
    expect(mapping.recommendedComponents).toContain('Button');
  });
});

describe('getAllComponentMappings', () => {
  it('should return mappings for all screen types', () => {
    const mappings = getAllComponentMappings();
    const screenTypes = getAllScreenTypes();

    expect(mappings.length).toBe(screenTypes.length);
    for (const mapping of mappings) {
      expect(screenTypes).toContain(mapping.screenType);
    }
  });
});

describe('formatComponentImports', () => {
  it('should format import statements', () => {
    const components = ['Button', 'Card', 'CardHeader', 'CardContent'];
    const imports = formatComponentImports(components as any);

    expect(imports).toContain('import {');
    expect(imports).toContain('@/components/ui/button');
    expect(imports).toContain('@/components/ui/card');
  });

  it('should group components by import path', () => {
    const components = ['Card', 'CardHeader', 'CardTitle'];
    const imports = formatComponentImports(components as any);

    // Card components should be in one import
    expect(imports.split('import').length).toBe(2); // One import statement
  });
});

describe('suggestComponentProps', () => {
  it('should suggest Button props', () => {
    const props = suggestComponentProps('Button');
    expect(props.variant).toBeDefined();
    expect(props.size).toBeDefined();
    expect(props.disabled).toBeDefined();
  });

  it('should suggest Input props', () => {
    const props = suggestComponentProps('Input');
    expect(props.type).toBeDefined();
    expect(props.placeholder).toBeDefined();
  });

  it('should return empty object for unknown components', () => {
    const props = suggestComponentProps('UnknownComponent' as any);
    expect(Object.keys(props).length).toBe(0);
  });
});

// ============================================================================
// Implementation Order Tests
// ============================================================================

describe('calculateImplementationOrder', () => {
  it('should calculate order for screens', () => {
    const specs = [
      createMockScreenSpec('landing', 2),
      createMockScreenSpec('auth', 3),
      createMockScreenSpec('dashboard', 4),
      createMockScreenSpec('list', 5)
    ];

    const order = calculateImplementationOrder(specs);

    expect(order.phases.length).toBeGreaterThan(0);
    expect(order.totalScreens).toBe(4);
    expect(order.criticalPath).toBeDefined();
    expect(order.recommendedParallelization).toBeDefined();
  });

  it('should place landing/dashboard before auth-protected screens', () => {
    const specs = [
      createMockScreenSpec('list', 5),
      createMockScreenSpec('landing', 2),
      createMockScreenSpec('auth', 3)
    ];

    const order = calculateImplementationOrder(specs);

    // Find phase containing landing
    const foundationPhase = order.phases.find(p =>
      p.screens.some(s => s.includes('landing') || s.includes('dashboard'))
    );
    const authPhase = order.phases.find(p =>
      p.screens.some(s => s.includes('auth'))
    );

    if (foundationPhase && authPhase) {
      expect(foundationPhase.phase).toBeLessThanOrEqual(authPhase.phase);
    }
  });

  it('should group screens by phase', () => {
    const specs = [
      createMockScreenSpec('dashboard', 4),
      createMockScreenSpec('settings', 3),
      createMockScreenSpec('empty', 1)
    ];

    const order = calculateImplementationOrder(specs);

    // Each screen should be in exactly one phase
    const allScreensInPhases = order.phases.flatMap(p => p.screens);
    expect(allScreensInPhases.length).toBe(specs.length);
  });
});

describe('formatImplementationChecklist', () => {
  it('should format checklist as markdown', () => {
    const specs = [
      createMockScreenSpec('dashboard', 4),
      createMockScreenSpec('list', 3)
    ];
    const order = calculateImplementationOrder(specs);
    const checklist = formatImplementationChecklist(order);

    expect(checklist).toContain('# Implementation Checklist');
    expect(checklist).toContain('Phase');
    expect(checklist).toContain('[ ]'); // Checkbox
    expect(checklist).toContain('Total Screens:');
  });
});

// ============================================================================
// Validation Tests
// ============================================================================

describe('validateDesignTokens', () => {
  it('should validate complete tokens', () => {
    const tokens = createMockDesignTokens();
    const result = validateDesignTokens(tokens);

    expect(result.valid).toBe(true);
    expect(result.issues.filter(i => i.severity === 'error').length).toBe(0);
  });

  it('should detect missing color tokens', () => {
    const tokens = createMockDesignTokens();
    delete (tokens.colors as any).primary;

    const result = validateDesignTokens(tokens);

    expect(result.issues.some(i => i.category === 'colors')).toBe(true);
  });

  it('should detect missing typography', () => {
    const tokens = createMockDesignTokens();
    tokens.typography.fontFamily = '';

    const result = validateDesignTokens(tokens);

    expect(result.issues.some(i => i.category === 'typography')).toBe(true);
  });
});

describe('validateSpecs', () => {
  it('should validate complete specs report', () => {
    const report = createMockSpecsReport();
    const result = validateSpecs(report);

    expect(result.completenessScore).toBeGreaterThan(0);
    expect(result.summary.sectionsValidated).toBeGreaterThan(0);
  });

  it('should detect missing screens', () => {
    const report = createMockSpecsReport();
    report.screens = [];

    const result = validateSpecs(report);

    expect(result.issues.some(i => i.category === 'screens')).toBe(true);
  });
});

describe('calculateCompletenessScore', () => {
  it('should calculate score based on validation results', () => {
    const report = createMockSpecsReport();
    const validations = [
      { section: 'metadata', valid: true, issues: [], itemsChecked: 3, itemsPassed: 3 },
      { section: 'designTokens', valid: true, issues: [], itemsChecked: 10, itemsPassed: 10 },
      { section: 'screenSpecs', valid: true, issues: [], itemsChecked: 5, itemsPassed: 5 }
    ];

    const score = calculateCompletenessScore(report, validations);

    expect(score).toBeGreaterThan(80);
    expect(score).toBeLessThanOrEqual(100);
  });
});

// ============================================================================
// Report Building Tests
// ============================================================================

describe('buildSpecsReport', () => {
  it('should build complete report', () => {
    const tokens = createMockDesignTokens();
    const doc = createMockDesignSystemDoc();
    const specs = [createMockScreenSpec('dashboard', 3)];
    const mappings = [mapScreenTypeToComponents('dashboard')];
    const order = calculateImplementationOrder(specs);

    const report = buildSpecsReport(
      'Test App',
      'mobile',
      tokens,
      doc,
      specs,
      mappings,
      order
    );

    expect(report.appName).toBe('Test App');
    expect(report.viewport).toBe('mobile');
    expect(report.designTokens).toBeDefined();
    expect(report.screens.length).toBe(1);
    expect(report.summary.totalScreens).toBe(1);
    expect(report.generatedAt).toBeDefined();
  });

  it('should calculate total components', () => {
    const tokens = createMockDesignTokens();
    const doc = createMockDesignSystemDoc();
    const specs = [
      createMockScreenSpec('dashboard', 5),
      createMockScreenSpec('list', 4)
    ];
    const mappings = getAllComponentMappings();
    const order = calculateImplementationOrder(specs);

    const report = buildSpecsReport(
      'Test App',
      'mobile',
      tokens,
      doc,
      specs,
      mappings,
      order
    );

    expect(report.summary.totalComponents).toBe(9); // 5 + 4
  });
});

describe('generateSpecsSummary', () => {
  it('should generate summary from report', () => {
    const report = createMockSpecsReport();
    const summary = generateSpecsSummary(report);

    expect(summary.totalScreens).toBe(report.summary.totalScreens);
    expect(summary.totalComponents).toBe(report.summary.totalComponents);
    expect(summary.tokensGenerated).toBe(true);
    expect(summary.documentationGenerated).toBe(true);
  });
});

// ============================================================================
// Display Tests
// ============================================================================

describe('getSpecsSummary', () => {
  it('should format summary as string', () => {
    const report = createMockSpecsReport();
    const summary = getSpecsSummary(report);

    expect(summary).toContain('Test App');
    expect(summary).toContain('mobile');
    expect(summary).toContain('Total Screens:');
    expect(summary).toContain('Tokens Generated:');
    expect(summary).toContain('Implementation Phases:');
  });
});

describe('getSpecsStatusLine', () => {
  it('should format status line correctly', () => {
    const report = createMockSpecsReport();
    const statusLine = getSpecsStatusLine(report);

    expect(statusLine).toContain('screens');
    expect(statusLine).toContain('components');
    expect(statusLine).toContain('phases');
    expect(statusLine).toContain('complete');
  });
});

// ============================================================================
// Mock Helpers
// ============================================================================

function createMockColorPalette() {
  return {
    primary: '#3B82F6',
    secondary: '#6366F1',
    accent: '#10B981',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    text: '#111827',
    textMuted: '#6B7280',
    border: '#E5E7EB',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B'
  };
}

function createMockColorTokens(): ColorTokens {
  return {
    primary: '#3B82F6',
    secondary: '#6366F1',
    accent: '#10B981',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    text: '#111827',
    textMuted: '#6B7280',
    border: '#E5E7EB',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B'
  };
}

function createMockDesignTokens(): DesignTokens {
  return {
    colors: createMockColorTokens(),
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontFamilyMono: 'ui-monospace, monospace',
      fontSize: {
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem'
      },
      fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700
      },
      lineHeight: {
        tight: '1.25',
        normal: '1.5',
        relaxed: '1.625'
      },
      letterSpacing: {
        normal: '0em',
        wide: '0.025em'
      }
    },
    spacing: {
      base: '4px',
      scale: {
        '0': '0px',
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px'
      }
    },
    borderRadius: {
      none: '0px',
      sm: '4px',
      md: '8px',
      lg: '12px',
      full: '9999px'
    },
    shadows: {
      none: 'none',
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
    }
  };
}

function createMockStyleConfig() {
  return {
    generatedAt: new Date().toISOString(),
    styleDirection: 'Modern minimalist',
    viewport: 'mobile' as const,
    borderRadius: 'rounded' as const,
    shadowStyle: 'medium' as const,
    colorPalette: createMockColorPalette(),
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      headingWeight: '600',
      bodyWeight: '400'
    },
    spacing: {
      base: 4,
      scale: [4, 8, 12, 16, 24, 32]
    },
    anchors: []
  };
}

function createMockDesignSystemDoc(): DesignSystemDoc {
  return {
    title: 'Modern Design System',
    generatedAt: new Date().toISOString(),
    sections: [
      { id: 'overview', title: 'Overview', content: 'Overview content' },
      { id: 'colors', title: 'Colors', content: 'Colors content' },
      { id: 'typography', title: 'Typography', content: 'Typography content' }
    ],
    fullMarkdown: '# Modern Design System\n\nContent here...'
  };
}

function createMockScreenSpec(type: ScreenType, componentCount: number): ScreenSpec {
  const components = [];
  for (let i = 0; i < componentCount; i++) {
    components.push({
      id: `component-${i}`,
      name: `Component ${i}`,
      shadcnComponent: 'Card',
      props: {},
      tokens: {},
      notes: []
    });
  }

  return {
    screenId: `screen-${type}`,
    screenName: `${type.charAt(0).toUpperCase() + type.slice(1)} Screen`,
    screenType: type,
    imagePath: `generated/screens/${type}-propagated.png`,
    layout: {
      structure: 'standard layout',
      mainAreas: ['header', 'content', 'footer'],
      navigation: 'bottom tabs',
      responsiveNotes: ['Stack on mobile']
    },
    components,
    states: [],
    implementationNotes: [],
    uxRequirements: [],
    estimatedComplexity: 'medium'
  };
}

function createMockPropagatedScreen(screenType: string) {
  return {
    screenId: `screen-${screenType}`,
    screenName: `${screenType} Screen`,
    screenType,
    originalPath: `screenshots/${screenType}.png`,
    propagatedPath: `generated/screens/${screenType}-propagated.png`,
    success: true,
    attempts: 1,
    cost: 0.1,
    strengthUsed: 0.6,
    improvementsApplied: []
  };
}

function createMockSpecsReport(): SpecsReport {
  const tokens = createMockDesignTokens();
  const doc = createMockDesignSystemDoc();
  const specs = [createMockScreenSpec('dashboard', 4)];
  const mappings = [mapScreenTypeToComponents('dashboard')];
  const order = calculateImplementationOrder(specs);

  return {
    generatedAt: new Date().toISOString(),
    appName: 'Test App',
    viewport: 'mobile',
    designTokens: tokens,
    designSystem: doc,
    screens: specs,
    componentMap: mappings,
    implementationOrder: order,
    summary: {
      totalScreens: 1,
      totalComponents: 4,
      tokensGenerated: true,
      documentationGenerated: true,
      implementationPhasesCount: order.phases.length,
      completenessScore: 85
    }
  };
}
