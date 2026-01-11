/**
 * Specs Validator for UX Overhaul Skill
 * Validates completeness and quality of generated specs
 */

import { DesignTokens, ColorTokens, TypographyTokens, getColorTokenKeys } from '../token-extractor';
import { DesignSystemDoc, DocSection } from '../doc-generator';
import { ScreenSpec, ComponentSpec } from '../screen-spec-generator';
import { ComponentMapping } from '../component-mapper';
import { ImplementationOrder } from '../implementation-order';

// ============================================================================
// Types
// ============================================================================

/**
 * Validation severity levels
 */
export type ValidationSeverity = 'error' | 'warning' | 'info';

/**
 * Single validation issue
 */
export interface ValidationIssue {
  severity: ValidationSeverity;
  category: string;
  message: string;
  path?: string;
}

/**
 * Validation result for a specific section
 */
export interface SectionValidation {
  section: string;
  valid: boolean;
  issues: ValidationIssue[];
  itemsChecked: number;
  itemsPassed: number;
}

/**
 * Complete validation result
 */
export interface SpecsValidationResult {
  valid: boolean;
  sections: SectionValidation[];
  issues: ValidationIssue[];
  completenessScore: number;
  summary: ValidationSummary;
}

/**
 * Validation summary
 */
export interface ValidationSummary {
  totalIssues: number;
  errors: number;
  warnings: number;
  infos: number;
  sectionsValidated: number;
  sectionsPassed: number;
}

/**
 * Complete specs report structure (for validation)
 */
export interface SpecsReport {
  generatedAt: string;
  appName: string;
  viewport: string;
  designTokens: DesignTokens;
  designSystem?: DesignSystemDoc;
  screens: ScreenSpec[];
  componentMap?: ComponentMapping[];
  implementationOrder?: ImplementationOrder;
  summary: {
    totalScreens: number;
    totalComponents: number;
    tokensGenerated: boolean;
    documentationGenerated: boolean;
    implementationPhasesCount?: number;
    completenessScore?: number;
  };
}

// ============================================================================
// Main Validation
// ============================================================================

/**
 * Validates complete specs report
 */
export function validateSpecs(report: SpecsReport): SpecsValidationResult {
  const sections: SectionValidation[] = [];
  const allIssues: ValidationIssue[] = [];

  // Validate metadata
  const metadataValidation = validateMetadata(report);
  sections.push(metadataValidation);
  allIssues.push(...metadataValidation.issues);

  // Validate design tokens
  const tokensValidation = validateDesignTokens(report.designTokens);
  sections.push(tokensValidation);
  allIssues.push(...tokensValidation.issues);

  // Validate design system doc
  if (report.designSystem) {
    const docValidation = validateDesignSystemDoc(report.designSystem);
    sections.push(docValidation);
    allIssues.push(...docValidation.issues);
  }

  // Validate screen specs
  const screensValidation = validateScreenSpecs(report.screens);
  sections.push(screensValidation);
  allIssues.push(...screensValidation.issues);

  // Validate component mappings
  if (report.componentMap) {
    const mappingsValidation = validateComponentMappings(report.componentMap);
    sections.push(mappingsValidation);
    allIssues.push(...mappingsValidation.issues);
  }

  // Validate implementation order
  if (report.implementationOrder) {
    const orderValidation = validateImplementationOrder(report.implementationOrder, report.screens);
    sections.push(orderValidation);
    allIssues.push(...orderValidation.issues);
  }

  // Calculate completeness score
  const completenessScore = calculateCompletenessScore(report, sections);

  // Build summary
  const summary: ValidationSummary = {
    totalIssues: allIssues.length,
    errors: allIssues.filter(i => i.severity === 'error').length,
    warnings: allIssues.filter(i => i.severity === 'warning').length,
    infos: allIssues.filter(i => i.severity === 'info').length,
    sectionsValidated: sections.length,
    sectionsPassed: sections.filter(s => s.valid).length
  };

  const valid = summary.errors === 0;

  return {
    valid,
    sections,
    issues: allIssues,
    completenessScore,
    summary
  };
}

