/**
 * Tests for Coherence Phase
 */

import {
  createCoherenceConfig,
  generateCoherenceSummary,
  buildCoherenceReport,
  getCoherenceSummary,
  getCoherenceStatusLine,
  ScreenCoherence,
  CoherenceReport
} from './coherence';

import {
  OUTLIER_THRESHOLD,
  REGENERATION_THRESHOLD,
  OutlierInfo,
  OutlierReason
} from './outlier-detector';

import {
  adjustPromptForCoherenceRetry,
  buildRegenerationPrompt,
  RegenerationRecord
} from './regenerator';

// ============================================================================
// Config Tests
// ============================================================================

describe('createCoherenceConfig', () => {
  it('should create config with defaults', () => {
    const config = createCoherenceConfig('./output');
    expect(config.outputDir).toBe('./output');
    expect(config.viewport).toBe('mobile');
    expect(config.maxPasses).toBe(2);
    expect(config.coherenceThreshold).toBe(85);
    expect(config.maxRegenerationsPerScreen).toBe(2);
  });

  it('should create config with custom options', () => {
    const config = createCoherenceConfig('./output', {
      viewport: 'desktop',
      maxPasses: 3,
      coherenceThreshold: 90
    });
    expect(config.viewport).toBe('desktop');
    expect(config.maxPasses).toBe(3);
    expect(config.coherenceThreshold).toBe(90);
  });

  it('should create config with partial options', () => {
    const config = createCoherenceConfig('./output', {
      maxPasses: 1
    });
    expect(config.maxPasses).toBe(1);
    expect(config.viewport).toBe('mobile'); // Default
    expect(config.coherenceThreshold).toBe(85); // Default
  });
});

// ============================================================================
// Constants Tests
// ============================================================================

describe('OUTLIER_THRESHOLD', () => {
  it('should be 30', () => {
    expect(OUTLIER_THRESHOLD).toBe(30);
  });
});

describe('REGENERATION_THRESHOLD', () => {
  it('should be 50', () => {
    expect(REGENERATION_THRESHOLD).toBe(50);
  });

  it('should be greater than OUTLIER_THRESHOLD', () => {
    expect(REGENERATION_THRESHOLD).toBeGreaterThan(OUTLIER_THRESHOLD);
  });
});

// ============================================================================
// Summary Tests
// ============================================================================

describe('generateCoherenceSummary', () => {
  it('should generate correct summary for empty arrays', () => {
    const summary = generateCoherenceSummary([], [], [], 1, 2);
    expect(summary.totalScreens).toBe(0);
    expect(summary.coherentCount).toBe(0);
    expect(summary.outlierCount).toBe(0);
    expect(summary.regeneratedCount).toBe(0);
    expect(summary.overallCoherenceScore).toBe(100);
    expect(summary.passNumber).toBe(1);
    expect(summary.totalPasses).toBe(2);
  });

  it('should calculate summary correctly with screens', () => {
    const screens: ScreenCoherence[] = [
      createMockScreenCoherence('screen-1', true, 90),
      createMockScreenCoherence('screen-2', true, 85),
      createMockScreenCoherence('screen-3', false, 65)
    ];
    const outliers: OutlierInfo[] = [
      createMockOutlier('screen-3', 35)
    ];
    const regenerations: RegenerationRecord[] = [];

    const summary = generateCoherenceSummary(screens, outliers, regenerations, 1, 2);

    expect(summary.totalScreens).toBe(3);
    expect(summary.coherentCount).toBe(2);
    expect(summary.outlierCount).toBe(1);
    expect(summary.overallCoherenceScore).toBe(80); // (90+85+65)/3 = 80
    expect(summary.passNumber).toBe(1);
  });

  it('should calculate regeneration count and cost', () => {
    const screens: ScreenCoherence[] = [
      createMockScreenCoherence('screen-1', true, 95)
    ];
    const outliers: OutlierInfo[] = [];
    const regenerations: RegenerationRecord[] = [
      { screenId: 'screen-1', passNumber: 1, reason: 'test', success: true, attempts: 2, cost: 0.30 },
      { screenId: 'screen-2', passNumber: 1, reason: 'test', success: false, attempts: 3, cost: 0.45 }
    ];

    const summary = generateCoherenceSummary(screens, outliers, regenerations, 1, 2);

    expect(summary.regeneratedCount).toBe(1);
    expect(summary.totalRegenerationCost).toBeCloseTo(0.75);
  });
});

describe('buildCoherenceReport', () => {
  it('should build complete report', () => {
    const screens: ScreenCoherence[] = [
      createMockScreenCoherence('screen-1', true, 90)
    ];
    const outliers: OutlierInfo[] = [];
    const regenerations: RegenerationRecord[] = [];

    const report = buildCoherenceReport(
      'Test App',
      'mobile',
      1,
      2,
      screens,
      outliers,
      regenerations
    );

    expect(report.appName).toBe('Test App');
    expect(report.viewport).toBe('mobile');
    expect(report.passNumber).toBe(1);
    expect(report.maxPasses).toBe(2);
    expect(report.screens.length).toBe(1);
    expect(report.outliers.length).toBe(0);
    expect(report.regenerations.length).toBe(0);
    expect(report.summary.totalScreens).toBe(1);
    expect(report.validatedAt).toBeDefined();
  });

  it('should build report with outliers', () => {
    const screens: ScreenCoherence[] = [
      createMockScreenCoherence('screen-1', false, 60)
    ];
    const outliers: OutlierInfo[] = [
      createMockOutlier('screen-1', 40)
    ];
    const regenerations: RegenerationRecord[] = [];

    const report = buildCoherenceReport(
      'Test App',
      'mobile',
      1,
      2,
      screens,
      outliers,
      regenerations
    );

    expect(report.outliers.length).toBe(1);
    expect(report.summary.outlierCount).toBe(1);
  });
});

