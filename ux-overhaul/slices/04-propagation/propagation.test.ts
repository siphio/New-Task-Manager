/**
 * Tests for Propagation Phase
 */

import {
  createPropagationConfig,
  generatePropagationSummary,
  buildPropagationReport,
  getPropagationSummary,
  getPropagationStatusLine,
  PropagatedScreen
} from './propagation';

import {
  inferScreenTypeFromName,
  getStrengthForScreenType,
  SCREEN_TYPE_STRENGTHS,
  classifyScreen,
  getAllScreenTypes,
  getStrengthInfo,
  ScreenType
} from './screen-classifier';

import { adjustPromptForRetry, estimatePropagationCost, formatCost } from './propagator';

// ============================================================================
// Propagation Config Tests
// ============================================================================

describe('createPropagationConfig', () => {
  it('should create config with defaults', () => {
    const config = createPropagationConfig('./output');

    expect(config.outputDir).toBe('./output');
    expect(config.viewport).toBe('mobile');
    expect(config.batchSize).toBe(5);
    expect(config.maxRegenerations).toBe(3);
    expect(config.strengthOverride).toBeUndefined();
  });

  it('should create config with custom options', () => {
    const config = createPropagationConfig('./output', {
      viewport: 'desktop',
      batchSize: 10,
      maxRegenerations: 5,
      strengthOverride: 0.7
    });

    expect(config.viewport).toBe('desktop');
    expect(config.batchSize).toBe(10);
    expect(config.maxRegenerations).toBe(5);
    expect(config.strengthOverride).toBe(0.7);
  });

  it('should handle partial options', () => {
    const config = createPropagationConfig('./output', {
      batchSize: 8
    });

    expect(config.batchSize).toBe(8);
    expect(config.viewport).toBe('mobile'); // default
    expect(config.maxRegenerations).toBe(3); // default
  });
});

// ============================================================================
// Screen Classifier Tests
// ============================================================================

describe('inferScreenTypeFromName', () => {
  it('should classify dashboard screens', () => {
    expect(inferScreenTypeFromName('Dashboard')).toBe('dashboard');
    expect(inferScreenTypeFromName('Main Overview')).toBe('dashboard');
    expect(inferScreenTypeFromName('home-page')).toBe('dashboard');
  });

  it('should classify list screens', () => {
    expect(inferScreenTypeFromName('Product List')).toBe('list');
    expect(inferScreenTypeFromName('Search Results')).toBe('list');
    expect(inferScreenTypeFromName('Browse Items')).toBe('list');
  });

  it('should classify form screens', () => {
    expect(inferScreenTypeFromName('Contact Form')).toBe('form');
    expect(inferScreenTypeFromName('Edit Profile')).toBe('form');
    expect(inferScreenTypeFromName('Create New Task')).toBe('form');
    expect(inferScreenTypeFromName('Add Item')).toBe('form');
  });

  it('should classify auth screens', () => {
    expect(inferScreenTypeFromName('Login')).toBe('auth');
    expect(inferScreenTypeFromName('Sign Up')).toBe('auth');
    expect(inferScreenTypeFromName('signin-page')).toBe('auth');
    expect(inferScreenTypeFromName('Register Account')).toBe('auth');
    expect(inferScreenTypeFromName('Forgot Password')).toBe('auth');
  });

  it('should classify settings screens', () => {
    expect(inferScreenTypeFromName('Settings')).toBe('settings');
    expect(inferScreenTypeFromName('Preferences')).toBe('settings');
    expect(inferScreenTypeFromName('Account Settings')).toBe('settings');
  });

  it('should classify detail screens', () => {
    expect(inferScreenTypeFromName('Product Detail')).toBe('detail');
    expect(inferScreenTypeFromName('Item View')).toBe('detail');
    expect(inferScreenTypeFromName('User Profile')).toBe('detail');
  });

  it('should classify landing screens', () => {
    expect(inferScreenTypeFromName('Landing Page')).toBe('landing');
    expect(inferScreenTypeFromName('Welcome Screen')).toBe('landing');
    expect(inferScreenTypeFromName('Onboarding')).toBe('landing');
  });

  it('should classify modal screens', () => {
    expect(inferScreenTypeFromName('Delete Modal')).toBe('modal');
    expect(inferScreenTypeFromName('Confirmation Dialog')).toBe('modal');
    expect(inferScreenTypeFromName('Popup Message')).toBe('modal');
  });

  it('should classify empty screens', () => {
    expect(inferScreenTypeFromName('Empty State')).toBe('empty');
    expect(inferScreenTypeFromName('No Data')).toBe('empty');
    expect(inferScreenTypeFromName('no-results-page')).toBe('empty');
  });

  it('should classify error screens', () => {
    expect(inferScreenTypeFromName('Error Page')).toBe('error');
    expect(inferScreenTypeFromName('404 Not Found')).toBe('error');
    expect(inferScreenTypeFromName('500-error')).toBe('error');
  });

  it('should return generic for unknown patterns', () => {
    expect(inferScreenTypeFromName('Random Screen')).toBe('generic');
    expect(inferScreenTypeFromName('Feature XYZ')).toBe('generic');
  });
});

