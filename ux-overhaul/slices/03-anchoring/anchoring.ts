/**
 * Anchoring Orchestrator for UX Overhaul Skill
 * Main entry point for the anchoring phase
 *
 * Establishes visual foundation through 14-slot anchor system
 * with progressive reference building and validation gates
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
import { AppUnderstanding } from '../01-capture/capture';
import { ImprovementPlan } from '../02-audit/audit';

// ============================================================================
// Types
// ============================================================================

export type AnchorType = 'hero' | 'screen' | 'component' | 'typography' | 'state' | 'iconography';

export type ViewportType = 'mobile' | 'tablet' | 'desktop' | 'desktop-xl';

/**
 * Single anchor image definition
 */
export interface Anchor {
  slot: number;
  type: AnchorType;
  name: string;
  description: string;
  imagePath: string;
  validated: boolean;
  validatedAt?: string;
  promptUsed: string;
}

/**
 * Color palette with semantic tokens
 */
export interface ColorPalette {
  primary: string;
  secondary?: string;
  accent?: string;
  background: string;
  surface?: string;
  text: string;
  textMuted?: string;
  border?: string;
  error?: string;
  success?: string;
  warning?: string;
}

/**
 * Typography configuration
 */
export interface TypographyConfig {
  fontFamily: string;
  headingWeight: string;
  bodyWeight: string;
}

/**
 * Spacing configuration
 */
export interface SpacingConfig {
  base: number;
  scale: number[];
}

/**
 * Complete style configuration
 */
export interface StyleConfig {
  generatedAt: string;
  viewport: ViewportType;
  styleDirection: string;
  colorPalette: ColorPalette;
  typography: TypographyConfig;
  spacing: SpacingConfig;
  borderRadius: 'none' | 'subtle' | 'rounded' | 'pill';
  shadowStyle: 'none' | 'subtle' | 'medium' | 'dramatic';
  anchors: Anchor[];
}

/**
 * Anchoring configuration
 */
export interface AnchoringConfig {
  outputDir: string;
  viewport: ViewportType;
  styleDirection?: string;
  colorPalette?: string[];
  heroVariants?: number;
  maxRegenerations?: number;
}

/**
 * Anchoring operation result
 */
export interface AnchoringResult {
  success: boolean;
  manifest?: Manifest;
  styleConfig?: StyleConfig;
  anchors?: Anchor[];
  error?: string;
}

// ============================================================================
// Configuration Defaults
// ============================================================================

const DEFAULT_STYLE_DIRECTION = 'modern minimal with subtle shadows';
const DEFAULT_HERO_VARIANTS = 4;
const DEFAULT_MAX_REGENERATIONS = 3;

/**
 * Creates anchoring config from arguments
 */
export function createAnchoringConfig(
  outputDir: string,
  options?: Partial<AnchoringConfig>
): AnchoringConfig {
  return {
    outputDir,
    viewport: options?.viewport || 'mobile',
    styleDirection: options?.styleDirection || DEFAULT_STYLE_DIRECTION,
    colorPalette: options?.colorPalette || [],
    heroVariants: options?.heroVariants || DEFAULT_HERO_VARIANTS,
    maxRegenerations: options?.maxRegenerations || DEFAULT_MAX_REGENERATIONS
  };
}

// ============================================================================
// Initialization
// ============================================================================

/**
 * Initializes anchoring session
 */
export function initializeAnchoring(config: AnchoringConfig): AnchoringResult {
  // Read manifest
  const manifestResult = readManifest(config.outputDir);
  if (!manifestResult.success || !manifestResult.data) {
    return { success: false, error: `Failed to read manifest: ${manifestResult.error}` };
  }

  const manifest = manifestResult.data;

  // Check if anchoring can start (audit must be complete)
  const canStart = canStartPhase(manifest, 'anchoring');
  if (!canStart.canStart) {
    return { success: false, error: canStart.reason };
  }

  // Create output directories
  const anchorsDir = path.join(config.outputDir, 'generated', 'anchors');
  const variantsDir = path.join(anchorsDir, 'hero-variants');

  const anchorsDirResult = ensureDir(anchorsDir);
  if (!anchorsDirResult.success) {
    return { success: false, error: anchorsDirResult.error };
  }

  ensureDir(variantsDir);

  // Update phase status
  updatePhaseStatus(manifest, 'anchoring', 'in_progress');

  // Write manifest
  const writeResult = writeManifest(config.outputDir, manifest);
  if (!writeResult.success) {
    return { success: false, error: writeResult.error };
  }

  return { success: true, manifest };
}

