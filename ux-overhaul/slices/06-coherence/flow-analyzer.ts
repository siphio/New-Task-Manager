/**
 * Flow Analyzer for UX Overhaul Skill
 * Analyzes flow coherence - do screen transitions feel natural?
 */

import { PropagatedScreen, PropagationReport } from '../04-propagation/propagation';
import { StyleConfig } from '../03-anchoring/anchoring';
import { AppUnderstanding } from '../01-capture/capture';

// ============================================================================
// Types
// ============================================================================

export interface FlowTransition {
  fromScreenId: string;
  fromScreenName: string;
  toScreenId: string;
  toScreenName: string;
  transitionScore: number;  // 0-100, higher = more coherent
  issues: string[];
}

export interface FlowAnalysisResult {
  flowName: string;
  transitions: FlowTransition[];
  overallFlowScore: number;
  coherent: boolean;
}

export interface FlowAnalysisSummary {
  totalFlows: number;
  coherentFlows: number;
  problematicTransitions: FlowTransition[];
  averageFlowScore: number;
}

// ============================================================================
// Constants
// ============================================================================

const TRANSITION_COHERENCE_THRESHOLD = 70;  // Min score for coherent transition
const FLOW_COHERENCE_THRESHOLD = 75;        // Min average for coherent flow

/**
 * Screen type compatibility matrix
 * Higher values indicate more natural transitions between screen types
 */
const SCREEN_TYPE_COMPATIBILITY: Record<string, Record<string, number>> = {
  'auth': { 'auth': 90, 'landing': 95, 'dashboard': 85, 'form': 80, 'list': 70, 'detail': 60 },
  'landing': { 'landing': 85, 'auth': 90, 'dashboard': 85, 'form': 75, 'list': 80, 'detail': 70 },
  'dashboard': { 'dashboard': 90, 'list': 90, 'detail': 85, 'form': 80, 'settings': 85 },
  'list': { 'list': 85, 'detail': 95, 'form': 80, 'dashboard': 85, 'modal': 75 },
  'detail': { 'detail': 80, 'list': 90, 'form': 85, 'modal': 85, 'dashboard': 75 },
  'form': { 'form': 75, 'detail': 85, 'list': 80, 'dashboard': 75, 'modal': 80 },
  'settings': { 'settings': 85, 'dashboard': 85, 'detail': 75, 'modal': 80 },
  'modal': { 'modal': 70, 'detail': 85, 'list': 80, 'form': 85 },
  'empty': { 'empty': 60, 'list': 95, 'dashboard': 90 },
  'error': { 'error': 50, 'dashboard': 80, 'list': 75 },
  'loading': { 'loading': 50, 'dashboard': 95, 'list': 95, 'detail': 95 },
  'generic': { 'generic': 75 }
};

// ============================================================================
// Core Analysis
// ============================================================================

/**
 * Analyzes a single flow for coherence
 */
export function analyzeFlow(
  flowName: string,
  screens: PropagatedScreen[],
  flowOrder: string[],
  styleConfig: StyleConfig
): FlowAnalysisResult {
  const transitions: FlowTransition[] = [];

  // Build screen lookup map
  const screenMap = new Map(screens.map(s => [s.screenId, s]));

  // Analyze each transition in the flow
  for (let i = 0; i < flowOrder.length - 1; i++) {
    const fromId = flowOrder[i];
    const toId = flowOrder[i + 1];

    const fromScreen = screenMap.get(fromId);
    const toScreen = screenMap.get(toId);

    if (!fromScreen || !toScreen) {
      // Missing screen in flow
      transitions.push({
        fromScreenId: fromId,
        fromScreenName: fromScreen?.screenName || 'Unknown',
        toScreenId: toId,
        toScreenName: toScreen?.screenName || 'Unknown',
        transitionScore: 0,
        issues: ['Missing screen in flow sequence']
      });
      continue;
    }

    const transition = calculateTransitionScore(fromScreen, toScreen, styleConfig);
    transitions.push(transition);
  }

  // Calculate overall flow score
  const totalScore = transitions.reduce((sum, t) => sum + t.transitionScore, 0);
  const overallFlowScore = transitions.length > 0
    ? Math.round(totalScore / transitions.length)
    : 100; // Empty flow is coherent by default

  return {
    flowName,
    transitions,
    overallFlowScore,
    coherent: overallFlowScore >= FLOW_COHERENCE_THRESHOLD
  };
}

/**
 * Analyzes all flows in the app
 */
export function analyzeAllFlows(
  propagationReport: PropagationReport,
  appUnderstanding: AppUnderstanding,
  styleConfig: StyleConfig
): FlowAnalysisResult[] {
  const results: FlowAnalysisResult[] = [];
  const screens = propagationReport.screens.filter(s => s.success);

  // If app understanding has flow definitions in sitemap, use them
  if (appUnderstanding.sitemap?.flows && appUnderstanding.sitemap.flows.length > 0) {
    for (const flow of appUnderstanding.sitemap.flows) {
      const result = analyzeFlow(
        flow.name,
        screens,
        flow.screens || [],
        styleConfig
      );
      results.push(result);
    }
  } else {
    // Fall back to sequential analysis of all screens
    const screenIds = screens.map(s => s.screenId);
    const result = analyzeFlow('Main Flow', screens, screenIds, styleConfig);
    results.push(result);
  }

  return results;
}

