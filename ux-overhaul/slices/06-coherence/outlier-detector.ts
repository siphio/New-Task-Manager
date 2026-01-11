/**
 * Outlier Detector for UX Overhaul Skill
 * Detects style drift and outlier screens
 */

import * as fs from 'fs';
import { PropagatedScreen } from '../04-propagation/propagation';
import { StyleConfig, Anchor } from '../03-anchoring/anchoring';
import { getFileStats } from '../../core/utils/file';

// ============================================================================
// Types
// ============================================================================

export type OutlierReason =
  | 'color_drift'
  | 'style_inconsistency'
  | 'layout_deviation'
  | 'component_mismatch'
  | 'spacing_variance'
  | 'typography_inconsistency';

export interface OutlierInfo {
  screenId: string;
  screenName: string;
  screenPath: string;
  outlierScore: number;  // 0-100, higher = more deviant
  reasons: OutlierReason[];
  recommendations: string[];
  shouldRegenerate: boolean;
}

export interface OutlierDetectionResult {
  totalScreens: number;
  outlierCount: number;
  outliers: OutlierInfo[];
  overallCoherenceScore: number;  // 0-100
}

// ============================================================================
// Constants
// ============================================================================

export const OUTLIER_THRESHOLD = 30;         // Score above this = outlier
export const REGENERATION_THRESHOLD = 50;    // Score above this = must regenerate

/**
 * Screen type weights for outlier scoring
 * Some screen types are more sensitive to style drift
 */
const SCREEN_TYPE_SENSITIVITY: Record<string, number> = {
  'landing': 1.2,     // Higher sensitivity - first impression
  'auth': 1.1,        // Higher sensitivity - trust
  'dashboard': 1.0,   // Normal
  'list': 0.9,        // Slightly lower - repetitive
  'detail': 1.0,      // Normal
  'form': 1.0,        // Normal
  'settings': 0.8,    // Lower - less visible
  'modal': 0.9,       // Lower - overlay
  'generic': 1.0      // Normal
};

/**
 * Reason weights for scoring
 */
const REASON_WEIGHTS: Record<OutlierReason, number> = {
  'color_drift': 25,
  'style_inconsistency': 20,
  'layout_deviation': 15,
  'component_mismatch': 15,
  'spacing_variance': 10,
  'typography_inconsistency': 15
};

// ============================================================================
// Core Detection
// ============================================================================

/**
 * Detects outliers from a set of propagated screens
 */
export function detectOutliers(
  screens: PropagatedScreen[],
  styleConfig: StyleConfig,
  anchors: Anchor[]
): OutlierDetectionResult {
  const validatedAnchors = anchors.filter(a => a.validated && a.imagePath);
  const anchorPaths = validatedAnchors.map(a => a.imagePath);

  const outliers: OutlierInfo[] = [];
  let totalOutlierScore = 0;

  for (const screen of screens) {
    if (!screen.success) {
      // Failed screens are automatic outliers
      outliers.push({
        screenId: screen.screenId,
        screenName: screen.screenName,
        screenPath: screen.propagatedPath,
        outlierScore: 100,
        reasons: ['style_inconsistency'],
        recommendations: ['Regenerate screen - propagation failed'],
        shouldRegenerate: true
      });
      totalOutlierScore += 100;
      continue;
    }

    const outlierInfo = calculateOutlierScore(screen, styleConfig, anchorPaths);

    if (outlierInfo.outlierScore >= OUTLIER_THRESHOLD) {
      outliers.push(outlierInfo);
    }

    totalOutlierScore += outlierInfo.outlierScore;
  }

  // Calculate overall coherence (inverse of average outlier score)
  const averageOutlierScore = screens.length > 0
    ? totalOutlierScore / screens.length
    : 0;
  const overallCoherenceScore = Math.round(100 - averageOutlierScore);

  return {
    totalScreens: screens.length,
    outlierCount: outliers.length,
    outliers,
    overallCoherenceScore
  };
}

/**
 * Calculates outlier score for a single screen
 * MVP: Uses heuristics based on screen metadata and file properties
 */
