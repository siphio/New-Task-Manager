/**
 * Base64 utilities for image encoding
 * Required for fal.ai API which accepts base64 data URLs
 */

import * as fs from 'fs';
import * as path from 'path';

export interface Base64Result {
  success: boolean;
  dataUrl?: string;
  error?: string;
}

/**
 * Converts an image file to a base64 data URL
 */
export function imageToDataUrl(filePath: string): Base64Result {
  try {
    if (!fs.existsSync(filePath)) {
      return { success: false, error: `File not found: ${filePath}` };
    }

    const buffer = fs.readFileSync(filePath);
    const base64 = buffer.toString('base64');
    const ext = path.extname(filePath).toLowerCase().slice(1);

    const mimeTypes: Record<string, string> = {
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'webp': 'image/webp',
      'gif': 'image/gif'
    };

    const mimeType = mimeTypes[ext] || 'image/png';
    const dataUrl = `data:${mimeType};base64,${base64}`;

    return { success: true, dataUrl };
  } catch (error) {
    return { success: false, error: `Failed to encode image: ${error}` };
  }
}

/**
 * Converts a buffer to a base64 data URL
 */
export function bufferToDataUrl(buffer: Buffer, mimeType: string = 'image/png'): string {
  const base64 = buffer.toString('base64');
  return `data:${mimeType};base64,${base64}`;
}

/**
 * Extracts base64 data from a data URL
 */
export function extractBase64(dataUrl: string): string | null {
  const match = dataUrl.match(/^data:[^;]+;base64,(.+)$/);
  return match ? match[1] : null;
}

/**
 * Converts a base64 data URL back to a buffer
 */
export function dataUrlToBuffer(dataUrl: string): Buffer | null {
  const base64 = extractBase64(dataUrl);
  if (!base64) return null;
  return Buffer.from(base64, 'base64');
}

/**
 * Gets the mime type from a data URL
 */
export function getMimeType(dataUrl: string): string | null {
  const match = dataUrl.match(/^data:([^;]+);base64,/);
  return match ? match[1] : null;
}

/**
 * Validates if a string is a valid data URL
 */
export function isValidDataUrl(str: string): boolean {
  return /^data:[^;]+;base64,[A-Za-z0-9+/]+=*$/.test(str);
}

/**
 * Batch convert multiple images to data URLs
 */
export function batchImageToDataUrl(filePaths: string[]): Base64Result[] {
  return filePaths.map(fp => imageToDataUrl(fp));
}

/**
 * Gets the file extension from a mime type
 */
export function mimeTypeToExtension(mimeType: string): string {
  const extensions: Record<string, string> = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/webp': 'webp',
    'image/gif': 'gif'
  };
  return extensions[mimeType] || 'png';
}

/**
 * Saves a data URL to a file
 */
export function saveDataUrlToFile(dataUrl: string, filePath: string): { success: boolean; error?: string } {
  try {
    const buffer = dataUrlToBuffer(dataUrl);
    if (!buffer) {
      return { success: false, error: 'Invalid data URL' };
    }

    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, buffer);
    return { success: true };
  } catch (error) {
    return { success: false, error: `Failed to save file: ${error}` };
  }
}
