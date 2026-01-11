/**
 * Core Evaluation Engine for UX Overhaul Skill
 * Provides shared utilities for all heuristic evaluators
 */

import { CapturedScreen } from '../01-capture/flow-executor';
import { DomAnalysis, HeadingElement, FormInfo, InteractiveElement } from '../01-capture/dom-analyzer';
import { classifyScreenType } from '../01-capture/dom-analyzer';
import { Issue, Severity } from './audit';
import { evaluateNielsenHeuristics } from './heuristics/nielsen';
import { evaluateLawsOfUx } from './heuristics/laws-of-ux';
import { evaluateAccessibility } from './heuristics/accessibility';

// ============================================================================
// Types
// ============================================================================

export type Framework = 'nielsen' | 'laws-of-ux' | 'wcag';

export interface EvaluationResult {
  success: boolean;
  data?: {
    screenType: string;
    issues: Issue[];
  };
  error?: string;
}

export interface HeadingAnalysis {
  hasH1: boolean;
  multipleH1: boolean;
  skippedLevels: number[];
  headingCount: number;
}

// ============================================================================
// Main Evaluation
// ============================================================================

/**
 * Evaluates a screen against specified frameworks
 */
export function evaluateScreen(
  screen: CapturedScreen,
  analysis: DomAnalysis,
  frameworks: Framework[]
): EvaluationResult {
  try {
    // Classify screen type
    const screenType = classifyScreenType(analysis);
    const issues: Issue[] = [];

    // Run each framework evaluator
    for (const framework of frameworks) {
      switch (framework) {
        case 'nielsen':
          issues.push(...evaluateNielsenHeuristics(screen, analysis, screenType));
          break;
        case 'laws-of-ux':
          issues.push(...evaluateLawsOfUx(screen, analysis, screenType));
          break;
        case 'wcag':
          issues.push(...evaluateAccessibility(screen, analysis, screenType));
          break;
      }
    }

    // Deduplicate issues by ID
    const uniqueIssues = deduplicateIssues(issues);

    return {
      success: true,
      data: {
        screenType,
        issues: uniqueIssues
      }
    };
  } catch (error) {
    return {
      success: false,
      error: `Evaluation failed: ${error}`
    };
  }
}

/**
 * Deduplicates issues by ID
 */
function deduplicateIssues(issues: Issue[]): Issue[] {
  const seen = new Set<string>();
  return issues.filter(issue => {
    if (seen.has(issue.id)) {
      return false;
    }
    seen.add(issue.id);
    return true;
  });
}

// ============================================================================
// Issue Factory
// ============================================================================

/**
 * Creates a standardized issue object
 */
export function createIssue(
  principleId: string,
  principle: string,
  category: string,
  severity: Severity,
  description: string,
  recommendation: string,
  screenId: string,
  checkId: string,
  affectedElements?: string[]
): Issue {
  return {
    id: generateIssueId(principleId, screenId, checkId),
    principle,
    principleId,
    category,
    severity,
    description,
    affectedElements,
    recommendation,
    promptInjection: convertToPromptInjection(recommendation)
  };
}

/**
 * Generates unique issue ID
 */
export function generateIssueId(
  principleId: string,
  screenId: string,
  checkId: string
): string {
  return `${principleId}-${screenId}-${checkId}`;
}

/**
 * Converts recommendation to prompt injection
 * Strips filler words and makes it action-oriented
 */