describe('getStrengthForScreenType', () => {
  it('should return correct strength for each type', () => {
    expect(getStrengthForScreenType('dashboard')).toBe(0.60);
    expect(getStrengthForScreenType('list')).toBe(0.55);
    expect(getStrengthForScreenType('form')).toBe(0.65);
    expect(getStrengthForScreenType('auth')).toBe(0.55);
    expect(getStrengthForScreenType('modal')).toBe(0.65);
    expect(getStrengthForScreenType('empty')).toBe(0.50);
    expect(getStrengthForScreenType('error')).toBe(0.50);
    expect(getStrengthForScreenType('generic')).toBe(0.60);
  });
});

describe('SCREEN_TYPE_STRENGTHS', () => {
  it('should have all screen types defined', () => {
    const allTypes = getAllScreenTypes();
    expect(allTypes.length).toBe(11);

    for (const type of allTypes) {
      expect(SCREEN_TYPE_STRENGTHS[type]).toBeDefined();
      expect(typeof SCREEN_TYPE_STRENGTHS[type]).toBe('number');
    }
  });

  it('should have strengths between 0 and 1', () => {
    for (const strength of Object.values(SCREEN_TYPE_STRENGTHS)) {
      expect(strength).toBeGreaterThanOrEqual(0);
      expect(strength).toBeLessThanOrEqual(1);
    }
  });
});

describe('getStrengthInfo', () => {
  it('should return correct min/max/default', () => {
    const info = getStrengthInfo();
    expect(info.min).toBe(0.50);
    expect(info.max).toBe(0.65);
    expect(info.default).toBe(0.60);
  });
});

// ============================================================================
// Propagation Summary Tests
// ============================================================================

describe('generatePropagationSummary', () => {
  it('should generate correct summary for empty array', () => {
    const summary = generatePropagationSummary([]);

    expect(summary.totalScreens).toBe(0);
    expect(summary.successCount).toBe(0);
    expect(summary.failureCount).toBe(0);
    expect(summary.totalCost).toBe(0);
    expect(summary.averageAttempts).toBe(0);
    expect(Object.keys(summary.byScreenType).length).toBe(0);
  });

  it('should calculate summary correctly', () => {
    const screens: PropagatedScreen[] = [
      {
        screenId: 'screen-1',
        screenName: 'Dashboard',
        screenType: 'dashboard',
        originalPath: 'orig/1.png',
        propagatedPath: 'gen/1.png',
        success: true,
        attempts: 1,
        cost: 0.15,
        strengthUsed: 0.6,
        improvementsApplied: []
      },
      {
        screenId: 'screen-2',
        screenName: 'List',
        screenType: 'list',
        originalPath: 'orig/2.png',
        propagatedPath: 'gen/2.png',
        success: true,
        attempts: 2,
        cost: 0.30,
        strengthUsed: 0.55,
        improvementsApplied: []
      },
      {
        screenId: 'screen-3',
        screenName: 'Form',
        screenType: 'form',
        originalPath: 'orig/3.png',
        propagatedPath: '',
        success: false,
        attempts: 3,
        cost: 0.45,
        strengthUsed: 0.65,
        improvementsApplied: [],
        error: 'API error'
      }
    ];

    const summary = generatePropagationSummary(screens);

    expect(summary.totalScreens).toBe(3);
    expect(summary.successCount).toBe(2);
    expect(summary.failureCount).toBe(1);
    expect(summary.totalCost).toBeCloseTo(0.90);
    expect(summary.averageAttempts).toBe(2);
    expect(summary.byScreenType['dashboard'].count).toBe(1);
    expect(summary.byScreenType['dashboard'].successRate).toBe(100);
    expect(summary.byScreenType['form'].successRate).toBe(0);
  });
});

