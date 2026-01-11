/**
 * Prompt template utilities for UX Overhaul Skill
 * Provides structured prompt building for fal.ai generations
 */

import { Severity, Improvement } from '../../slices/02-audit/audit';

export interface PromptContext {
  screenType?: string;
  screenName?: string;
  viewport?: string;
  colorPalette?: string[];
  styleDirection?: string;
  improvements?: string[];
  referenceDescriptions?: string[];
}

/**
 * Base prompt template for UI generation
 */
export function buildBasePrompt(context: PromptContext): string {
  const parts: string[] = [];

  // Style direction
  if (context.styleDirection) {
    parts.push(`${context.styleDirection} user interface design`);
  } else {
    parts.push('Professional modern user interface design');
  }

  // Screen type
  if (context.screenType) {
    parts.push(`for a ${context.screenType} screen`);
  }

  // Viewport
  if (context.viewport) {
    const viewportDescriptions: Record<string, string> = {
      'mobile': 'optimized for mobile devices with touch-friendly elements',
      'tablet': 'optimized for tablet with balanced touch and precision interactions',
      'desktop': 'optimized for desktop with standard cursor interactions',
      'desktop-xl': 'optimized for large desktop displays'
    };
    parts.push(viewportDescriptions[context.viewport] || '');
  }

  return parts.filter(Boolean).join(', ');
}

/**
 * Adds color palette constraints to prompt
 */
export function addColorConstraints(basePrompt: string, colors: string[]): string {
  if (colors.length === 0) return basePrompt;

  const colorList = colors.slice(0, 5).join(', ');
  return `${basePrompt}. Use this exact color palette: ${colorList}`;
}

/**
 * Adds improvement recommendations from audit
 */
export function addImprovements(basePrompt: string, improvements: string[]): string {
  if (improvements.length === 0) return basePrompt;

  const improvementList = improvements.slice(0, 3).join('; ');
  return `${basePrompt}. Apply these UX improvements: ${improvementList}`;
}

/**
 * Adds reference image descriptions for consistency
 */
export function addReferenceInstructions(
  basePrompt: string,
  references: { index: number; description: string }[]
): string {
  if (references.length === 0) return basePrompt;

  const instructions = references.map(r =>
    `reference ${r.index} for ${r.description}`
  ).join(', ');

  return `${basePrompt}. Match style from: ${instructions}`;
}

/**
 * Screen type specific prompt enhancements
 */
export function getScreenTypePrompt(screenType: string): string {
  const screenPrompts: Record<string, string> = {
    'dashboard': 'data-rich dashboard with clear information hierarchy, meaningful metrics, and scannable layout',
    'form': 'clean form layout with proper field grouping, clear labels, and visible validation states',
    'list': 'well-organized list view with consistent item styling, clear actions, and efficient scanning',
    'detail': 'focused detail view with clear content sections and related actions',
    'settings': 'organized settings page with logical groupings and clear toggle/input states',
    'auth': 'trustworthy authentication screen with clear call-to-action and minimal distractions',
    'landing': 'compelling landing page with clear value proposition and strong visual hierarchy',
    'modal': 'focused modal dialog with clear purpose, actions, and dismissal options',
    'empty': 'friendly empty state with clear guidance and suggested actions',
    'error': 'helpful error state with clear explanation and recovery options',
    'loading': 'subtle loading state with skeleton elements preserving layout structure'
  };

  return screenPrompts[screenType] || 'clean, professional interface layout';
}

/**
 * Builds a complete prompt for screen generation
 */
export function buildScreenPrompt(context: PromptContext): string {
  let prompt = buildBasePrompt(context);

  if (context.screenType) {
    prompt += `. ${getScreenTypePrompt(context.screenType)}`;
  }

  if (context.colorPalette && context.colorPalette.length > 0) {
    prompt = addColorConstraints(prompt, context.colorPalette);
  }

  if (context.improvements && context.improvements.length > 0) {
    prompt = addImprovements(prompt, context.improvements);
  }

  // Add quality requirements
  prompt += '. High fidelity, pixel-perfect, production-ready UI design';

  return prompt;
}

