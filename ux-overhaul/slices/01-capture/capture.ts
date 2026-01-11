/**
 * Capture Orchestrator for UX Overhaul Skill
 * Main entry point for the capture phase
 */

import * as path from 'path';
import { readJson, writeJson, ensureDir, FileResult } from '../../core/utils/file';
import {
  createManifest,
  writeManifest,
  updatePhaseStatus,
  setTotalScreens,
  Manifest
} from '../../core/utils/manifest';
import {
  FlowDefinition,
  validateFlowDefinition,
  buildExecutionPlan,
  ExecutionPlan,
  getScreenshotSteps,
  createCapturedScreen,
  CapturedScreen,
  formatExecutionPlanSummary
} from './flow-executor';
import { DomAnalysis, createEmptyAnalysis, classifyScreenType } from './dom-analyzer';
import { ViewportConfig, buildLaunchInstructions } from './playwright-adapter';

export interface CaptureConfig {
  flowDefinitionPath: string;
  outputDir: string;
  viewport: 'mobile' | 'tablet' | 'desktop' | 'desktop-xl';
}

export interface AppUnderstanding {
  appName: string;
  capturedAt: string;
  viewport: {
    name: string;
    width: number;
    height: number;
    aspectRatio: string;
  };
  screens: CapturedScreen[];
  sitemap: {
    totalScreens: number;
    flows: { name: string; screens: string[] }[];
  };
  detectedPatterns: {
    colors: { hex: string; usage: string; frequency: number }[];
    fonts: string[];
    spacing: { base: number; scale: number[] };
  };
}

export interface CaptureResult {
  success: boolean;
  manifest?: Manifest;
  appUnderstanding?: AppUnderstanding;
  executionPlan?: ExecutionPlan;
  error?: string;
}

/**
 * Initializes a capture session
 */
export function initializeCapture(config: CaptureConfig): CaptureResult {
  // Read flow definition
  const flowResult = readJson<FlowDefinition>(config.flowDefinitionPath);
  if (!flowResult.success || !flowResult.data) {
    return { success: false, error: `Failed to read flow definition: ${flowResult.error}` };
  }

  const flowDefinition = flowResult.data;

  // Validate flow definition
  const validation = validateFlowDefinition(flowDefinition);
  if (!validation.valid) {
    return { success: false, error: `Invalid flow definition: ${validation.errors.join(', ')}` };
  }

  // Build execution plan
  const executionPlan = buildExecutionPlan(flowDefinition, config.viewport);

  // Create output directory structure
  const outputDirResult = ensureDir(config.outputDir);
  if (!outputDirResult.success) {
    return { success: false, error: outputDirResult.error };
  }

  ensureDir(path.join(config.outputDir, 'screenshots'));

  // Create project ID from app name and viewport
  const projectId = `${flowDefinition.appName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${config.viewport}`;

  // Create manifest
  const manifest = createManifest(projectId, flowDefinition.baseUrl, config.viewport);
  manifest.totalScreens = executionPlan.totalScreenshots;

  // Update phase status to in_progress
  updatePhaseStatus(manifest, 'capture', 'in_progress');

  // Write manifest
  const manifestResult = writeManifest(config.outputDir, manifest);
  if (!manifestResult.success) {
    return { success: false, error: manifestResult.error };
  }

  return {
    success: true,
    manifest,
    executionPlan
  };
}

/**
 * Creates the app understanding document after capture completes
 */
export function createAppUnderstanding(
  flowDefinition: FlowDefinition,
  screens: CapturedScreen[],
  viewport: ViewportConfig,
  viewportName: string
): AppUnderstanding {
  // Group screens by flow
  const flowScreens: Record<string, string[]> = {};
  for (const screen of screens) {
    if (!flowScreens[screen.flowName]) {
      flowScreens[screen.flowName] = [];
    }
    flowScreens[screen.flowName].push(screen.id);
  }

  return {
    appName: flowDefinition.appName,
    capturedAt: new Date().toISOString(),
    viewport: {
      name: viewportName,
      width: viewport.width,
      height: viewport.height,
      aspectRatio: getAspectRatioString(viewport.width, viewport.height)
    },
    screens,
    sitemap: {
      totalScreens: screens.length,
      flows: Object.entries(flowScreens).map(([name, screenIds]) => ({
        name,
        screens: screenIds
      }))
    },
    detectedPatterns: {
      colors: [],
      fonts: [],
      spacing: { base: 4, scale: [4, 8, 12, 16, 24, 32, 48, 64] }
    }
  };
}

