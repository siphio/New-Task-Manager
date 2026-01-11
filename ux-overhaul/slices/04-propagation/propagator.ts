/**
 * Propagator Engine for UX Overhaul Skill
 * Core propagation logic with fal.ai integration and retry handling
 */

import * as path from 'path';
import { createFalClientFromEnv } from '../../core/clients/fal-client';
import { imageToDataUrl, batchImageToDataUrl } from '../../core/utils/base64';
import { ensureDir, writeBuffer } from '../../core/utils/file';
import { buildScreenPromptWithAudit, AuditPromptContext } from '../../core/prompts/index';
import { CapturedScreen } from '../01-capture/flow-executor';
import { Anchor, StyleConfig } from '../03-anchoring/anchoring';
import { PropagatedScreen } from './propagation';
import { ScreenType, getStrengthForScreenType } from './screen-classifier';

// ============================================================================
// Types
// ============================================================================

/**
 * Request for screen propagation
 */
export interface PropagationRequest {
  screen: CapturedScreen;
  screenType: ScreenType;
  anchors: Anchor[];
  colorPalette: string[];
  styleDirection: string;
  viewport: string;
  promptInjections: string[];
  outputDir: string;
  strengthOverride?: number;
}

/**
 * Result from screen propagation
 */
export interface PropagatorResult {
  success: boolean;
  propagatedScreen?: PropagatedScreen;
  attempts?: number;
  cost?: number;
  error?: string;
}

// ============================================================================
// Viewport Mapping
// ============================================================================

const VIEWPORT_ASPECT_RATIOS: Record<string, string> = {
  'mobile': '9:16',
  'tablet': '3:4',
  'desktop': '16:9',
  'desktop-xl': '16:9'
};

// ============================================================================
// Core Propagation
// ============================================================================

/**
 * Propagates a single screen with style from anchors
 */
export async function propagateScreen(
  request: PropagationRequest,
  maxAttempts: number = 3
): Promise<PropagatorResult> {
  try {
    const client = createFalClientFromEnv();
    let attempts = 0;
    let lastError = '';
    let totalCost = 0;

    // Build reference array from all validated anchors
    const referenceUrls = await buildReferenceArray(request.anchors);
    if (referenceUrls.length === 0) {
      return { success: false, error: 'No validated anchors available as references' };
    }

    // Convert input screen to data URL
    const inputResult = imageToDataUrl(request.screen.screenshotPath);
    if (!inputResult.success || !inputResult.dataUrl) {
      return { success: false, error: inputResult.error || 'Failed to encode input image' };
    }

    // Get aspect ratio and strength
    const aspectRatio = VIEWPORT_ASPECT_RATIOS[request.viewport] || '9:16';
    const strength = request.strengthOverride ?? getStrengthForScreenType(request.screenType);

    // Build prompt with audit improvements
    const promptContext: AuditPromptContext = {
      screenType: request.screenType,
      screenName: request.screen.name,
      viewport: request.viewport,
      colorPalette: request.colorPalette,
      styleDirection: request.styleDirection,
      promptInjections: request.promptInjections,
      severityFocus: 'high'
    };

    let prompt = buildScreenPromptWithAudit(promptContext);

    // Add reference instructions
    const refCount = Math.min(referenceUrls.length, 14);
    prompt += `. Match style exactly from reference images 1-${refCount} (use reference 1 for overall aesthetic, subsequent references for component styling)`;

    while (attempts < maxAttempts) {
      attempts++;

      const result = await client.editImage({
        imageUrl: inputResult.dataUrl,
        prompt,
        referenceImages: referenceUrls.slice(0, 14), // Max 14 references
        strength,
        aspectRatio,
        resolution: '1K',
        outputFormat: 'png'
      });

      totalCost += result.cost || 0;

      if (!result.success || !result.data?.images?.[0]) {
        lastError = result.error || 'Generation failed';

        // Adjust prompt for retry
        if (attempts < maxAttempts) {
          prompt = adjustPromptForRetry(prompt, attempts);
        }
        continue;
      }

      // Download generated image
      const imageUrl = result.data.images[0].url;
      const downloadResult = await client.downloadImage(imageUrl);

      if (!downloadResult.success || !downloadResult.data) {
        lastError = 'Failed to download generated image';
        continue;
      }

      // Save propagated image
      const screenFilename = `${request.screen.id}-propagated.png`;
      const outputPath = path.join(request.outputDir, 'generated', 'screens', screenFilename);

      ensureDir(path.dirname(outputPath));
      const writeResult = writeBuffer(outputPath, downloadResult.data);

      if (!writeResult.success) {
        lastError = writeResult.error || 'Failed to save propagated image';
        continue;
      }

      // Build result
      const propagatedScreen: PropagatedScreen = {
        screenId: request.screen.id,
        screenName: request.screen.name,
        screenType: request.screenType,
        originalPath: request.screen.screenshotPath,
        propagatedPath: outputPath,
        success: true,
        attempts,
        cost: totalCost,
        strengthUsed: strength,
        improvementsApplied: request.promptInjections
      };

      return {
        success: true,
        propagatedScreen,
        attempts,
        cost: totalCost
      };
    }

    // All attempts failed
    const failedScreen: PropagatedScreen = {
      screenId: request.screen.id,
      screenName: request.screen.name,
      screenType: request.screenType,
      originalPath: request.screen.screenshotPath,
      propagatedPath: '',
      success: false,
      attempts,
      cost: totalCost,
      strengthUsed: strength,
      improvementsApplied: request.promptInjections,
      error: lastError
    };

    return {
      success: false,
      propagatedScreen: failedScreen,
      attempts,
      cost: totalCost,
      error: lastError
    };
  } catch (error) {
    return { success: false, error: `Propagation failed: ${error}` };
  }
}