/**
 * Builds a prompt for typography specimen generation
 */
export function buildTypographyPrompt(fontFamily: string, style: string): string {
  return `Typography specimen sheet showing ${fontFamily} font family in ${style} style. ` +
    'Display headings H1-H6, body text, captions, and labels. ' +
    'Show different weights and sizes with clear visual hierarchy. ' +
    'Clean white background, professional layout.';
}

/**
 * Builds a prompt for state variant generation
 */
export function buildStatePrompt(
  baseScreenDescription: string,
  stateType: 'loading' | 'empty' | 'error' | 'success'
): string {
  const stateDescriptions: Record<string, string> = {
    'loading': 'loading skeleton state with animated placeholder elements, preserving exact layout structure',
    'empty': 'empty state with friendly illustration, helpful message, and suggested action',
    'error': 'error state with clear error message, explanation, and recovery action',
    'success': 'success state with confirmation message, next steps, and positive feedback'
  };

  return `${baseScreenDescription}, showing ${stateDescriptions[stateType]}`;
}

/**
 * Builds a prompt for component anchor generation
 */
export function buildComponentPrompt(
  componentType: string,
  styleDirection: string,
  colorPalette: string[]
): string {
  const componentDescriptions: Record<string, string> = {
    'navigation': 'navigation bar component with logo, menu items, and user actions',
    'form': 'form component with input fields, labels, validation states, and submit button',
    'card': 'card component with header, content area, and action buttons',
    'modal': 'modal dialog with header, content, and footer actions',
    'button': 'button component set showing primary, secondary, and tertiary variants',
    'input': 'input field set showing text, select, checkbox, and radio variants',
    'table': 'data table with header, rows, sorting, and pagination',
    'toast': 'notification toast in success, error, warning, and info variants'
  };

  const description = componentDescriptions[componentType] || `${componentType} component`;
  const colors = colorPalette.slice(0, 3).join(', ');

  return `${styleDirection} ${description}. Use colors: ${colors}. ` +
    'Isolated component on white background, showing all states and variants.';
}

/**
 * Builds a prompt for hero/entry screen generation with variants
 */
export function buildHeroPrompt(
  appType: string,
  styleDirection: string,
  viewport: string
): string {
  const viewportContext = viewport === 'mobile'
    ? 'mobile-first design with bottom navigation and touch-friendly controls'
    : 'desktop layout with sidebar navigation and hover states';

  return `${styleDirection} ${appType} application main screen. ${viewportContext}. ` +
    'Modern, clean aesthetic with clear information hierarchy. ' +
    'Professional color scheme, balanced whitespace, readable typography. ' +
    'High fidelity mockup ready for production.';
}

/**
 * Formats improvement recommendations for prompt injection
 */
export function formatImprovementsForPrompt(improvements: {
  principle: string;
  recommendation: string;
}[]): string[] {
  return improvements.map(imp =>
    `${imp.recommendation} (${imp.principle})`
  );
}

/**
 * Creates a negative prompt to avoid common AI generation issues
 */
export function getNegativePrompt(): string {
  return 'blurry, low quality, distorted text, illegible text, ' +
    'inconsistent spacing, misaligned elements, amateur design, ' +
    'clip art, stock photos, watermarks';
}

// ============================================================================
// Audit Integration
// ============================================================================

/**
 * Extended context with audit improvements
 */
export interface AuditPromptContext extends PromptContext {
  promptInjections?: string[];
  severityFocus?: Severity;
}

/**
 * Formats severity level for prompt emphasis
 * Higher severity = stronger language
 */
export function formatSeverityForPrompt(severity: Severity): string {
  const severityPhrases: Record<Severity, string> = {
    critical: 'MUST',
    high: 'should definitely',
    medium: 'should',
    low: 'consider to'
  };
  return severityPhrases[severity];
}

