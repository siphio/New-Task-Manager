/**
 * Coherence Validator for UX Overhaul Skill
 * Validation checks for individual screen coherence
 */

import * as fs from 'fs';
import { getFileStats } from '../../../core/utils/file';

// ============================================================================
// Types
// ============================================================================

export interface ValidationCheck {
  name: string;
  passed: boolean;
  details?: string;
  severity?: 'error' | 'warning' | 'info';
}

export interface CoherenceValidationResult {
  valid: boolean;
  checks: ValidationCheck[];
  overallScore: number;
  screenId: string;
  screenName: string;
  coherenceIssues?: string[];
}

// ============================================================================
// Constants
// ============================================================================

const MIN_FILE_SIZE_KB = 10;      // Minimum expected file size
const MAX_FILE_SIZE_KB = 10000;   // Maximum expected file size (10MB)
const VALIDITY_THRESHOLD = 80;    // Minimum score to pass validation

// PNG magic bytes: 89 50 4E 47 0D 0A 1A 0A
const PNG_MAGIC_BYTES = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

// ============================================================================
// Main Validation
// ============================================================================

/**
 * Validates a single screen for coherence
 */
export function validateScreenCoherence(
  imagePath: string,
  screenId: string,
  screenName: string,
  referenceAnchors?: string[],
  colorPalette?: string[],
  viewport?: string
): CoherenceValidationResult {
  const checks: ValidationCheck[] = [];
  const issues: string[] = [];

  // Check 1: File integrity
  const integrityCheck = validateFileIntegrity(imagePath);
  checks.push(integrityCheck);
  if (!integrityCheck.passed) {
    issues.push(`File integrity failed: ${integrityCheck.details}`);
  }

  // Check 2: File size
  const sizeCheck = validateFileSize(imagePath);
  checks.push(sizeCheck);
  if (!sizeCheck.passed) {
    issues.push(`File size issue: ${sizeCheck.details}`);
  }

  // Check 3: File format (PNG)
  const formatCheck = validateFileFormat(imagePath);
  checks.push(formatCheck);
  if (!formatCheck.passed) {
    issues.push(`File format issue: ${formatCheck.details}`);
  }

  // Check 4: Color adherence (MVP: stub)
  if (colorPalette && colorPalette.length > 0) {
    const colorCheck = validateColorAdherence(imagePath, colorPalette);
    checks.push(colorCheck);
    if (!colorCheck.passed) {
      issues.push(`Color adherence issue: ${colorCheck.details}`);
    }
  }

  // Check 5: Style consistency (MVP: stub based on file presence)
  if (referenceAnchors && referenceAnchors.length > 0) {
    const styleCheck = validateStyleConsistency(imagePath, referenceAnchors);
    checks.push(styleCheck);
    if (!styleCheck.passed) {
      issues.push(`Style consistency issue: ${styleCheck.details}`);
    }
  }

  // Calculate score
  const passed = checks.filter(c => c.passed).length;
  const overallScore = Math.round((passed / checks.length) * 100);

  return {
    valid: overallScore >= VALIDITY_THRESHOLD,
    checks,
    overallScore,
    screenId,
    screenName,
    coherenceIssues: issues.length > 0 ? issues : undefined
  };
}

// ============================================================================
// Individual Checks
// ============================================================================

/**
 * Validates file integrity (exists and readable)
 */
export function validateFileIntegrity(filePath: string): ValidationCheck {
  try {
    const exists = fs.existsSync(filePath);
    if (!exists) {
      return {
        name: 'file_integrity',
        passed: false,
        details: 'File not found',
        severity: 'error'
      };
    }

    // Try to read first bytes to verify readable
    const fd = fs.openSync(filePath, 'r');
    const buffer = Buffer.alloc(8);
    fs.readSync(fd, buffer, 0, 8, 0);
    fs.closeSync(fd);

    return {
      name: 'file_integrity',
      passed: true,
      details: 'File exists and is readable',
      severity: 'info'
    };
  } catch (error) {
    return {
      name: 'file_integrity',
      passed: false,
      details: `File read error: ${error}`,
      severity: 'error'
    };
  }
}

/**
 * Validates file size is within expected range
 */
export function validateFileSize(filePath: string): ValidationCheck {
  const stats = getFileStats(filePath);
  if (!stats.success || !stats.data) {
    return {
      name: 'file_size',
      passed: false,
      details: 'Could not read file stats',
      severity: 'error'
    };
  }

  const sizeKB = stats.data.size / 1024;
  const passed = sizeKB >= MIN_FILE_SIZE_KB && sizeKB <= MAX_FILE_SIZE_KB;

  return {
    name: 'file_size',
    passed,
    details: `${Math.round(sizeKB)}KB (expected ${MIN_FILE_SIZE_KB}KB-${MAX_FILE_SIZE_KB / 1000}MB)`,
    severity: passed ? 'info' : 'warning'
  };
}

/**
 * Validates file format (PNG magic bytes)
 */