/**
 * Propagates a batch of screens
 */
export async function propagateBatch(
  screens: CapturedScreen[],
  screenTypes: Map<string, ScreenType>,
  anchors: Anchor[],
  styleConfig: StyleConfig,
  promptInjections: Map<string, string[]>,
  outputDir: string,
  viewport: string,
  maxAttempts: number = 3
): Promise<{ screens: PropagatedScreen[]; totalCost: number }> {
  const propagatedScreens: PropagatedScreen[] = [];
  let totalCost = 0;

  // Convert color palette to array
  const colorPalette = extractColorPaletteArray(styleConfig.colorPalette);

  for (const screen of screens) {
    const screenType = screenTypes.get(screen.id) || 'generic';
    const injections = promptInjections.get(screen.id) || [];

    const result = await propagateScreen({
      screen,
      screenType,
      anchors,
      colorPalette,
      styleDirection: styleConfig.styleDirection,
      viewport,
      promptInjections: injections,
      outputDir
    }, maxAttempts);

    if (result.propagatedScreen) {
      propagatedScreens.push(result.propagatedScreen);
    }
    totalCost += result.cost || 0;
  }

  return { screens: propagatedScreens, totalCost };
}

// ============================================================================
// Reference Building
// ============================================================================

/**
 * Builds reference image array from validated anchors
 */
export async function buildReferenceArray(anchors: Anchor[]): Promise<string[]> {
  const validatedAnchors = anchors.filter(a => a.validated && a.imagePath);
  const results = batchImageToDataUrl(validatedAnchors.map(a => a.imagePath));

  return results
    .filter(r => r.success && r.dataUrl)
    .map(r => r.dataUrl!);
}

// ============================================================================
// Color Palette Extraction
// ============================================================================

/**
 * Extracts color palette as array from StyleConfig
 */
export function extractColorPaletteArray(palette: StyleConfig['colorPalette']): string[] {
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
// Prompt Adjustment
// ============================================================================

/**
 * Adjusts prompt for retry attempt
 */
export function adjustPromptForRetry(prompt: string, attemptNumber: number): string {
  if (attemptNumber === 2) {
    return prompt + ' CRITICAL: Maintain exact visual style, shadows, and border radius from references.';
  }
  if (attemptNumber >= 3) {
    return prompt.replace('Match style exactly', 'MUST match style precisely') +
      ' Preserve original layout structure completely.';
  }
  return prompt;
}

// ============================================================================
// Cost Estimation
// ============================================================================

/**
 * Estimates propagation cost for given screen count
 */
export function estimatePropagationCost(
  screenCount: number,
  resolution: '1K' | '2K' | '4K' = '1K'
): number {
  const COST_PER_IMAGE = 0.15;
  const COST_4K_MULTIPLIER = 2;

  const multiplier = resolution === '4K' ? COST_4K_MULTIPLIER : 1;
  // screenCount + ~30% for regenerations
  const withRegenerations = Math.ceil(screenCount * 1.3);
  return withRegenerations * COST_PER_IMAGE * multiplier;
}

/**
 * Formats cost as a dollar string
 */
export function formatCost(cost: number): string {
  return `$${cost.toFixed(2)}`;
}

/**
 * Gets cost summary for a batch of propagated screens
 */
export function getCostSummary(screens: PropagatedScreen[]): {
  total: number;
  average: number;
  formatted: string;
} {
  const total = screens.reduce((sum, s) => sum + (s.cost || 0), 0);
  const average = screens.length > 0 ? total / screens.length : 0;

  return {
    total,
    average,
    formatted: `Total: ${formatCost(total)}, Average: ${formatCost(average)}/screen`
  };
}