/**
 * Formats an improvement as a prompt-ready instruction
 */
export function formatImprovementAsInstruction(improvement: Improvement): string {
  const emphasis = formatSeverityForPrompt(improvement.severity);
  return `${emphasis} ${improvement.promptText}`;
}

/**
 * Builds prompt with audit improvements integrated
 * Prioritizes critical/high severity improvements in prompt
 */
export function buildScreenPromptWithAudit(context: AuditPromptContext): string {
  // Start with base prompt
  let prompt = buildBasePrompt(context);

  // Add screen type specifics
  if (context.screenType) {
    prompt += `. ${getScreenTypePrompt(context.screenType)}`;
  }

  // Add color constraints
  if (context.colorPalette && context.colorPalette.length > 0) {
    prompt = addColorConstraints(prompt, context.colorPalette);
  }

  // Add audit-driven improvements (up to 5)
  if (context.promptInjections && context.promptInjections.length > 0) {
    const injections = context.promptInjections.slice(0, 5);
    prompt += `. UX Requirements: ${injections.join('; ')}`;
  }

  // Add severity focus if specified
  if (context.severityFocus) {
    const focusDescriptions: Record<Severity, string> = {
      critical: 'Pay critical attention to accessibility and core usability',
      high: 'Ensure strong attention to usability best practices',
      medium: 'Apply thoughtful attention to user experience details',
      low: 'Polish with minor UX enhancements'
    };
    prompt += `. ${focusDescriptions[context.severityFocus]}`;
  }

  // Add quality requirements
  prompt += '. High fidelity, pixel-perfect, production-ready UI design';

  return prompt;
}

/**
 * Combines global and screen-specific improvements for prompt injection
 * Returns prioritized list with global issues first
 */
export function combineImprovementsForPrompt(
  globalImprovements: Improvement[],
  screenImprovements: Improvement[],
  maxInjections: number = 5
): string[] {
  const injections: string[] = [];
  const seen = new Set<string>();

  // Add top 2 global improvements first
  for (const improvement of globalImprovements.slice(0, 2)) {
    if (!seen.has(improvement.promptText)) {
      injections.push(improvement.promptText);
      seen.add(improvement.promptText);
    }
  }

  // Add screen-specific improvements
  for (const improvement of screenImprovements) {
    if (injections.length >= maxInjections) break;
    if (!seen.has(improvement.promptText)) {
      injections.push(improvement.promptText);
      seen.add(improvement.promptText);
    }
  }

  return injections.slice(0, maxInjections);
}

/**
 * Generates a summary prompt section from audit severity breakdown
 */
export function generateAuditSummaryPrompt(severityCounts: Record<Severity, number>): string {
  const total = Object.values(severityCounts).reduce((a, b) => a + b, 0);

  if (total === 0) {
    return 'No UX issues identified - maintain current quality standards';
  }

  const parts: string[] = [];

  if (severityCounts.critical > 0) {
    parts.push(`${severityCounts.critical} critical issues requiring immediate attention`);
  }
  if (severityCounts.high > 0) {
    parts.push(`${severityCounts.high} high-priority improvements`);
  }

  if (parts.length > 0) {
    return `Address: ${parts.join(' and ')}`;
  }

  return 'Apply general UX polish and refinements';
}

// ============================================================================
// Anchoring Phase Prompts
// ============================================================================

/**
 * Anchor type for anchoring phase
 */
export type AnchorPromptType = 'hero' | 'screen' | 'component' | 'typography' | 'state' | 'iconography';

/**
 * Builds prompt for progressive anchor generation with reference instructions
 */
