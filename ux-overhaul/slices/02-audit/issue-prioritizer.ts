/**
 * Issue Prioritizer for UX Overhaul Skill
 * Severity scoring and improvement plan generation
 */

import {
  Issue,
  Severity,
  ScreenAudit,
  AuditReport,
  Improvement,
  ScreenImprovement,
  ImprovementPlan
} from './audit';

// ============================================================================
// Weights
// ============================================================================

/**
 * Severity weights for priority scoring
 */
export const SEVERITY_WEIGHTS: Record<Severity, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1
};

/**
 * Category weights (accessibility/prevention weighted higher)
 */
export const CATEGORY_WEIGHTS: Record<string, number> = {
  // Accessibility categories
  perceivable: 1.3,
  operable: 1.2,
  understandable: 1.1,
  robust: 1.0,

  // Nielsen/UX categories
  prevention: 1.2,
  errors: 1.2,
  feedback: 1.1,
  control: 1.1,
  memory: 1.0,
  consistency: 1.0,

  // Cognitive categories
  cognitive: 1.1,
  motor: 1.0,

  // Lower priority
  design: 0.9,
  efficiency: 0.8,
  help: 0.8
};

// ============================================================================
// Priority Scoring
// ============================================================================

/**
 * Calculates priority score for an issue
 */
export function calculatePriorityScore(issue: Issue): number {
  const severityWeight = SEVERITY_WEIGHTS[issue.severity];
  const categoryWeight = CATEGORY_WEIGHTS[issue.category] || 1.0;
  return severityWeight * categoryWeight;
}

/**
 * Sorts issues by priority (highest first)
 */
export function prioritizeIssues(issues: Issue[]): Issue[] {
  return [...issues].sort((a, b) => {
    const scoreDiff = calculatePriorityScore(b) - calculatePriorityScore(a);
    if (scoreDiff !== 0) return scoreDiff;

    // Secondary sort by severity
    return SEVERITY_WEIGHTS[b.severity] - SEVERITY_WEIGHTS[a.severity];
  });
}

// ============================================================================
// Global Issue Detection
// ============================================================================

/**
 * Finds issues that appear in 2+ screens (systemic issues)
 */
export function findGlobalIssues(screenAudits: ScreenAudit[]): Improvement[] {
  // Group issues by signature (principle + check type)
  const issueGroups: Map<string, { issue: Issue; screens: string[] }> = new Map();

  for (const screenAudit of screenAudits) {
    for (const issue of screenAudit.issues) {
      // Create signature from principleId and check (last part of ID)
      const parts = issue.id.split('-');
      const checkId = parts[parts.length - 1];
      const signature = `${issue.principleId}-${checkId}`;

      if (!issueGroups.has(signature)) {
        issueGroups.set(signature, {
          issue,
          screens: [screenAudit.screenId]
        });
      } else {
        issueGroups.get(signature)!.screens.push(screenAudit.screenId);
      }
    }
  }

  // Filter to issues appearing in 2+ screens
  const globalIssues: Improvement[] = [];

  Array.from(issueGroups.values()).forEach(group => {
    if (group.screens.length >= 2) {
      globalIssues.push(issueToImprovement(group.issue, group.screens));
    }
  });

  // Sort by priority
  return globalIssues.sort((a, b) => {
    const scoreA = SEVERITY_WEIGHTS[a.severity] * (CATEGORY_WEIGHTS[a.category] || 1);
    const scoreB = SEVERITY_WEIGHTS[b.severity] * (CATEGORY_WEIGHTS[b.category] || 1);
    return scoreB - scoreA;
  });
}

// ============================================================================
// Conversion
// ============================================================================

/**
 * Converts an Issue to an Improvement
 */
export function issueToImprovement(issue: Issue, affectedScreens: string[]): Improvement {
  return {
    id: issue.id,
    principle: issue.principle,
    principleId: issue.principleId,
    category: issue.category,
    severity: issue.severity,
    recommendation: issue.recommendation,
    promptText: issue.promptInjection,
    affectedScreens
  };
}

// ============================================================================
// Improvement Plan Generation
// ============================================================================

/**
 * Generates complete improvement plan from audit report
 */