function convertToPromptInjection(recommendation: string): string {
  return recommendation
    .replace(/^(should|must|needs? to|you should|consider)\s+/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ============================================================================
// Heading Analysis
// ============================================================================

/**
 * Analyzes heading hierarchy for issues
 */
export function checkHeadingHierarchy(headings: HeadingElement[]): HeadingAnalysis {
  if (headings.length === 0) {
    return {
      hasH1: false,
      multipleH1: false,
      skippedLevels: [],
      headingCount: 0
    };
  }

  // Check for H1
  const h1Headings = headings.filter(h => h.level === 1);
  const hasH1 = h1Headings.length > 0;
  const multipleH1 = h1Headings.length > 1;

  // Check for skipped levels
  const skippedLevels: number[] = [];
  const sortedHeadings = [...headings].sort((a, b) => a.level - b.level);

  let previousLevel = 0;
  for (const heading of sortedHeadings) {
    // If we skip more than one level (e.g., H1 to H3)
    if (previousLevel > 0 && heading.level > previousLevel + 1) {
      for (let i = previousLevel + 1; i < heading.level; i++) {
        if (!skippedLevels.includes(i)) {
          skippedLevels.push(i);
        }
      }
    }
    previousLevel = heading.level;
  }

  return {
    hasH1,
    multipleH1,
    skippedLevels,
    headingCount: headings.length
  };
}

// ============================================================================
// Form Analysis
// ============================================================================

/**
 * Checks if all forms have proper labels
 */
export function hasProperFormLabels(forms: FormInfo[]): boolean {
  if (forms.length === 0) {
    return true; // No forms = no issue
  }
  return forms.every(form => form.hasLabels);
}

/**
 * Checks if any forms have validation
 */
export function hasFormValidation(forms: FormInfo[]): boolean {
  if (forms.length === 0) {
    return true; // No forms = no issue
  }
  return forms.some(form => form.hasValidation);
}

/**
 * Gets total field count across all forms
 */
export function getTotalFormFields(forms: FormInfo[]): number {
  return forms.reduce((total, form) => total + form.fields, 0);
}

/**
 * Checks if forms exist on the screen
 */
export function hasForms(forms: FormInfo[]): boolean {
  return forms.length > 0;
}

// ============================================================================
// Element Analysis
// ============================================================================

/**
 * Counts elements by their inferred purpose
 */
export function countElementsByPurpose(
  elements: InteractiveElement[]
): Record<string, number> {
  const counts: Record<string, number> = {};

  for (const element of elements) {
    const purpose = element.purpose || 'unknown';
    counts[purpose] = (counts[purpose] || 0) + 1;
  }

  return counts;
}

/**
 * Gets elements with a specific purpose
 */
export function getElementsByPurpose(
  elements: InteractiveElement[],
  purpose: string
): InteractiveElement[] {
  return elements.filter(el => el.purpose === purpose);
}

/**
 * Counts elements by type
 */
export function countElementsByType(
  elements: InteractiveElement[]
): Record<string, number> {
  const counts: Record<string, number> = {};

  for (const element of elements) {
    counts[element.type] = (counts[element.type] || 0) + 1;
  }

  return counts;
}

/**
 * Checks if navigation elements exist
 */
export function hasNavigation(elements: InteractiveElement[]): boolean {
  return elements.some(el => el.purpose === 'navigation' || el.purpose === 'menu-toggle');
}

/**
 * Checks if search is available
 */
export function hasSearch(elements: InteractiveElement[]): boolean {
  return elements.some(el => el.purpose === 'search');
}

/**
 * Checks if help is available
 */
export function hasHelp(elements: InteractiveElement[]): boolean {
  return elements.some(el => el.purpose === 'help');
}

/**
 * Checks if cancel/back options exist (for forms)
 */
export function hasCancelOption(elements: InteractiveElement[]): boolean {
  return elements.some(el =>
    el.purpose === 'dismissal' ||
    el.purpose === 'navigation-backward'
  );
}

/**
 * Checks if deletion elements exist
 */
export function hasDeletionElements(elements: InteractiveElement[]): boolean {
  return elements.some(el => el.purpose === 'deletion');
}

/**
 * Finds buttons that might be too small (icon-only)
 */
export function findSmallButtons(elements: InteractiveElement[]): InteractiveElement[] {
  return elements.filter(el =>
    el.type === 'button' &&
    el.text &&
    el.text.length <= 2 &&
    !el.ariaLabel
  );
}

/**
 * Finds links with poor text (generic phrases)
 */
export function findPoorLinkText(elements: InteractiveElement[]): InteractiveElement[] {
  const poorPhrases = ['click here', 'read more', 'learn more', 'here', 'more', 'link'];

  return elements.filter(el =>
    el.type === 'link' &&
    el.text &&
    poorPhrases.includes(el.text.toLowerCase().trim())
  );
}

/**
 * Finds buttons without accessible text
 */
export function findButtonsWithoutText(elements: InteractiveElement[]): InteractiveElement[] {
  return elements.filter(el =>
    el.type === 'button' &&
    !el.text &&
    !el.ariaLabel
  );
}

// ============================================================================
// Landmark Analysis
// ============================================================================

/**
 * Checks if main landmark exists
 */
export function hasMainLandmark(landmarks: string[]): boolean {
  return landmarks.includes('main');
}

/**
 * Checks if navigation landmark exists
 */
export function hasNavigationLandmark(landmarks: string[]): boolean {
  return landmarks.includes('navigation');
}

// ============================================================================
// Image Analysis
// ============================================================================

/**
 * Gets count of images missing alt text
 */
export function getMissingAltCount(analysis: DomAnalysis): number {
  const { images } = analysis;
  return images.total - images.withAlt - images.decorative;
}
