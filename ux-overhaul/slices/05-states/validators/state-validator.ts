/**
 * State Validator for UX Overhaul Skill
 */

import * as fs from 'fs';
import { getFileStats } from '../../../core/utils/file';
import { StateType } from '../states';

export interface ValidationCheck {
  name: string;
  passed: boolean;
  details?: string;
}

export interface StateValidationResult {
  valid: boolean;
  checks: ValidationCheck[];
  overallScore: number;
}

const MIN_FILE_SIZE_KB = 10;
const MAX_FILE_SIZE_KB = 10000;
const VALIDITY_THRESHOLD = 80;
const PNG_MAGIC_BYTES = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

export function validateStateImage(imagePath: string, stateType?: StateType): StateValidationResult {
  const checks: ValidationCheck[] = [
    validateFileExists(imagePath),
    validateFileSize(imagePath),
    validateFileFormat(imagePath)
  ];

  const passed = checks.filter(c => c.passed).length;
  const overallScore = Math.round((passed / checks.length) * 100);

  return { valid: overallScore >= VALIDITY_THRESHOLD, checks, overallScore };
}

export function validateFileExists(filePath: string): ValidationCheck {
  const exists = fs.existsSync(filePath);
  return { name: 'file_exists', passed: exists, details: exists ? 'File found' : 'File not found' };
}

export function validateFileSize(filePath: string): ValidationCheck {
  const stats = getFileStats(filePath);
  if (!stats.success || !stats.data) {
    return { name: 'file_size', passed: false, details: 'Could not read file stats' };
  }
  const sizeKB = stats.data.size / 1024;
  const passed = sizeKB >= MIN_FILE_SIZE_KB && sizeKB <= MAX_FILE_SIZE_KB;
  return { name: 'file_size', passed, details: `${Math.round(sizeKB)}KB` };
}

export function validateFileFormat(filePath: string): ValidationCheck {
  try {
    if (!fs.existsSync(filePath)) {
      return { name: 'file_format', passed: false, details: 'File not found' };
    }
    const buffer = fs.readFileSync(filePath);
    if (buffer.length < 8) {
      return { name: 'file_format', passed: false, details: 'File too small' };
    }
    const isPng = buffer.slice(0, 8).equals(PNG_MAGIC_BYTES);
    return { name: 'file_format', passed: isPng, details: isPng ? 'Valid PNG' : 'Not a valid PNG' };
  } catch (error) {
    return { name: 'file_format', passed: false, details: `Error: ${error}` };
  }
}

export function formatValidationResult(result: StateValidationResult): string {
  const lines = [`Validation: ${result.valid ? 'PASSED' : 'FAILED'} (${result.overallScore}%)`];
  for (const check of result.checks) {
    lines.push(`  ${check.passed ? '✓' : '✗'} ${check.name}: ${check.details || ''}`);
  }
  return lines.join('\n');
}

export function getValidationStatusLine(result: StateValidationResult): string {
  const passedCount = result.checks.filter(c => c.passed).length;
  return `${passedCount}/${result.checks.length} checks passed (${result.overallScore}%)`;
}

export function validateStateImages(imagePaths: string[]): { valid: StateValidationResult[]; invalid: StateValidationResult[] } {
  const results = imagePaths.map(path => ({ path, result: validateStateImage(path) }));
  return {
    valid: results.filter(r => r.result.valid).map(r => r.result),
    invalid: results.filter(r => !r.result.valid).map(r => r.result)
  };
}

export function getBatchValidationSummary(imagePaths: string[]): { totalStates: number; validCount: number; invalidCount: number; successRate: number } {
  const results = imagePaths.map(path => validateStateImage(path));
  const validCount = results.filter(r => r.valid).length;
  return {
    totalStates: imagePaths.length,
    validCount,
    invalidCount: imagePaths.length - validCount,
    successRate: imagePaths.length > 0 ? Math.round((validCount / imagePaths.length) * 100) : 0
  };
}