export function calculateOutlierScore(
  screen: PropagatedScreen,
  styleConfig: StyleConfig,
  anchorPaths: string[]
): OutlierInfo {
  const reasons: OutlierReason[] = [];
  let baseScore = 0;

  // Factor 1: Screen propagation success
  if (!screen.success) {
    reasons.push('style_inconsistency');
    baseScore += REASON_WEIGHTS.style_inconsistency;
  }

  // Factor 2: Number of attempts (more attempts = potential issues)
  if (screen.attempts > 1) {
    const attemptPenalty = (screen.attempts - 1) * 10;
    baseScore += attemptPenalty;
    if (screen.attempts >= 3) {
      reasons.push('style_inconsistency');
    }
  }

  // Factor 3: Strength used variance from typical
  const typicalStrength = 0.55;
  const strengthVariance = Math.abs(screen.strengthUsed - typicalStrength);
  if (strengthVariance > 0.10) {
    baseScore += strengthVariance * 30;
    reasons.push('layout_deviation');
  }

  // Factor 4: Compare to anchor files (MVP: file size heuristic)
  const anchorComparison = compareToAnchors(screen.propagatedPath, anchorPaths);
  if (!anchorComparison.comparable) {
    baseScore += 15;
    reasons.push('color_drift');
  }

  // Factor 5: Screen type sensitivity
  const sensitivity = SCREEN_TYPE_SENSITIVITY[screen.screenType] || 1.0;
  baseScore = Math.round(baseScore * sensitivity);

  // Factor 6: File exists and valid
  if (!screen.propagatedPath || !fs.existsSync(screen.propagatedPath)) {
    baseScore += 30;
    reasons.push('style_inconsistency');
  }

  // Clamp score to 0-100
  const outlierScore = Math.min(100, Math.max(0, baseScore));

  // Generate recommendations
  const recommendations = getRecommendationsForOutlier({
    screenId: screen.screenId,
    screenName: screen.screenName,
    screenPath: screen.propagatedPath,
    outlierScore,
    reasons,
    recommendations: [],
    shouldRegenerate: outlierScore >= REGENERATION_THRESHOLD
  });

  return {
    screenId: screen.screenId,
    screenName: screen.screenName,
    screenPath: screen.propagatedPath,
    outlierScore,
    reasons: [...new Set(reasons)], // Dedupe
    recommendations,
    shouldRegenerate: outlierScore >= REGENERATION_THRESHOLD
  };
}

/**
 * Compares screen to anchor files
 * MVP: Uses file size as proxy for style consistency
 * Full implementation would use image similarity metrics
 */
export function compareToAnchors(
  screenPath: string,
  anchorPaths: string[]
): { comparable: boolean; similarity: number; issues: string[] } {
  const issues: string[] = [];

  if (!screenPath || !fs.existsSync(screenPath)) {
    return { comparable: false, similarity: 0, issues: ['Screen file not found'] };
  }

  const screenStats = getFileStats(screenPath);
  if (!screenStats.success || !screenStats.data) {
    return { comparable: false, similarity: 0, issues: ['Could not read screen stats'] };
  }

  const screenSizeKB = screenStats.data.size / 1024;

  // Get anchor file sizes for comparison
  const anchorSizes: number[] = [];
  for (const anchorPath of anchorPaths) {
    if (fs.existsSync(anchorPath)) {
      const stats = getFileStats(anchorPath);
      if (stats.success && stats.data) {
        anchorSizes.push(stats.data.size / 1024);
      }
    }
  }

  if (anchorSizes.length === 0) {
    return { comparable: false, similarity: 0, issues: ['No anchor files available'] };
  }

  // Calculate average anchor size
  const avgAnchorSize = anchorSizes.reduce((a, b) => a + b, 0) / anchorSizes.length;

  // Check if screen size is within reasonable range of anchors
  // (Within 50% of average is considered comparable)
  const sizeRatio = screenSizeKB / avgAnchorSize;
  const comparable = sizeRatio >= 0.5 && sizeRatio <= 2.0;

  if (!comparable) {
    issues.push(`Screen size ${Math.round(screenSizeKB)}KB differs significantly from anchor average ${Math.round(avgAnchorSize)}KB`);
  }

  // Calculate similarity as inverse of deviation
  const deviation = Math.abs(1 - sizeRatio);
  const similarity = Math.round((1 - Math.min(deviation, 1)) * 100);

  return { comparable, similarity, issues };
}

