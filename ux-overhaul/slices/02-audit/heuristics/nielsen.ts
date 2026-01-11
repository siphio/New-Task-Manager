/**
 * Nielsen's 10 Usability Heuristics Evaluator
 * Evaluates screens against Jakob Nielsen's usability principles
 */

import { CapturedScreen } from '../../01-capture/flow-executor';
import { DomAnalysis } from '../../01-capture/dom-analyzer';
import { Issue } from '../audit';
import {
  createIssue,
  checkHeadingHierarchy,
  hasProperFormLabels,
  hasFormValidation,
  hasForms,
  hasCancelOption,
  hasSearch,
  hasHelp,
  hasNavigation,
  countElementsByType
} from '../evaluator';

/**
 * Main evaluator for Nielsen's 10 Heuristics
 */
export function evaluateNielsenHeuristics(
  screen: CapturedScreen,
  analysis: DomAnalysis,
  screenType: string
): Issue[] {
  const issues: Issue[] = [];

  // H1: Visibility of System Status
  issues.push(...evaluateH1SystemStatus(screen, analysis));

  // H3: User Control and Freedom
  issues.push(...evaluateH3UserControl(screen, analysis));

  // H5: Error Prevention
  issues.push(...evaluateH5ErrorPrevention(screen, analysis));

  // H6: Recognition Rather Than Recall
  issues.push(...evaluateH6Recognition(screen, analysis));

  // H7: Flexibility and Efficiency
  issues.push(...evaluateH7Flexibility(screen, analysis));

  // H8: Aesthetic and Minimalist Design
  issues.push(...evaluateH8AestheticDesign(screen, analysis));

  // H9: Help Users Recognize and Recover from Errors
  issues.push(...evaluateH9ErrorRecovery(screen, analysis, screenType));

  // H10: Help and Documentation
  issues.push(...evaluateH10HelpDocs(screen, analysis));

  return issues;
}

/**
 * H1: Visibility of System Status
 * Users should always know what's happening
 */
function evaluateH1SystemStatus(
  screen: CapturedScreen,
  analysis: DomAnalysis
): Issue[] {
  const issues: Issue[] = [];

  // Check for active navigation state (if navigation exists)
  if (hasNavigation(analysis.interactiveElements)) {
    // This is advisory - we can't fully detect active states from DOM
    // Left as documentation for future enhancement
  }

  return issues;
}

/**
 * H3: User Control and Freedom
 * Users need an emergency exit
 */
function evaluateH3UserControl(
  screen: CapturedScreen,
  analysis: DomAnalysis
): Issue[] {
  const issues: Issue[] = [];

  // Check for cancel/back options in forms
  if (hasForms(analysis.forms) && !hasCancelOption(analysis.interactiveElements)) {
    issues.push(createIssue(
      'NH3',
      "Nielsen's Heuristic #3: User Control and Freedom",
      'control',
      'high',
      'Form lacks cancel or back option',
      'Add a cancel or back button to allow users to exit the form without completing it',
      screen.id,
      'cancel-button'
    ));
  }

  return issues;
}

/**
 * H5: Error Prevention
 * Prevent problems before they occur
 */
function evaluateH5ErrorPrevention(
  screen: CapturedScreen,
  analysis: DomAnalysis
): Issue[] {
  const issues: Issue[] = [];

  // Check for form validation
  if (hasForms(analysis.forms) && !hasFormValidation(analysis.forms)) {
    issues.push(createIssue(
      'NH5',
      "Nielsen's Heuristic #5: Error Prevention",
      'prevention',
      'high',
      'Forms lack input validation',
      'Add input validation to prevent users from submitting invalid data',
      screen.id,
      'form-validation'
    ));
  }

  // Check for deletion elements (advisory about confirmation)
  const hasDeletion = analysis.interactiveElements.some(
    el => el.purpose === 'deletion'
  );
  if (hasDeletion) {
    // Advisory note - we recommend but can't verify confirmation dialogs
    issues.push(createIssue(
      'NH5',
      "Nielsen's Heuristic #5: Error Prevention",
      'prevention',
      'medium',
      'Destructive action detected - ensure confirmation is required',
      'Add confirmation dialog for delete and other destructive actions',
      screen.id,
      'delete-confirm',
      ['delete buttons']
    ));
  }

  return issues;
}

/**
 * H6: Recognition Rather Than Recall
 * Make information visible
 */
