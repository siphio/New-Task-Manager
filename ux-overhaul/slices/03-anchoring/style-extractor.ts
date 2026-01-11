/**
 * Style Extractor for UX Overhaul Skill
 * Extracts and compiles style configuration from validated anchors
 *
 * Note: Full color extraction would require image analysis libraries.
 * For MVP, we use prompt-based extraction and default palettes.
 */

import {
  Anchor,
  ColorPalette,
  StyleConfig,
  TypographyConfig,
  SpacingConfig,
  ViewportType
} from './anchoring';

// ============================================================================
// Types
// ============================================================================

/**
 * Extracted color information from an image
 */
export interface ExtractedColors {
  dominantColors: string[];
  suggestedPalette: ColorPalette;
}

/**
 * Border radius style options
 */
export type BorderRadiusStyle = 'none' | 'subtle' | 'rounded' | 'pill';

/**
 * Shadow style options
 */
export type ShadowStyle = 'none' | 'subtle' | 'medium' | 'dramatic';

/**
 * Spacing density options
 */
export type SpacingDensity = 'compact' | 'comfortable' | 'spacious';

/**
 * Complete extracted style information
 */
export interface ExtractedStyle {
  colors: ExtractedColors;
  borderRadius: BorderRadiusStyle;
  shadowStyle: ShadowStyle;
  spacing: SpacingDensity;
}

// ============================================================================
// Default Palettes
// ============================================================================

/**
 * Default color palettes by style direction
 */
const DEFAULT_PALETTES: Record<string, ColorPalette> = {
  'modern minimal': {
    primary: '#3B82F6',
    secondary: '#6366F1',
    accent: '#10B981',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    text: '#111827',
    textMuted: '#6B7280',
    border: '#E5E7EB',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B'
  },
  'bold vibrant': {
    primary: '#7C3AED',
    secondary: '#EC4899',
    accent: '#F59E0B',
    background: '#FFFFFF',
    surface: '#F5F3FF',
    text: '#1F2937',
    textMuted: '#6B7280',
    border: '#DDD6FE',
    error: '#DC2626',
    success: '#059669',
    warning: '#D97706'
  },
  'dark professional': {
    primary: '#3B82F6',
    secondary: '#8B5CF6',
    accent: '#22D3EE',
    background: '#0F172A',
    surface: '#1E293B',
    text: '#F1F5F9',
    textMuted: '#94A3B8',
    border: '#334155',
    error: '#F87171',
    success: '#4ADE80',
    warning: '#FBBF24'
  },
  'soft organic': {
    primary: '#059669',
    secondary: '#0891B2',
    accent: '#F97316',
    background: '#FFFBEB',
    surface: '#FEF3C7',
    text: '#292524',
    textMuted: '#78716C',
    border: '#D6D3D1',
    error: '#DC2626',
    success: '#16A34A',
    warning: '#CA8A04'
  },
  'corporate clean': {
    primary: '#2563EB',
    secondary: '#4F46E5',
    accent: '#0EA5E9',
    background: '#FFFFFF',
    surface: '#F8FAFC',
    text: '#0F172A',
    textMuted: '#64748B',
    border: '#CBD5E1',
    error: '#DC2626',
    success: '#16A34A',
    warning: '#EAB308'
  }
};

/**
 * Default typography by style direction
 */
const DEFAULT_TYPOGRAPHY: Record<string, TypographyConfig> = {
  'modern minimal': {
    fontFamily: 'Inter, system-ui, sans-serif',
    headingWeight: '600',
    bodyWeight: '400'
  },
  'bold vibrant': {
    fontFamily: 'Poppins, system-ui, sans-serif',
    headingWeight: '700',
    bodyWeight: '400'
  },
  'dark professional': {
    fontFamily: 'Inter, system-ui, sans-serif',
    headingWeight: '600',
    bodyWeight: '400'
  },
  'soft organic': {
    fontFamily: 'Nunito, system-ui, sans-serif',
    headingWeight: '600',
    bodyWeight: '400'
  },
  'corporate clean': {
    fontFamily: 'Source Sans Pro, system-ui, sans-serif',
    headingWeight: '600',
    bodyWeight: '400'
  }
};

