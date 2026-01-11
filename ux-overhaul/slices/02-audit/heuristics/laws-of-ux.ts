/**
 * Laws of UX Evaluator
 * Evaluates screens against cognitive and motor UX laws
 */

import { CapturedScreen } from '../../01-capture/flow-executor';
import { DomAnalysis } from '../../01-capture/dom-analyzer';
import { Issue } from '../audit';
import {
  createIssue,
  countElementsByPurpose,
  getTotalFormFields,
  hasProperFormLabels,
  hasForms,
  findSmallButtons
} from '../evaluator';

// ============================================================================
// Thresholds
// ============================================================================

const FITTS_MIN_TARGET = 44;
const HICK_MAX_NAV = 7;
const HICK_MAX_NAV_WARNING = 5;
const HICK_MAX_NAV_CRITICAL = 12;
const HICK_MAX_ACTIONS = 5;
const MILLER_MAX_FIELDS = 9;
const MILLER_WARNING_FIELDS = 7;
const MILLER_CRITICAL_FIELDS = 15;

// ============================================================================
// Main Evaluator
// ============================================================================

/**
 * Main evaluator for Laws of UX
 */
export function evaluateLawsOfUx(
  screen: CapturedScreen,
  analysis: DomAnalysis,
  screenType: string
): Issue[] {
  const issues: Issue[] = [];

  // Fitts's Law - Target size and prominence
  issues.push(...evaluateFittsLaw(screen, analysis));

  // Hick's Law - Choice complexity
  issues.push(...evaluateHicksLaw(screen, analysis));

  // Miller's Law - Cognitive load
  issues.push(...evaluateMillersLaw(screen, analysis));

  // Law of Proximity - Label association
  issues.push(...evaluateProximity(screen, analysis));

  return issues;
}

// ============================================================================
// Fitts's Law
// ============================================================================

/**
 * Fitts's Law: Target size and reach
 * Time to acquire a target depends on distance and size
 */
function evaluateFittsLaw(
  screen: CapturedScreen,
  analysis: DomAnalysis
): Issue[] {
  const issues: Issue[] = [];

  // Check for small buttons (icon-only with no aria-label)
  const smallButtons = findSmallButtons(analysis.interactiveElements);
  if (smallButtons.length > 0) {
    issues.push(createIssue(
      'FITTS',
      "Fitts's Law",
      'motor',
      'medium',
      `${smallButtons.length} potentially small touch target(s) detected`,
      'Ensure interactive elements are at least 44x44px for comfortable touch interaction',
      screen.id,
      'small-targets',
      smallButtons.map(el => el.selector)
    ));
  }

  // Check CTA prominence
  const purposeCounts = countElementsByPurpose(analysis.interactiveElements);
  const submissionCount = purposeCounts['submission'] || 0;
  const actionCount = purposeCounts['action'] || 0;

  // If there are actions but no clear submission/CTA, recommend adding prominence
  if (actionCount > 3 && submissionCount === 0) {
    issues.push(createIssue(
      'FITTS',
      "Fitts's Law",
      'motor',
      'low',
      'No primary call-to-action button detected among multiple actions',
      'Make the primary action button larger and more prominent than secondary actions',
      screen.id,
      'cta-prominence'
    ));
  }

  return issues;
}

// ============================================================================
// Hick's Law
// ============================================================================

/**
 * Hick's Law: Choice complexity
 * Decision time increases with number of choices
 */