/**
 * Saves app understanding to file
 */
export function saveAppUnderstanding(
  outputDir: string,
  appUnderstanding: AppUnderstanding
): FileResult<void> {
  const filePath = path.join(outputDir, 'app_understanding.json');
  return writeJson(filePath, appUnderstanding);
}

/**
 * Completes the capture phase
 */
export function completeCapture(
  outputDir: string,
  manifest: Manifest,
  appUnderstanding: AppUnderstanding
): CaptureResult {
  // Save app understanding
  const saveResult = saveAppUnderstanding(outputDir, appUnderstanding);
  if (!saveResult.success) {
    return { success: false, error: saveResult.error };
  }

  // Update manifest
  setTotalScreens(manifest, appUnderstanding.screens.length);
  updatePhaseStatus(manifest, 'capture', 'complete');

  // Write updated manifest
  const manifestResult = writeManifest(outputDir, manifest);
  if (!manifestResult.success) {
    return { success: false, error: manifestResult.error };
  }

  return {
    success: true,
    manifest,
    appUnderstanding
  };
}

/**
 * Generates capture instructions for Claude Code
 */
export function generateCaptureInstructions(executionPlan: ExecutionPlan): string[] {
  const instructions: string[] = [
    '## Capture Phase Instructions',
    '',
    formatExecutionPlanSummary(executionPlan),
    '',
    '### Setup',
    buildLaunchInstructions(executionPlan.viewport),
    ''
  ];

  // Auth steps
  if (executionPlan.authSteps.length > 0) {
    instructions.push('### Authentication');
    for (const step of executionPlan.authSteps) {
      for (const instruction of step.instructions) {
        instructions.push(`- ${instruction}`);
      }
    }
    instructions.push('');
  }

  // Flow steps
  instructions.push('### Capture Steps');
  let currentFlow = '';
  for (const step of executionPlan.flowSteps) {
    if (step.flowName !== currentFlow) {
      currentFlow = step.flowName;
      instructions.push(`\n#### Flow: ${currentFlow}`);
    }
    for (const instruction of step.instructions) {
      instructions.push(`- ${instruction}`);
    }
  }

  return instructions;
}

/**
 * Gets aspect ratio as a string
 */
function getAspectRatioString(width: number, height: number): string {
  const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
  const divisor = gcd(width, height);
  return `${width / divisor}:${height / divisor}`;
}

/**
 * Validates that all expected screenshots were captured
 */
export function validateCaptureCompleteness(
  expectedScreenshots: number,
  capturedScreens: CapturedScreen[]
): { complete: boolean; missing: number } {
  const captured = capturedScreens.length;
  return {
    complete: captured >= expectedScreenshots,
    missing: Math.max(0, expectedScreenshots - captured)
  };
}

/**
 * Adds DOM analysis to a captured screen
 */
export function enrichScreenWithAnalysis(
  screen: CapturedScreen,
  analysis: DomAnalysis
): CapturedScreen & { dom: DomAnalysis; screenType: string } {
  return {
    ...screen,
    dom: analysis,
    screenType: classifyScreenType(analysis)
  };
}

/**
 * Gets a summary of the capture session
 */
export function getCaptureSummary(appUnderstanding: AppUnderstanding): string {
  const lines = [
    `Capture Complete: ${appUnderstanding.appName}`,
    `Viewport: ${appUnderstanding.viewport.name} (${appUnderstanding.viewport.width}x${appUnderstanding.viewport.height})`,
    `Captured At: ${appUnderstanding.capturedAt}`,
    '',
    `Total Screens: ${appUnderstanding.sitemap.totalScreens}`,
    'Flows:'
  ];

  for (const flow of appUnderstanding.sitemap.flows) {
    lines.push(`  - ${flow.name}: ${flow.screens.length} screens`);
  }

  return lines.join('\n');
}

/**
 * Creates initial capture config from arguments
 */
export function createCaptureConfig(
  flowDefinitionPath: string,
  outputDir: string,
  viewport: string
): CaptureConfig {
  const validViewports = ['mobile', 'tablet', 'desktop', 'desktop-xl'];
  const normalizedViewport = validViewports.includes(viewport)
    ? viewport as CaptureConfig['viewport']
    : 'mobile';

  return {
    flowDefinitionPath,
    outputDir,
    viewport: normalizedViewport
  };
}