/**
 * Default spacing configuration
 */
const DEFAULT_SPACING: SpacingConfig = {
  base: 4,
  scale: [4, 8, 12, 16, 24, 32, 48, 64]
};

// ============================================================================
// Color Extraction
// ============================================================================

/**
 * Extracts dominant colors from an anchor image
 *
 * Note: For MVP, returns default palette based on style direction.
 * Full implementation would use image analysis (sharp, jimp) for actual extraction.
 */
export async function extractColorsFromAnchor(
  anchorPath: string,
  styleDirection: string = 'modern minimal'
): Promise<ExtractedColors> {
  // MVP: Return default palette based on style direction
  const palette = getDefaultPalette(styleDirection);

  return {
    dominantColors: [
      palette.primary,
      palette.secondary || palette.primary,
      palette.accent || palette.primary,
      palette.background,
      palette.text
    ],
    suggestedPalette: palette
  };
}

/**
 * Gets default color palette for a style direction
 */
export function getDefaultPalette(styleDirection: string): ColorPalette {
  // Normalize style direction
  const normalized = styleDirection.toLowerCase();

  // Check for exact match
  if (DEFAULT_PALETTES[normalized]) {
    return { ...DEFAULT_PALETTES[normalized] };
  }

  // Check for partial matches
  for (const [key, palette] of Object.entries(DEFAULT_PALETTES)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return { ...palette };
    }
  }

  // Check for keyword matches
  if (normalized.includes('dark')) {
    return { ...DEFAULT_PALETTES['dark professional'] };
  }
  if (normalized.includes('bold') || normalized.includes('vibrant')) {
    return { ...DEFAULT_PALETTES['bold vibrant'] };
  }
  if (normalized.includes('organic') || normalized.includes('soft') || normalized.includes('warm')) {
    return { ...DEFAULT_PALETTES['soft organic'] };
  }
  if (normalized.includes('corporate') || normalized.includes('business')) {
    return { ...DEFAULT_PALETTES['corporate clean'] };
  }

  // Default to modern minimal
  return { ...DEFAULT_PALETTES['modern minimal'] };
}

// ============================================================================
// Palette Building
// ============================================================================

/**
 * Builds color palette from extracted or user-provided colors
 */
export function buildColorPalette(
  extractedColors: string[],
  userProvidedColors?: string[]
): ColorPalette {
  // Start with extracted colors
  const colors = userProvidedColors && userProvidedColors.length > 0
    ? userProvidedColors
    : extractedColors;

  // Build palette with sensible defaults
  return {
    primary: colors[0] || '#3B82F6',
    secondary: colors[1] || shiftHue(colors[0] || '#3B82F6', 30),
    accent: colors[2] || '#10B981',
    background: colors[3] || '#FFFFFF',
    surface: lighten(colors[3] || '#FFFFFF', 0.02),
    text: getContrastingText(colors[3] || '#FFFFFF'),
    textMuted: '#6B7280',
    border: '#E5E7EB',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B'
  };
}

/**
 * Merges user colors with default palette
 */
export function mergeColorPalette(
  basePalette: ColorPalette,
  userColors: string[]
): ColorPalette {
  const merged = { ...basePalette };

  if (userColors[0]) merged.primary = userColors[0];
  if (userColors[1]) merged.secondary = userColors[1];
  if (userColors[2]) merged.accent = userColors[2];
  if (userColors[3]) merged.background = userColors[3];
  if (userColors[4]) merged.text = userColors[4];

  return merged;
}

// ============================================================================
// Style Inference
// ============================================================================

/**
 * Infers style characteristics from style direction
 */