function evaluateHicksLaw(
  screen: CapturedScreen,
  analysis: DomAnalysis
): Issue[] {
  const issues: Issue[] = [];

  const purposeCounts = countElementsByPurpose(analysis.interactiveElements);
  const navCount = purposeCounts['navigation'] || 0;
  const actionCount = (purposeCounts['action'] || 0) +
    (purposeCounts['submission'] || 0) +
    (purposeCounts['creation'] || 0);

  // Check navigation item count
  if (navCount > HICK_MAX_NAV_CRITICAL) {
    issues.push(createIssue(
      'HICK',
      "Hick's Law",
      'cognitive',
      'high',
      `Navigation has ${navCount} items (recommended: ${HICK_MAX_NAV} or fewer)`,
      'Reduce navigation options or group them into categories to decrease cognitive load',
      screen.id,
      'excessive-nav'
    ));
  } else if (navCount > HICK_MAX_NAV) {
    issues.push(createIssue(
      'HICK',
      "Hick's Law",
      'cognitive',
      'medium',
      `Navigation has ${navCount} items (recommended: ${HICK_MAX_NAV} or fewer)`,
      'Consider grouping navigation items into categories or using a mega-menu',
      screen.id,
      'nav-items'
    ));
  }

  // Check action button count
  if (actionCount > HICK_MAX_ACTIONS) {
    issues.push(createIssue(
      'HICK',
      "Hick's Law",
      'cognitive',
      'medium',
      `Screen has ${actionCount} action buttons (recommended: ${HICK_MAX_ACTIONS} or fewer)`,
      'Prioritize actions and hide less common ones in a menu or secondary location',
      screen.id,
      'action-buttons'
    ));
  }

  return issues;
}

// ============================================================================
// Miller's Law
// ============================================================================

/**
 * Miller's Law: Cognitive load
 * Working memory holds 7±2 items
 */
function evaluateMillersLaw(
  screen: CapturedScreen,
  analysis: DomAnalysis
): Issue[] {
  const issues: Issue[] = [];

  // Check form field count
  if (hasForms(analysis.forms)) {
    const totalFields = getTotalFormFields(analysis.forms);

    if (totalFields > MILLER_CRITICAL_FIELDS) {
      issues.push(createIssue(
        'MILLER',
        "Miller's Law",
        'cognitive',
        'critical',
        `Form has ${totalFields} fields (recommended: ${MILLER_MAX_FIELDS} or fewer)`,
        'Break the form into multiple steps or logical sections of 7 or fewer fields each',
        screen.id,
        'form-overload'
      ));
    } else if (totalFields > MILLER_MAX_FIELDS) {
      issues.push(createIssue(
        'MILLER',
        "Miller's Law",
        'cognitive',
        'high',
        `Form has ${totalFields} fields (recommended: ${MILLER_MAX_FIELDS} or fewer)`,
        'Chunk form fields into logical sections of 7 or fewer to reduce cognitive load',
        screen.id,
        'form-fields'
      ));
    } else if (totalFields > MILLER_WARNING_FIELDS) {
      issues.push(createIssue(
        'MILLER',
        "Miller's Law",
        'cognitive',
        'medium',
        `Form has ${totalFields} fields - consider grouping`,
        'Group related form fields into logical sections for easier comprehension',
        screen.id,
        'form-grouping'
      ));
    }
  }

  // Check section/heading count for overload
  const headingCount = analysis.headings.length;
  if (headingCount > 10) {
    issues.push(createIssue(
      'MILLER',
      "Miller's Law",
      'cognitive',
      'medium',
      `Page has ${headingCount} sections - consider consolidating`,
      'Group related sections or use progressive disclosure to reduce visible content',
      screen.id,
      'section-overload'
    ));
  }

  return issues;
}

// ============================================================================
// Law of Proximity
// ============================================================================

/**
 * Law of Proximity: Label-input association
 * Related elements should be close together
 */
function evaluateProximity(
  screen: CapturedScreen,
  analysis: DomAnalysis
): Issue[] {
  const issues: Issue[] = [];

  // Check form label proximity
  if (hasForms(analysis.forms) && !hasProperFormLabels(analysis.forms)) {
    issues.push(createIssue(
      'PROXIMITY',
      'Law of Proximity',
      'design',
      'high',
      'Form labels may not be properly associated with inputs',
      'Position labels close to their associated inputs (above or to the left)',
      screen.id,
      'label-input'
    ));
  }

  return issues;
}