// ============================================================================
// Anchoring Execution
// ============================================================================

/**
 * Runs the full anchoring process
 *
 * Flow:
 * 1. Generate hero variants -> user selects
 * 2. Extract color palette from selected hero
 * 3. Generate component anchors (slots 2-6) progressively
 * 4. Generate typography specimens (slots 7-9)
 * 5. Generate state indicators (slots 10-13)
 * 6. Generate iconography anchor (slot 14)
 * 7. Compile StyleConfig
 */
export async function runAnchoring(
  config: AnchoringConfig,
  appUnderstanding: AppUnderstanding,
  improvementPlan: ImprovementPlan
): Promise<AnchoringResult> {
  const anchors: Anchor[] = [];

  // Determine entry screen from first flow
  const entryScreen = appUnderstanding.screens[0];
  if (!entryScreen) {
    return { success: false, error: 'No screens found in app understanding' };
  }

  // This is a placeholder for the full implementation
  // The actual generation logic will be in anchor-generator.ts
  // and will be called here with proper validation gates

  // For now, return a structure indicating anchoring needs to be run interactively
  return {
    success: true,
    anchors,
    error: undefined
  };
}

// ============================================================================
// Completion
// ============================================================================

/**
 * Completes anchoring phase
 */
export function completeAnchoring(
  outputDir: string,
  styleConfig: StyleConfig,
  anchors: Anchor[]
): AnchoringResult {
  // Validate we have all 14 anchors
  if (anchors.length !== 14) {
    return {
      success: false,
      error: `Expected 14 anchors, got ${anchors.length}`
    };
  }

  // Update style config with anchors
  styleConfig.anchors = anchors;

  // Write style configuration
  const configPath = path.join(outputDir, 'style_config.json');
  const configResult = writeJson(configPath, styleConfig);
  if (!configResult.success) {
    return { success: false, error: `Failed to write style config: ${configResult.error}` };
  }

  // Update manifest
  const manifestResult = readManifest(outputDir);
  if (!manifestResult.success || !manifestResult.data) {
    return { success: false, error: `Failed to read manifest: ${manifestResult.error}` };
  }

  const manifest = manifestResult.data;
  updatePhaseStatus(manifest, 'anchoring', 'complete');

  const writeManifestResult = writeManifest(outputDir, manifest);
  if (!writeManifestResult.success) {
    return { success: false, error: writeManifestResult.error };
  }

  return {
    success: true,
    manifest,
    styleConfig,
    anchors
  };
}

// ============================================================================
// Summary & Display
// ============================================================================

/**
 * Generates human-readable anchoring summary
 */
export function getAnchoringSummary(styleConfig: StyleConfig): string {
  const lines = [
    `Anchoring Complete`,
    `Viewport: ${styleConfig.viewport}`,
    `Style Direction: ${styleConfig.styleDirection}`,
    `Generated At: ${styleConfig.generatedAt}`,
    '',
    'Color Palette:',
    `  Primary: ${styleConfig.colorPalette.primary}`,
    `  Background: ${styleConfig.colorPalette.background}`,
    `  Text: ${styleConfig.colorPalette.text}`,
    '',
    `Typography: ${styleConfig.typography.fontFamily}`,
    `Border Radius: ${styleConfig.borderRadius}`,
    `Shadow Style: ${styleConfig.shadowStyle}`,
    '',
    'Anchors:'
  ];

  for (const anchor of styleConfig.anchors) {
    const status = anchor.validated ? 'validated' : 'pending';
    lines.push(`  [${anchor.slot}] ${anchor.type}: ${anchor.name} (${status})`);
  }

  return lines.join('\n');
}

/**
 * Gets a brief status line
 */
export function getAnchoringStatusLine(styleConfig: StyleConfig): string {
  const validated = styleConfig.anchors.filter(a => a.validated).length;
  return `${validated}/14 anchors validated, style: ${styleConfig.styleDirection}`;
}

// ============================================================================
// Helpers
// ============================================================================

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
 * Loads saved style configuration
 */
export function loadStyleConfig(outputDir: string): FileResult<StyleConfig> {
  const filePath = path.join(outputDir, 'style_config.json');
  return readJson<StyleConfig>(filePath);
}

