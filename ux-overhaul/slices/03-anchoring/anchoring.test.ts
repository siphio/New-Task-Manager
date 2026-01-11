/**
 * Unit tests for Phase 3 Anchoring System
 * Tests core constants, configuration, and utility functions
 */

import {
  ANCHOR_SLOTS,
  STRENGTH_SETTINGS,
  createAnchoringConfig,
  getDefaultPalette,
  isValidHexColor,
  ColorPalette,
  AnchorType
} from './anchoring';

import {
  buildAnchorPrompt
} from '../../core/prompts/index';

// ============================================================================
// Test 1: ANCHOR_SLOTS has 14 slots
// ============================================================================
describe('ANCHOR_SLOTS constant', () => {
  it('should have exactly 14 slots', () => {
    const slotCount = Object.keys(ANCHOR_SLOTS).length;
    expect(slotCount).toBe(14);
  });

  it('should have slot values from 1 to 14', () => {
    const values = Object.values(ANCHOR_SLOTS);
    expect(values).toContain(1);
    expect(values).toContain(14);
    expect(Math.min(...values)).toBe(1);
    expect(Math.max(...values)).toBe(14);
  });

  it('should have all required slot types', () => {
    expect(ANCHOR_SLOTS).toHaveProperty('HERO');
    expect(ANCHOR_SLOTS).toHaveProperty('SCREEN_2');
    expect(ANCHOR_SLOTS).toHaveProperty('SCREEN_3');
    expect(ANCHOR_SLOTS).toHaveProperty('SCREEN_4');
    expect(ANCHOR_SLOTS).toHaveProperty('SCREEN_5');
    expect(ANCHOR_SLOTS).toHaveProperty('SCREEN_6');
    expect(ANCHOR_SLOTS).toHaveProperty('TYPOGRAPHY_HEADING');
    expect(ANCHOR_SLOTS).toHaveProperty('TYPOGRAPHY_BODY');
    expect(ANCHOR_SLOTS).toHaveProperty('TYPOGRAPHY_UI');
    expect(ANCHOR_SLOTS).toHaveProperty('STATE_LOADING');
    expect(ANCHOR_SLOTS).toHaveProperty('STATE_EMPTY');
    expect(ANCHOR_SLOTS).toHaveProperty('STATE_ERROR');
    expect(ANCHOR_SLOTS).toHaveProperty('STATE_SUCCESS');
    expect(ANCHOR_SLOTS).toHaveProperty('ICONOGRAPHY');
  });
});

// ============================================================================
// Test 2: STRENGTH_SETTINGS has all anchor types with valid numeric values
// ============================================================================
describe('STRENGTH_SETTINGS constant', () => {
  const anchorTypes: AnchorType[] = ['hero', 'screen', 'component', 'typography', 'state', 'iconography'];

  it('should have all anchor types', () => {
    for (const type of anchorTypes) {
      expect(STRENGTH_SETTINGS).toHaveProperty(type);
    }
  });

  it('should have valid numeric values for all anchor types', () => {
    for (const type of anchorTypes) {
      const value = STRENGTH_SETTINGS[type];
      expect(typeof value).toBe('number');
      expect(value).toBeGreaterThan(0);
      expect(value).toBeLessThanOrEqual(1);
    }
  });

  it('should have hero strength higher than others (for establishing style)', () => {
    expect(STRENGTH_SETTINGS.hero).toBeGreaterThanOrEqual(STRENGTH_SETTINGS.screen);
    expect(STRENGTH_SETTINGS.hero).toBeGreaterThanOrEqual(STRENGTH_SETTINGS.component);
    expect(STRENGTH_SETTINGS.hero).toBeGreaterThanOrEqual(STRENGTH_SETTINGS.typography);
    expect(STRENGTH_SETTINGS.hero).toBeGreaterThanOrEqual(STRENGTH_SETTINGS.state);
    expect(STRENGTH_SETTINGS.hero).toBeGreaterThanOrEqual(STRENGTH_SETTINGS.iconography);
  });
});

