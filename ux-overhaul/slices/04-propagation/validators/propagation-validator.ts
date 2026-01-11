/**
 * Propagation Validator for UX Overhaul Skill
 * Pre-validation checks for propagated screen images
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
}

export interface PropagationValidationResult {
  valid: boolean;
  checks: ValidationCheck[];
  overallScore: number;
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
 * Validates a propagated screen image
 */
export function validatePropagatedScreen(
  imagePath: string,
  expectedViewport?: string
): PropagationValidationResult {
  const checks: ValidationCheck[] = [];

  // Check 1: File exists
  checks.push(validateFileExists(imagePath));

  // Check 2: File size is reasonable (not empty, not too small)
  checks.push(validateFileSize(imagePath));

  // Check 3: File is valid PNG
  checks.push(validateFileFormat(imagePath));

  // Calculate score
  const passed = checks.filter(c => c.passed).length;
  const overallScore = Math.round((passed / checks.length) * 100);

  return {
    valid: overallScore >= VALIDITY_THRESHOLD,
    checks,
    overallScore
  };
}

// ============================================================================
// Individual Checks
// ============================================================================

/**
 * Validates file exists
 */
export function validateFileExists(filePath: string): ValidationCheck {
  const exists = fs.existsSync(filePath);
  return {
    name: 'file_exists',
    passed: exists,
    details: exists ? 'File found' : 'File not found'
  };
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
      details: 'Could not read file stats'
    };
  }

  const sizeKB = stats.data.size / 1024;
  const passed = sizeKB >= MIN_FILE_SIZE_KB && sizeKB <= MAX_FILE_SIZE_KB;

  return {
    name: 'file_size',
    passed,
    details: `${Math.round(sizeKB)}KB (expected ${MIN_FILE_SIZE_KB}KB-${MAX_FILE_SIZE_KB / 1000}MB)`
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
        details: 'File not found'
      };
    }

    const buffer = fs.readFileSync(filePath);

    if (buffer.length < 8) {
      return {
        name: 'file_format',
        passed: false,
        details: 'File too small to be a valid PNG'
      };
    }

    const headerBytes = buffer.slice(0, 8);
    const isPng = headerBytes.equals(PNG_MAGIC_BYTES);

    return {
      name: 'file_format',
      passed: isPng,
      details: isPng ? 'Valid PNG' : 'Not a valid PNG file'
    };
  } catch (error) {
    return {
      name: 'file_format',
      passed: false,
      details: `Error reading file: ${error}`
    };
  }
}

// ============================================================================
// Formatting
// ============================================================================

/**
 * Formats validation result for display
 */
export function formatValidationResult(result: PropagationValidationResult): string {
  const lines = [
    `Validation: ${result.valid ? 'PASSED' : 'FAILED'} (${result.overallScore}%)`
  ];

  for (const check of result.checks) {
    const status = check.passed ? '✓' : '✗';
    lines.push(`  ${status} ${check.name}: ${check.details || ''}`);
  }

  return lines.join('\n');
}

/**
 * Gets a brief validation status line
 */
export function getValidationStatusLine(result: PropagationValidationResult): string {
  const passedCount = result.checks.filter(c => c.passed).length;
  return `${passedCount}/${result.checks.length} checks passed (${result.overallScore}%)`;
}

// ============================================================================
// Batch Validation
// ============================================================================

/**
 * Validates multiple propagated screens
 */
export function validatePropagatedScreens(
  imagePaths: string[]
): { valid: PropagationValidationResult[]; invalid: PropagationValidationResult[] } {
  const results = imagePaths.map(path => ({
    path,
    result: validatePropagatedScreen(path)
  }));

  return {
    valid: results.filter(r => r.result.valid).map(r => r.result),
    invalid: results.filter(r => !r.result.valid).map(r => r.result)
  };
}

/**
 * Gets summary of batch validation
 */
export function getBatchValidationSummary(
  imagePaths: string[]
): { totalScreens: number; validCount: number; invalidCount: number; successRate: number } {
  const results = imagePaths.map(path => validatePropagatedScreen(path));
  const validCount = results.filter(r => r.valid).length;

  return {
    totalScreens: imagePaths.length,
    validCount,
    invalidCount: imagePaths.length - validCount,
    successRate: imagePaths.length > 0 ? Math.round((validCount / imagePaths.length) * 100) : 0
  };
}