// ============================================================================
// Section Validators
// ============================================================================

/**
 * Validates report metadata
 */
function validateMetadata(report: SpecsReport): SectionValidation {
  const issues: ValidationIssue[] = [];
  let itemsChecked = 0;
  let itemsPassed = 0;

  // Check generatedAt
  itemsChecked++;
  if (!report.generatedAt) {
    issues.push({
      severity: 'error',
      category: 'metadata',
      message: 'Missing generatedAt timestamp'
    });
  } else {
    itemsPassed++;
  }

  // Check appName
  itemsChecked++;
  if (!report.appName || report.appName.trim() === '') {
    issues.push({
      severity: 'warning',
      category: 'metadata',
      message: 'Missing or empty appName'
    });
  } else {
    itemsPassed++;
  }

  // Check viewport
  itemsChecked++;
  const validViewports = ['mobile', 'tablet', 'desktop', 'desktop-xl'];
  if (!report.viewport || !validViewports.includes(report.viewport)) {
    issues.push({
      severity: 'error',
      category: 'metadata',
      message: `Invalid viewport: ${report.viewport}. Expected one of: ${validViewports.join(', ')}`
    });
  } else {
    itemsPassed++;
  }

  return {
    section: 'metadata',
    valid: issues.filter(i => i.severity === 'error').length === 0,
    issues,
    itemsChecked,
    itemsPassed
  };
}

/**
 * Validates design tokens
 */
export function validateDesignTokens(tokens: DesignTokens): SectionValidation {
  const issues: ValidationIssue[] = [];
  let itemsChecked = 0;
  let itemsPassed = 0;

  // Validate colors
  const colorKeys = getColorTokenKeys();
  for (const key of colorKeys) {
    itemsChecked++;
    const value = tokens.colors[key];
    if (!value) {
      issues.push({
        severity: 'error',
        category: 'colors',
        message: `Missing color token: ${key}`,
        path: `colors.${key}`
      });
    } else if (!isValidColor(value)) {
      issues.push({
        severity: 'warning',
        category: 'colors',
        message: `Invalid color format for ${key}: ${value}`,
        path: `colors.${key}`
      });
    } else {
      itemsPassed++;
    }
  }

  // Validate typography
  itemsChecked++;
  if (!tokens.typography.fontFamily) {
    issues.push({
      severity: 'error',
      category: 'typography',
      message: 'Missing fontFamily',
      path: 'typography.fontFamily'
    });
  } else {
    itemsPassed++;
  }

  itemsChecked++;
  if (!tokens.typography.fontSize || Object.keys(tokens.typography.fontSize).length === 0) {
    issues.push({
      severity: 'warning',
      category: 'typography',
      message: 'Missing or empty fontSize scale',
      path: 'typography.fontSize'
    });
  } else {
    itemsPassed++;
  }

  // Validate spacing
  itemsChecked++;
  if (!tokens.spacing.base) {
    issues.push({
      severity: 'error',
      category: 'spacing',
      message: 'Missing spacing base unit',
      path: 'spacing.base'
    });
  } else {
    itemsPassed++;
  }

  itemsChecked++;
  if (!tokens.spacing.scale || Object.keys(tokens.spacing.scale).length === 0) {
    issues.push({
      severity: 'warning',
      category: 'spacing',
      message: 'Missing or empty spacing scale',
      path: 'spacing.scale'
    });
  } else {
    itemsPassed++;
  }

  // Validate border radius
  itemsChecked++;
  const requiredRadii = ['none', 'sm', 'md', 'lg', 'full'];
  const missingRadii = requiredRadii.filter(r => !tokens.borderRadius[r as keyof typeof tokens.borderRadius]);
  if (missingRadii.length > 0) {
    issues.push({
      severity: 'warning',
      category: 'borderRadius',
      message: `Missing border radius values: ${missingRadii.join(', ')}`,
      path: 'borderRadius'
    });
  } else {
    itemsPassed++;
  }

  // Validate shadows
  itemsChecked++;
  const requiredShadows = ['none', 'sm', 'md', 'lg', 'xl'];
  const missingShadows = requiredShadows.filter(s => !tokens.shadows[s as keyof typeof tokens.shadows]);
  if (missingShadows.length > 0) {
    issues.push({
      severity: 'warning',
      category: 'shadows',
      message: `Missing shadow values: ${missingShadows.join(', ')}`,
      path: 'shadows'
    });
  } else {
    itemsPassed++;
  }

  return {
    section: 'designTokens',
    valid: issues.filter(i => i.severity === 'error').length === 0,
    issues,
    itemsChecked,
    itemsPassed
  };
}

