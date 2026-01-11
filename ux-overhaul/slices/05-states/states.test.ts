/**
 * Tests for States Phase
 */

import {
  createStatesConfig, generateStatesSummary, buildStatesReport,
  getStatesSummary, getStatesStatusLine, StateType, STATE_TYPES, ScreenStates, GeneratedState
} from './states';

import {
  STATE_STRENGTHS, STATE_TYPE_NAMES, adjustPromptForRetry, estimateStatesCost, formatCost
} from './state-generator';

// ============================================================================
// Config Tests
// ============================================================================

describe('createStatesConfig', () => {
  it('should create config with defaults', () => {
    const config = createStatesConfig('./output');
    expect(config.outputDir).toBe('./output');
    expect(config.viewport).toBe('mobile');
    expect(config.batchSize).toBe(5);
    expect(config.maxRegenerations).toBe(3);
    expect(config.stateTypes).toEqual(STATE_TYPES);
  });

  it('should create config with custom options', () => {
    const config = createStatesConfig('./output', {
      viewport: 'desktop',
      batchSize: 10,
      stateTypes: ['loading', 'error']
    });
    expect(config.viewport).toBe('desktop');
    expect(config.batchSize).toBe(10);
    expect(config.stateTypes).toEqual(['loading', 'error']);
  });
});

// ============================================================================
// Constants Tests
// ============================================================================

describe('STATE_TYPES', () => {
  it('should have exactly 4 state types', () => {
    expect(STATE_TYPES.length).toBe(4);
    expect(STATE_TYPES).toContain('loading');
    expect(STATE_TYPES).toContain('empty');
    expect(STATE_TYPES).toContain('error');
    expect(STATE_TYPES).toContain('success');
  });
});

describe('STATE_STRENGTHS', () => {
  it('should have valid strengths for all types', () => {
    for (const type of STATE_TYPES) {
      expect(STATE_STRENGTHS[type]).toBeDefined();
      expect(STATE_STRENGTHS[type]).toBeGreaterThanOrEqual(0.50);
      expect(STATE_STRENGTHS[type]).toBeLessThanOrEqual(0.55);
    }
  });
});

describe('STATE_TYPE_NAMES', () => {
  it('should have display names for all types', () => {
    for (const type of STATE_TYPES) {
      expect(STATE_TYPE_NAMES[type]).toBeDefined();
      expect(typeof STATE_TYPE_NAMES[type]).toBe('string');
    }
  });
});

// ============================================================================
// Summary Tests
// ============================================================================

describe('generateStatesSummary', () => {
  it('should generate correct summary for empty array', () => {
    const summary = generateStatesSummary([]);
    expect(summary.totalScreens).toBe(0);
    expect(summary.totalStates).toBe(0);
    expect(summary.successCount).toBe(0);
  });

  it('should calculate summary correctly', () => {
    const screenStates: ScreenStates[] = [{
      screenId: 'screen-1',
      screenName: 'Dashboard',
      states: [
        createMockState('loading', true, 1, 0.15),
        createMockState('empty', true, 1, 0.15),
        createMockState('error', true, 2, 0.30),
        createMockState('success', false, 3, 0.45)
      ],
      totalCost: 1.05,
      successCount: 3
    }];

    const summary = generateStatesSummary(screenStates);
    expect(summary.totalScreens).toBe(1);
    expect(summary.totalStates).toBe(4);
    expect(summary.successCount).toBe(3);
    expect(summary.failureCount).toBe(1);
    expect(summary.totalCost).toBeCloseTo(1.05);
  });
});

describe('buildStatesReport', () => {
  it('should build complete report', () => {
    const screenStates: ScreenStates[] = [{
      screenId: 'screen-1',
      screenName: 'Dashboard',
      states: [createMockState('loading', true, 1, 0.15)],
      totalCost: 0.15,
      successCount: 1
    }];

    const report = buildStatesReport('Test App', 'mobile', 5, screenStates);
    expect(report.appName).toBe('Test App');
    expect(report.viewport).toBe('mobile');
    expect(report.screens.length).toBe(1);
    expect(report.summary.totalStates).toBe(1);
  });
});

describe('getStatesSummary', () => {
  it('should format summary as string', () => {
    const report = buildStatesReport('Test App', 'mobile', 5, [{
      screenId: 'screen-1',
      screenName: 'Dashboard',
      states: [createMockState('loading', true, 1, 0.15)],
      totalCost: 0.15,
      successCount: 1
    }]);

    const summary = getStatesSummary(report);
    expect(summary).toContain('Test App');
    expect(summary).toContain('mobile');
  });
});

describe('getStatesStatusLine', () => {
  it('should format status line', () => {
    const report = buildStatesReport('Test App', 'mobile', 5, [{
      screenId: 'screen-1',
      screenName: 'Dashboard',
      states: [createMockState('loading', true, 1, 0.50)],
      totalCost: 0.50,
      successCount: 1
    }]);

    const statusLine = getStatesStatusLine(report);
    expect(statusLine).toBe('1/1 states generated, $0.50 cost');
  });
});

// ============================================================================
// Generator Tests
// ============================================================================

describe('adjustPromptForRetry', () => {
  it('should add state-specific instructions on attempt 2', () => {
    const adjusted = adjustPromptForRetry('test', 'loading', 2);
    expect(adjusted).toContain('CRITICAL');
    expect(adjusted).toContain('skeleton');
  });

  it('should strengthen on attempt 3+', () => {
    const adjusted = adjustPromptForRetry('Match style exactly', 'error', 3);
    expect(adjusted).toContain('MUST match style precisely');
  });

  it('should have different adjustments per state type', () => {
    expect(adjustPromptForRetry('test', 'loading', 2)).toContain('skeleton');
    expect(adjustPromptForRetry('test', 'empty', 2)).toContain('illustration');
    expect(adjustPromptForRetry('test', 'error', 2)).toContain('error indicator');
    expect(adjustPromptForRetry('test', 'success', 2)).toContain('checkmark');
  });
});

describe('estimateStatesCost', () => {
  it('should calculate cost with regeneration buffer', () => {
    const cost = estimateStatesCost(10, 4, '1K');
    expect(cost).toBeCloseTo(7.80);
  });

  it('should double cost for 4K', () => {
    const cost4K = estimateStatesCost(10, 4, '4K');
    expect(cost4K).toBeCloseTo(15.60);
  });
});

describe('formatCost', () => {
  it('should format cost as dollar string', () => {
    expect(formatCost(1.5)).toBe('$1.50');
    expect(formatCost(0.15)).toBe('$0.15');
  });
});

// ============================================================================
// Helpers
// ============================================================================

function createMockState(stateType: StateType, success: boolean, attempts: number, cost: number): GeneratedState {
  return {
    screenId: 'screen-1',
    screenName: 'Dashboard',
    stateType,
    originalPropagatedPath: 'generated/screens/screen-1-propagated.png',
    statePath: success ? `generated/states/screen-1-${stateType}.png` : '',
    success,
    attempts,
    cost,
    strengthUsed: STATE_STRENGTHS[stateType],
    error: success ? undefined : 'Test error'
  };
}
