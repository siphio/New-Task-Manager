/**
 * Propagation Orchestrator for UX Overhaul Skill
 * Main entry point for the propagation phase
 *
 * Applies validated 14-anchor style system to all captured screens,
 * producing redesigned versions with consistent styling and audit-driven improvements
 */

import * as path from 'path';
import { readJson, writeJson, ensureDir, FileResult } from '../../core/utils/file';
import {
  readManifest,
  writeManifest,
  updatePhaseStatus,
  canStartPhase,
  incrementBatchProgress,
  Manifest
} from '../../core/utils/manifest';
import { AppUnderstanding } from '../01-capture/capture';
import { CapturedScreen } from '../01-capture/flow-executor';
import { ImprovementPlan } from '../02-audit/audit';
import { getPromptInjectionsFromPlan } from '../02-audit/issue-prioritizer';
import { StyleConfig, Anchor, ViewportType } from '../03-anchoring/anchoring';
import { ScreenType, classifyScreen, classifyScreens } from './screen-classifier';
import { propagateScreen, extractColorPaletteArray } from './propagator';

// ============================================================================
// Types
// ============================================================================

/**
 * Single propagated screen result
 */
export interface PropagatedScreen {
  screenId: string;
  screenName: string;
  screenType: string;
  originalPath: string;
  propagatedPath: string;
  success: boolean;
  attempts: number;
  cost: number;
  strengthUsed: number;
  improvementsApplied: string[];
  error?: string;
}

/**
 * Aggregated propagation summary
 */
export interface PropagationSummary {
  totalScreens: number;
  successCount: number;
  failureCount: number;
  totalCost: number;
  averageAttempts: number;
  byScreenType: Record<string, { count: number; successRate: number }>;
}

/**
 * Complete propagation report
 */
export interface PropagationReport {
  propagatedAt: string;
  appName: string;
  viewport: ViewportType;
  batchSize: number;
  screens: PropagatedScreen[];
  summary: PropagationSummary;
}

/**
 * Propagation configuration
 */
export interface PropagationConfig {
  outputDir: string;
  viewport: ViewportType;
  batchSize: number;
  maxRegenerations: number;
  strengthOverride?: number;
}

/**
 * Propagation operation result
 */
export interface PropagationResult {
  success: boolean;
  manifest?: Manifest;
  propagatedScreens?: PropagatedScreen[];
  propagationReport?: PropagationReport;
  error?: string;
}

// ============================================================================
// Configuration Defaults
// ============================================================================

const DEFAULT_BATCH_SIZE = 5;
const DEFAULT_MAX_REGENERATIONS = 3;

/**
 * Creates propagation config from arguments
 */
export function createPropagationConfig(
  outputDir: string,
  options?: Partial<PropagationConfig>
): PropagationConfig {
  return {
    outputDir,
    viewport: options?.viewport || 'mobile',
    batchSize: options?.batchSize || DEFAULT_BATCH_SIZE,
    maxRegenerations: options?.maxRegenerations || DEFAULT_MAX_REGENERATIONS,
    strengthOverride: options?.strengthOverride
  };
}

// ============================================================================
// Initialization
// ============================================================================

/**
 * Initializes propagation session
 */