/**
 * Validates design system documentation
 */
export function validateDesignSystemDoc(doc: DesignSystemDoc): SectionValidation {
  const issues: ValidationIssue[] = [];
  let itemsChecked = 0;
  let itemsPassed = 0;

  // Check title
  itemsChecked++;
  if (!doc.title) {
    issues.push({
      severity: 'error',
      category: 'documentation',
      message: 'Missing documentation title'
    });
  } else {
    itemsPassed++;
  }

  // Check sections
  itemsChecked++;
  if (!doc.sections || doc.sections.length === 0) {
    issues.push({
      severity: 'error',
      category: 'documentation',
      message: 'No documentation sections'
    });
  } else {
    itemsPassed++;

    // Check expected sections
    const expectedSections = ['overview', 'colors', 'typography', 'spacing', 'border-radius', 'shadows'];
    for (const sectionId of expectedSections) {
      itemsChecked++;
      const section = doc.sections.find(s => s.id === sectionId);
      if (!section) {
        issues.push({
          severity: 'warning',
          category: 'documentation',
          message: `Missing expected section: ${sectionId}`
        });
      } else if (!section.content || section.content.trim() === '') {
        issues.push({
          severity: 'warning',
          category: 'documentation',
          message: `Empty content for section: ${sectionId}`
        });
      } else {
        itemsPassed++;
      }
    }
  }

  // Check fullMarkdown
  itemsChecked++;
  if (!doc.fullMarkdown || doc.fullMarkdown.length < 100) {
    issues.push({
      severity: 'warning',
      category: 'documentation',
      message: 'Full markdown output appears incomplete'
    });
  } else {
    itemsPassed++;
  }

  return {
    section: 'designSystemDoc',
    valid: issues.filter(i => i.severity === 'error').length === 0,
    issues,
    itemsChecked,
    itemsPassed
  };
}

/**
 * Validates screen specifications
 */
export function validateScreenSpecs(screens: ScreenSpec[]): SectionValidation {
  const issues: ValidationIssue[] = [];
  let itemsChecked = 0;
  let itemsPassed = 0;

  // Check for screens
  itemsChecked++;
  if (!screens || screens.length === 0) {
    issues.push({
      severity: 'error',
      category: 'screens',
      message: 'No screen specifications generated'
    });
    return {
      section: 'screenSpecs',
      valid: false,
      issues,
      itemsChecked,
      itemsPassed
    };
  } else {
    itemsPassed++;
  }

  // Validate each screen
  for (const screen of screens) {
    // Check required fields
    itemsChecked++;
    if (!screen.screenId) {
      issues.push({
        severity: 'error',
        category: 'screens',
        message: `Screen missing screenId`,
        path: `screens[${screens.indexOf(screen)}]`
      });
    } else {
      itemsPassed++;
    }

    itemsChecked++;
    if (!screen.screenName) {
      issues.push({
        severity: 'error',
        category: 'screens',
        message: `Screen ${screen.screenId} missing screenName`,
        path: `screens.${screen.screenId}.screenName`
      });
    } else {
      itemsPassed++;
    }

    itemsChecked++;
    if (!screen.screenType) {
      issues.push({
        severity: 'error',
        category: 'screens',
        message: `Screen ${screen.screenId} missing screenType`,
        path: `screens.${screen.screenId}.screenType`
      });
    } else {
      itemsPassed++;
    }

    // Check layout
    itemsChecked++;
    if (!screen.layout || !screen.layout.structure) {
      issues.push({
        severity: 'warning',
        category: 'screens',
        message: `Screen ${screen.screenId} missing layout information`,
        path: `screens.${screen.screenId}.layout`
      });
    } else {
      itemsPassed++;
    }

    // Check components
    itemsChecked++;
    if (!screen.components || screen.components.length === 0) {
      issues.push({
        severity: 'warning',
        category: 'screens',
        message: `Screen ${screen.screenId} has no components`,
        path: `screens.${screen.screenId}.components`
      });
    } else {
      itemsPassed++;

      // Validate each component
      for (const component of screen.components) {
        itemsChecked++;
        if (!component.shadcnComponent) {
          issues.push({
            severity: 'warning',
            category: 'screens',
            message: `Component ${component.id} in ${screen.screenId} missing shadcnComponent mapping`,
            path: `screens.${screen.screenId}.components.${component.id}`
          });
        } else {
          itemsPassed++;
        }
      }
    }
  }

  return {
    section: 'screenSpecs',
    valid: issues.filter(i => i.severity === 'error').length === 0,
    issues,
    itemsChecked,
    itemsPassed
  };
}

