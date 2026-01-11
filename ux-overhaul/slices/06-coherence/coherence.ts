/**
 * Coherence Orchestrator for UX Overhaul Skill
 * Main entry point for the coherence validation phase
 *
 * Validates visual consistency across all generated designs from Phases 4 and 5,
 * detects outliers showing style drift, and orchestrates regeneration.
 */

import * as path from 'path';
import { readJson, writeJson, ensureDir, FileResult } from '../../core/utils/file';
import {
  readManifest,
  writeManifest,
  updatePhaseStatus,
  canStartPhase,
  Manifest
} from '../../core/utils/manifest';
import { PropagatedScreen, PropagationReport } from '../04-propagation/propagation';
import { StatesReport, ScreenStates } from '../05-states/states';
import { StyleConfig, Anchor, ViewportType } from '../03-anchoring/anchoring';
import { AppUnderstanding } from '../01-capture/capture';
import {
  OutlierInfo,
  OutlierDetectionResult,
  OUTLIER_THRESHOLD,
  REGENERATION_THRESHOLD,
  detectOutliers,
  getOutliersForRegeneration
} from './outlier-detector';
import {
  FlowAnalysisResult,
  FlowAnalysisSummary,
  analyzeAllFlows,
  getFlowAnalysisSummary
} from './flow-analyzer';
import {
  RegenerationRecord,
  RegenerationResult,
  regenerateBatch,
  toRegenerationRecords,
  getRegenerationSummary
} from './regenerator';
import {
  CoherenceValidationResult,
  validateScreenCoherence
} from './validators/coherence-validator';

// ============================================================================
// Types
// ============================================================================

/**
 * Individual screen coherence result
 */
export interface ScreenCoherence {
  screenId: string;
  screenName: string;
  screenPath: string;
  coherenceScore: number;
  passed: boolean;
  issues: string[];
}

/**
 * Aggregated coherence summary
 */
export interface CoherenceSummary {
  totalScreens: number;
  coherentCount: number;
  outlierCount: number;
  regeneratedCount: number;
  overallCoherenceScore: number;
  passNumber: number;
  totalPasses: number;
  totalRegenerationCost: number;
}

/**
 * Complete coherence report
 */
export interface CoherenceReport {
  validatedAt: string;
  appName: string;
  viewport: ViewportType;
  passNumber: number;
  maxPasses: number;
  screens: ScreenCoherence[];
  outliers: OutlierInfo[];
  regenerations: RegenerationRecord[];
  summary: CoherenceSummary;
}

/**
 * Coherence configuration
 */
export interface CoherenceConfig {
  outputDir: string;
  viewport: ViewportType;
  maxPasses: number;
  coherenceThreshold: number;
  maxRegenerationsPerScreen: number;
}

/**
 * Coherence operation result
 */
export interface CoherenceResult {
  success: boolean;
  manifest?: Manifest;
  coherenceReport?: CoherenceReport;
  flowAnalysis?: FlowAnalysisResult[];
  error?: string;
}

// ============================================================================
// Configuration Defaults
// ============================================================================

const DEFAULT_MAX_PASSES = 2;
const DEFAULT_COHERENCE_THRESHOLD = 85;
const DEFAULT_MAX_REGENERATIONS_PER_SCREEN = 2;

/**
 * Creates coherence config from arguments
 */
export function createCoherenceConfig(
  outputDir: string,
  options?: Partial<CoherenceConfig>
): CoherenceConfig {
  return {
    outputDir,
    viewport: options?.viewport || 'mobile',
    maxPasses: options?.maxPasses || DEFAULT_MAX_PASSES,
    coherenceThreshold: options?.coherenceThreshold || DEFAULT_COHERENCE_THRESHOLD,
    maxRegenerationsPerScreen: options?.maxRegenerationsPerScreen || DEFAULT_MAX_REGENERATIONS_PER_SCREEN
  };
}

// ============================================================================
// Initialization
// ============================================================================