export function generateImprovementPlan(auditReport: AuditReport): ImprovementPlan {
  // Find global issues (systemic)
  const globalImprovements = findGlobalIssues(auditReport.screens);

  // Get all issues and prioritize
  const allIssues = auditReport.screens.flatMap(s => s.issues);
  const prioritized = prioritizeIssues(allIssues);

  // Take top 20 prioritized improvements
  const prioritizedImprovements = prioritized.slice(0, 20).map(issue =>
    issueToImprovement(issue, [getScreenIdFromIssue(issue)])
  );

  // Generate per-screen improvements
  const screenImprovements: ScreenImprovement[] = auditReport.screens.map(screenAudit => {
    const screenPrioritized = prioritizeIssues(screenAudit.issues);
    const improvements = screenPrioritized.map(issue =>
      issueToImprovement(issue, [screenAudit.screenId])
    );

    // Get top 5 prompt injections
    const promptInjections = getPromptInjectionsForScreen(
      screenPrioritized,
      globalImprovements,
      5
    );

    return {
      screenId: screenAudit.screenId,
      screenName: screenAudit.screenName,
      screenType: screenAudit.screenType,
      improvements,
      promptInjections
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    appName: auditReport.appName,
    globalImprovements,
    prioritizedImprovements,
    screenImprovements
  };
}

/**
 * Extracts screen ID from issue ID
 */
function getScreenIdFromIssue(issue: Issue): string {
  // Issue ID format: PRINCIPLE-SCREEN-CHECK
  const parts = issue.id.split('-');
  if (parts.length >= 3) {
    // Remove first (principle) and last (check) parts
    return parts.slice(1, -1).join('-');
  }
  return 'unknown';
}

// ============================================================================
// Prompt Injection
// ============================================================================

/**
 * Gets prompt injections for a screen
 * Combines global improvements (top 2) with screen-specific (remaining)
 */
export function getPromptInjectionsForScreen(
  screenIssues: Issue[],
  globalImprovements: Improvement[],
  maxInjections: number = 5
): string[] {
  const injections: string[] = [];
  const seen = new Set<string>();

  // Add top 2 global improvements
  for (const improvement of globalImprovements.slice(0, 2)) {
    if (!seen.has(improvement.promptText)) {
      injections.push(improvement.promptText);
      seen.add(improvement.promptText);
    }
  }

  // Add screen-specific issues
  for (const issue of screenIssues) {
    if (injections.length >= maxInjections) break;
    if (!seen.has(issue.promptInjection)) {
      injections.push(issue.promptInjection);
      seen.add(issue.promptInjection);
    }
  }

  return injections.slice(0, maxInjections);
}

/**
 * Gets prompt injections from an improvement plan for a specific screen
 */
export function getPromptInjectionsFromPlan(
  plan: ImprovementPlan,
  screenId: string,
  maxInjections: number = 5
): string[] {
  const screenImprovement = plan.screenImprovements.find(
    s => s.screenId === screenId
  );

  if (!screenImprovement) {
    return [];
  }

  return screenImprovement.promptInjections.slice(0, maxInjections);
}

// ============================================================================
// Summary & Display
// ============================================================================

/**
 * Formats improvement plan as human-readable summary
 */
export function formatImprovementPlanSummary(plan: ImprovementPlan): string {
  const lines = [
    `Improvement Plan: ${plan.appName}`,
    `Generated: ${plan.generatedAt}`,
    '',
    `Global Issues (appear in 2+ screens): ${plan.globalImprovements.length}`,
    `Top Prioritized Issues: ${plan.prioritizedImprovements.length}`,
    `Screens with Improvements: ${plan.screenImprovements.length}`,
    ''
  ];

  // List top global issues
  if (plan.globalImprovements.length > 0) {
    lines.push('Global Issues:');
    for (const imp of plan.globalImprovements.slice(0, 5)) {
      lines.push(`  [${imp.severity.toUpperCase()}] ${imp.principleId}: ${imp.recommendation}`);
      lines.push(`    Affects: ${imp.affectedScreens.length} screens`);
    }
    lines.push('');
  }

  // List top prioritized issues
  if (plan.prioritizedImprovements.length > 0) {
    lines.push('Top Priority Issues:');
    for (const imp of plan.prioritizedImprovements.slice(0, 5)) {
      lines.push(`  [${imp.severity.toUpperCase()}] ${imp.principleId}: ${imp.recommendation}`);
    }
  }

  return lines.join('\n');
}

/**
 * Gets a brief summary line
 */
export function getImprovementPlanStatusLine(plan: ImprovementPlan): string {
  const totalImprovements = plan.screenImprovements.reduce(
    (sum, s) => sum + s.improvements.length,
    0
  );
  return `${totalImprovements} improvements identified, ${plan.globalImprovements.length} global issues`;
}
