/**
 * Specs Orchestrator for UX Overhaul Skill
 * Main entry point for the developer handoff specifications phase
 *
 * Transforms validated design artifacts into actionable developer deliverables:
 * - Design tokens (TweakCN-compatible)
 * - Design system documentation
 * - Per-screen implementation specs
 * - Component mappings to shadcn/ui
 * - Implementation order
 */

import * as path from 'path';
import { readJson, writeJson, writeText, ensureDir, FileResult } from '../../core/utils/file';
import {
  readManifest,
  writeManifest,
  updatePhaseStatus,
  canStartPhase,
  Manifest
} from '../../core/utils/manifest';
import { PropagationReport, PropagatedScreen } from '../04-propagation/propagation';
import { StatesReport, ScreenStates } from '../05-states/states';
import { StyleConfig, ViewportType } from '../03-anchoring/anchoring';
import { CoherenceReport } from '../06-coherence/coherence';
import { AppUnderstanding } from '../01-capture/capture';
import { ImprovementPlan } from '../02-audit/audit';
import {
  DesignTokens,
  extractDesignTokens,
  formatTokensAsCSS,
  formatTokensAsJSON,
  formatTokensAsTailwind,
  TokenOutputFormat
} from './token-extractor';
import {
  DesignSystemDoc,
  generateDesignSystemDoc,
  compileMarkdown
} from './doc-generator';
import {
  ScreenSpec,
  generateScreenSpec,
  generateAllScreenSpecs,
  formatScreenSpecAsMarkdown
} from './screen-spec-generator';
import {
  ComponentMapping,
  getAllComponentMappings,
  mapScreenTypeToComponents,
  ScreenType
} from './component-mapper';
import {
  ImplementationOrder,
  calculateImplementationOrder,
  formatImplementationChecklist,
  AppUnderstanding as ImplAppUnderstanding
} from './implementation-order';
import {
  SpecsValidationResult,
  validateSpecs,
  formatValidationResult as formatSpecsValidation,
  getValidationStatusLine as getSpecsValidationStatus,
  SpecsReport
} from './validators/specs-validator';

// ============================================================================
// Types
// ============================================================================

/**
 * Specs configuration
 */
export interface SpecsConfig {
  outputDir: string;
  viewport: ViewportType;
  outputFormats: TokenOutputFormat[];
  generateMarkdown: boolean;
  generateChecklist: boolean;
}

/**
 * Specs operation result
 */
export interface SpecsResult {
  success: boolean;
  manifest?: Manifest;
  specsReport?: SpecsReport;
  validation?: SpecsValidationResult;
  error?: string;
}

/**
 * Specs summary for display
 */
export interface SpecsSummary {
  totalScreens: number;
  totalComponents: number;
  tokensGenerated: boolean;
  documentationGenerated: boolean;
  implementationPhasesCount: number;
  completenessScore: number;
}

// ============================================================================
// Configuration Defaults
// ============================================================================

const DEFAULT_OUTPUT_FORMATS: TokenOutputFormat[] = ['json', 'css'];
const DEFAULT_GENERATE_MARKDOWN = true;
const DEFAULT_GENERATE_CHECKLIST = true;

/**
 * Creates specs config from arguments
 */
export function createSpecsConfig(
  outputDir: string,
  options?: Partial<SpecsConfig>
): SpecsConfig {
  return {
    outputDir,
    viewport: options?.viewport || 'mobile',
    outputFormats: options?.outputFormats || DEFAULT_OUTPUT_FORMATS,
    generateMarkdown: options?.generateMarkdown ?? DEFAULT_GENERATE_MARKDOWN,
    generateChecklist: options?.generateChecklist ?? DEFAULT_GENERATE_CHECKLIST
  };
}

// ============================================================================
// Initialization
// ============================================================================

/**
 * Initializes specs generation session
 */
export function initializeSpecs(config: SpecsConfig): SpecsResult {
  // Read manifest
  const manifestResult = readManifest(config.outputDir);
  if (!manifestResult.success || !manifestResult.data) {
    return { success: false, error: `Failed to read manifest: ${manifestResult.error}` };
  }

  const manifest = manifestResult.data;

  // Check if specs can start (coherence or propagation must be complete)
  const canStart = canStartPhase(manifest, 'specs');
  if (!canStart.canStart) {
    return { success: false, error: canStart.reason };
  }

  // Ensure specs directory exists
  const specsDir = path.join(config.outputDir, 'specs');
  const dirResult = ensureDir(specsDir);
  if (!dirResult.success) {
    return { success: false, error: `Failed to create specs directory: ${dirResult.error}` };
  }

  // Update phase status
  updatePhaseStatus(manifest, 'specs', 'in_progress');

  // Write manifest
  const writeResult = writeManifest(config.outputDir, manifest);
  if (!writeResult.success) {
    return { success: false, error: writeResult.error };
  }

  return { success: true, manifest };
}