describe('buildPropagationReport', () => {
  it('should build complete report', () => {
    const screens: PropagatedScreen[] = [
      {
        screenId: 'screen-1',
        screenName: 'Dashboard',
        screenType: 'dashboard',
        originalPath: 'orig/1.png',
        propagatedPath: 'gen/1.png',
        success: true,
        attempts: 1,
        cost: 0.15,
        strengthUsed: 0.6,
        improvementsApplied: ['improvement1']
      }
    ];

    const report = buildPropagationReport('Test App', 'mobile', 5, screens);

    expect(report.appName).toBe('Test App');
    expect(report.viewport).toBe('mobile');
    expect(report.batchSize).toBe(5);
    expect(report.screens.length).toBe(1);
    expect(report.propagatedAt).toBeDefined();
    expect(report.summary.totalScreens).toBe(1);
  });
});

describe('getPropagationSummary', () => {
  it('should format summary as string', () => {
    const screens: PropagatedScreen[] = [
      {
        screenId: 'screen-1',
        screenName: 'Dashboard',
        screenType: 'dashboard',
        originalPath: 'orig/1.png',
        propagatedPath: 'gen/1.png',
        success: true,
        attempts: 1,
        cost: 0.15,
        strengthUsed: 0.6,
        improvementsApplied: []
      }
    ];

    const report = buildPropagationReport('Test App', 'mobile', 5, screens);
    const summary = getPropagationSummary(report);

    expect(summary).toContain('Propagation Complete: Test App');
    expect(summary).toContain('Viewport: mobile');
    expect(summary).toContain('Total Screens: 1');
    expect(summary).toContain('Success: 1');
    expect(summary).toContain('$0.15');
  });
});

describe('getPropagationStatusLine', () => {
  it('should format status line', () => {
    const screens: PropagatedScreen[] = [
      {
        screenId: 'screen-1',
        screenName: 'Dashboard',
        screenType: 'dashboard',
        originalPath: 'orig/1.png',
        propagatedPath: 'gen/1.png',
        success: true,
        attempts: 1,
        cost: 0.50,
        strengthUsed: 0.6,
        improvementsApplied: []
      }
    ];

    const report = buildPropagationReport('Test App', 'mobile', 5, screens);
    const statusLine = getPropagationStatusLine(report);

    expect(statusLine).toBe('1/1 screens propagated, $0.50 cost');
  });
});

// ============================================================================
// Propagator Tests
// ============================================================================

describe('adjustPromptForRetry', () => {
  it('should add style enforcement on attempt 2', () => {
    const original = 'Generate a dashboard screen';
    const adjusted = adjustPromptForRetry(original, 2);

    expect(adjusted).toContain(original);
    expect(adjusted).toContain('CRITICAL');
  });

  it('should add structure preservation on attempt 3+', () => {
    const original = 'Match style exactly from references';
    const adjusted = adjustPromptForRetry(original, 3);

    expect(adjusted).toContain('MUST match style precisely');
    expect(adjusted).toContain('Preserve original layout structure');
  });
});

describe('estimatePropagationCost', () => {
  it('should calculate cost with regeneration buffer', () => {
    const cost1K = estimatePropagationCost(10, '1K');
    expect(cost1K).toBeCloseTo(1.95); // 10 * 1.3 * 0.15
  });

  it('should double cost for 4K', () => {
    const cost4K = estimatePropagationCost(10, '4K');
    expect(cost4K).toBeCloseTo(3.90); // 10 * 1.3 * 0.15 * 2
  });
});

describe('formatCost', () => {
  it('should format cost as dollar string', () => {
    expect(formatCost(1.5)).toBe('$1.50');
    expect(formatCost(0.15)).toBe('$0.15');
    expect(formatCost(10)).toBe('$10.00');
  });
});