// ============================================================================
// Test 3: getDefaultPalette returns complete ColorPalette
// ============================================================================
describe('getDefaultPalette function', () => {
  const requiredPaletteKeys: (keyof ColorPalette)[] = [
    'primary', 'background', 'text'
  ];

  const optionalPaletteKeys: (keyof ColorPalette)[] = [
    'secondary', 'accent', 'surface', 'textMuted', 'border', 'error', 'success', 'warning'
  ];

  it('should return a valid palette for "modern minimal" style', () => {
    const palette = getDefaultPalette('modern minimal');

    for (const key of requiredPaletteKeys) {
      expect(palette[key]).toBeDefined();
      expect(typeof palette[key]).toBe('string');
    }
  });

  it('should return a valid palette for "bold vibrant" style', () => {
    const palette = getDefaultPalette('bold vibrant');

    for (const key of requiredPaletteKeys) {
      expect(palette[key]).toBeDefined();
    }
  });

  it('should return a valid palette for "dark professional" style', () => {
    const palette = getDefaultPalette('dark professional');

    for (const key of requiredPaletteKeys) {
      expect(palette[key]).toBeDefined();
    }
    // Dark theme should have dark background
    expect(palette.background).not.toBe('#FFFFFF');
  });

  it('should return a valid palette for "soft organic" style', () => {
    const palette = getDefaultPalette('soft organic');

    for (const key of requiredPaletteKeys) {
      expect(palette[key]).toBeDefined();
    }
  });

  it('should return a valid palette for "corporate clean" style', () => {
    const palette = getDefaultPalette('corporate clean');

    for (const key of requiredPaletteKeys) {
      expect(palette[key]).toBeDefined();
    }
  });

  it('should return modern minimal palette for unknown style directions', () => {
    const palette = getDefaultPalette('unknown-style-xyz');
    const modernMinimal = getDefaultPalette('modern minimal');

    expect(palette.primary).toBe(modernMinimal.primary);
    expect(palette.background).toBe(modernMinimal.background);
  });

  it('should match partial style keywords (e.g., "dark" matches "dark professional")', () => {
    const paletteDark = getDefaultPalette('dark');
    const paletteDarkProfessional = getDefaultPalette('dark professional');

    expect(paletteDark.primary).toBe(paletteDarkProfessional.primary);
  });

  it('should return all optional palette properties', () => {
    const palette = getDefaultPalette('modern minimal');

    for (const key of optionalPaletteKeys) {
      expect(palette[key]).toBeDefined();
    }
  });
});

// ============================================================================
// Test 4: createAnchoringConfig creates valid config with defaults
// ============================================================================
describe('createAnchoringConfig function', () => {
  it('should create config with required outputDir', () => {
    const config = createAnchoringConfig('/test/output');
    expect(config.outputDir).toBe('/test/output');
  });

  it('should set default viewport to mobile', () => {
    const config = createAnchoringConfig('/test/output');
    expect(config.viewport).toBe('mobile');
  });

  it('should set default style direction', () => {
    const config = createAnchoringConfig('/test/output');
    expect(config.styleDirection).toBeDefined();
    expect(typeof config.styleDirection).toBe('string');
    expect(config.styleDirection!.length).toBeGreaterThan(0);
  });

  it('should set default hero variants to 4', () => {
    const config = createAnchoringConfig('/test/output');
    expect(config.heroVariants).toBe(4);
  });

  it('should set default max regenerations to 3', () => {
    const config = createAnchoringConfig('/test/output');
    expect(config.maxRegenerations).toBe(3);
  });

  it('should set empty color palette by default', () => {
    const config = createAnchoringConfig('/test/output');
    expect(config.colorPalette).toBeDefined();
    expect(Array.isArray(config.colorPalette)).toBe(true);
  });

  it('should allow overriding viewport', () => {
    const config = createAnchoringConfig('/test/output', { viewport: 'desktop' });
    expect(config.viewport).toBe('desktop');
  });

  it('should allow overriding style direction', () => {
    const config = createAnchoringConfig('/test/output', { styleDirection: 'bold vibrant' });
    expect(config.styleDirection).toBe('bold vibrant');
  });

  it('should allow overriding color palette', () => {
    const colors = ['#FF0000', '#00FF00', '#0000FF'];
    const config = createAnchoringConfig('/test/output', { colorPalette: colors });
    expect(config.colorPalette).toEqual(colors);
  });

  it('should allow overriding hero variants', () => {
    const config = createAnchoringConfig('/test/output', { heroVariants: 6 });
    expect(config.heroVariants).toBe(6);
  });

  it('should allow overriding max regenerations', () => {
    const config = createAnchoringConfig('/test/output', { maxRegenerations: 5 });
    expect(config.maxRegenerations).toBe(5);
  });
});

