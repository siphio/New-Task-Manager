/**
 * Anchor Generator for UX Overhaul Skill
 * Core generation engine with progressive referencing
 *
 * Each generation includes all previously validated anchors as references
 * to maintain visual consistency across the 14-slot system
 */

import * as path from 'path';
import { createFalClientFromEnv, FalClient } from '../../core/clients/fal-client';
import { imageToDataUrl, batchImageToDataUrl } from '../../core/utils/base64';
import { parseViewportPreset, getAspectRatioForViewport } from '../../core/utils/image';
import { ensureDir, writeBuffer } from '../../core/utils/file';
import {
  buildHeroPrompt,
  buildComponentPrompt,
  buildTypographyPrompt,
  buildStatePrompt
} from '../../core/prompts/index';
import { Anchor, AnchorType } from './anchoring';

// ============================================================================
// Constants
// ============================================================================

/**
 * 14-slot anchor allocation
 */
export const ANCHOR_SLOTS = {
  HERO: 1,                  // Entry/hero screen
  SCREEN_2: 2,              // Second flow screen
  SCREEN_3: 3,              // Third flow screen
  SCREEN_4: 4,              // Fourth flow screen
  SCREEN_5: 5,              // Fifth flow screen
  SCREEN_6: 6,              // Sixth flow screen
  TYPOGRAPHY_HEADING: 7,    // Heading specimens
  TYPOGRAPHY_BODY: 8,       // Body text specimens
  TYPOGRAPHY_UI: 9,         // UI text (labels, buttons)
  STATE_LOADING: 10,        // Loading/skeleton
  STATE_EMPTY: 11,          // Empty state
  STATE_ERROR: 12,          // Error state
  STATE_SUCCESS: 13,        // Success state
  ICONOGRAPHY: 14           // Icon set
} as const;

/**
 * Strength settings by anchor type
 * Higher = more faithful to prompt, lower = more reference influence
 */
export const STRENGTH_SETTINGS: Record<AnchorType, number> = {
  hero: 0.70,           // Higher strength for hero - establish style
  screen: 0.65,         // Medium - preserve structure, apply style
  component: 0.60,      // Component isolation
  typography: 0.55,     // Typography preservation
  state: 0.55,          // State variant generation
  iconography: 0.50     // Icon generation
};

/**
 * Viewport to aspect ratio mapping
 */
const VIEWPORT_ASPECT_RATIOS: Record<string, string> = {
  'mobile': '9:16',
  'tablet': '3:4',
  'desktop': '16:9',
  'desktop-xl': '16:9'
};

// ============================================================================
// Types
// ============================================================================

/**
 * Request for anchor generation
 */
export interface GenerationRequest {
  slot: number;
  type: AnchorType;
  name: string;
  description: string;
  inputImagePath?: string;
  previousAnchors: Anchor[];
  colorPalette?: string[];
  styleDirection: string;
  viewport: string;
  promptInjections?: string[];
  outputDir: string;
}

/**
 * Result from anchor generation
 */
export interface GenerationResult {
  success: boolean;
  anchor?: Anchor;
  validationPassed?: boolean;
  validationErrors?: string[];
  attempts?: number;
  cost?: number;
  error?: string;
}

/**
 * Hero variant generation result
 */
export interface HeroVariantsResult {
  success: boolean;
  variants?: string[];
  cost?: number;
  error?: string;
}

// ============================================================================
// Hero Generation
// ============================================================================

/**
 * Generates hero screen variants for user selection
 */