/**
 * Calculates transition score between two screens
 * MVP: Based on screen type compatibility heuristics
 */
export function calculateTransitionScore(
  fromScreen: PropagatedScreen,
  toScreen: PropagatedScreen,
  styleConfig: StyleConfig
): FlowTransition {
  const issues: string[] = [];
  let baseScore = 75; // Default middle score

  // Factor 1: Screen type compatibility (MVP main factor)
  const fromType = fromScreen.screenType || 'generic';
  const toType = toScreen.screenType || 'generic';

  const compatibilityMap = SCREEN_TYPE_COMPATIBILITY[fromType] || {};
  const typeScore = compatibilityMap[toType] ?? 70; // Default to 70 if no mapping

  // Factor 2: Both screens successful
  const bothSuccessful = fromScreen.success && toScreen.success;
  if (!bothSuccessful) {
    issues.push('One or both screens failed propagation');
    baseScore -= 20;
  }

  // Factor 3: Screen strength variance (high variance = potential style drift)
  const strengthDiff = Math.abs(fromScreen.strengthUsed - toScreen.strengthUsed);
  if (strengthDiff > 0.15) {
    issues.push('Large strength variance between screens');
    baseScore -= 10;
  }

  // Calculate final score weighted by type compatibility
  const transitionScore = Math.round((baseScore * 0.3) + (typeScore * 0.7));

  // Add issues for low compatibility
  if (typeScore < TRANSITION_COHERENCE_THRESHOLD) {
    issues.push(`Unusual transition: ${fromType} → ${toType}`);
  }

  return {
    fromScreenId: fromScreen.screenId,
    fromScreenName: fromScreen.screenName,
    toScreenId: toScreen.screenId,
    toScreenName: toScreen.screenName,
    transitionScore: Math.min(100, Math.max(0, transitionScore)),
    issues
  };
}

// ============================================================================
// Summary & Formatting
// ============================================================================

/**
 * Generates summary of all flow analyses
 */
export function getFlowAnalysisSummary(results: FlowAnalysisResult[]): FlowAnalysisSummary {
  const coherentFlows = results.filter(r => r.coherent).length;

  // Collect all problematic transitions
  const problematicTransitions: FlowTransition[] = [];
  for (const result of results) {
    for (const transition of result.transitions) {
      if (transition.transitionScore < TRANSITION_COHERENCE_THRESHOLD || transition.issues.length > 0) {
        problematicTransitions.push(transition);
      }
    }
  }

  // Calculate average flow score
  const totalScore = results.reduce((sum, r) => sum + r.overallFlowScore, 0);
  const averageFlowScore = results.length > 0
    ? Math.round(totalScore / results.length)
    : 100;

  return {
    totalFlows: results.length,
    coherentFlows,
    problematicTransitions,
    averageFlowScore
  };
}

/**
 * Formats flow analysis for display
 */
export function formatFlowAnalysis(result: FlowAnalysisResult): string {
  const lines = [
    `Flow: ${result.flowName}`,
    `Status: ${result.coherent ? 'COHERENT' : 'NEEDS ATTENTION'} (${result.overallFlowScore}%)`,
    `Transitions: ${result.transitions.length}`
  ];

  if (result.transitions.length > 0) {
    lines.push('');
    lines.push('Transition Details:');

    for (const transition of result.transitions) {
      const status = transition.transitionScore >= TRANSITION_COHERENCE_THRESHOLD ? '✓' : '✗';
      lines.push(`  ${status} ${transition.fromScreenName} → ${transition.toScreenName} (${transition.transitionScore}%)`);

      if (transition.issues.length > 0) {
        for (const issue of transition.issues) {
          lines.push(`      Issue: ${issue}`);
        }
      }
    }
  }

  return lines.join('\n');
}

/**
 * Formats flow analysis summary
 */
export function formatFlowAnalysisSummary(summary: FlowAnalysisSummary): string {
  const lines = [
    'Flow Analysis Summary',
    `Total Flows: ${summary.totalFlows}`,
    `Coherent: ${summary.coherentFlows}/${summary.totalFlows}`,
    `Average Score: ${summary.averageFlowScore}%`
  ];

  if (summary.problematicTransitions.length > 0) {
    lines.push('');
    lines.push(`Problematic Transitions (${summary.problematicTransitions.length}):`);

    for (const transition of summary.problematicTransitions.slice(0, 5)) {
      lines.push(`  - ${transition.fromScreenName} → ${transition.toScreenName}: ${transition.issues.join(', ')}`);
    }

    if (summary.problematicTransitions.length > 5) {
      lines.push(`  ... and ${summary.problematicTransitions.length - 5} more`);
    }
  }

  return lines.join('\n');
}

/**
 * Gets screen types that commonly have coherence issues
 */
export function getProblematicScreenTypes(results: FlowAnalysisResult[]): Record<string, number> {
  const typeCounts: Record<string, number> = {};

  for (const result of results) {
    for (const transition of result.transitions) {
      if (transition.transitionScore < TRANSITION_COHERENCE_THRESHOLD) {
        // Count screen types involved in problematic transitions
        typeCounts[transition.fromScreenName] = (typeCounts[transition.fromScreenName] || 0) + 1;
        typeCounts[transition.toScreenName] = (typeCounts[transition.toScreenName] || 0) + 1;
      }
    }
  }

  return typeCounts;
}
