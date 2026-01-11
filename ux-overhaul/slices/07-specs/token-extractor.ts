/**
 * Token Extractor for UX Overhaul Skill
 * Extracts design tokens from style configuration in TweakCN-compatible format
 */

import { StyleConfig, ColorPalette, TypographyConfig, SpacingConfig } from '../03-anchoring/anchoring';

// ============================================================================
// Types
// ============================================================================

/**
 * Complete design tokens structure
 */
export interface DesignTokens {
  colors: ColorTokens;
  typography: TypographyTokens;
  spacing: SpacingTokens;
  borderRadius: BorderRadiusTokens;
  shadows: ShadowTokens;
}

/**
 * Color tokens with semantic naming
 */
export interface ColorTokens {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
  error: string;
  success: string;
  warning: string;
}

/**
 * Typography tokens
 */
export interface TypographyTokens {
  fontFamily: string;
  fontFamilyMono: string;
  fontSize: Record<string, string>;
  fontWeight: Record<string, number>;
  lineHeight: Record<string, string>;
  letterSpacing: Record<string, string>;
}

/**
 * Spacing tokens
 */
export interface SpacingTokens {
  base: string;
  scale: Record<string, string>;
}

/**
 * Border radius tokens
 */
export interface BorderRadiusTokens {
  none: string;
  sm: string;
  md: string;
  lg: string;
  full: string;
}

/**
 * Shadow tokens
 */
export interface ShadowTokens {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

/**
 * Output format for tokens
 */
export type TokenOutputFormat = 'json' | 'css' | 'tailwind';

// ============================================================================
// Constants
// ============================================================================

/**
 * Default typography scale (follows Tailwind conventions)
 */
const DEFAULT_FONT_SIZE_SCALE: Record<string, string> = {
  xs: '0.75rem',
  sm: '0.875rem',
  base: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem',
  '5xl': '3rem'
};

/**
 * Default font weight scale
 */
const DEFAULT_FONT_WEIGHT_SCALE: Record<string, number> = {
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700
};

/**
 * Default line height scale
 */
const DEFAULT_LINE_HEIGHT_SCALE: Record<string, string> = {
  none: '1',
  tight: '1.25',
  snug: '1.375',
  normal: '1.5',
  relaxed: '1.625',
  loose: '2'
};

/**
 * Default letter spacing scale
 */
const DEFAULT_LETTER_SPACING_SCALE: Record<string, string> = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0em',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em'
};

// ============================================================================
// Main Extraction
// ============================================================================

/**
 * Extracts complete design tokens from style configuration
 */
export function extractDesignTokens(styleConfig: StyleConfig): DesignTokens {
  return {
    colors: extractColorTokens(styleConfig.colorPalette),
    typography: extractTypographyTokens(styleConfig.typography),
    spacing: extractSpacingTokens(styleConfig.spacing),
    borderRadius: mapBorderRadius(styleConfig.borderRadius),
    shadows: mapShadowTokens(styleConfig.shadowStyle)
  };
}

// ============================================================================
// Color Extraction
// ============================================================================

/**
 * Extracts color tokens from color palette
 */
export function extractColorTokens(palette: ColorPalette): ColorTokens {
  return {
    primary: palette.primary || '#3B82F6',
    secondary: palette.secondary || palette.primary || '#6366F1',
    accent: palette.accent || '#10B981',
    background: palette.background || '#FFFFFF',
    surface: palette.surface || '#F9FAFB',
    text: palette.text || '#111827',
    textMuted: palette.textMuted || '#6B7280',
    border: palette.border || '#E5E7EB',
    error: palette.error || '#EF4444',
    success: palette.success || '#10B981',
    warning: palette.warning || '#F59E0B'
  };
}

// ============================================================================
// Typography Extraction
// ============================================================================

/**
 * Extracts typography tokens from typography config
 */
export function extractTypographyTokens(typography: TypographyConfig): TypographyTokens {
  return {
    fontFamily: typography.fontFamily || 'Inter, system-ui, sans-serif',
    fontFamilyMono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    fontSize: { ...DEFAULT_FONT_SIZE_SCALE },
    fontWeight: {
      ...DEFAULT_FONT_WEIGHT_SCALE,
      heading: parseWeight(typography.headingWeight),
      body: parseWeight(typography.bodyWeight)
    },
    lineHeight: { ...DEFAULT_LINE_HEIGHT_SCALE },
    letterSpacing: { ...DEFAULT_LETTER_SPACING_SCALE }
  };
}

/**
 * Parses weight string to number
 */
function parseWeight(weight: string): number {
  const num = parseInt(weight, 10);
  return isNaN(num) ? 400 : num;
}

// ============================================================================
// Spacing Extraction
// ============================================================================

/**
 * Extracts spacing tokens from spacing config
 */
export function extractSpacingTokens(spacing: SpacingConfig): SpacingTokens {
  const base = spacing.base || 4;
  const scale = spacing.scale || [4, 8, 12, 16, 24, 32, 48, 64];

  // Build named scale
  const namedScale: Record<string, string> = {
    '0': '0px',
    px: '1px'
  };

  // Generate scale values
  scale.forEach((value, index) => {
    const key = String(index + 1);
    namedScale[key] = `${value}px`;
  });

  // Add common named values
  namedScale['0.5'] = `${base * 0.5}px`;
  namedScale['1.5'] = `${base * 1.5}px`;
  namedScale['2.5'] = `${base * 2.5}px`;
  namedScale['3.5'] = `${base * 3.5}px`;

  return {
    base: `${base}px`,
    scale: namedScale
  };
}