export async function generateHeroVariants(
  inputScreenPath: string,
  styleDirection: string,
  viewport: string,
  colorPalette: string[],
  outputDir: string,
  variantCount: number = 4
): Promise<HeroVariantsResult> {
  try {
    const client = createFalClientFromEnv();

    // Convert input screen to data URL
    const inputResult = imageToDataUrl(inputScreenPath);
    if (!inputResult.success || !inputResult.dataUrl) {
      return { success: false, error: inputResult.error || 'Failed to encode input image' };
    }

    // Get aspect ratio for viewport
    const aspectRatio = VIEWPORT_ASPECT_RATIOS[viewport] || '9:16';

    // Build hero prompt
    const prompt = buildHeroPrompt('application', styleDirection, viewport);

    // Ensure output directory exists
    const variantsDir = path.join(outputDir, 'generated', 'anchors', 'hero-variants');
    ensureDir(variantsDir);

    const variants: string[] = [];
    let totalCost = 0;

    // Generate variants one at a time for better control
    for (let i = 0; i < variantCount; i++) {
      const result = await client.editImage({
        imageUrl: inputResult.dataUrl,
        prompt: `${prompt}. Variant ${i + 1} with unique interpretation of ${styleDirection}.`,
        strength: STRENGTH_SETTINGS.hero,
        aspectRatio,
        resolution: '1K',
        outputFormat: 'png'
      });

      if (!result.success || !result.data?.images?.[0]) {
        continue; // Skip failed variants
      }

      // Download and save variant
      const imageUrl = result.data.images[0].url;
      const downloadResult = await client.downloadImage(imageUrl);

      if (downloadResult.success && downloadResult.data) {
        const variantPath = path.join(variantsDir, `hero-variant-${i + 1}.png`);
        const writeResult = writeBuffer(variantPath, downloadResult.data);

        if (writeResult.success) {
          variants.push(variantPath);
        }
      }

      totalCost += result.cost || 0;
    }

    if (variants.length === 0) {
      return { success: false, error: 'Failed to generate any hero variants' };
    }

    return {
      success: true,
      variants,
      cost: totalCost
    };
  } catch (error) {
    return { success: false, error: `Hero generation failed: ${error}` };
  }
}

// ============================================================================
// Anchor Generation
// ============================================================================

/**
 * Generates a single anchor with AI pre-validation
 */
export async function generateAnchor(
  request: GenerationRequest,
  maxAttempts: number = 3
): Promise<GenerationResult> {
  try {
    const client = createFalClientFromEnv();
    let attempts = 0;
    let lastError = '';
    let totalCost = 0;

    // Build reference array from previous anchors
    const referenceUrls = await buildReferenceArray(request.previousAnchors);

    // Get aspect ratio
    const aspectRatio = VIEWPORT_ASPECT_RATIOS[request.viewport] || '9:16';

    // Build prompt based on anchor type
    let prompt = buildPromptForType(request);

    while (attempts < maxAttempts) {
      attempts++;

      // Prepare generation request
      const colors = request.colorPalette?.slice(0, 5).join(', ') || '';
      const fullPrompt = colors
        ? `${prompt}. Use exact colors: ${colors}`
        : prompt;

      let result;

      if (request.inputImagePath) {
        // Edit mode - transform existing image
        const inputResult = imageToDataUrl(request.inputImagePath);
        if (!inputResult.success || !inputResult.dataUrl) {
          return { success: false, error: inputResult.error };
        }

        result = await client.editImage({
          imageUrl: inputResult.dataUrl,
          prompt: fullPrompt,
          referenceImages: referenceUrls.slice(0, 14), // Max 14 references
          strength: STRENGTH_SETTINGS[request.type],
          aspectRatio,
          resolution: '1K',
          outputFormat: 'png'
        });
      } else {
        // Generation mode - create from scratch
        result = await client.generateImage({
          prompt: fullPrompt,
          aspectRatio,
          resolution: '1K',
          outputFormat: 'png'
        });
      }

      totalCost += result.cost || 0;

      if (!result.success || !result.data?.images?.[0]) {
        lastError = result.error || 'Generation failed';
        continue;
      }

      // Download generated image
      const imageUrl = result.data.images[0].url;
      const downloadResult = await client.downloadImage(imageUrl);

      if (!downloadResult.success || !downloadResult.data) {
        lastError = 'Failed to download generated image';
        continue;
      }

      // Save anchor image
      const anchorFilename = `anchor-${String(request.slot).padStart(2, '0')}-${request.type}.png`;
      const anchorPath = path.join(request.outputDir, 'generated', 'anchors', anchorFilename);

      ensureDir(path.dirname(anchorPath));
      const writeResult = writeBuffer(anchorPath, downloadResult.data);

      if (!writeResult.success) {
        lastError = writeResult.error || 'Failed to save anchor image';
        continue;
      }

      // Create anchor record
      const anchor: Anchor = {
        slot: request.slot,
        type: request.type,
        name: request.name,
        description: request.description,
        imagePath: anchorPath,
        validated: false, // Will be validated separately
        promptUsed: fullPrompt
      };

      return {
        success: true,
        anchor,
        attempts,
        cost: totalCost
      };
    }

    return {
      success: false,
      error: lastError || 'Max attempts reached',
      attempts
    };
  } catch (error) {
    return { success: false, error: `Anchor generation failed: ${error}` };
  }
}