/**
 * Creates an empty anchor placeholder
 */
export function createEmptyAnchor(
  slot: number,
  type: AnchorType,
  name: string,
  description: string
): Anchor {
  return {
    slot,
    type,
    name,
    description,
    imagePath: '',
    validated: false,
    promptUsed: ''
  };
}

/**
 * Creates the initial 14-slot anchor array with placeholders
 */
export function createAnchorSlots(): Anchor[] {
  return [
    createEmptyAnchor(1, 'hero', 'Hero Screen', 'Entry screen establishing visual direction'),
    createEmptyAnchor(2, 'screen', 'Flow Screen 2', 'Second screen in user flow'),
    createEmptyAnchor(3, 'screen', 'Flow Screen 3', 'Third screen in user flow'),
    createEmptyAnchor(4, 'screen', 'Flow Screen 4', 'Fourth screen in user flow'),
    createEmptyAnchor(5, 'screen', 'Flow Screen 5', 'Fifth screen in user flow'),
    createEmptyAnchor(6, 'screen', 'Flow Screen 6', 'Sixth screen in user flow'),
    createEmptyAnchor(7, 'typography', 'Heading Specimens', 'Typography specimen for H1-H6 headings'),
    createEmptyAnchor(8, 'typography', 'Body Specimens', 'Typography specimen for body text'),
    createEmptyAnchor(9, 'typography', 'UI Text Specimens', 'Typography specimen for labels, buttons, captions'),
    createEmptyAnchor(10, 'state', 'Loading State', 'Loading/skeleton state indicator'),
    createEmptyAnchor(11, 'state', 'Empty State', 'Empty state with guidance'),
    createEmptyAnchor(12, 'state', 'Error State', 'Error state with recovery options'),
    createEmptyAnchor(13, 'state', 'Success State', 'Success/confirmation state'),
    createEmptyAnchor(14, 'iconography', 'Icon Set', 'Icon set specimen sheet')
  ];
}

/**
 * Updates a specific anchor in the array
 */
export function updateAnchor(
  anchors: Anchor[],
  slot: number,
  updates: Partial<Anchor>
): Anchor[] {
  return anchors.map(anchor => {
    if (anchor.slot === slot) {
      return { ...anchor, ...updates };
    }
    return anchor;
  });
}

/**
 * Gets anchor by slot number
 */
export function getAnchorBySlot(anchors: Anchor[], slot: number): Anchor | undefined {
  return anchors.find(a => a.slot === slot);
}

/**
 * Checks if all anchors are validated
 */
export function allAnchorsValidated(anchors: Anchor[]): boolean {
  return anchors.every(a => a.validated);
}

/**
 * Gets validated anchors only
 */
export function getValidatedAnchors(anchors: Anchor[]): Anchor[] {
  return anchors.filter(a => a.validated);
}

// ============================================================================
// Re-exports for skill integration
// ============================================================================

// From anchor-generator.ts
export { ANCHOR_SLOTS, STRENGTH_SETTINGS } from './anchor-generator';
export {
  generateHeroVariants,
  generateAnchor,
  generateScreenAnchor,
  generateTypographyAnchor,
  generateStateAnchor,
  generateIconographyAnchor,
  buildReferenceArray,
  estimateAnchoringCost
} from './anchor-generator';
export type { GenerationRequest, GenerationResult, HeroVariantsResult } from './anchor-generator';

// From validation/pre-validator.ts
export { preValidateAnchor, formatValidationResult, shouldRegenerate } from './validation/pre-validator';
export type { ValidationCheck, PreValidationResult } from './validation/pre-validator';

// From validation/user-validator.ts
export {
  createHeroSelectionGate,
  createAnchorApprovalGate,
  formatValidationPrompt,
  processUserResponse,
  generateReviewInstructions,
  parseUserInput
} from './validation/user-validator';
export type {
  UserValidationRequest,
  UserValidationResponse,
  ValidationGate,
  ValidationGateType,
  ProcessedResponse
} from './validation/user-validator';

// From style-extractor.ts
export {
  extractColorsFromAnchor,
  buildColorPalette,
  compileStyleConfig,
  getDefaultPalette,
  inferStyleCharacteristics,
  getAvailableStyleDirections,
  getPalettePreview,
  isValidHexColor
} from './style-extractor';
export type { ExtractedColors, ExtractedStyle, BorderRadiusStyle, ShadowStyle } from './style-extractor';