// ============================================================================
// Completion
// ============================================================================

/**
 * Completes specs phase
 */
export function completeSpecs(
  outputDir: string,
  report: SpecsReport
): SpecsResult {
  // Write specs report
  const reportPath = path.join(outputDir, 'specs_report.json');
  const reportResult = writeJson(reportPath, report);
  if (!reportResult.success) {
    return { success: false, error: `Failed to write specs report: ${reportResult.error}` };
  }

  // Update manifest
  const manifestResult = readManifest(outputDir);
  if (!manifestResult.success || !manifestResult.data) {
    return { success: false, error: `Failed to read manifest: ${manifestResult.error}` };
  }

  const manifest = manifestResult.data;
  updatePhaseStatus(manifest, 'specs', 'complete');

  const writeManifestResult = writeManifest(outputDir, manifest);
  if (!writeManifestResult.success) {
    return { success: false, error: writeManifestResult.error };
  }

  return {
    success: true,
    manifest,
    specsReport: report
  };
}

// ============================================================================
// Main Execution
// ============================================================================

/**
 * Runs the full specs generation process
 *
 * Flow:
 * 1. Load required artifacts (propagation report, style config)
 * 2. Extract design tokens
 * 3. Generate design system documentation
 * 4. Generate per-screen specs
 * 5. Map components
 * 6. Calculate implementation order
 * 7. Validate specs
 * 8. Write all outputs
 */
export async function runSpecs(
  config: SpecsConfig,
  propagationReport: PropagationReport,
  statesReport: StatesReport | null,
  coherenceReport: CoherenceReport | null,
  styleConfig: StyleConfig,
  appUnderstanding: AppUnderstanding,
  improvementPlan?: ImprovementPlan
): Promise<SpecsResult> {
  const screens = propagationReport.screens.filter(s => s.success);

  if (screens.length === 0) {
    return { success: false, error: 'No successfully propagated screens to generate specs for' };
  }

  // Step 1: Extract design tokens
  const designTokens = extractDesignTokens(styleConfig);

  // Write tokens in requested formats
  for (const format of config.outputFormats) {
    const writeResult = writeTokens(config.outputDir, designTokens, format);
    if (!writeResult.success) {
      return { success: false, error: `Failed to write tokens (${format}): ${writeResult.error}` };
    }
  }

  // Step 2: Generate design system documentation
  const designSystem = generateDesignSystemDoc(designTokens, styleConfig);

  if (config.generateMarkdown) {
    const docPath = path.join(config.outputDir, 'design_system.md');
    const docResult = writeText(docPath, designSystem.fullMarkdown);
    if (!docResult.success) {
      return { success: false, error: `Failed to write design system doc: ${docResult.error}` };
    }
  }

  // Step 3: Generate per-screen specs
  const allComponentMappings = getAllComponentMappings();
  const screenSpecs = generateAllScreenSpecs(
    screens,
    designTokens,
    allComponentMappings,
    statesReport || undefined,
    improvementPlan
  );

  // Write per-screen markdown specs
  if (config.generateMarkdown) {
    const specsDir = path.join(config.outputDir, 'specs');
    for (const spec of screenSpecs) {
      const markdown = formatScreenSpecAsMarkdown(spec, designTokens);
      const specPath = path.join(specsDir, `screen-${spec.screenId}.md`);
      const specResult = writeText(specPath, markdown);
      if (!specResult.success) {
        // Non-fatal, continue with other screens
        console.warn(`Failed to write screen spec for ${spec.screenId}: ${specResult.error}`);
      }
    }
  }

  // Step 4: Get component mappings
  const uniqueScreenTypes = getUniqueScreenTypes(screenSpecs);
  const componentMap = uniqueScreenTypes.map(type => mapScreenTypeToComponents(type));

  // Step 5: Calculate implementation order
  // Build app understanding from sitemap flows
  const implAppUnderstanding: ImplAppUnderstanding | undefined = appUnderstanding ? {
    screens: appUnderstanding.screens.map(s => ({
      id: s.id,
      name: s.name,
      type: 'generic' // CapturedScreen doesn't have type, infer from screenType mapping
    })),
    flows: appUnderstanding.sitemap?.flows || []
  } : undefined;

  const implementationOrder = calculateImplementationOrder(screenSpecs, implAppUnderstanding);

  // Write implementation checklist
  if (config.generateChecklist) {
    const checklist = formatImplementationChecklist(implementationOrder);
    const checklistPath = path.join(config.outputDir, 'implementation_checklist.md');
    const checklistResult = writeText(checklistPath, checklist);
    if (!checklistResult.success) {
      return { success: false, error: `Failed to write implementation checklist: ${checklistResult.error}` };
    }
  }

  // Step 6: Build specs report
  const specsReport = buildSpecsReport(
    propagationReport.appName,
    config.viewport,
    designTokens,
    designSystem,
    screenSpecs,
    componentMap,
    implementationOrder
  );

  // Step 7: Validate specs
  const validation = validateSpecs(specsReport);

  // Update report with validation score
  specsReport.summary.completenessScore = validation.completenessScore;

  return {
    success: true,
    specsReport,
    validation
  };
}