/**
 * Validates component mappings
 */
export function validateComponentMappings(mappings: ComponentMapping[]): SectionValidation {
  const issues: ValidationIssue[] = [];
  let itemsChecked = 0;
  let itemsPassed = 0;

  itemsChecked++;
  if (!mappings || mappings.length === 0) {
    issues.push({
      severity: 'warning',
      category: 'componentMap',
      message: 'No component mappings generated'
    });
  } else {
    itemsPassed++;

    for (const mapping of mappings) {
      itemsChecked++;
      if (!mapping.screenType) {
        issues.push({
          severity: 'error',
          category: 'componentMap',
          message: 'Component mapping missing screenType'
        });
      } else {
        itemsPassed++;
      }

      itemsChecked++;
      if (!mapping.recommendedComponents || mapping.recommendedComponents.length === 0) {
        issues.push({
          severity: 'warning',
          category: 'componentMap',
          message: `No recommended components for screen type: ${mapping.screenType}`
        });
      } else {
        itemsPassed++;
      }
    }
  }

  return {
    section: 'componentMap',
    valid: issues.filter(i => i.severity === 'error').length === 0,
    issues,
    itemsChecked,
    itemsPassed
  };
}

/**
 * Validates implementation order
 */
export function validateImplementationOrder(
  order: ImplementationOrder,
  screens: ScreenSpec[]
): SectionValidation {
  const issues: ValidationIssue[] = [];
  let itemsChecked = 0;
  let itemsPassed = 0;

  // Check phases exist
  itemsChecked++;
  if (!order.phases || order.phases.length === 0) {
    issues.push({
      severity: 'error',
      category: 'implementationOrder',
      message: 'No implementation phases defined'
    });
  } else {
    itemsPassed++;

    // Check all screens are included
    itemsChecked++;
    const allPhaseScreens = order.phases.flatMap(p => p.screens);
    const screenIds = screens.map(s => s.screenId);
    const missingScreens = screenIds.filter(id => !allPhaseScreens.includes(id));

    if (missingScreens.length > 0) {
      issues.push({
        severity: 'warning',
        category: 'implementationOrder',
        message: `Screens not included in any phase: ${missingScreens.join(', ')}`
      });
    } else {
      itemsPassed++;
    }

    // Check total screens matches
    itemsChecked++;
    if (order.totalScreens !== screens.length) {
      issues.push({
        severity: 'warning',
        category: 'implementationOrder',
        message: `Total screens mismatch: order has ${order.totalScreens}, actual is ${screens.length}`
      });
    } else {
      itemsPassed++;
    }
  }

  return {
    section: 'implementationOrder',
    valid: issues.filter(i => i.severity === 'error').length === 0,
    issues,
    itemsChecked,
    itemsPassed
  };
}

// ============================================================================
// Scoring
// ============================================================================

/**
 * Calculates completeness score (0-100)
 */