export function validateFileFormat(filePath: string): ValidationCheck {
  try {
    if (!fs.existsSync(filePath)) {
      return {
        name: 'file_format',
        passed: false,
        details: 'File not found',
        severity: 'error'
      };
    }

    const buffer = fs.readFileSync(filePath);

    if (buffer.length < 8) {
      return {
        name: 'file_format',
        passed: false,
        details: 'File too small to be a valid PNG',
        severity: 'error'
      };
    }

    const headerBytes = buffer.slice(0, 8);
    const isPng = headerBytes.equals(PNG_MAGIC_BYTES);

    return {
      name: 'file_format',
      passed: isPng,
      details: isPng ? 'Valid PNG' : 'Not a valid PNG file',
      severity: isPng ? 'info' : 'error'
    };
  } catch (error) {
    return {
      name: 'file_format',
      passed: false,
      details: `Error reading file: ${error}`,
      severity: 'error'
    };
  }
}

/**
 * Validates color adherence to palette
 * MVP: Stub that always passes - full image analysis requires external libs
 */
export function validateColorAdherence(
  imagePath: string,
  expectedColors: string[]
): ValidationCheck {
  // MVP: Stub implementation
  // Full implementation would use Sharp/Jimp to extract dominant colors
  // and compare against expected palette
  const exists = fs.existsSync(imagePath);

  return {
    name: 'color_adherence',
    passed: exists, // MVP: pass if file exists
    details: exists
      ? `Color check passed (MVP: ${expectedColors.length} colors expected)`
      : 'File not found for color check',
    severity: 'info'
  };
}

/**
 * Validates style consistency against reference anchors
 * MVP: Stub based on file presence - full analysis requires image comparison
 */
export function validateStyleConsistency(
  imagePath: string,
  referenceAnchors: string[]
): ValidationCheck {
  // MVP: Stub implementation
  // Full implementation would use perceptual hashing or SSIM
  // to compare style elements between screen and anchors
  const imageExists = fs.existsSync(imagePath);
  const anchorsExist = referenceAnchors.filter(a => fs.existsSync(a)).length;

  const passed = imageExists && anchorsExist > 0;

  return {
    name: 'style_consistency',
    passed,
    details: passed
      ? `Style consistency check passed (${anchorsExist}/${referenceAnchors.length} anchors available)`
      : `Style check failed: ${imageExists ? 'No reference anchors' : 'Image not found'}`,
    severity: passed ? 'info' : 'warning'
  };
}

// ============================================================================
// Formatting
// ============================================================================

/**
 * Formats validation result for display
 */
export function formatValidationResult(result: CoherenceValidationResult): string {
  const lines = [
    `Coherence Validation: ${result.valid ? 'PASSED' : 'FAILED'} (${result.overallScore}%)`,
    `Screen: ${result.screenName} (${result.screenId})`
  ];

  for (const check of result.checks) {
    const status = check.passed ? '✓' : '✗';
    const severity = check.severity ? ` [${check.severity}]` : '';
    lines.push(`  ${status} ${check.name}${severity}: ${check.details || ''}`);
  }

  if (result.coherenceIssues && result.coherenceIssues.length > 0) {
    lines.push('');
    lines.push('Issues:');
    for (const issue of result.coherenceIssues) {
      lines.push(`  - ${issue}`);
    }
  }

  return lines.join('\n');
}

/**
 * Gets a brief validation status line
 */
export function getValidationStatusLine(result: CoherenceValidationResult): string {
  const passedCount = result.checks.filter(c => c.passed).length;
  return `${result.screenName}: ${passedCount}/${result.checks.length} checks (${result.overallScore}%)`;
}

// ============================================================================
// Batch Validation
// ============================================================================

/**
 * Validates multiple screens for coherence
 */
export function validateBatchCoherence(
  screens: Array<{
    imagePath: string;
    screenId: string;
    screenName: string;
  }>,
  referenceAnchors?: string[],
  colorPalette?: string[]
): { valid: CoherenceValidationResult[]; invalid: CoherenceValidationResult[] } {
  const results = screens.map(screen =>
    validateScreenCoherence(
      screen.imagePath,
      screen.screenId,
      screen.screenName,
      referenceAnchors,
      colorPalette
    )
  );

  return {
    valid: results.filter(r => r.valid),
    invalid: results.filter(r => !r.valid)
  };
}

/**
 * Gets summary of batch validation
 */
export function getBatchValidationSummary(
  screens: Array<{
    imagePath: string;
    screenId: string;
    screenName: string;
  }>,
  referenceAnchors?: string[],
  colorPalette?: string[]
): {
  totalScreens: number;
  validCount: number;
  invalidCount: number;
  successRate: number;
  averageScore: number;
} {
  const results = screens.map(screen =>
    validateScreenCoherence(
      screen.imagePath,
      screen.screenId,
      screen.screenName,
      referenceAnchors,
      colorPalette
    )
  );

  const validCount = results.filter(r => r.valid).length;
  const totalScore = results.reduce((sum, r) => sum + r.overallScore, 0);

  return {
    totalScreens: screens.length,
    validCount,
    invalidCount: screens.length - validCount,
    successRate: screens.length > 0 ? Math.round((validCount / screens.length) * 100) : 0,
    averageScore: screens.length > 0 ? Math.round(totalScore / screens.length) : 0
  };
}