// ============================================================================
// Report Building
// ============================================================================

/**
 * Builds the complete specs report
 */
export function buildSpecsReport(
  appName: string,
  viewport: ViewportType,
  designTokens: DesignTokens,
  designSystem: DesignSystemDoc,
  screenSpecs: ScreenSpec[],
  componentMap: ComponentMapping[],
  implementationOrder: ImplementationOrder
): SpecsReport {
  const totalComponents = screenSpecs.reduce(
    (sum, s) => sum + (s.components?.length || 0),
    0
  );

  return {
    generatedAt: new Date().toISOString(),
    appName,
    viewport,
    designTokens,
    designSystem,
    screens: screenSpecs,
    componentMap,
    implementationOrder,
    summary: {
      totalScreens: screenSpecs.length,
      totalComponents,
      tokensGenerated: true,
      documentationGenerated: true,
      implementationPhasesCount: implementationOrder.phases.length,
      completenessScore: 0 // Will be set after validation
    }
  };
}

/**
 * Generates specs summary from report
 */
export function generateSpecsSummary(report: SpecsReport): SpecsSummary {
  return {
    totalScreens: report.summary.totalScreens,
    totalComponents: report.summary.totalComponents,
    tokensGenerated: report.summary.tokensGenerated,
    documentationGenerated: report.summary.documentationGenerated,
    implementationPhasesCount: report.summary.implementationPhasesCount || 0,
    completenessScore: report.summary.completenessScore || 0
  };
}

// ============================================================================
// Summary & Display
// ============================================================================

/**
 * Generates human-readable specs summary
 */
export function getSpecsSummary(report: SpecsReport): string {
  const { summary } = report;
  const lines = [
    `Developer Handoff Specs: ${report.appName}`,
    `Viewport: ${report.viewport}`,
    `Generated At: ${report.generatedAt}`,
    '',
    `Total Screens: ${summary.totalScreens}`,
    `Total Components: ${summary.totalComponents}`,
    `Implementation Phases: ${summary.implementationPhasesCount}`,
    '',
    `Tokens Generated: ${summary.tokensGenerated ? 'Yes' : 'No'}`,
    `Documentation Generated: ${summary.documentationGenerated ? 'Yes' : 'No'}`,
    `Completeness Score: ${summary.completenessScore}%`,
    ''
  ];

  // Add implementation phases
  if (report.implementationOrder) {
    lines.push('Implementation Phases:');
    for (const phase of report.implementationOrder.phases) {
      lines.push(`  ${phase.phase}. ${phase.name} (${phase.screens.length} screens)`);
    }
  }

  return lines.join('\n');
}

/**
 * Gets a brief status line
 */
export function getSpecsStatusLine(report: SpecsReport): string {
  const { summary } = report;
  return `${summary.totalScreens} screens, ${summary.totalComponents} components, ${summary.implementationPhasesCount} phases, ${summary.completenessScore}% complete`;
}

// ============================================================================
// Loaders
// ============================================================================

/**
 * Loads propagation report from output directory
 */
export function loadPropagationReport(outputDir: string): FileResult<PropagationReport> {
  const filePath = path.join(outputDir, 'propagation_report.json');
  return readJson<PropagationReport>(filePath);
}

/**
 * Loads states report from output directory
 */
export function loadStatesReport(outputDir: string): FileResult<StatesReport> {
  const filePath = path.join(outputDir, 'states_report.json');
  return readJson<StatesReport>(filePath);
}

/**
 * Loads coherence report from output directory
 */
export function loadCoherenceReport(outputDir: string): FileResult<CoherenceReport> {
  const filePath = path.join(outputDir, 'coherence_report.json');
  return readJson<CoherenceReport>(filePath);
}

/**
 * Loads style config from output directory
 */
export function loadStyleConfig(outputDir: string): FileResult<StyleConfig> {
  const filePath = path.join(outputDir, 'style_config.json');
  return readJson<StyleConfig>(filePath);
}

/**
 * Loads app understanding from output directory
 */
export function loadAppUnderstanding(outputDir: string): FileResult<AppUnderstanding> {
  const filePath = path.join(outputDir, 'app_understanding.json');
  return readJson<AppUnderstanding>(filePath);
}