/**
 * Generates fix recommendations for an outlier
 */
export function getRecommendationsForOutlier(outlier: OutlierInfo): string[] {
  const recommendations: string[] = [];

  for (const reason of outlier.reasons) {
    switch (reason) {
      case 'color_drift':
        recommendations.push('Enforce exact color palette from style config');
        recommendations.push('Add CRITICAL color constraints to prompt');
        break;
      case 'style_inconsistency':
        recommendations.push('Increase reference image weight in prompt');
        recommendations.push('Use hero anchor as primary style reference');
        break;
      case 'layout_deviation':
        recommendations.push('Reduce strength to preserve original layout');
        recommendations.push('Add layout preservation instruction to prompt');
        break;
      case 'component_mismatch':
        recommendations.push('Reference component anchors explicitly');
        recommendations.push('Ensure component consistency across screens');
        break;
      case 'spacing_variance':
        recommendations.push('Maintain consistent spacing from references');
        recommendations.push('Add whitespace/padding preservation instruction');
        break;
      case 'typography_inconsistency':
        recommendations.push('Reference typography anchor for text styles');
        recommendations.push('Enforce consistent font sizes and weights');
        break;
    }
  }

  // Dedupe and limit recommendations
  return [...new Set(recommendations)].slice(0, 5);
}

// ============================================================================
// Formatting
// ============================================================================

/**
 * Formats outlier detection report for display
 */
export function formatOutlierReport(result: OutlierDetectionResult): string {
  const lines = [
    'Outlier Detection Report',
    `Total Screens: ${result.totalScreens}`,
    `Outliers Found: ${result.outlierCount}`,
    `Overall Coherence: ${result.overallCoherenceScore}%`,
    ''
  ];

  if (result.outliers.length > 0) {
    lines.push('Outliers:');
    for (const outlier of result.outliers) {
      const regenStatus = outlier.shouldRegenerate ? ' [REGENERATE]' : '';
      lines.push(`  ${outlier.screenName} (${outlier.outlierScore}%)${regenStatus}`);
      lines.push(`    Reasons: ${outlier.reasons.join(', ')}`);
      if (outlier.recommendations.length > 0) {
        lines.push(`    Fix: ${outlier.recommendations[0]}`);
      }
    }
  } else {
    lines.push('No outliers detected - all screens are coherent!');
  }

  return lines.join('\n');
}

/**
 * Gets brief outlier status line
 */
export function getOutlierStatusLine(result: OutlierDetectionResult): string {
  const regenCount = result.outliers.filter(o => o.shouldRegenerate).length;
  return `${result.outlierCount}/${result.totalScreens} outliers, ${regenCount} need regeneration, ${result.overallCoherenceScore}% coherent`;
}

// ============================================================================
// Filtering
// ============================================================================

/**
 * Gets outliers that need regeneration
 */
export function getOutliersForRegeneration(result: OutlierDetectionResult): OutlierInfo[] {
  return result.outliers.filter(o => o.shouldRegenerate);
}

/**
 * Gets outliers sorted by severity (highest score first)
 */
export function getOutliersBySeverity(result: OutlierDetectionResult): OutlierInfo[] {
  return [...result.outliers].sort((a, b) => b.outlierScore - a.outlierScore);
}

/**
 * Gets outliers grouped by reason
 */
export function getOutliersByReason(result: OutlierDetectionResult): Record<OutlierReason, OutlierInfo[]> {
  const grouped: Record<OutlierReason, OutlierInfo[]> = {
    color_drift: [],
    style_inconsistency: [],
    layout_deviation: [],
    component_mismatch: [],
    spacing_variance: [],
    typography_inconsistency: []
  };

  for (const outlier of result.outliers) {
    for (const reason of outlier.reasons) {
      grouped[reason].push(outlier);
    }
  }

  return grouped;
}