// ============================================================================
// Test 5: buildAnchorPrompt generates prompts with reference instructions
// ============================================================================
describe('buildAnchorPrompt function', () => {
  const styleDirection = 'modern minimal';
  const colorPalette = ['#3B82F6', '#6366F1', '#10B981', '#FFFFFF', '#111827'];

  it('should generate prompt with style direction', () => {
    const prompt = buildAnchorPrompt('hero', 'Hero screen', styleDirection, colorPalette, 0);
    expect(prompt).toContain(styleDirection);
  });

  it('should generate prompt with description', () => {
    const prompt = buildAnchorPrompt('screen', 'Dashboard view', styleDirection, colorPalette, 0);
    expect(prompt).toContain('Dashboard view');
  });

  it('should include color palette in prompt', () => {
    const prompt = buildAnchorPrompt('hero', 'Hero screen', styleDirection, colorPalette, 0);
    expect(prompt).toContain('#3B82F6');
  });

  it('should NOT include reference instructions when referenceCount is 0', () => {
    const prompt = buildAnchorPrompt('hero', 'Hero screen', styleDirection, colorPalette, 0);
    expect(prompt).not.toContain('reference images');
    expect(prompt).not.toContain('Match style exactly from');
  });

  it('should include reference instructions when referenceCount is 1', () => {
    const prompt = buildAnchorPrompt('screen', 'Second screen', styleDirection, colorPalette, 1);
    expect(prompt).toContain('reference');
    expect(prompt).toContain('1');
  });

  it('should include expanded reference instructions when referenceCount is 2+', () => {
    const prompt = buildAnchorPrompt('screen', 'Third screen', styleDirection, colorPalette, 2);
    expect(prompt).toContain('reference 1');
    expect(prompt).toContain('reference 2');
  });

  it('should include quality requirements', () => {
    const prompt = buildAnchorPrompt('hero', 'Hero screen', styleDirection, colorPalette, 0);
    expect(prompt.toLowerCase()).toContain('high fidelity');
  });

  it('should handle empty color palette', () => {
    const prompt = buildAnchorPrompt('hero', 'Hero screen', styleDirection, [], 0);
    expect(prompt).toBeDefined();
    expect(prompt.length).toBeGreaterThan(0);
  });
});

// ============================================================================
// Test 6: isValidHexColor validates hex color format
// ============================================================================
describe('isValidHexColor function', () => {
  it('should return true for valid 6-digit hex color with #', () => {
    expect(isValidHexColor('#3B82F6')).toBe(true);
    expect(isValidHexColor('#FFFFFF')).toBe(true);
    expect(isValidHexColor('#000000')).toBe(true);
    expect(isValidHexColor('#abcdef')).toBe(true);
    expect(isValidHexColor('#ABCDEF')).toBe(true);
  });

  it('should return true for mixed case hex colors', () => {
    expect(isValidHexColor('#aAbBcC')).toBe(true);
    expect(isValidHexColor('#1A2b3C')).toBe(true);
  });

  it('should return false for 3-digit hex color', () => {
    expect(isValidHexColor('#FFF')).toBe(false);
    expect(isValidHexColor('#000')).toBe(false);
    expect(isValidHexColor('#ABC')).toBe(false);
  });

  it('should return false for hex color without #', () => {
    expect(isValidHexColor('3B82F6')).toBe(false);
    expect(isValidHexColor('FFFFFF')).toBe(false);
  });

  it('should return false for invalid characters', () => {
    expect(isValidHexColor('#GGGGGG')).toBe(false);
    expect(isValidHexColor('#ZZZZZZ')).toBe(false);
    expect(isValidHexColor('#12345G')).toBe(false);
  });

  it('should return false for too long hex color', () => {
    expect(isValidHexColor('#1234567')).toBe(false);
    expect(isValidHexColor('#12345678')).toBe(false);
  });

  it('should return false for too short hex color', () => {
    expect(isValidHexColor('#12345')).toBe(false);
    expect(isValidHexColor('#1234')).toBe(false);
    expect(isValidHexColor('#12')).toBe(false);
  });

  it('should return false for empty string', () => {
    expect(isValidHexColor('')).toBe(false);
  });

  it('should return false for non-hex values', () => {
    expect(isValidHexColor('red')).toBe(false);
    expect(isValidHexColor('rgb(0,0,0)')).toBe(false);
    expect(isValidHexColor('hsl(0,0%,0%)')).toBe(false);
  });
});
