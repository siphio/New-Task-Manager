/**
 * States Orchestrator for UX Overhaul Skill
 * Generates state variants (loading, empty, error, success) for propagated screens
 */

import * as path from 'path';
import { readJson, writeJson, ensureDir, FileResult } from '../../core/utils/file';
import {
  readManifest, writeManifest, updatePhaseStatus, canStartPhase,
  incrementBatchProgress, Manifest
} from '../../core/utils/manifest';
import { PropagatedScreen, PropagationReport } from '../04-propagation/propagation';
import { StyleConfig, ViewportType } from '../03-anchoring/anchoring';

// ============================================================================
// Types
// ============================================================================

export type StateType = 'loading' | 'empty' | 'error' | 'success';
export const STATE_TYPES: StateType[] = ['loading', 'empty', 'error', 'success'];

export interface GeneratedState {
  screenId: string;
  screenName: string;
  stateType: StateType;
  originalPropagatedPath: string;
  statePath: string;
  success: boolean;
  attempts: number;
  cost: number;
  strengthUsed: number;
  error?: string;
}

export interface ScreenStates {
  screenId: string;
  screenName: string;
  states: GeneratedState[];
  totalCost: number;
  successCount: number;
}

export interface StatesSummary {
  totalScreens: number;
  totalStates: number;
  successCount: number;
  failureCount: number;
  totalCost: number;
  averageAttempts: number;
  byStateType: Record<StateType, { count: number; successRate: number }>;
}

export interface StatesReport {
  generatedAt: string;
  appName: string;
  viewport: ViewportType;
  batchSize: number;
  screens: ScreenStates[];
  summary: StatesSummary;
}

export interface StatesConfig {
  outputDir: string;
  viewport: ViewportType;
  batchSize: number;
  maxRegenerations: number;
  stateTypes?: StateType[];
}

export interface StatesResult {
  success: boolean;
  manifest?: Manifest;
  generatedStates?: GeneratedState[];
  statesReport?: StatesReport;
  error?: string;
}

// ============================================================================
// Configuration
// ============================================================================

const DEFAULT_BATCH_SIZE = 5;
const DEFAULT_MAX_REGENERATIONS = 3;

export function createStatesConfig(
  outputDir: string,
  options?: Partial<StatesConfig>
): StatesConfig {
  return {
    outputDir,
    viewport: options?.viewport || 'mobile',
    batchSize: options?.batchSize || DEFAULT_BATCH_SIZE,
    maxRegenerations: options?.maxRegenerations || DEFAULT_MAX_REGENERATIONS,
    stateTypes: options?.stateTypes || STATE_TYPES
  };
}

// ============================================================================
// Initialization
// ============================================================================

export function initializeStates(config: StatesConfig): StatesResult {
  const manifestResult = readManifest(config.outputDir);
  if (!manifestResult.success || !manifestResult.data) {
    return { success: false, error: `Failed to read manifest: ${manifestResult.error}` };
  }

  const manifest = manifestResult.data;
  const canStart = canStartPhase(manifest, 'states');
  if (!canStart.canStart) {
    return { success: false, error: canStart.reason };
  }

  const statesDir = path.join(config.outputDir, 'generated', 'states');
  const statesDirResult = ensureDir(statesDir);
  if (!statesDirResult.success) {
    return { success: false, error: statesDirResult.error };
  }

  updatePhaseStatus(manifest, 'states', 'in_progress');
  const writeResult = writeManifest(config.outputDir, manifest);
  if (!writeResult.success) {
    return { success: false, error: writeResult.error };
  }

  return { success: true, manifest };
}

// ============================================================================
// Completion
// ============================================================================

export function completeStates(
  outputDir: string,
  screenStates: ScreenStates[],
  statesReport: StatesReport
): StatesResult {
  const reportPath = path.join(outputDir, 'states_report.json');
  const reportResult = writeJson(reportPath, statesReport);
  if (!reportResult.success) {
    return { success: false, error: `Failed to write states report: ${reportResult.error}` };
  }

  const manifestResult = readManifest(outputDir);
  if (!manifestResult.success || !manifestResult.data) {
    return { success: false, error: `Failed to read manifest: ${manifestResult.error}` };
  }

  const manifest = manifestResult.data;
  updatePhaseStatus(manifest, 'states', 'complete');
  const writeManifestResult = writeManifest(outputDir, manifest);
  if (!writeManifestResult.success) {
    return { success: false, error: writeManifestResult.error };
  }

  return {
    success: true,
    manifest,
    generatedStates: screenStates.flatMap(s => s.states),
    statesReport
  };
}

// ============================================================================
// Summary Generation
// ============================================================================

