/**
 * Regenerator for UX Overhaul Skill
 * Orchestrates regeneration of outlier screens with fal.ai
 */

import * as path from 'path';
import { createFalClientFromEnv } from '../../core/clients/fal-client';
import { imageToDataUrl, batchImageToDataUrl } from '../../core/utils/base64';
import { ensureDir, writeBuffer, copyFile } from '../../core/utils/file';
import { PropagatedScreen } from '../04-propagation/propagation';
import { Anchor, StyleConfig, ViewportType } from '../03-anchoring/anchoring';
import { OutlierInfo, OutlierReason } from './outlier-detector';

// ============================================================================
// Types
// ============================================================================

export interface RegenerationRequest {
  outlier: OutlierInfo;
  originalScreen: PropagatedScreen;
  anchors: Anchor[];
  colorPalette: string[];
  styleDirection: string;
  viewport: ViewportType;
  outputDir: string;
}

export interface RegenerationResult {
  success: boolean;
  screenId: string;
  screenName: string;
  originalPath: string;
  newPath?: string;
  backupPath?: string;
  attempts: number;
  cost: number;
  error?: string;
}

export interface RegenerationRecord {
  screenId: string;
  passNumber: number;
  reason: string;
  success: boolean;
  attempts: number;
  cost: number;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_MAX_ATTEMPTS = 2;
const COST_PER_IMAGE = 0.15;

/**
 * Viewport aspect ratio mapping
 */
const VIEWPORT_ASPECT_RATIOS: Record<string, string> = {
  'mobile': '9:16',
  'tablet': '3:4',
  'desktop': '16:9',
  'desktop-xl': '16:9'
};

// ============================================================================
// Core Regeneration
// ============================================================================

/**
 * Regenerates a single outlier screen
 */
export async function regenerateScreen(
  request: RegenerationRequest,
  maxAttempts: number = DEFAULT_MAX_ATTEMPTS
): Promise<RegenerationResult> {
  try {
    const client = createFalClientFromEnv();
    let attempts = 0;
    let lastError = '';
    let totalCost = 0;

    // Build reference array from validated anchors
    const referenceUrls = await buildReferenceArray(request.anchors);
    if (referenceUrls.length === 0) {
      return {
        success: false,
        screenId: request.outlier.screenId,
        screenName: request.outlier.screenName,
        originalPath: request.outlier.screenPath,
        attempts: 0,
        cost: 0,
        error: 'No validated anchors available as references'
      };
    }

    // Get original screen for input
    const inputPath = request.originalScreen.originalPath;
    const inputResult = imageToDataUrl(inputPath);
    if (!inputResult.success || !inputResult.dataUrl) {
      return {
        success: false,
        screenId: request.outlier.screenId,
        screenName: request.outlier.screenName,
        originalPath: inputPath,
        attempts: 0,
        cost: 0,
        error: inputResult.error || 'Failed to encode input image'
      };
    }

    // Build initial prompt with fix recommendations
    let prompt = buildRegenerationPrompt(
      request.outlier,
      request.originalScreen.screenType,
      request.styleDirection,
      request.colorPalette
    );

    const aspectRatio = VIEWPORT_ASPECT_RATIOS[request.viewport] || '9:16';

    // Use lower strength for regeneration to preserve more of original
    const strength = 0.50;

    while (attempts < maxAttempts) {
      attempts++;

      const result = await client.editImage({
        imageUrl: inputResult.dataUrl,
        prompt,
        referenceImages: referenceUrls.slice(0, 14),
        strength,
        aspectRatio,
        resolution: '1K',
        outputFormat: 'png'
      });

      totalCost += result.cost || COST_PER_IMAGE;

      if (!result.success || !result.data?.images?.[0]) {
        lastError = result.error || 'Generation failed';

        // Adjust prompt for retry
        if (attempts < maxAttempts) {
          prompt = adjustPromptForCoherenceRetry(prompt, attempts, request.outlier.reasons);
        }
        continue;
      }

      // Download generated image
      const imageUrl = result.data.images[0].url;
      const downloadResult = await client.downloadImage(imageUrl);

      if (!downloadResult.success || !downloadResult.data) {
        lastError = 'Failed to download regenerated image';
        continue;
      }

      // Create backup of original
      const timestamp = Date.now();
      const backupFilename = `${request.outlier.screenId}-backup-${timestamp}.png`;
      const backupPath = path.join(request.outputDir, 'generated', 'screens', backupFilename);

      if (request.outlier.screenPath && request.outlier.screenPath !== '') {
        copyFile(request.outlier.screenPath, backupPath);
      }

      // Save regenerated image (replace original)
      const outputPath = path.join(
        request.outputDir,
        'generated',
        'screens',
        `${request.outlier.screenId}-propagated.png`
      );

      ensureDir(path.dirname(outputPath));
      const writeResult = writeBuffer(outputPath, downloadResult.data);

      if (!writeResult.success) {
        lastError = writeResult.error || 'Failed to save regenerated image';
        continue;
      }

      return {
        success: true,
        screenId: request.outlier.screenId,
        screenName: request.outlier.screenName,
        originalPath: request.outlier.screenPath,
        newPath: outputPath,
        backupPath,
        attempts,
        cost: totalCost
      };
    }

    // All attempts failed
    return {
      success: false,
      screenId: request.outlier.screenId,
      screenName: request.outlier.screenName,
      originalPath: request.outlier.screenPath,
      attempts,
      cost: totalCost,
      error: lastError
    };
  } catch (error) {
    return {
      success: false,
      screenId: request.outlier.screenId,
      screenName: request.outlier.screenName,
      originalPath: request.outlier.screenPath,
      attempts: 0,
      cost: 0,
      error: `Regeneration failed: ${error}`
    };
  }
}

/**
 * Regenerates a batch of outlier screens
 */
export async function regenerateBatch(
  outliers: OutlierInfo[],
  screens: PropagatedScreen[],
  styleConfig: StyleConfig,
  viewport: ViewportType,
  outputDir: string,
  maxAttempts: number = DEFAULT_MAX_ATTEMPTS
): Promise<{ results: RegenerationResult[]; totalCost: number }> {
  const results: RegenerationResult[] = [];
  let totalCost = 0;

  // Build screen lookup map
  const screenMap = new Map(screens.map(s => [s.screenId, s]));

  // Get validated anchors and color palette
  const validatedAnchors = styleConfig.anchors.filter(a => a.validated);
  const colorPalette = extractColorPaletteArray(styleConfig.colorPalette);

  for (const outlier of outliers) {
    const originalScreen = screenMap.get(outlier.screenId);

    if (!originalScreen) {
      results.push({
        success: false,
        screenId: outlier.screenId,
        screenName: outlier.screenName,
        originalPath: outlier.screenPath,
        attempts: 0,
        cost: 0,
        error: 'Original screen not found'
      });
      continue;
    }

    const result = await regenerateScreen({
      outlier,
      originalScreen,
      anchors: validatedAnchors,
      colorPalette,
      styleDirection: styleConfig.styleDirection,
      viewport,
      outputDir
    }, maxAttempts);

    results.push(result);
    totalCost += result.cost;
  }

  return { results, totalCost };
}

// ============================================================================
// Prompt Building
// ============================================================================

/**
 * Builds prompt for coherence regeneration with specific fixes
 */
export function buildRegenerationPrompt(
  outlier: OutlierInfo,
  screenType: string,
  styleDirection: string,
  colorPalette: string[]
): string {
  const colors = colorPalette.slice(0, 5).join(', ');
  const fixes = outlier.recommendations.slice(0, 3).join('; ');

  let prompt = `${styleDirection} ${screenType} screen redesign. `;
  prompt += `CRITICAL: Use ONLY these exact colors: ${colors}. `;

  if (fixes) {
    prompt += `FIX THESE ISSUES: ${fixes}. `;
  }

  prompt += `Match style EXACTLY from reference images (use reference 1 for overall aesthetic). `;
  prompt += `High fidelity, pixel-perfect, production-ready UI design.`;

  return prompt;
}

/**
 * Adjusts prompt for retry after regeneration failure
 */
export function adjustPromptForCoherenceRetry(
  prompt: string,
  attemptNumber: number,
  failedReasons: OutlierReason[]
): string {
  let adjusted = prompt;

  if (attemptNumber === 2) {
    adjusted += ' MUST maintain exact visual style, shadows, and border radius from references.';
    adjusted += ' Preserve layout structure completely.';
  }

  if (attemptNumber >= 3) {
    // Add specific instructions based on failed reasons
    const reasonInstructions = failedReasons.map(r => {
      switch (r) {
        case 'color_drift':
          return 'Match color palette EXACTLY - no deviations';
        case 'style_inconsistency':
          return 'Copy style from reference 1 precisely';
        case 'layout_deviation':
          return 'Preserve original layout 100%';
        case 'component_mismatch':
          return 'Match component styling from reference images';
        case 'spacing_variance':
          return 'Maintain consistent spacing throughout';
        case 'typography_inconsistency':
          return 'Use exact typography from references';
        default:
          return '';
      }
    }).filter(Boolean).join('. ');

    adjusted = adjusted.replace('CRITICAL', 'MANDATORY');
    if (reasonInstructions) {
      adjusted += ` ${reasonInstructions}.`;
    }
  }

  return adjusted;
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Builds reference image array from validated anchors
 */
async function buildReferenceArray(anchors: Anchor[]): Promise<string[]> {
  const validatedAnchors = anchors.filter(a => a.validated && a.imagePath);
  const results = batchImageToDataUrl(validatedAnchors.map(a => a.imagePath));

  return results
    .filter(r => r.success && r.dataUrl)
    .map(r => r.dataUrl!);
}

/**
 * Extracts color palette as array from StyleConfig
 */
function extractColorPaletteArray(palette: StyleConfig['colorPalette']): string[] {
  return [
    palette.primary,
    palette.secondary,
    palette.accent,
    palette.background,
    palette.surface,
    palette.text,
    palette.textMuted,
    palette.border,
    palette.error,
    palette.success,
    palette.warning
  ].filter(Boolean) as string[];
}

// ============================================================================
// Summary
// ============================================================================

/**
 * Gets summary of regeneration results
 */
export function getRegenerationSummary(results: RegenerationResult[]): {
  total: number;
  successful: number;
  failed: number;
  totalCost: number;
  averageAttempts: number;
} {
  const successful = results.filter(r => r.success).length;
  const totalCost = results.reduce((sum, r) => sum + r.cost, 0);
  const totalAttempts = results.reduce((sum, r) => sum + r.attempts, 0);

  return {
    total: results.length,
    successful,
    failed: results.length - successful,
    totalCost,
    averageAttempts: results.length > 0 ? totalAttempts / results.length : 0
  };
}

/**
 * Formats regeneration summary for display
 */
export function formatRegenerationSummary(results: RegenerationResult[]): string {
  const summary = getRegenerationSummary(results);

  const lines = [
    'Regeneration Summary',
    `Total: ${summary.total}`,
    `Successful: ${summary.successful}`,
    `Failed: ${summary.failed}`,
    `Total Cost: $${summary.totalCost.toFixed(2)}`,
    `Average Attempts: ${summary.averageAttempts.toFixed(1)}`
  ];

  const failed = results.filter(r => !r.success);
  if (failed.length > 0) {
    lines.push('');
    lines.push('Failed Regenerations:');
    for (const result of failed) {
      lines.push(`  - ${result.screenName}: ${result.error}`);
    }
  }

  return lines.join('\n');
}

/**
 * Converts regeneration results to records for report
 */
export function toRegenerationRecords(
  results: RegenerationResult[],
  passNumber: number
): RegenerationRecord[] {
  return results.map(result => ({
    screenId: result.screenId,
    passNumber,
    reason: result.error || 'Coherence improvement',
    success: result.success,
    attempts: result.attempts,
    cost: result.cost
  }));
}

/**
 * Estimates regeneration cost
 */
export function estimateRegenerationCost(
  outlierCount: number,
  averageAttempts: number = 1.5
): number {
  return outlierCount * COST_PER_IMAGE * averageAttempts;
}

/**
 * Formats cost as dollar string
 */
export function formatCost(cost: number): string {
  return `$${cost.toFixed(2)}`;
}