export function buildAnchorPrompt(
  anchorType: AnchorPromptType,
  description: string,
  styleDirection: string,
  colorPalette: string[],
  referenceCount: number
): string {
  const colors = colorPalette.slice(0, 5).join(', ');

  let referenceInstructions = '';
  if (referenceCount > 0) {
    referenceInstructions = `. Match style exactly from reference images 1-${referenceCount}`;
    if (referenceCount >= 1) {
      referenceInstructions += ' (use reference 1 for overall aesthetic';
    }
    if (referenceCount >= 2) {
      referenceInstructions += ', reference 2 for component styling';
    }
    referenceInstructions += ')';
  }

  const colorInstruction = colors ? `. Use exact colors: ${colors}` : '';

  return `${styleDirection} ${description}${colorInstruction}${referenceInstructions}. High fidelity, pixel-perfect, production-ready UI design.`;
}

/**
 * Builds prompt for iconography anchor
 */
export function buildIconographyPrompt(
  styleDirection: string,
  colorPalette: string[]
): string {
  const accentColor = colorPalette[2] || colorPalette[0] || '#3B82F6';

  return `Icon set specimen sheet showing common UI icons in ${styleDirection} style. ` +
    `Include: home, settings, user, search, menu, close, add, edit, delete, share, notification, message. ` +
    `Consistent stroke weight, ${accentColor} accent color, clean grid layout on white background. ` +
    `SVG-style crisp icons, minimal detail, professional quality.`;
}

/**
 * Adjusts prompt for regeneration after validation failure
 */
export function adjustPromptForRegeneration(
  originalPrompt: string,
  failedChecks: string[]
): string {
  let adjusted = originalPrompt;

  for (const check of failedChecks) {
    const checkLower = check.toLowerCase();

    if (checkLower.includes('color')) {
      adjusted = adjusted.replace(
        'Use exact colors:',
        'CRITICAL - Use ONLY these exact hex colors:'
      );
    }
    if (checkLower.includes('style') || checkLower.includes('consistency')) {
      adjusted += ' MUST maintain exact visual style, shadows, and border radius from references.';
    }
    if (checkLower.includes('structure') || checkLower.includes('layout')) {
      adjusted += ' Preserve original layout structure completely.';
    }
    if (checkLower.includes('dimension') || checkLower.includes('size')) {
      adjusted += ' Generate at full resolution matching viewport requirements.';
    }
  }

  return adjusted;
}

/**
 * Builds prompt for screen anchor with progressive references
 */
export function buildScreenAnchorPrompt(
  screenDescription: string,
  styleDirection: string,
  colorPalette: string[],
  previousAnchorCount: number,
  screenType?: string
): string {
  let prompt = buildAnchorPrompt(
    'screen',
    screenDescription,
    styleDirection,
    colorPalette,
    previousAnchorCount
  );

  if (screenType) {
    prompt = `${prompt} ${getScreenTypePrompt(screenType)}`;
  }

  return prompt;
}

/**
 * Builds prompt for typography specimen anchor
 */
export function buildTypographyAnchorPrompt(
  specimenType: 'heading' | 'body' | 'ui',
  fontFamily: string,
  styleDirection: string,
  colorPalette: string[]
): string {
  const specimenDescriptions: Record<string, string> = {
    heading: 'Typography specimen sheet showing H1-H6 headings with clear size progression and weight variations',
    body: 'Typography specimen showing body text, paragraphs, blockquotes, and list styles at multiple sizes',
    ui: 'Typography specimen showing labels, buttons, input text, captions, and helper text at interface scale'
  };

  const description = specimenDescriptions[specimenType];
  const textColor = colorPalette[4] || '#111827';

  return `${description} in ${styleDirection} style using ${fontFamily}. ` +
    `Text color ${textColor} on white background. ` +
    'Clear visual hierarchy, professional spacing, production-ready quality.';
}

/**
 * Builds prompt for state indicator anchor
 */