export function calculateCompletenessScore(
  report: SpecsReport,
  validations: SectionValidation[]
): number {
  let totalWeight = 0;
  let weightedScore = 0;

  // Weights for each section
  const weights: Record<string, number> = {
    metadata: 5,
    designTokens: 25,
    designSystemDoc: 15,
    screenSpecs: 35,
    componentMap: 10,
    implementationOrder: 10
  };

  for (const validation of validations) {
    const weight = weights[validation.section] || 10;
    totalWeight += weight;

    if (validation.itemsChecked > 0) {
      const sectionScore = (validation.itemsPassed / validation.itemsChecked) * weight;
      weightedScore += sectionScore;
    }
  }

  // Bonus points for optional sections
  if (report.designSystem) weightedScore += 2;
  if (report.componentMap && report.componentMap.length > 0) weightedScore += 2;
  if (report.implementationOrder) weightedScore += 2;

  const rawScore = (weightedScore / totalWeight) * 100;
  return Math.round(Math.min(100, rawScore));
}

// ============================================================================
// Output Formatting
// ============================================================================

/**
 * Formats validation result as readable output
 */
export function formatValidationResult(result: SpecsValidationResult): string {
  const lines: string[] = [
    '# Specs Validation Report',
    '',
    `**Status**: ${result.valid ? 'PASSED' : 'FAILED'}`,
    `**Completeness Score**: ${result.completenessScore}%`,
    '',
    '## Summary',
    '',
    `- Total Issues: ${result.summary.totalIssues}`,
    `- Errors: ${result.summary.errors}`,
    `- Warnings: ${result.summary.warnings}`,
    `- Info: ${result.summary.infos}`,
    `- Sections Validated: ${result.summary.sectionsValidated}`,
    `- Sections Passed: ${result.summary.sectionsPassed}`,
    ''
  ];

  // Section details
  lines.push('## Section Details');
  lines.push('');

  for (const section of result.sections) {
    const status = section.valid ? '✓' : '✗';
    const percentage = section.itemsChecked > 0
      ? Math.round((section.itemsPassed / section.itemsChecked) * 100)
      : 0;

    lines.push(`### ${status} ${section.section} (${percentage}%)`);
    lines.push('');

    if (section.issues.length > 0) {
      for (const issue of section.issues) {
        const icon = issue.severity === 'error' ? '❌' : issue.severity === 'warning' ? '⚠️' : 'ℹ️';
        lines.push(`${icon} ${issue.message}`);
        if (issue.path) {
          lines.push(`   Path: ${issue.path}`);
        }
      }
      lines.push('');
    } else {
      lines.push('No issues found.');
      lines.push('');
    }
  }

  return lines.join('\n');
}

/**
 * Gets single-line status for validation result
 */
export function getValidationStatusLine(result: SpecsValidationResult): string {
  const status = result.valid ? 'PASSED' : 'FAILED';
  return `Specs validation ${status}: ${result.completenessScore}% complete, ${result.summary.errors} errors, ${result.summary.warnings} warnings`;
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Checks if a color value is valid
 */
function isValidColor(value: string): boolean {
  // Check hex format
  if (/^#[0-9A-Fa-f]{6}$/.test(value)) return true;
  if (/^#[0-9A-Fa-f]{3}$/.test(value)) return true;

  // Check rgb/rgba format
  if (/^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/.test(value)) return true;
  if (/^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/.test(value)) return true;

  // Check hsl/hsla format
  if (/^hsl\(\s*\d+\s*,\s*[\d.]+%\s*,\s*[\d.]+%\s*\)$/.test(value)) return true;
  if (/^hsla\(\s*\d+\s*,\s*[\d.]+%\s*,\s*[\d.]+%\s*,\s*[\d.]+\s*\)$/.test(value)) return true;

  return false;
}

/**
 * Gets issues by severity
 */
export function getIssuesBySeverity(
  result: SpecsValidationResult,
  severity: ValidationSeverity
): ValidationIssue[] {
  return result.issues.filter(i => i.severity === severity);
}

/**
 * Gets issues by category
 */
export function getIssuesByCategory(
  result: SpecsValidationResult,
  category: string
): ValidationIssue[] {
  return result.issues.filter(i => i.category === category);
}
