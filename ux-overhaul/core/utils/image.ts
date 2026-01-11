/**
 * Image processing utilities for UX Overhaul Skill
 * Handles image metadata, validation, and basic processing
 */

import * as fs from 'fs';
import * as path from 'path';

export interface ImageInfo {
  width: number;
  height: number;
  format: string;
  fileSizeBytes: number;
  aspectRatio: string;
}

export interface ImageResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Extracts basic image information from a PNG file
 * Note: For full image processing, consider using sharp or jimp
 */
export function getImageInfo(filePath: string): ImageResult<ImageInfo> {
  try {
    if (!fs.existsSync(filePath)) {
      return { success: false, error: `File not found: ${filePath}` };
    }

    const buffer = fs.readFileSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const fileSizeBytes = buffer.length;

    let width = 0;
    let height = 0;

    // PNG: width at bytes 16-19, height at bytes 20-23 (big-endian)
    if (ext === '.png' && buffer.length > 24) {
      width = buffer.readUInt32BE(16);
      height = buffer.readUInt32BE(20);
    }
    // JPEG: More complex, need to parse markers
    else if (ext === '.jpg' || ext === '.jpeg') {
      // Simplified JPEG dimension extraction
      let i = 2;
      while (i < buffer.length) {
        if (buffer[i] !== 0xFF) break;
        const marker = buffer[i + 1];
        if (marker === 0xC0 || marker === 0xC2) {
          height = buffer.readUInt16BE(i + 5);
          width = buffer.readUInt16BE(i + 7);
          break;
        }
        const segmentLength = buffer.readUInt16BE(i + 2);
        i += segmentLength + 2;
      }
    }

    const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
    const divisor = gcd(width, height);
    const aspectRatio = divisor > 0 ? `${width/divisor}:${height/divisor}` : 'unknown';

    return {
      success: true,
      data: {
        width,
        height,
        format: ext.slice(1),
        fileSizeBytes,
        aspectRatio
      }
    };
  } catch (error) {
    return { success: false, error: `Failed to get image info: ${error}` };
  }
}

/**
 * Maps viewport dimensions to fal.ai aspect ratios
 */
export function getAspectRatioForViewport(width: number, height: number): string {
  const ratio = width / height;

  // fal.ai supported ratios: 21:9, 16:9, 3:2, 4:3, 5:4, 1:1, 4:5, 3:4, 2:3, 9:16
  const ratios = [
    { ratio: 21/9, name: '21:9' },
    { ratio: 16/9, name: '16:9' },
    { ratio: 16/10, name: '16:9' }, // Map 16:10 to nearest
    { ratio: 3/2, name: '3:2' },
    { ratio: 4/3, name: '4:3' },
    { ratio: 5/4, name: '5:4' },
    { ratio: 1, name: '1:1' },
    { ratio: 4/5, name: '4:5' },
    { ratio: 3/4, name: '3:4' },
    { ratio: 2/3, name: '2:3' },
    { ratio: 9/16, name: '9:16' }
  ];

  let closest = ratios[0];
  let minDiff = Math.abs(ratio - ratios[0].ratio);

  for (const r of ratios) {
    const diff = Math.abs(ratio - r.ratio);
    if (diff < minDiff) {
      minDiff = diff;
      closest = r;
    }
  }

  return closest.name;
}

/**
 * Validates an image file meets requirements
 */
export function validateImage(filePath: string, maxSizeMB: number = 10): ImageResult<boolean> {
  const info = getImageInfo(filePath);
  if (!info.success || !info.data) {
    return { success: false, error: info.error };
  }

  const maxBytes = maxSizeMB * 1024 * 1024;
  if (info.data.fileSizeBytes > maxBytes) {
    return { success: false, error: `Image exceeds ${maxSizeMB}MB limit` };
  }

  if (info.data.width === 0 || info.data.height === 0) {
    return { success: false, error: 'Could not determine image dimensions' };
  }

  return { success: true, data: true };
}

/**
 * Generates a unique filename for a screenshot
 */
export function generateScreenshotFilename(
  screenName: string,
  viewport: string,
  state: string = 'default',
  extension: string = 'png'
): string {
  const timestamp = Date.now();
  const safeName = screenName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return `${safeName}_${viewport}_${state}_${timestamp}.${extension}`;
}

/**
 * Generates a deterministic filename (without timestamp)
 */
export function generateDeterministicFilename(
  screenName: string,
  viewport: string,
  state: string = 'default',
  extension: string = 'png'
): string {
  const safeName = screenName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return `${safeName}_${viewport}_${state}.${extension}`;
}

/**
 * Parses viewport dimensions from common device names
 */
export function parseViewportPreset(preset: string): { width: number; height: number } | null {
  const presets: Record<string, { width: number; height: number }> = {
    'mobile': { width: 390, height: 844 },
    'tablet': { width: 768, height: 1024 },
    'desktop': { width: 1440, height: 900 },
    'desktop-xl': { width: 1920, height: 1080 }
  };

  return presets[preset.toLowerCase()] || null;
}

/**
 * Calculates if an image needs resizing for a target
 */
export function needsResize(
  currentWidth: number,
  currentHeight: number,
  maxWidth: number,
  maxHeight: number
): boolean {
  return currentWidth > maxWidth || currentHeight > maxHeight;
}

/**
 * Calculates new dimensions while maintaining aspect ratio
 */
export function calculateResizedDimensions(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  const widthRatio = maxWidth / width;
  const heightRatio = maxHeight / height;
  const ratio = Math.min(widthRatio, heightRatio, 1);

  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio)
  };
}