function evaluateH6Recognition(
  screen: CapturedScreen,
  analysis: DomAnalysis
): Issue[] {
  const issues: Issue[] = [];

  // Check for visible form labels
  if (hasForms(analysis.forms) && !hasProperFormLabels(analysis.forms)) {
    issues.push(createIssue(
      'NH6',
      "Nielsen's Heuristic #6: Recognition Rather Than Recall",
      'memory',
      'critical',
      'Form fields lack visible labels',
      'Add visible labels to all form fields (not just placeholders)',
      screen.id,
      'form-labels',
      ['form fields']
    ));
  }

  // Check for navigation landmark
  if (!analysis.landmarks.includes('navigation')) {
    issues.push(createIssue(
      'NH6',
      "Nielsen's Heuristic #6: Recognition Rather Than Recall",
      'memory',
      'medium',
      'No persistent navigation detected',
      'Add a visible navigation structure to help users understand available options',
      screen.id,
      'persistent-nav'
    ));
  }

  return issues;
}

/**
 * H7: Flexibility and Efficiency of Use
 * Shortcuts and efficiency features
 */
function evaluateH7Flexibility(
  screen: CapturedScreen,
  analysis: DomAnalysis
): Issue[] {
  const issues: Issue[] = [];

  // Check for search in screens with many links
  const elementCounts = countElementsByType(analysis.interactiveElements);
  const linkCount = elementCounts['link'] || 0;

  if (linkCount > 10 && !hasSearch(analysis.interactiveElements)) {
    issues.push(createIssue(
      'NH7',
      "Nielsen's Heuristic #7: Flexibility and Efficiency of Use",
      'efficiency',
      'medium',
      `Large list detected (${linkCount} links) without search functionality`,
      'Add search or filter capability for lists with many items',
      screen.id,
      'search-present'
    ));
  }

  return issues;
}

/**
 * H8: Aesthetic and Minimalist Design
 * Keep interfaces simple and focused
 */
function evaluateH8AestheticDesign(
  screen: CapturedScreen,
  analysis: DomAnalysis
): Issue[] {
  const issues: Issue[] = [];

  // Check heading hierarchy
  const headingAnalysis = checkHeadingHierarchy(analysis.headings);

  // Missing H1
  if (!headingAnalysis.hasH1 && headingAnalysis.headingCount > 0) {
    issues.push(createIssue(
      'NH8',
      "Nielsen's Heuristic #8: Aesthetic and Minimalist Design",
      'design',
      'medium',
      'Page lacks an H1 heading',
      'Add a primary H1 heading that describes the page content',
      screen.id,
      'missing-h1'
    ));
  }

  // Multiple H1s
  if (headingAnalysis.multipleH1) {
    issues.push(createIssue(
      'NH8',
      "Nielsen's Heuristic #8: Aesthetic and Minimalist Design",
      'design',
      'low',
      'Page has multiple H1 headings',
      'Use only one H1 heading per page for clear hierarchy',
      screen.id,
      'multiple-h1'
    ));
  }

  // Skipped heading levels
  if (headingAnalysis.skippedLevels.length > 0) {
    issues.push(createIssue(
      'NH8',
      "Nielsen's Heuristic #8: Aesthetic and Minimalist Design",
      'design',
      'low',
      `Heading hierarchy skips levels: ${headingAnalysis.skippedLevels.join(', ')}`,
      'Maintain sequential heading levels (H1 > H2 > H3) for logical structure',
      screen.id,
      'skipped-levels'
    ));
  }

  return issues;
}

/**
 * H9: Help Users Recognize, Diagnose, and Recover from Errors
 * Clear error messages
 */
function evaluateH9ErrorRecovery(
  screen: CapturedScreen,
  analysis: DomAnalysis,
  screenType: string
): Issue[] {
  const issues: Issue[] = [];

  // For form screens, recommend inline error messaging
  if (screenType === 'form' && hasForms(analysis.forms)) {
    // This is advisory - can't detect actual error message implementation
    // But we can recommend it for form-heavy screens
    if (analysis.forms.some(f => f.fields > 3)) {
      issues.push(createIssue(
        'NH9',
        "Nielsen's Heuristic #9: Help Users Recognize and Recover from Errors",
        'errors',
        'medium',
        'Complex form should have inline error messaging',
        'Display error messages inline near the problematic field with clear guidance',
        screen.id,
        'inline-errors'
      ));
    }
  }

  return issues;
}

/**
 * H10: Help and Documentation
 * Provide help when needed
 */
function evaluateH10HelpDocs(
  screen: CapturedScreen,
  analysis: DomAnalysis
): Issue[] {
  const issues: Issue[] = [];

  // Check for help availability in complex screens
  const hasHelpOption = hasHelp(analysis.interactiveElements);
  const isComplex = hasForms(analysis.forms) ||
    analysis.interactiveElements.length > 10;

  if (isComplex && !hasHelpOption) {
    issues.push(createIssue(
      'NH10',
      "Nielsen's Heuristic #10: Help and Documentation",
      'help',
      'low',
      'Complex interface lacks visible help option',
      'Add help link, tooltip, or documentation access for complex features',
      screen.id,
      'help-available'
    ));
  }

  return issues;
}
