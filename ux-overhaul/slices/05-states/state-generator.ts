/**
 * State Generator Engine for UX Overhaul Skill
 */

import * as path from 'path';
import { createFalClientFromEnv } from '../../core/clients/fal-client';
import { imageToDataUrl, batchImageToDataUrl } from '../../core/utils/base64';
import { ensureDir, writeBuffer } from '../../core/utils/file';
import { buildStatePrompt } from '../../core/prompts/index';
import { Anchor } from '../03-anchoring/anchoring';
import { PropagatedScreen } from '../04-propagation/propagation';
import { StateType, GeneratedState, ScreenStates } from './states';

// ============================================================================
// Types
// ============================================================================

export interface StateGenerationRequest {
  screen: PropagatedScreen;
  stateType: StateType;
  anchors: Anchor[];
  colorPalette: string[];
  styleDirection: string;
  viewport: string;
  outputDir: string;
}

export interface StateGeneratorResult {
  success: boolean;
  generatedState?: GeneratedState;
  attempts?: number;
  cost?: number;
  error?: string;
}

// ============================================================================
// Constants
// ============================================================================

export const STATE_STRENGTHS: Record<StateType, number> = {
  loading: 0.50,
  empty: 0.52,
  error: 0.52,
  success: 0.55
};

const VIEWPORT_ASPECT_RATIOS: Record<string, string> = {
  'mobile': '9:16',
  'tablet': '3:4',
  'desktop': '16:9',
  'desktop-xl': '16:9'
};

export const STATE_TYPE_NAMES: Record<StateType, string> = {
  loading: 'Loading State',
  empty: 'Empty State',
  error: 'Error State',
  success: 'Success State'
};

// ============================================================================
// Core Generation
// ============================================================================

export async function generateState(
  request: StateGenerationRequest,
  maxAttempts: number = 3
): Promise<StateGeneratorResult> {
  try {
    const client = createFalClientFromEnv();
    let attempts = 0;
    let lastError = '';
    let totalCost = 0;

    const referenceUrls = await buildReferenceArray(request.anchors);
    if (referenceUrls.length === 0) {
      return { success: false, error: 'No validated anchors available' };
    }

    const inputResult = imageToDataUrl(request.screen.propagatedPath);
    if (!inputResult.success || !inputResult.dataUrl) {
      return { success: false, error: inputResult.error || 'Failed to encode input' };
    }

    const aspectRatio = VIEWPORT_ASPECT_RATIOS[request.viewport] || '9:16';
    const strength = STATE_STRENGTHS[request.stateType];
    const baseDescription = `${request.styleDirection} ${request.screen.screenName} screen`;
    let prompt = buildStatePrompt(baseDescription, request.stateType);

    const refCount = Math.min(referenceUrls.length, 14);
    prompt += `. Match style exactly from reference images 1-${refCount}`;
    if (request.colorPalette.length > 0) {
      prompt += `. Use colors: ${request.colorPalette.slice(0, 5).join(', ')}`;
    }

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

      totalCost += result.cost || 0;

      if (!result.success || !result.data?.images?.[0]) {
        lastError = result.error || 'Generation failed';
        if (attempts < maxAttempts) {
          prompt = adjustPromptForRetry(prompt, request.stateType, attempts);
        }
        continue;
      }

      const downloadResult = await client.downloadImage(result.data.images[0].url);
      if (!downloadResult.success || !downloadResult.data) {
        lastError = 'Failed to download generated image';
        continue;
      }

      const stateFilename = `${request.screen.screenId}-${request.stateType}.png`;
      const outputPath = path.join(request.outputDir, 'generated', 'states', stateFilename);
      ensureDir(path.dirname(outputPath));

      const writeResult = writeBuffer(outputPath, downloadResult.data);
      if (!writeResult.success) {
        lastError = writeResult.error || 'Failed to save image';
        continue;
      }

      return {
        success: true,
        generatedState: {
          screenId: request.screen.screenId,
          screenName: request.screen.screenName,
          stateType: request.stateType,
          originalPropagatedPath: request.screen.propagatedPath,
          statePath: outputPath,
          success: true,
          attempts,
          cost: totalCost,
          strengthUsed: strength
        },
        attempts,
        cost: totalCost
      };
    }

    return {
      success: false,
      generatedState: {
        screenId: request.screen.screenId,
        screenName: request.screen.screenName,
        stateType: request.stateType,
        originalPropagatedPath: request.screen.propagatedPath,
        statePath: '',
        success: false,
        attempts,
        cost: totalCost,
        strengthUsed: strength,
        error: lastError
      },
      attempts,
      cost: totalCost,
      error: lastError
    };
  } catch (error) {
    return { success: false, error: `State generation failed: ${error}` };
  }
}

// ============================================================================
// Screen States Generation
// ============================================================================

export async function generateScreenStates(
  screen: PropagatedScreen,
  stateTypes: StateType[],
  anchors: Anchor[],
  colorPalette: string[],
  styleDirection: string,
  viewport: string,
  outputDir: string,
  maxAttempts: number = 3
): Promise<ScreenStates> {
  const states: GeneratedState[] = [];
  let totalCost = 0;
  let successCount = 0;

  for (const stateType of stateTypes) {
    const result = await generateState({
      screen, stateType, anchors, colorPalette, styleDirection, viewport, outputDir
    }, maxAttempts);

    if (result.generatedState) {
      states.push(result.generatedState);
      if (result.generatedState.success) successCount++;
    }
    totalCost += result.cost || 0;
  }

  return { screenId: screen.screenId, screenName: screen.screenName, states, totalCost, successCount };
}

// ============================================================================
// Helpers
// ============================================================================

export async function buildReferenceArray(anchors: Anchor[]): Promise<string[]> {
  const validatedAnchors = anchors.filter(a => a.validated && a.imagePath);
  const results = batchImageToDataUrl(validatedAnchors.map(a => a.imagePath));
  return results.filter(r => r.success && r.dataUrl).map(r => r.dataUrl!);
}

export function adjustPromptForRetry(prompt: string, stateType: StateType, attemptNumber: number): string {
  const adjustments: Record<StateType, string> = {
    loading: 'CRITICAL: Show clear skeleton/shimmer placeholders. Preserve layout.',
    empty: 'CRITICAL: Show friendly illustration with guidance message.',
    error: 'CRITICAL: Show clear error indicator with recovery action.',
    success: 'CRITICAL: Show confirmation checkmark with next steps.'
  };

  if (attemptNumber === 2) {
    return prompt + ` ${adjustments[stateType]}`;
  }
  if (attemptNumber >= 3) {
    return prompt.replace('Match style exactly', 'MUST match style precisely') +
      ` ${adjustments[stateType]} Maintain visual consistency.`;
  }
  return prompt;
}

export function estimateStatesCost(screenCount: number, stateCount: number = 4, resolution: '1K' | '4K' = '1K'): number {
  const multiplier = resolution === '4K' ? 2 : 1;
  return Math.ceil(screenCount * stateCount * 1.3) * 0.15 * multiplier;
}

export function formatCost(cost: number): string {
  return `$${cost.toFixed(2)}`;
}