// ============================================================================
// Border Radius Mapping
// ============================================================================

/**
 * Maps border radius style to token values
 */
export function mapBorderRadius(style: 'none' | 'subtle' | 'rounded' | 'pill'): BorderRadiusTokens {
  const radiusMap: Record<string, BorderRadiusTokens> = {
    none: {
      none: '0px',
      sm: '0px',
      md: '0px',
      lg: '0px',
      full: '0px'
    },
    subtle: {
      none: '0px',
      sm: '2px',
      md: '4px',
      lg: '6px',
      full: '9999px'
    },
    rounded: {
      none: '0px',
      sm: '4px',
      md: '8px',
      lg: '12px',
      full: '9999px'
    },
    pill: {
      none: '0px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      full: '9999px'
    }
  };

  return radiusMap[style] || radiusMap.rounded;
}

// ============================================================================
// Shadow Mapping
// ============================================================================

/**
 * Maps shadow style to token values
 */
export function mapShadowTokens(style: 'none' | 'subtle' | 'medium' | 'dramatic'): ShadowTokens {
  const shadowMap: Record<string, ShadowTokens> = {
    none: {
      none: 'none',
      sm: 'none',
      md: 'none',
      lg: 'none',
      xl: 'none'
    },
    subtle: {
      none: 'none',
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      md: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      lg: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      xl: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
    },
    medium: {
      none: 'none',
      sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
    },
    dramatic: {
      none: 'none',
      sm: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      md: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      lg: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      xl: '0 25px 50px -12px rgb(0 0 0 / 0.25)'
    }
  };

  return shadowMap[style] || shadowMap.medium;
}

// ============================================================================
// Output Formatters
// ============================================================================

/**
 * Formats tokens as CSS custom properties
 */
export function formatTokensAsCSS(tokens: DesignTokens): string {
  const lines: string[] = [
    ':root {',
    '  /* Colors */'
  ];

  // Colors
  for (const [key, value] of Object.entries(tokens.colors)) {
    const cssKey = toKebabCase(key);
    lines.push(`  --color-${cssKey}: ${value};`);
  }

  lines.push('');
  lines.push('  /* Typography */');
  lines.push(`  --font-family: ${tokens.typography.fontFamily};`);
  lines.push(`  --font-family-mono: ${tokens.typography.fontFamilyMono};`);

  for (const [key, value] of Object.entries(tokens.typography.fontSize)) {
    lines.push(`  --font-size-${key}: ${value};`);
  }

  for (const [key, value] of Object.entries(tokens.typography.fontWeight)) {
    lines.push(`  --font-weight-${key}: ${value};`);
  }

  lines.push('');
  lines.push('  /* Spacing */');
  lines.push(`  --spacing-base: ${tokens.spacing.base};`);
  for (const [key, value] of Object.entries(tokens.spacing.scale)) {
    lines.push(`  --spacing-${key}: ${value};`);
  }

  lines.push('');
  lines.push('  /* Border Radius */');
  for (const [key, value] of Object.entries(tokens.borderRadius)) {
    lines.push(`  --radius-${key}: ${value};`);
  }

  lines.push('');
  lines.push('  /* Shadows */');
  for (const [key, value] of Object.entries(tokens.shadows)) {
    lines.push(`  --shadow-${key}: ${value};`);
  }

  lines.push('}');

  return lines.join('\n');
}

/**
 * Formats tokens as JSON (TweakCN-compatible)
 */
export function formatTokensAsJSON(tokens: DesignTokens): string {
  return JSON.stringify(tokens, null, 2);
}

/**
 * Formats tokens as Tailwind config extend
 */
export function formatTokensAsTailwind(tokens: DesignTokens): string {
  const config = {
    theme: {
      extend: {
        colors: {
          primary: tokens.colors.primary,
          secondary: tokens.colors.secondary,
          accent: tokens.colors.accent,
          background: tokens.colors.background,
          surface: tokens.colors.surface,
          foreground: tokens.colors.text,
          muted: {
            DEFAULT: tokens.colors.surface,
            foreground: tokens.colors.textMuted
          },
          border: tokens.colors.border,
          destructive: tokens.colors.error,
          success: tokens.colors.success,
          warning: tokens.colors.warning
        },
        fontFamily: {
          sans: [tokens.typography.fontFamily],
          mono: [tokens.typography.fontFamilyMono]
        },
        borderRadius: tokens.borderRadius,
        boxShadow: tokens.shadows
      }
    }
  };

  return `// tailwind.config.js extend
module.exports = ${JSON.stringify(config, null, 2)};`;
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * Converts camelCase to kebab-case
 */
function toKebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Validates hex color format
 */
export function isValidHexColor(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}

/**
 * Gets token value by path (e.g., 'colors.primary')
 */
export function getTokenValue(tokens: DesignTokens, path: string): string | number | undefined {
  const parts = path.split('.');
  let current: unknown = tokens;

  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }

  return current as string | number | undefined;
}

/**
 * Gets all color token keys
 */
export function getColorTokenKeys(): (keyof ColorTokens)[] {
  return [
    'primary', 'secondary', 'accent', 'background', 'surface',
    'text', 'textMuted', 'border', 'error', 'success', 'warning'
  ];
}

/**
 * Formats tokens in the specified output format
 */
export function formatTokens(tokens: DesignTokens, format: TokenOutputFormat): string {
  switch (format) {
    case 'css':
      return formatTokensAsCSS(tokens);
    case 'tailwind':
      return formatTokensAsTailwind(tokens);
    case 'json':
    default:
      return formatTokensAsJSON(tokens);
  }
}