export function buildStateAnchorPrompt(
  stateType: 'loading' | 'empty' | 'error' | 'success',
  styleDirection: string,
  colorPalette: string[],
  baseScreenDescription: string
): string {
  const stateDescriptions: Record<string, { description: string; accent: number }> = {
    loading: {
      description: 'loading skeleton state with animated placeholder elements, shimmer effect on content areas',
      accent: 0
    },
    empty: {
      description: 'empty state with friendly illustration, helpful message explaining the state, and primary action button',
      accent: 2
    },
    error: {
      description: 'error state with clear error icon, descriptive message, and recovery action button',
      accent: 8 // error color
    },
    success: {
      description: 'success state with confirmation checkmark, positive message, and next step action',
      accent: 9 // success color
    }
  };

  const state = stateDescriptions[stateType];
  const accentColor = colorPalette[state.accent] || colorPalette[0] || '#3B82F6';

  return `${styleDirection} ${baseScreenDescription} showing ${state.description}. ` +
    `Use ${accentColor} as the state accent color. ` +
    'Consistent with overall design system, clear user feedback, production-ready quality.';
}

// ============================================================================
// Coherence Phase Prompts
// ============================================================================

/**
 * Outlier reason type for coherence regeneration
 */
export type OutlierReason =
  | 'color_drift'
  | 'style_inconsistency'
  | 'layout_deviation'
  | 'component_mismatch'
  | 'spacing_variance'
  | 'typography_inconsistency';

/**
 * Builds prompt for coherence regeneration with specific fixes
 */
export function buildCoherenceRegenerationPrompt(
  screenDescription: string,
  styleDirection: string,
  colorPalette: string[],
  fixInstructions: string[]
): string {
  const colors = colorPalette.slice(0, 5).join(', ');
  const fixes = fixInstructions.slice(0, 3).join('; ');

  let prompt = `${styleDirection} ${screenDescription}. `;
  prompt += `CRITICAL: Use ONLY these exact colors: ${colors}. `;

  if (fixes) {
    prompt += `FIX THESE ISSUES: ${fixes}. `;
  }

  prompt += `Match style EXACTLY from reference images. `;
  prompt += `High fidelity, pixel-perfect, production-ready UI design.`;

  return prompt;
}

/**
 * Adjusts coherence prompt for retry after regeneration failure
 */
export function adjustCoherencePromptForRetry(
  prompt: string,
  attemptNumber: number,
  failedReasons: OutlierReason[]
): string {
  let adjusted = prompt;

  if (attemptNumber === 2) {
    adjusted += ' MUST maintain exact visual style, shadows, and border radius from references.';
    adjusted += ' Preserve layout structure completely.';
  }

  if (attemptNumber >= 3) {
    // Add specific instructions based on failed reasons
    const reasonInstructions = failedReasons.map(r => {
      switch (r) {
        case 'color_drift':
          return 'Match color palette EXACTLY - no deviations';
        case 'style_inconsistency':
          return 'Copy style from reference 1 precisely';
        case 'layout_deviation':
          return 'Preserve original layout 100%';
        case 'component_mismatch':
          return 'Match component styling from reference images';
        case 'spacing_variance':
          return 'Maintain consistent spacing throughout';
        case 'typography_inconsistency':
          return 'Use exact typography from references';
        default:
          return '';
      }
    }).filter(Boolean).join('. ');

    adjusted = adjusted.replace('CRITICAL', 'MANDATORY');
    if (reasonInstructions) {
      adjusted += ` ${reasonInstructions}.`;
    }
  }

  return adjusted;
}

/**
 * Gets fix instructions for outlier reasons
 */
export function getFixInstructionsForReasons(reasons: OutlierReason[]): string[] {
  const instructions: string[] = [];

  for (const reason of reasons) {
    switch (reason) {
      case 'color_drift':
        instructions.push('Enforce exact color palette from style config');
        break;
      case 'style_inconsistency':
        instructions.push('Increase reference image weight in styling');
        break;
      case 'layout_deviation':
        instructions.push('Preserve original layout structure');
        break;
      case 'component_mismatch':
        instructions.push('Match component styling from anchors');
        break;
      case 'spacing_variance':
        instructions.push('Maintain consistent spacing');
        break;
      case 'typography_inconsistency':
        instructions.push('Use typography from reference anchors');
        break;
    }
  }

  return [...new Set(instructions)];
}