/**
 * Generates a screen anchor (slots 2-6)
 */
export async function generateScreenAnchor(
  slot: number,
  screenPath: string,
  screenName: string,
  previousAnchors: Anchor[],
  styleDirection: string,
  colorPalette: string[],
  viewport: string,
  outputDir: string
): Promise<GenerationResult> {
  return generateAnchor({
    slot,
    type: 'screen',
    name: screenName,
    description: `Flow screen ${slot}`,
    inputImagePath: screenPath,
    previousAnchors,
    colorPalette,
    styleDirection,
    viewport,
    outputDir
  });
}

/**
 * Generates a component anchor
 */
export async function generateComponentAnchor(
  componentType: string,
  previousAnchors: Anchor[],
  styleDirection: string,
  colorPalette: string[],
  viewport: string,
  outputDir: string
): Promise<GenerationResult> {
  return generateAnchor({
    slot: ANCHOR_SLOTS.HERO, // Component anchors don't use fixed slots
    type: 'component',
    name: `${componentType} Component`,
    description: `Isolated ${componentType} component`,
    previousAnchors,
    colorPalette,
    styleDirection,
    viewport,
    outputDir
  });
}

/**
 * Generates a typography anchor
 */
export async function generateTypographyAnchor(
  specimenType: 'heading' | 'body' | 'ui',
  slot: number,
  previousAnchors: Anchor[],
  styleDirection: string,
  colorPalette: string[],
  outputDir: string
): Promise<GenerationResult> {
  const names: Record<string, string> = {
    heading: 'Heading Specimens',
    body: 'Body Text Specimens',
    ui: 'UI Text Specimens'
  };

  const descriptions: Record<string, string> = {
    heading: 'H1-H6 heading specimens with clear hierarchy',
    body: 'Body text, paragraphs, and list specimens',
    ui: 'Labels, buttons, captions, and form text'
  };

  return generateAnchor({
    slot,
    type: 'typography',
    name: names[specimenType],
    description: descriptions[specimenType],
    previousAnchors,
    colorPalette,
    styleDirection,
    viewport: 'desktop', // Typography specimens use desktop ratio
    outputDir
  });
}

/**
 * Generates a state indicator anchor
 */
export async function generateStateAnchor(
  stateType: 'loading' | 'empty' | 'error' | 'success',
  slot: number,
  baseScreenPath: string,
  previousAnchors: Anchor[],
  styleDirection: string,
  colorPalette: string[],
  viewport: string,
  outputDir: string
): Promise<GenerationResult> {
  const names: Record<string, string> = {
    loading: 'Loading State',
    empty: 'Empty State',
    error: 'Error State',
    success: 'Success State'
  };

  return generateAnchor({
    slot,
    type: 'state',
    name: names[stateType],
    description: `${stateType} state indicator`,
    inputImagePath: baseScreenPath,
    previousAnchors,
    colorPalette,
    styleDirection,
    viewport,
    outputDir
  });
}

/**
 * Generates the iconography anchor (slot 14)
 */
export async function generateIconographyAnchor(
  previousAnchors: Anchor[],
  styleDirection: string,
  colorPalette: string[],
  outputDir: string
): Promise<GenerationResult> {
  return generateAnchor({
    slot: ANCHOR_SLOTS.ICONOGRAPHY,
    type: 'iconography',
    name: 'Icon Set',
    description: 'Icon specimen sheet with common UI icons',
    previousAnchors,
    colorPalette,
    styleDirection,
    viewport: 'desktop',
    outputDir
  });
}

// ============================================================================
// Reference Building
// ============================================================================

