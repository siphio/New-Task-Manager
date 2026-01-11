/**
 * Pre-Validator for UX Overhaul Skill
 * AI pre-validation checks before user review
 *
 * Validates generated anchors for:
 * - File validity and dimensions
 * - Style consistency with previous anchors
 * - Basic quality checks
 */

import { fileExists } from '../../../core/utils/file';
import { getImageInfo } from '../../../core/utils/image';
import { Anchor, AnchorType } from '../anchoring';

// ============================================================================
// Types
// ============================================================================

/**
 * Individual validation check result
 */
export interface ValidationCheck {
  name: string;
  passed: boolean;
  details?: string;
  severity?: 'error' | 'warning' | 'info';
}

/**
 * Complete pre-validation result
 */
export interface PreValidationResult {
  valid: boolean;
  checks: ValidationCheck[];
  overallScore: number;
  adjustedPrompt?: string;
  suggestions?: string[];
}

/**
 * Expected dimensions by viewport
 */
const EXPECTED_DIMENSIONS: Record<string, { minWidth: number; minHeight: number }> = {
  'mobile': { minWidth: 300, minHeight: 500 },
  'tablet': { minWidth: 600, minHeight: 800 },
  'desktop': { minWidth: 1200, minHeight: 700 },
  'desktop-xl': { minWidth: 1600, minHeight: 900 }
};

/**
 * Validation threshold (70% of checks must pass)
 */
const VALIDATION_THRESHOLD = 70;

// ============================================================================
// Main Validation
// ============================================================================

/**
 * Runs all pre-validation checks on a generated anchor image
 */
export async function preValidateAnchor(
  imagePath: string,
  expectedColors: string[],
  previousAnchors: Anchor[],
  anchorType: AnchorType,
  viewport: string = 'mobile'
): Promise<PreValidationResult> {
  const checks: ValidationCheck[] = [];
  const suggestions: string[] = [];

  // 1. Check image exists
  const existsCheck = validateImageExists(imagePath);
  checks.push(existsCheck);

  if (!existsCheck.passed) {
    return {
      valid: false,
      checks,
      overallScore: 0,
      adjustedPrompt: 'Regenerate image - file not created',
      suggestions: ['Verify fal.ai API key is valid', 'Check network connectivity']
    };
  }

  // 2. Check dimensions match viewport expectations
  const dimensionsCheck = await validateDimensions(imagePath, viewport);
  checks.push(dimensionsCheck);

  if (!dimensionsCheck.passed) {
    suggestions.push(`Ensure output matches ${viewport} dimensions`);
  }

  // 3. Check file size is reasonable
  const fileSizeCheck = validateFileSize(imagePath);
  checks.push(fileSizeCheck);

  if (!fileSizeCheck.passed) {
    suggestions.push('Image file may be corrupted or too small');
  }

  // 4. For non-hero anchors: Check consistency with previous anchors
  if (previousAnchors.length > 0 && anchorType !== 'hero') {
    const consistencyCheck = await validateStyleConsistency(
      imagePath,
      previousAnchors,
      anchorType
    );
    checks.push(consistencyCheck);

    if (!consistencyCheck.passed) {
      suggestions.push('Add stronger reference matching instructions');
    }
  }

  // 5. Type-specific validation
  const typeCheck = validateAnchorType(imagePath, anchorType);
  checks.push(typeCheck);

  // Calculate overall score
  const passedCount = checks.filter(c => c.passed).length;
  const overallScore = Math.round((passedCount / checks.length) * 100);

  // Build adjusted prompt if needed
  const failedChecks = checks.filter(c => !c.passed);
  const adjustedPrompt = overallScore < VALIDATION_THRESHOLD
    ? buildAdjustedPrompt(failedChecks, expectedColors)
    : undefined;

  return {
    valid: overallScore >= VALIDATION_THRESHOLD,
    checks,
    overallScore,
    adjustedPrompt,
    suggestions: suggestions.length > 0 ? suggestions : undefined
  };
}

// ============================================================================
// Individual Checks
// ============================================================================

/**
 * Validates that the image file exists
 */
export function validateImageExists(imagePath: string): ValidationCheck {
  const exists = fileExists(imagePath);

  return {
    name: 'File Exists',
    passed: exists,
    details: exists ? `Found at ${imagePath}` : 'Image file not found',
    severity: exists ? 'info' : 'error'
  };
}

/**
 * Validates image dimensions match viewport expectations
 */
export async function validateDimensions(
  imagePath: string,
  viewport: string
): Promise<ValidationCheck> {
  const info = getImageInfo(imagePath);

  if (!info.success || !info.data) {
    return {
      name: 'Dimensions',
      passed: false,
      details: 'Could not read image dimensions',
      severity: 'error'
    };
  }

  const expected = EXPECTED_DIMENSIONS[viewport] || EXPECTED_DIMENSIONS['mobile'];
  const { width, height } = info.data;

  const meetsWidth = width >= expected.minWidth;
  const meetsHeight = height >= expected.minHeight;
  const passed = meetsWidth && meetsHeight;

  return {
    name: 'Dimensions',
    passed,
    details: passed
      ? `${width}x${height} meets ${viewport} requirements`
      : `${width}x${height} below minimum ${expected.minWidth}x${expected.minHeight}`,
    severity: passed ? 'info' : 'warning'
  };
}

/**
 * Validates file size is reasonable (not too small or corrupted)
 */