// ============================================================================
// Display Tests
// ============================================================================

describe('getCoherenceSummary', () => {
  it('should format summary as string', () => {
    const screens: ScreenCoherence[] = [
      createMockScreenCoherence('screen-1', true, 90)
    ];

    const report = buildCoherenceReport('Test App', 'mobile', 1, 2, screens, [], []);
    const summary = getCoherenceSummary(report);

    expect(summary).toContain('Test App');
    expect(summary).toContain('mobile');
    expect(summary).toContain('Pass: 1/2');
    expect(summary).toContain('Total Screens: 1');
  });

  it('should include outliers in summary', () => {
    const screens: ScreenCoherence[] = [
      createMockScreenCoherence('screen-1', false, 60)
    ];
    const outliers: OutlierInfo[] = [
      createMockOutlier('screen-1', 55)
    ];

    const report = buildCoherenceReport('Test App', 'mobile', 1, 2, screens, outliers, []);
    const summary = getCoherenceSummary(report);

    expect(summary).toContain('Outliers');
    expect(summary).toContain('[REGEN]');
  });
});

describe('getCoherenceStatusLine', () => {
  it('should format status line correctly', () => {
    const screens: ScreenCoherence[] = [
      createMockScreenCoherence('screen-1', true, 90),
      createMockScreenCoherence('screen-2', false, 65)
    ];

    const report = buildCoherenceReport('Test App', 'mobile', 1, 2, screens, [], []);
    const statusLine = getCoherenceStatusLine(report);

    expect(statusLine).toContain('1/2 coherent');
    expect(statusLine).toContain('78%'); // Average: (90+65)/2 = 77.5 rounded
    expect(statusLine).toContain('$0.00 cost');
  });
});

// ============================================================================
// Regenerator Tests
// ============================================================================

describe('buildRegenerationPrompt', () => {
  it('should build prompt with colors and fixes', () => {
    const outlier = createMockOutlier('screen-1', 60);
    const colors = ['#3B82F6', '#10B981', '#F59E0B'];

    const prompt = buildRegenerationPrompt(outlier, 'dashboard', 'Modern minimalist', colors);

    expect(prompt).toContain('Modern minimalist');
    expect(prompt).toContain('dashboard');
    expect(prompt).toContain('CRITICAL');
    expect(prompt).toContain('#3B82F6');
  });

  it('should include recommendations as fixes', () => {
    const outlier = createMockOutlier('screen-1', 60);
    outlier.recommendations = ['Fix color palette', 'Adjust spacing'];
    const colors = ['#3B82F6'];

    const prompt = buildRegenerationPrompt(outlier, 'form', 'Clean', colors);

    expect(prompt).toContain('FIX THESE ISSUES');
    expect(prompt).toContain('Fix color palette');
  });
});

describe('adjustPromptForCoherenceRetry', () => {
  it('should add style instructions on attempt 2', () => {
    const adjusted = adjustPromptForCoherenceRetry('test prompt', 2, ['color_drift']);

    expect(adjusted).toContain('MUST maintain');
    expect(adjusted).toContain('shadows');
    expect(adjusted).toContain('border radius');
  });

  it('should strengthen on attempt 3+', () => {
    const adjusted = adjustPromptForCoherenceRetry('CRITICAL test', 3, ['color_drift', 'style_inconsistency']);

    expect(adjusted).toContain('MANDATORY');
    expect(adjusted).toContain('Match color palette EXACTLY');
    expect(adjusted).toContain('Copy style from reference 1');
  });

  it('should handle different outlier reasons', () => {
    const reasons: OutlierReason[] = ['layout_deviation', 'typography_inconsistency'];
    const adjusted = adjustPromptForCoherenceRetry('CRITICAL test', 3, reasons);

    expect(adjusted).toContain('Preserve original layout');
    expect(adjusted).toContain('exact typography');
  });
});

// ============================================================================
// Outlier Tests
// ============================================================================

describe('OutlierInfo', () => {
  it('should mark as regenerate when score >= REGENERATION_THRESHOLD', () => {
    const outlier = createMockOutlier('screen-1', REGENERATION_THRESHOLD);
    expect(outlier.shouldRegenerate).toBe(true);
  });

  it('should not regenerate when score < REGENERATION_THRESHOLD', () => {
    const outlier = createMockOutlier('screen-1', REGENERATION_THRESHOLD - 1);
    expect(outlier.shouldRegenerate).toBe(false);
  });
});

// ============================================================================
// Mock Helpers
// ============================================================================

function createMockScreenCoherence(
  screenId: string,
  passed: boolean,
  score: number
): ScreenCoherence {
  return {
    screenId,
    screenName: `Screen ${screenId}`,
    screenPath: `generated/screens/${screenId}-propagated.png`,
    coherenceScore: score,
    passed,
    issues: passed ? [] : ['Test issue']
  };
}

function createMockOutlier(screenId: string, score: number): OutlierInfo {
  return {
    screenId,
    screenName: `Screen ${screenId}`,
    screenPath: `generated/screens/${screenId}-propagated.png`,
    outlierScore: score,
    reasons: ['color_drift'],
    recommendations: ['Adjust colors'],
    shouldRegenerate: score >= REGENERATION_THRESHOLD
  };
}
