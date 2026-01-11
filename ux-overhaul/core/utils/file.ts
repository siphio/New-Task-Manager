/**
 * File system utilities for UX Overhaul Skill
 * Provides safe file operations with error handling
 */

import * as fs from 'fs';
import * as path from 'path';

export interface FileResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Ensures a directory exists, creating it recursively if needed
 */
export function ensureDir(dirPath: string): FileResult<void> {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: `Failed to create directory: ${error}` };
  }
}

/**
 * Reads a JSON file and parses it
 */
export function readJson<T>(filePath: string): FileResult<T> {
  try {
    if (!fs.existsSync(filePath)) {
      return { success: false, error: `File not found: ${filePath}` };
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content) as T;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: `Failed to read JSON: ${error}` };
  }
}

/**
 * Writes data to a JSON file with pretty formatting
 */
export function writeJson<T>(filePath: string, data: T): FileResult<void> {
  try {
    const dirPath = path.dirname(filePath);
    ensureDir(dirPath);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return { success: true };
  } catch (error) {
    return { success: false, error: `Failed to write JSON: ${error}` };
  }
}

/**
 * Reads a file as a buffer (for images)
 */
export function readBuffer(filePath: string): FileResult<Buffer> {
  try {
    if (!fs.existsSync(filePath)) {
      return { success: false, error: `File not found: ${filePath}` };
    }
    const buffer = fs.readFileSync(filePath);
    return { success: true, data: buffer };
  } catch (error) {
    return { success: false, error: `Failed to read file: ${error}` };
  }
}

/**
 * Writes a buffer to a file (for images)
 */
export function writeBuffer(filePath: string, buffer: Buffer): FileResult<void> {
  try {
    const dirPath = path.dirname(filePath);
    ensureDir(dirPath);
    fs.writeFileSync(filePath, buffer);
    return { success: true };
  } catch (error) {
    return { success: false, error: `Failed to write file: ${error}` };
  }
}

/**
 * Lists files in a directory matching a pattern
 */
export function listFiles(dirPath: string, extension?: string): FileResult<string[]> {
  try {
    if (!fs.existsSync(dirPath)) {
      return { success: true, data: [] };
    }
    let files = fs.readdirSync(dirPath);
    if (extension) {
      files = files.filter(f => f.endsWith(extension));
    }
    return { success: true, data: files.map(f => path.join(dirPath, f)) };
  } catch (error) {
    return { success: false, error: `Failed to list files: ${error}` };
  }
}

/**
 * Resolves a path relative to the project output directory
 */
export function resolveOutputPath(basePath: string, ...segments: string[]): string {
  return path.join(basePath, ...segments);
}

/**
 * Checks if a file exists
 */
export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

/**
 * Deletes a file if it exists
 */
export function deleteFile(filePath: string): FileResult<void> {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: `Failed to delete file: ${error}` };
  }
}

/**
 * Copies a file from source to destination
 */
export function copyFile(src: string, dest: string): FileResult<void> {
  try {
    if (!fs.existsSync(src)) {
      return { success: false, error: `Source file not found: ${src}` };
    }
    const destDir = path.dirname(dest);
    ensureDir(destDir);
    fs.copyFileSync(src, dest);
    return { success: true };
  } catch (error) {
    return { success: false, error: `Failed to copy file: ${error}` };
  }
}

/**
 * Gets file stats
 */
export function getFileStats(filePath: string): FileResult<fs.Stats> {
  try {
    if (!fs.existsSync(filePath)) {
      return { success: false, error: `File not found: ${filePath}` };
    }
    const stats = fs.statSync(filePath);
    return { success: true, data: stats };
  } catch (error) {
    return { success: false, error: `Failed to get file stats: ${error}` };
  }
}

/**
 * Writes text content to a file
 */
export function writeText(filePath: string, content: string): FileResult<void> {
  try {
    const dirPath = path.dirname(filePath);
    ensureDir(dirPath);
    fs.writeFileSync(filePath, content, 'utf-8');
    return { success: true };
  } catch (error) {
    return { success: false, error: `Failed to write text: ${error}` };
  }
}