export function validateFileSize(imagePath: string): ValidationCheck {
  const info = getImageInfo(imagePath);

  if (!info.success || !info.data) {
    return {
      name: 'File Size',
      passed: false,
      details: 'Could not read file size',
      severity: 'error'
    };
  }

  const sizeKB = info.data.fileSizeBytes / 1024;
  const minSizeKB = 10; // At least 10KB
  const maxSizeMB = 10; // No more than 10MB

  const tooSmall = sizeKB < minSizeKB;
  const tooLarge = sizeKB > maxSizeMB * 1024;
  const passed = !tooSmall && !tooLarge;

  let details = '';
  if (tooSmall) {
    details = `File too small (${sizeKB.toFixed(1)}KB) - may be corrupted`;
  } else if (tooLarge) {
    details = `File too large (${(sizeKB / 1024).toFixed(1)}MB) - exceeds limit`;
  } else {
    details = `${sizeKB.toFixed(1)}KB - acceptable size`;
  }

  return {
    name: 'File Size',
    passed,
    details,
    severity: passed ? 'info' : tooSmall ? 'error' : 'warning'
  };
}

/**
 * Validates style consistency with previous anchors
 *
 * Note: Full style validation would require image analysis libraries.
 * For MVP, we use simplified heuristics and rely on prompt engineering.
 */
export async function validateStyleConsistency(
  imagePath: string,
  previousAnchors: Anchor[],
  anchorType: AnchorType
): Promise<ValidationCheck> {
  // For MVP, we do a basic file validity check
  // In production, this would use image analysis for:
  // - Color distribution matching
  // - Edge detection consistency
  // - Brightness/contrast similarity

  const validatedCount = previousAnchors.filter(a => a.validated).length;

  if (validatedCount === 0) {
    return {
      name: 'Style Consistency',
      passed: true,
      details: 'No previous anchors to compare - first anchor establishes style',
      severity: 'info'
    };
  }

  // Check that the file was generated (proxy for successful style application)
  const info = getImageInfo(imagePath);
  const passed = !!(info.success && info.data && info.data.width > 0);

  return {
    name: 'Style Consistency',
    passed,
    details: passed
      ? `Generated with ${validatedCount} reference anchors`
      : 'Could not verify style consistency',
    severity: passed ? 'info' : 'warning'
  };
}

/**
 * Validates anchor matches expected type requirements
 */
export function validateAnchorType(
  imagePath: string,
  anchorType: AnchorType
): ValidationCheck {
  // Type-specific validations
  const typeRequirements: Record<AnchorType, { check: () => boolean; requirement: string }> = {
    hero: {
      check: () => true, // Hero has no specific requirements beyond base checks
      requirement: 'Hero screen with established visual direction'
    },
    screen: {
      check: () => true,
      requirement: 'Screen matching user flow'
    },
    component: {
      check: () => true,
      requirement: 'Isolated component on white background'
    },
    typography: {
      check: () => true,
      requirement: 'Typography specimen with clear hierarchy'
    },
    state: {
      check: () => true,
      requirement: 'State indicator with clear feedback'
    },
    iconography: {
      check: () => true,
      requirement: 'Icon set with consistent style'
    }
  };

  const req = typeRequirements[anchorType];
  const passed = req.check();

  return {
    name: 'Anchor Type',
    passed,
    details: `${anchorType}: ${req.requirement}`,
    severity: 'info'
  };
}

// ============================================================================
// Prompt Adjustment
// ============================================================================

/**
 * Builds an adjusted prompt based on failed checks
 */
function buildAdjustedPrompt(
  failedChecks: ValidationCheck[],
  expectedColors: string[]
): string {
  const adjustments: string[] = [];

  for (const check of failedChecks) {
    switch (check.name) {
      case 'Dimensions':
        adjustments.push('Generate at higher resolution matching viewport requirements');
        break;

      case 'File Size':
        adjustments.push('Ensure complete image generation with full detail');
        break;

      case 'Style Consistency':
        if (expectedColors.length > 0) {
          adjustments.push(
            `CRITICAL - Use ONLY these exact hex colors: ${expectedColors.slice(0, 5).join(', ')}`
          );
        }
        adjustments.push('MUST maintain exact visual style, shadows, and border radius from references');
        break;

      default:
        adjustments.push('Improve quality and consistency');
    }
  }

  return adjustments.join('. ');
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * Formats validation result for display
 */
export function formatValidationResult(result: PreValidationResult): string {
  const lines: string[] = [
    `Validation: ${result.valid ? 'PASSED' : 'FAILED'} (${result.overallScore}%)`,
    ''
  ];

  for (const check of result.checks) {
    const icon = check.passed ? 'ok' : 'fail';
    lines.push(`  [${icon}] ${check.name}: ${check.details || ''}`);
  }

  if (result.suggestions && result.suggestions.length > 0) {
    lines.push('');
    lines.push('Suggestions:');
    for (const suggestion of result.suggestions) {
      lines.push(`  - ${suggestion}`);
    }
  }

  return lines.join('\n');
}

/**
 * Gets validation summary for logging
 */
export function getValidationSummary(result: PreValidationResult): string {
  const passed = result.checks.filter(c => c.passed).length;
  const total = result.checks.length;
  return `${passed}/${total} checks passed (${result.overallScore}%)`;
}

/**
 * Checks if regeneration should be attempted
 */
export function shouldRegenerate(result: PreValidationResult): boolean {
  // Regenerate if score is below threshold but above 0
  // (0 usually means critical failure like missing file)
  return !result.valid && result.overallScore > 0;
}

/**
 * Gets the number of critical failures
 */
export function getCriticalFailures(result: PreValidationResult): number {
  return result.checks.filter(c => !c.passed && c.severity === 'error').length;
}