export function generateStatesSummary(screenStates: ScreenStates[]): StatesSummary {
  const allStates = screenStates.flatMap(s => s.states);
  const successCount = allStates.filter(s => s.success).length;
  const totalAttempts = allStates.reduce((sum, s) => sum + s.attempts, 0);

  const byStateType: Record<StateType, { count: number; successRate: number }> = {
    loading: { count: 0, successRate: 0 },
    empty: { count: 0, successRate: 0 },
    error: { count: 0, successRate: 0 },
    success: { count: 0, successRate: 0 }
  };

  for (const stateType of STATE_TYPES) {
    const typeStates = allStates.filter(s => s.stateType === stateType);
    const typeSuccess = typeStates.filter(s => s.success).length;
    byStateType[stateType] = {
      count: typeStates.length,
      successRate: typeStates.length > 0 ? Math.round((typeSuccess / typeStates.length) * 100) : 0
    };
  }

  return {
    totalScreens: screenStates.length,
    totalStates: allStates.length,
    successCount,
    failureCount: allStates.length - successCount,
    totalCost: allStates.reduce((sum, s) => sum + (s.cost || 0), 0),
    averageAttempts: allStates.length > 0 ? totalAttempts / allStates.length : 0,
    byStateType
  };
}

export function buildStatesReport(
  appName: string,
  viewport: ViewportType,
  batchSize: number,
  screenStates: ScreenStates[]
): StatesReport {
  return {
    generatedAt: new Date().toISOString(),
    appName,
    viewport,
    batchSize,
    screens: screenStates,
    summary: generateStatesSummary(screenStates)
  };
}

// ============================================================================
// Display
// ============================================================================

export function getStatesSummary(report: StatesReport): string {
  const { summary } = report;
  const lines = [
    `States Generation Complete: ${report.appName}`,
    `Viewport: ${report.viewport}`,
    `Total Screens: ${summary.totalScreens}`,
    `Total States: ${summary.totalStates} (Success: ${summary.successCount}, Failed: ${summary.failureCount})`,
    `Total Cost: $${summary.totalCost.toFixed(2)}`,
    '',
    'By State Type:'
  ];
  for (const [type, stats] of Object.entries(summary.byStateType)) {
    lines.push(`  ${type}: ${stats.count} (${stats.successRate}% success)`);
  }
  return lines.join('\n');
}

export function getStatesStatusLine(report: StatesReport): string {
  const { summary } = report;
  return `${summary.successCount}/${summary.totalStates} states generated, $${summary.totalCost.toFixed(2)} cost`;
}

// ============================================================================
// Helpers
// ============================================================================

export function loadStyleConfig(outputDir: string): FileResult<StyleConfig> {
  return readJson<StyleConfig>(path.join(outputDir, 'style_config.json'));
}

export function loadPropagationReport(outputDir: string): FileResult<PropagationReport> {
  return readJson<PropagationReport>(path.join(outputDir, 'propagation_report.json'));
}

export function loadStatesReport(outputDir: string): FileResult<StatesReport> {
  return readJson<StatesReport>(path.join(outputDir, 'states_report.json'));
}

// ============================================================================
// Execution
// ============================================================================

import { generateScreenStates } from './state-generator';
import { extractColorPaletteArray } from '../04-propagation/propagator';

export async function runStates(
  config: StatesConfig,
  propagationReport: PropagationReport,
  styleConfig: StyleConfig
): Promise<StatesResult> {
  const screenStates: ScreenStates[] = [];
  const screens = propagationReport.screens.filter(s => s.success);

  if (screens.length === 0) {
    return { success: false, error: 'No successfully propagated screens' };
  }

  const validatedAnchors = styleConfig.anchors.filter(a => a.validated);
  if (validatedAnchors.length === 0) {
    return { success: false, error: 'No validated anchors available' };
  }

  const colorPalette = extractColorPaletteArray(styleConfig.colorPalette);
  const manifestResult = readManifest(config.outputDir);
  if (!manifestResult.success || !manifestResult.data) {
    return { success: false, error: `Failed to read manifest: ${manifestResult.error}` };
  }

  let manifest = manifestResult.data;
  const stateTypes = config.stateTypes || STATE_TYPES;
  const batches = chunkArray(screens, config.batchSize);

  for (const batch of batches) {
    for (const screen of batch) {
      const result = await generateScreenStates(
        screen, stateTypes, validatedAnchors, colorPalette,
        styleConfig.styleDirection, config.viewport, config.outputDir, config.maxRegenerations
      );
      screenStates.push(result);
    }

    incrementBatchProgress(manifest, 'states', batch.length * stateTypes.length);
    writeManifest(config.outputDir, manifest);
  }

  const statesReport = buildStatesReport(
    propagationReport.appName, config.viewport, config.batchSize, screenStates
  );

  return { success: true, manifest, generatedStates: screenStates.flatMap(s => s.states), statesReport };
}

function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

// ============================================================================
// Re-exports
// ============================================================================

export {
  StateGenerationRequest, StateGeneratorResult,
  STATE_STRENGTHS, STATE_TYPE_NAMES,
  generateState, generateScreenStates, buildReferenceArray,
  adjustPromptForRetry, estimateStatesCost, formatCost
} from './state-generator';

export {
  ValidationCheck, StateValidationResult,
  validateStateImage, formatValidationResult, getValidationStatusLine,
  validateStateImages, getBatchValidationSummary
} from './validators/state-validator';