/**
 * Builds reference image array from validated anchors
 * Converts each anchor image to base64 data URL for fal.ai
 */
export async function buildReferenceArray(anchors: Anchor[]): Promise<string[]> {
  const validatedAnchors = anchors.filter(a => a.validated && a.imagePath);
  const results = batchImageToDataUrl(validatedAnchors.map(a => a.imagePath));

  return results
    .filter(r => r.success && r.dataUrl)
    .map(r => r.dataUrl!);
}

/**
 * Gets the number of reference slots used
 */
export function getReferenceCount(anchors: Anchor[]): number {
  return anchors.filter(a => a.validated).length;
}

// ============================================================================
// Prompt Building
// ============================================================================

/**
 * Builds prompt based on anchor type and request
 */
function buildPromptForType(request: GenerationRequest): string {
  const refCount = getReferenceCount(request.previousAnchors);
  let refInstructions = '';

  if (refCount > 0) {
    refInstructions = `. Match style exactly from reference images 1-${refCount}`;
    if (refCount >= 1) {
      refInstructions += ' (use reference 1 for overall aesthetic';
    }
    if (refCount >= 2) {
      refInstructions += ', subsequent references for component styling';
    }
    refInstructions += ')';
  }

  switch (request.type) {
    case 'hero':
      return buildHeroPrompt('application', request.styleDirection, request.viewport) + refInstructions;

    case 'screen':
      return `${request.styleDirection} ${request.description}${refInstructions}. High fidelity UI design`;

    case 'component':
      return buildComponentPrompt(
        request.name.replace(' Component', '').toLowerCase(),
        request.styleDirection,
        request.colorPalette || []
      ) + refInstructions;

    case 'typography':
      return buildTypographyPrompt(
        'Inter, system-ui, sans-serif',
        request.styleDirection
      ) + refInstructions;

    case 'state':
      return buildStatePrompt(
        request.description,
        request.name.toLowerCase().replace(' state', '') as 'loading' | 'empty' | 'error' | 'success'
      ) + refInstructions;

    case 'iconography':
      return buildIconographyPrompt(request.styleDirection, request.colorPalette || []);

    default:
      return `${request.styleDirection} ${request.description}${refInstructions}`;
  }
}

/**
 * Builds iconography prompt
 */
function buildIconographyPrompt(styleDirection: string, colorPalette: string[]): string {
  const accentColor = colorPalette[2] || colorPalette[0] || '#3B82F6';

  return `Icon set specimen sheet showing common UI icons in ${styleDirection} style. ` +
    `Include: home, settings, user, search, menu, close, add, edit, delete, share, notification, message. ` +
    `Consistent stroke weight, ${accentColor} accent color, clean grid layout on white background. ` +
    `SVG-style crisp icons, minimal detail, professional quality.`;
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * Gets the slot number for a state type
 */
export function getStateSlot(stateType: 'loading' | 'empty' | 'error' | 'success'): number {
  const slots: Record<string, number> = {
    loading: ANCHOR_SLOTS.STATE_LOADING,
    empty: ANCHOR_SLOTS.STATE_EMPTY,
    error: ANCHOR_SLOTS.STATE_ERROR,
    success: ANCHOR_SLOTS.STATE_SUCCESS
  };
  return slots[stateType];
}

/**
 * Gets the slot number for a typography type
 */
export function getTypographySlot(specimenType: 'heading' | 'body' | 'ui'): number {
  const slots: Record<string, number> = {
    heading: ANCHOR_SLOTS.TYPOGRAPHY_HEADING,
    body: ANCHOR_SLOTS.TYPOGRAPHY_BODY,
    ui: ANCHOR_SLOTS.TYPOGRAPHY_UI
  };
  return slots[specimenType];
}

/**
 * Estimates cost for full anchor generation
 */
export function estimateAnchoringCost(heroVariants: number = 4): number {
  const COST_PER_IMAGE = 0.15;
  // Hero variants + 13 other anchors + ~50% regenerations
  const images = heroVariants + 13;
  const withRegenerations = Math.ceil(images * 1.5);
  return withRegenerations * COST_PER_IMAGE;
}