export function inferStyleCharacteristics(styleDirection: string): Partial<ExtractedStyle> {
  const normalized = styleDirection.toLowerCase();

  let borderRadius: BorderRadiusStyle = 'rounded';
  let shadowStyle: ShadowStyle = 'subtle';
  let spacing: SpacingDensity = 'comfortable';

  // Border radius inference
  if (normalized.includes('sharp') || normalized.includes('angular')) {
    borderRadius = 'none';
  } else if (normalized.includes('subtle')) {
    borderRadius = 'subtle';
  } else if (normalized.includes('pill') || normalized.includes('playful')) {
    borderRadius = 'pill';
  }

  // Shadow inference
  if (normalized.includes('flat') || normalized.includes('minimal')) {
    shadowStyle = 'none';
  } else if (normalized.includes('dramatic') || normalized.includes('bold')) {
    shadowStyle = 'dramatic';
  } else if (normalized.includes('subtle')) {
    shadowStyle = 'subtle';
  } else {
    shadowStyle = 'medium';
  }

  // Spacing inference
  if (normalized.includes('compact') || normalized.includes('dense')) {
    spacing = 'compact';
  } else if (normalized.includes('spacious') || normalized.includes('airy')) {
    spacing = 'spacious';
  }

  return { borderRadius, shadowStyle, spacing };
}

// ============================================================================
// Style Config Compilation
// ============================================================================

/**
 * Compiles full style configuration from all anchors
 */
export function compileStyleConfig(
  anchors: Anchor[],
  colorPalette: ColorPalette,
  viewport: ViewportType,
  styleDirection: string
): StyleConfig {
  // Get typography for style direction
  const normalizedStyle = styleDirection.toLowerCase();
  const typography = DEFAULT_TYPOGRAPHY[normalizedStyle] ||
    DEFAULT_TYPOGRAPHY['modern minimal'];

  // Infer style characteristics
  const characteristics = inferStyleCharacteristics(styleDirection);

  return {
    generatedAt: new Date().toISOString(),
    viewport,
    styleDirection,
    colorPalette,
    typography,
    spacing: DEFAULT_SPACING,
    borderRadius: characteristics.borderRadius || 'rounded',
    shadowStyle: characteristics.shadowStyle || 'subtle',
    anchors
  };
}

/**
 * Creates empty style config template
 */
export function createEmptyStyleConfig(
  viewport: ViewportType,
  styleDirection: string
): StyleConfig {
  return compileStyleConfig(
    [],
    getDefaultPalette(styleDirection),
    viewport,
    styleDirection
  );
}

// ============================================================================
// Color Utilities
// ============================================================================

/**
 * Shifts hue of a hex color by degrees
 */
function shiftHue(hex: string, degrees: number): string {
  // Simple implementation - shifts the hex value
  // For production, use proper HSL conversion
  const num = parseInt(hex.replace('#', ''), 16);
  const shift = Math.floor((degrees / 360) * 0xFFFFFF);
  const shifted = (num + shift) % 0xFFFFFF;
  return '#' + shifted.toString(16).padStart(6, '0');
}

/**
 * Lightens a hex color
 */
function lighten(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, ((num >> 16) & 0xFF) + Math.floor(255 * amount));
  const g = Math.min(255, ((num >> 8) & 0xFF) + Math.floor(255 * amount));
  const b = Math.min(255, (num & 0xFF) + Math.floor(255 * amount));
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

/**
 * Gets contrasting text color for background
 */
function getContrastingText(backgroundHex: string): string {
  const num = parseInt(backgroundHex.replace('#', ''), 16);
  const r = (num >> 16) & 0xFF;
  const g = (num >> 8) & 0xFF;
  const b = num & 0xFF;

  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5 ? '#111827' : '#F9FAFB';
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Validates hex color format
 */
export function isValidHexColor(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}

/**
 * Validates color palette has required colors
 */
export function validateColorPalette(palette: ColorPalette): {
  valid: boolean;
  missing: string[];
} {
  const required = ['primary', 'background', 'text'];
  const missing: string[] = [];

  for (const key of required) {
    const value = palette[key as keyof ColorPalette];
    if (!value || !isValidHexColor(value)) {
      missing.push(key);
    }
  }

  return {
    valid: missing.length === 0,
    missing
  };
}

/**
 * Gets list of available style directions
 */
export function getAvailableStyleDirections(): string[] {
  return Object.keys(DEFAULT_PALETTES);
}

/**
 * Gets palette preview for display
 */
export function getPalettePreview(palette: ColorPalette): string {
  return [
    `Primary: ${palette.primary}`,
    `Secondary: ${palette.secondary || 'not set'}`,
    `Accent: ${palette.accent || 'not set'}`,
    `Background: ${palette.background}`,
    `Text: ${palette.text}`
  ].join('\n');
}
