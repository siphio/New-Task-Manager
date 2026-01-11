/**
 * WCAG Accessibility Evaluator
 * Evaluates screens against essential WCAG 2.2 A/AA criteria
 */

import { CapturedScreen } from '../../01-capture/flow-executor';
import { DomAnalysis } from '../../01-capture/dom-analyzer';
import { Issue } from '../audit';
import {
  createIssue,
  checkHeadingHierarchy,
  hasProperFormLabels,
  hasForms,
  hasMainLandmark,
  getMissingAltCount,
  findPoorLinkText,
  findButtonsWithoutText
} from '../evaluator';

/**
 * Main evaluator for WCAG accessibility
 */
export function evaluateAccessibility(
  screen: CapturedScreen,
  analysis: DomAnalysis,
  screenType: string
): Issue[] {
  const issues: Issue[] = [];

  // WCAG 1.1.1: Image alt text
  issues.push(...evaluateImageAlt(screen, analysis));

  // WCAG 1.3.1: Heading structure
  issues.push(...evaluateHeadingStructure(screen, analysis));

  // WCAG 3.3.2: Form labels
  issues.push(...evaluateFormLabels(screen, analysis));

  // WCAG 2.4.4: Link text
  issues.push(...evaluateLinkText(screen, analysis));

  // WCAG 4.1.2: Landmarks
  issues.push(...evaluateLandmarks(screen, analysis));

  // WCAG 2.1.1: Keyboard access
  issues.push(...evaluateKeyboardAccess(screen, analysis));

  return issues;
}

/**
 * WCAG 1.1.1: Non-text Content
 * Images must have alt text
 */
function evaluateImageAlt(
  screen: CapturedScreen,
  analysis: DomAnalysis
): Issue[] {
  const issues: Issue[] = [];

  const missingAlt = getMissingAltCount(analysis);

  if (missingAlt > 0) {
    issues.push(createIssue(
      'A11Y-IMG-ALT',
      'WCAG 1.1.1: Non-text Content',
      'perceivable',
      'critical',
      `${missingAlt} image(s) missing alt text`,
      'Add descriptive alt text to all meaningful images, or empty alt for decorative images',
      screen.id,
      'img-alt',
      ['images without alt']
    ));
  }

  return issues;
}

/**
 * WCAG 1.3.1: Info and Relationships
 * Proper heading hierarchy
 */
function evaluateHeadingStructure(
  screen: CapturedScreen,
  analysis: DomAnalysis
): Issue[] {
  const issues: Issue[] = [];

  const headingAnalysis = checkHeadingHierarchy(analysis.headings);

  // No H1
  if (!headingAnalysis.hasH1 && headingAnalysis.headingCount > 0) {
    issues.push(createIssue(
      'A11Y-HEADING-H1',
      'WCAG 1.3.1: Info and Relationships',
      'perceivable',
      'high',
      'Page has headings but no H1',
      'Add a primary H1 heading that describes the page purpose',
      screen.id,
      'missing-h1'
    ));
  }

  // Multiple H1s
  if (headingAnalysis.multipleH1) {
    issues.push(createIssue(
      'A11Y-HEADING-H1',
      'WCAG 1.3.1: Info and Relationships',
      'perceivable',
      'medium',
      'Page has multiple H1 headings',
      'Use only one H1 per page; use H2-H6 for subsections',
      screen.id,
      'multiple-h1'
    ));
  }

  // Skipped levels
  if (headingAnalysis.skippedLevels.length > 0) {
    issues.push(createIssue(
      'A11Y-HEADING-HIERARCHY',
      'WCAG 1.3.1: Info and Relationships',
      'perceivable',
      'medium',
      `Heading hierarchy skips level(s): H${headingAnalysis.skippedLevels.join(', H')}`,
      'Maintain sequential heading levels without skipping (H1 > H2 > H3)',
      screen.id,
      'skipped-headings'
    ));
  }

  return issues;
}

/**
 * WCAG 3.3.2: Labels or Instructions
 * Form inputs must have labels
 */
function evaluateFormLabels(
  screen: CapturedScreen,
  analysis: DomAnalysis
): Issue[] {
  const issues: Issue[] = [];

  if (hasForms(analysis.forms) && !hasProperFormLabels(analysis.forms)) {
    issues.push(createIssue(
      'A11Y-FORM-LABELS',
      'WCAG 3.3.2: Labels or Instructions',
      'understandable',
      'critical',
      'Form inputs missing associated labels',
      'Add visible labels to all form inputs using label elements or aria-label',
      screen.id,
      'form-labels',
      ['form inputs']
    ));
  }

  return issues;
}

/**
 * WCAG 2.4.4: Link Purpose (In Context)
 * Link text should describe destination
 */
function evaluateLinkText(
  screen: CapturedScreen,
  analysis: DomAnalysis
): Issue[] {
  const issues: Issue[] = [];

  const poorLinks = findPoorLinkText(analysis.interactiveElements);

  if (poorLinks.length > 0) {
    const linkTexts = poorLinks.map(l => `"${l.text}"`).join(', ');
    issues.push(createIssue(
      'A11Y-LINK-TEXT',
      'WCAG 2.4.4: Link Purpose (In Context)',
      'operable',
      'high',
      `${poorLinks.length} link(s) with non-descriptive text: ${linkTexts}`,
      'Replace generic link text with descriptive text that explains the destination',
      screen.id,
      'link-text',
      poorLinks.map(l => l.selector)
    ));
  }

  return issues;
}

/**
 * WCAG 4.1.2: Name, Role, Value
 * Landmark regions should be present
 */
function evaluateLandmarks(
  screen: CapturedScreen,
  analysis: DomAnalysis
): Issue[] {
  const issues: Issue[] = [];

  // Check for main landmark
  if (!hasMainLandmark(analysis.landmarks)) {
    issues.push(createIssue(
      'A11Y-LANDMARKS',
      'WCAG 4.1.2: Name, Role, Value',
      'robust',
      'medium',
      'Page lacks main landmark region',
      'Add main landmark (main element or role="main") to identify primary content',
      screen.id,
      'main-landmark'
    ));
  }

  return issues;
}

/**
 * WCAG 2.1.1: Keyboard
 * Interactive elements must be keyboard accessible
 */
function evaluateKeyboardAccess(
  screen: CapturedScreen,
  analysis: DomAnalysis
): Issue[] {
  const issues: Issue[] = [];

  // Check for buttons without accessible names
  const buttonsWithoutText = findButtonsWithoutText(analysis.interactiveElements);

  if (buttonsWithoutText.length > 0) {
    issues.push(createIssue(
      'A11Y-KEYBOARD',
      'WCAG 2.1.1: Keyboard',
      'operable',
      'high',
      `${buttonsWithoutText.length} button(s) without accessible text`,
      'Add visible text or aria-label to all buttons for screen reader users',
      screen.id,
      'button-text',
      buttonsWithoutText.map(b => b.selector)
    ));
  }

  return issues;
}