/**
 * Initializes coherence validation session
 */
export function initializeCoherence(config: CoherenceConfig): CoherenceResult {
  // Read manifest
  const manifestResult = readManifest(config.outputDir);
  if (!manifestResult.success || !manifestResult.data) {
    return { success: false, error: `Failed to read manifest: ${manifestResult.error}` };
  }

  const manifest = manifestResult.data;

  // Check if coherence can start (states or propagation must be complete)
  const canStart = canStartPhase(manifest, 'coherence');
  if (!canStart.canStart) {
    return { success: false, error: canStart.reason };
  }

  // Update phase status
  updatePhaseStatus(manifest, 'coherence', 'in_progress');

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
 * Completes coherence phase
 */
export function completeCoherence(
  outputDir: string,
  report: CoherenceReport
): CoherenceResult {
  // Write coherence report
  const reportPath = path.join(outputDir, 'coherence_report.json');
  const reportResult = writeJson(reportPath, report);
  if (!reportResult.success) {
    return { success: false, error: `Failed to write coherence report: ${reportResult.error}` };
  }

  // Update manifest
  const manifestResult = readManifest(outputDir);
  if (!manifestResult.success || !manifestResult.data) {
    return { success: false, error: `Failed to read manifest: ${manifestResult.error}` };
  }

  const manifest = manifestResult.data;
  updatePhaseStatus(manifest, 'coherence', 'complete');

  const writeManifestResult = writeManifest(outputDir, manifest);
  if (!writeManifestResult.success) {
    return { success: false, error: writeManifestResult.error };
  }

  return {
    success: true,
    manifest,
    coherenceReport: report
  };
}

// ============================================================================
// Summary Generation
// ============================================================================

/**
 * Generates coherence summary from results
 */
export function generateCoherenceSummary(
  screens: ScreenCoherence[],
  outliers: OutlierInfo[],
  regenerations: RegenerationRecord[],
  passNumber: number,
  totalPasses: number
): CoherenceSummary {
  const coherentCount = screens.filter(s => s.passed).length;
  const totalCost = regenerations.reduce((sum, r) => sum + r.cost, 0);

  // Calculate overall coherence score
  const totalScore = screens.reduce((sum, s) => sum + s.coherenceScore, 0);
  const overallCoherenceScore = screens.length > 0
    ? Math.round(totalScore / screens.length)
    : 100;

  return {
    totalScreens: screens.length,
    coherentCount,
    outlierCount: outliers.length,
    regeneratedCount: regenerations.filter(r => r.success).length,
    overallCoherenceScore,
    passNumber,
    totalPasses,
    totalRegenerationCost: totalCost
  };
}

/**
 * Builds the coherence report
 */
export function buildCoherenceReport(
  appName: string,
  viewport: ViewportType,
  passNumber: number,
  maxPasses: number,
  screens: ScreenCoherence[],
  outliers: OutlierInfo[],
  regenerations: RegenerationRecord[]
): CoherenceReport {
  return {
    validatedAt: new Date().toISOString(),
    appName,
    viewport,
    passNumber,
    maxPasses,
    screens,
    outliers,
    regenerations,
    summary: generateCoherenceSummary(screens, outliers, regenerations, passNumber, maxPasses)
  };
}

// ============================================================================
// Summary & Display
// ============================================================================

/**
 * Generates human-readable coherence summary
 */
export function getCoherenceSummary(report: CoherenceReport): string {
  const { summary } = report;
  const lines = [
    `Coherence Validation: ${report.appName}`,
    `Viewport: ${report.viewport}`,
    `Validated At: ${report.validatedAt}`,
    '',
    `Pass: ${summary.passNumber}/${summary.totalPasses}`,
    `Overall Coherence: ${summary.overallCoherenceScore}%`,
    '',
    `Total Screens: ${summary.totalScreens}`,
    `  Coherent: ${summary.coherentCount}`,
    `  Outliers: ${summary.outlierCount}`,
    `  Regenerated: ${summary.regeneratedCount}`,
    '',
    `Regeneration Cost: $${summary.totalRegenerationCost.toFixed(2)}`
  ];

  if (report.outliers.length > 0) {
    lines.push('');
    lines.push('Outliers:');
    for (const outlier of report.outliers.slice(0, 5)) {
      const status = outlier.shouldRegenerate ? '[REGEN]' : '[MINOR]';
      lines.push(`  ${status} ${outlier.screenName} (${outlier.outlierScore}%)`);
    }
    if (report.outliers.length > 5) {
      lines.push(`  ... and ${report.outliers.length - 5} more`);
    }
  }

  return lines.join('\n');
}

/**
 * Gets a brief status line
 */
export function getCoherenceStatusLine(report: CoherenceReport): string {
  const { summary } = report;
  return `${summary.coherentCount}/${summary.totalScreens} coherent (${summary.overallCoherenceScore}%), ${summary.regeneratedCount} regenerated, $${summary.totalRegenerationCost.toFixed(2)} cost`;
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
 * Loads saved coherence report
 */
export function loadCoherenceReport(outputDir: string): FileResult<CoherenceReport> {
  const filePath = path.join(outputDir, 'coherence_report.json');
  return readJson<CoherenceReport>(filePath);
}

// ============================================================================
// Coherence Execution
// ============================================================================

/**
 * Runs the full coherence validation process
 *
 * Flow:
 * 1. Load required artifacts (propagation report, states report, style config)
 * 2. Analyze flows for coherence
 * 3. Detect outliers
 * 4. Regenerate outliers (if any)
 * 5. Re-validate (up to maxPasses)
 * 6. Generate final report
 */
export async function runCoherence(
  config: CoherenceConfig,
  propagationReport: PropagationReport,
  statesReport: StatesReport | null,
  styleConfig: StyleConfig,
  appUnderstanding?: AppUnderstanding
): Promise<CoherenceResult> {
  const screens = propagationReport.screens.filter(s => s.success);

  if (screens.length === 0) {
    return { success: false, error: 'No successfully propagated screens to validate' };
  }

  const validatedAnchors = styleConfig.anchors.filter(a => a.validated);
  if (validatedAnchors.length === 0) {
    return { success: false, error: 'No validated anchors available for coherence check' };
  }

  // Track all regenerations across passes
  const allRegenerations: RegenerationRecord[] = [];
  let currentScreens = [...screens];
  let passNumber = 0;

  // Main validation loop
  while (passNumber < config.maxPasses) {
    passNumber++;

    // Step 1: Detect outliers
    const outlierResult = detectOutliers(currentScreens, styleConfig, validatedAnchors);

    // Step 2: Check if coherence threshold met
    if (outlierResult.overallCoherenceScore >= config.coherenceThreshold) {
      // Coherence achieved!
      const screenCoherences = convertToScreenCoherences(currentScreens, outlierResult);
      const report = buildCoherenceReport(
        propagationReport.appName,
        config.viewport,
        passNumber,
        config.maxPasses,
        screenCoherences,
        [], // No remaining outliers
        allRegenerations
      );

      return {
        success: true,
        coherenceReport: report
      };
    }

    // Step 3: Get outliers that need regeneration
    const outliersToRegenerate = getOutliersForRegeneration(outlierResult);

    if (outliersToRegenerate.length === 0) {
      // No regeneratable outliers, but still below threshold
      const screenCoherences = convertToScreenCoherences(currentScreens, outlierResult);
      const report = buildCoherenceReport(
        propagationReport.appName,
        config.viewport,
        passNumber,
        config.maxPasses,
        screenCoherences,
        outlierResult.outliers,
        allRegenerations
      );

      return {
        success: true,
        coherenceReport: report
      };
    }

    // Step 4: Regenerate outliers
    const regenResult = await regenerateBatch(
      outliersToRegenerate,
      currentScreens,
      styleConfig,
      config.viewport,
      config.outputDir,
      config.maxRegenerationsPerScreen
    );

    // Track regenerations
    const records = toRegenerationRecords(regenResult.results, passNumber);
    allRegenerations.push(...records);

    // Update screens with successful regenerations
    const successfulRegens = regenResult.results.filter(r => r.success);
    for (const regen of successfulRegens) {
      const screenIndex = currentScreens.findIndex(s => s.screenId === regen.screenId);
      if (screenIndex >= 0 && regen.newPath) {
        currentScreens[screenIndex] = {
          ...currentScreens[screenIndex],
          propagatedPath: regen.newPath,
          attempts: currentScreens[screenIndex].attempts + regen.attempts,
          cost: currentScreens[screenIndex].cost + regen.cost
        };
      }
    }
  }

  // Max passes reached - generate final report with remaining outliers
  const finalOutlierResult = detectOutliers(currentScreens, styleConfig, validatedAnchors);
  const screenCoherences = convertToScreenCoherences(currentScreens, finalOutlierResult);

  const report = buildCoherenceReport(
    propagationReport.appName,
    config.viewport,
    passNumber,
    config.maxPasses,
    screenCoherences,
    finalOutlierResult.outliers,
    allRegenerations
  );

  return {
    success: true,
    coherenceReport: report
  };
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Converts propagated screens and outlier detection to screen coherences
 */
function convertToScreenCoherences(
  screens: PropagatedScreen[],
  outlierResult: OutlierDetectionResult
): ScreenCoherence[] {
  const outlierMap = new Map(outlierResult.outliers.map(o => [o.screenId, o]));

  return screens.map(screen => {
    const outlier = outlierMap.get(screen.screenId);
    const coherenceScore = outlier
      ? 100 - outlier.outlierScore
      : 100;

    return {
      screenId: screen.screenId,
      screenName: screen.screenName,
      screenPath: screen.propagatedPath,
      coherenceScore,
      passed: coherenceScore >= (100 - OUTLIER_THRESHOLD),
      issues: outlier?.reasons || []
    };
  });
}

// ============================================================================
// Re-exports for skill integration
// ============================================================================

// From flow-analyzer.ts
export {
  FlowTransition,
  FlowAnalysisResult,
  FlowAnalysisSummary,
  analyzeFlow,
  analyzeAllFlows,
  calculateTransitionScore,
  getFlowAnalysisSummary,
  formatFlowAnalysis,
  formatFlowAnalysisSummary,
  getProblematicScreenTypes
} from './flow-analyzer';

// From outlier-detector.ts
export {
  OutlierReason,
  OutlierInfo,
  OutlierDetectionResult,
  OUTLIER_THRESHOLD,
  REGENERATION_THRESHOLD,
  detectOutliers,
  calculateOutlierScore,
  compareToAnchors,
  getRecommendationsForOutlier,
  formatOutlierReport,
  getOutlierStatusLine,
  getOutliersForRegeneration,
  getOutliersBySeverity,
  getOutliersByReason
} from './outlier-detector';

// From regenerator.ts
export {
  RegenerationRequest,
  RegenerationResult,
  RegenerationRecord,
  regenerateScreen,
  regenerateBatch,
  buildRegenerationPrompt,
  adjustPromptForCoherenceRetry,
  getRegenerationSummary,
  formatRegenerationSummary,
  toRegenerationRecords,
  estimateRegenerationCost,
  formatCost
} from './regenerator';

// From validators/coherence-validator.ts
export {
  ValidationCheck,
  CoherenceValidationResult,
  validateScreenCoherence,
  validateFileIntegrity,
  validateFileSize,
  validateFileFormat,
  validateColorAdherence,
  validateStyleConsistency,
  formatValidationResult,
  getValidationStatusLine,
  validateBatchCoherence,
  getBatchValidationSummary
} from './validators/coherence-validator';