export function initializePropagation(config: PropagationConfig): PropagationResult {
  // Read manifest
  const manifestResult = readManifest(config.outputDir);
  if (!manifestResult.success || !manifestResult.data) {
    return { success: false, error: `Failed to read manifest: ${manifestResult.error}` };
  }

  const manifest = manifestResult.data;

  // Check if propagation can start (anchoring must be complete)
  const canStart = canStartPhase(manifest, 'propagation');
  if (!canStart.canStart) {
    return { success: false, error: canStart.reason };
  }

  // Create output directories
  const screensDir = path.join(config.outputDir, 'generated', 'screens');

  const screensDirResult = ensureDir(screensDir);
  if (!screensDirResult.success) {
    return { success: false, error: screensDirResult.error };
  }

  // Update phase status
  updatePhaseStatus(manifest, 'propagation', 'in_progress');

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
 * Completes propagation phase
 */
export function completePropagation(
  outputDir: string,
  propagatedScreens: PropagatedScreen[],
  propagationReport: PropagationReport
): PropagationResult {
  // Write propagation report
  const reportPath = path.join(outputDir, 'propagation_report.json');
  const reportResult = writeJson(reportPath, propagationReport);
  if (!reportResult.success) {
    return { success: false, error: `Failed to write propagation report: ${reportResult.error}` };
  }

  // Update manifest
  const manifestResult = readManifest(outputDir);
  if (!manifestResult.success || !manifestResult.data) {
    return { success: false, error: `Failed to read manifest: ${manifestResult.error}` };
  }

  const manifest = manifestResult.data;
  updatePhaseStatus(manifest, 'propagation', 'complete');

  const writeManifestResult = writeManifest(outputDir, manifest);
  if (!writeManifestResult.success) {
    return { success: false, error: writeManifestResult.error };
  }

  return {
    success: true,
    manifest,
    propagatedScreens,
    propagationReport
  };
}

// ============================================================================
// Summary Generation
// ============================================================================

/**
 * Generates propagation summary from screens
 */
export function generatePropagationSummary(screens: PropagatedScreen[]): PropagationSummary {
  const successCount = screens.filter(s => s.success).length;
  const failureCount = screens.length - successCount;
  const totalCost = screens.reduce((sum, s) => sum + (s.cost || 0), 0);
  const totalAttempts = screens.reduce((sum, s) => sum + s.attempts, 0);

  // Group by screen type
  const byScreenType: Record<string, { count: number; successRate: number }> = {};
  const typeGroups = new Map<string, PropagatedScreen[]>();

  for (const screen of screens) {
    if (!typeGroups.has(screen.screenType)) {
      typeGroups.set(screen.screenType, []);
    }
    typeGroups.get(screen.screenType)!.push(screen);
  }

  for (const [type, typeScreens] of typeGroups) {
    const typeSuccess = typeScreens.filter(s => s.success).length;
    byScreenType[type] = {
      count: typeScreens.length,
      successRate: Math.round((typeSuccess / typeScreens.length) * 100)
    };
  }

  return {
    totalScreens: screens.length,
    successCount,
    failureCount,
    totalCost,
    averageAttempts: screens.length > 0 ? totalAttempts / screens.length : 0,
    byScreenType
  };
}

/**
 * Builds the propagation report
 */
export function buildPropagationReport(
  appName: string,
  viewport: ViewportType,
  batchSize: number,
  screens: PropagatedScreen[]
): PropagationReport {
  return {
    propagatedAt: new Date().toISOString(),
    appName,
    viewport,
    batchSize,
    screens,
    summary: generatePropagationSummary(screens)
  };
}

// ============================================================================
// Summary & Display
// ============================================================================

/**
 * Generates human-readable propagation summary
 */
export function getPropagationSummary(report: PropagationReport): string {
  const { summary } = report;
  const lines = [
    `Propagation Complete: ${report.appName}`,
    `Viewport: ${report.viewport}`,
    `Propagated At: ${report.propagatedAt}`,
    '',
    `Total Screens: ${summary.totalScreens}`,
    `  Success: ${summary.successCount}`,
    `  Failed: ${summary.failureCount}`,
    '',
    `Total Cost: $${summary.totalCost.toFixed(2)}`,
    `Average Attempts: ${summary.averageAttempts.toFixed(1)}`,
    '',
    'By Screen Type:'
  ];

  for (const [type, stats] of Object.entries(summary.byScreenType)) {
    lines.push(`  ${type}: ${stats.count} screens (${stats.successRate}% success)`);
  }

  return lines.join('\n');
}

/**
 * Gets a brief status line
 */
export function getPropagationStatusLine(report: PropagationReport): string {
  const { summary } = report;
  return `${summary.successCount}/${summary.totalScreens} screens propagated, $${summary.totalCost.toFixed(2)} cost`;
}

// ============================================================================
// Helpers
// ============================================================================

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
 * Loads saved propagation report
 */
export function loadPropagationReport(outputDir: string): FileResult<PropagationReport> {
  const filePath = path.join(outputDir, 'propagation_report.json');
  return readJson<PropagationReport>(filePath);
}

// ============================================================================
// Propagation Execution
// ============================================================================

/**
 * Runs the full propagation process
 *
 * Flow:
 * 1. Load required artifacts (app understanding, style config, improvement plan)
 * 2. Classify all screens by type
 * 3. Process screens in batches
 * 4. For each screen: build prompt, call fal.ai, validate, save
 * 5. Update manifest progress after each batch
 * 6. Generate report on completion
 */
export async function runPropagation(
  config: PropagationConfig,
  appUnderstanding: AppUnderstanding,
  styleConfig: StyleConfig,
  improvementPlan: ImprovementPlan
): Promise<PropagationResult> {
  const propagatedScreens: PropagatedScreen[] = [];
  const screens = appUnderstanding.screens;

  // Validate we have anchors
  const validatedAnchors = styleConfig.anchors.filter(a => a.validated);
  if (validatedAnchors.length === 0) {
    return { success: false, error: 'No validated anchors available for propagation' };
  }

  // Classify all screens
  const screenTypes = classifyScreens(screens);

  // Extract color palette
  const colorPalette = extractColorPaletteArray(styleConfig.colorPalette);

  // Read manifest for progress tracking
  const manifestResult = readManifest(config.outputDir);
  if (!manifestResult.success || !manifestResult.data) {
    return { success: false, error: `Failed to read manifest: ${manifestResult.error}` };
  }

  let manifest = manifestResult.data;

  // Process screens in batches
  const batches = chunkArray(screens, config.batchSize);
  let batchNumber = 0;

  for (const batch of batches) {
    batchNumber++;

    for (const screen of batch) {
      const screenType = screenTypes.get(screen.id) || 'generic';

      // Get prompt injections for this screen
      const promptInjections = getPromptInjectionsFromPlan(
        improvementPlan,
        screen.id,
        5
      );

      // Propagate screen
      const result = await propagateScreen({
        screen,
        screenType: screenType as ScreenType,
        anchors: validatedAnchors,
        colorPalette,
        styleDirection: styleConfig.styleDirection,
        viewport: config.viewport,
        promptInjections,
        outputDir: config.outputDir,
        strengthOverride: config.strengthOverride
      }, config.maxRegenerations);

      if (result.propagatedScreen) {
        propagatedScreens.push(result.propagatedScreen);
      }
    }

    // Update manifest progress after each batch
    incrementBatchProgress(manifest, 'propagation', batch.length);
    writeManifest(config.outputDir, manifest);
  }

  // Build report
  const propagationReport = buildPropagationReport(
    appUnderstanding.appName,
    config.viewport,
    config.batchSize,
    propagatedScreens
  );

  return {
    success: true,
    manifest,
    propagatedScreens,
    propagationReport
  };
}

/**
 * Splits array into chunks
 */
function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

// ============================================================================
// Re-exports for skill integration
// ============================================================================

// From screen-classifier.ts
export {
  ScreenType,
  SCREEN_TYPE_STRENGTHS,
  classifyScreen,
  classifyScreens,
  inferScreenTypeFromName,
  getStrengthForScreenType,
  getScreenTypeDisplayName,
  getAllScreenTypes,
  getStrengthInfo,
  getClassificationStats
} from './screen-classifier';

// From propagator.ts
export {
  PropagationRequest,
  PropagatorResult,
  propagateScreen as propagateSingleScreen,
  propagateBatch,
  buildReferenceArray,
  extractColorPaletteArray,
  adjustPromptForRetry,
  estimatePropagationCost,
  formatCost,
  getCostSummary
} from './propagator';

// From validators/propagation-validator.ts
export {
  ValidationCheck,
  PropagationValidationResult,
  validatePropagatedScreen,
  validateFileExists,
  validateFileSize,
  validateFileFormat,
  formatValidationResult,
  getValidationStatusLine,
  validatePropagatedScreens,
  getBatchValidationSummary
} from './validators/propagation-validator';