/**
 * Loads improvement plan from output directory
 */
export function loadImprovementPlan(outputDir: string): FileResult<ImprovementPlan> {
  const filePath = path.join(outputDir, 'improvement_plan.json');
  return readJson<ImprovementPlan>(filePath);
}

/**
 * Loads saved specs report
 */
export function loadSpecsReport(outputDir: string): FileResult<SpecsReport> {
  const filePath = path.join(outputDir, 'specs_report.json');
  return readJson<SpecsReport>(filePath);
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Writes design tokens in the specified format
 */
function writeTokens(
  outputDir: string,
  tokens: DesignTokens,
  format: TokenOutputFormat
): FileResult<void> {
  let content: string;
  let filename: string;

  switch (format) {
    case 'css':
      content = formatTokensAsCSS(tokens);
      filename = 'design_tokens.css';
      break;
    case 'tailwind':
      content = formatTokensAsTailwind(tokens);
      filename = 'tailwind.config.tokens.js';
      break;
    case 'json':
    default:
      content = formatTokensAsJSON(tokens);
      filename = 'design_tokens.json';
  }

  const filePath = path.join(outputDir, filename);
  return writeText(filePath, content);
}

/**
 * Gets unique screen types from screen specs
 */
function getUniqueScreenTypes(screenSpecs: ScreenSpec[]): ScreenType[] {
  const types = new Set<ScreenType>();
  for (const spec of screenSpecs) {
    types.add(spec.screenType as ScreenType);
  }
  return Array.from(types);
}

// ============================================================================
// Re-exports for skill integration
// ============================================================================

// From token-extractor.ts
export {
  DesignTokens,
  ColorTokens,
  TypographyTokens,
  SpacingTokens,
  BorderRadiusTokens,
  ShadowTokens,
  TokenOutputFormat,
  extractDesignTokens,
  extractColorTokens,
  extractTypographyTokens,
  extractSpacingTokens,
  mapBorderRadius,
  mapShadowTokens,
  formatTokensAsCSS,
  formatTokensAsJSON,
  formatTokensAsTailwind,
  formatTokens,
  isValidHexColor,
  getTokenValue,
  getColorTokenKeys
} from './token-extractor';

// From doc-generator.ts
export {
  DesignSystemDoc,
  DocSection,
  ColorSwatch,
  generateDesignSystemDoc,
  generateColorSection,
  generateTypographySection,
  generateSpacingSection,
  generateBorderRadiusSection,
  generateShadowSection,
  generateComponentGuidelines,
  formatColorSwatch,
  compileMarkdown,
  getSectionById,
  getSectionIds
} from './doc-generator';

// From screen-spec-generator.ts
export {
  ScreenSpec,
  LayoutSpec,
  ComponentSpec,
  StateSpec,
  generateScreenSpec,
  generateAllScreenSpecs,
  inferLayoutSpec,
  generateComponentSpecs,
  generateStateSpecs,
  extractUxRequirements,
  estimateComplexity,
  formatScreenSpecAsMarkdown
} from './screen-spec-generator';

// From component-mapper.ts
export {
  ShadcnComponent,
  ScreenType,
  ComponentMapping,
  ComponentRecommendation,
  ComponentImport,
  mapScreenTypeToComponents,
  getAllComponentMappings,
  getComponentRecommendations,
  getLayoutPatternForScreenType,
  formatComponentImports,
  groupComponentsByImport,
  suggestComponentProps,
  getUniqueComponentsForScreenTypes,
  getAllScreenTypes,
  isComponentRecommendedForScreen,
  getScreenTypesUsingComponent
} from './component-mapper';

// From implementation-order.ts
export {
  ImplementationOrder,
  ImplementationPhase,
  DependencyNode,
  DependencyGraph,
  calculateImplementationOrder,
  buildDependencyGraph,
  topologicalSort,
  groupIntoPhases,
  identifyCriticalPath,
  suggestParallelization,
  formatImplementationChecklist,
  getPhaseByNumber,
  getScreensForPhase,
  isOnCriticalPath,
  getScreenPriority
} from './implementation-order';

// From validators/specs-validator.ts
export {
  ValidationSeverity,
  ValidationIssue,
  SectionValidation,
  SpecsValidationResult,
  ValidationSummary,
  SpecsReport,
  validateSpecs,
  validateDesignTokens,
  validateDesignSystemDoc,
  validateScreenSpecs,
  validateComponentMappings,
  validateImplementationOrder,
  calculateCompletenessScore,
  formatValidationResult,
  getValidationStatusLine,
  getIssuesBySeverity,
  getIssuesByCategory
} from './validators/specs-validator';
