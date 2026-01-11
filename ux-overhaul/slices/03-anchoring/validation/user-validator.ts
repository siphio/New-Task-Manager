/**
 * User Validator for UX Overhaul Skill
 * Utilities for user validation gates
 *
 * Provides structured prompts and response handling for:
 * - Hero selection from variants
 * - Individual anchor approval
 * - Batch anchor approval
 */

import { Anchor, AnchorType } from '../anchoring';

// ============================================================================
// Types
// ============================================================================

/**
 * Request for user validation
 */
export interface UserValidationRequest {
  anchorSlot: number;
  anchorType: AnchorType;
  imagePaths: string[];
  prompt: string;
  description?: string;
}

/**
 * User response to validation request
 */
export interface UserValidationResponse {
  selectedIndex?: number;
  accepted: boolean;
  feedback?: string;
  requestRegeneration?: boolean;
  customColorPalette?: string[];
}

/**
 * Validation gate types
 */
export type ValidationGateType = 'hero_selection' | 'anchor_approval' | 'batch_approval';

/**
 * Validation gate status
 */
export type ValidationGateStatus = 'pending' | 'approved' | 'rejected' | 'regenerate';

/**
 * Complete validation gate
 */
export interface ValidationGate {
  id: string;
  type: ValidationGateType;
  request: UserValidationRequest;
  status: ValidationGateStatus;
  createdAt: string;
  resolvedAt?: string;
  response?: UserValidationResponse;
}

/**
 * Result from processing user response
 */
export interface ProcessedResponse {
  proceed: boolean;
  selectedAnchor?: Anchor;
  selectedPath?: string;
  regenerate?: boolean;
  adjustments?: string[];
}

// ============================================================================
// Gate Creation
// ============================================================================

/**
 * Creates a hero selection gate (user picks from variants)
 */
export function createHeroSelectionGate(
  variantPaths: string[],
  styleDirection: string
): ValidationGate {
  return {
    id: `gate-hero-${Date.now()}`,
    type: 'hero_selection',
    request: {
      anchorSlot: 1,
      anchorType: 'hero',
      imagePaths: variantPaths,
      prompt: `Select the hero design that best represents your vision for "${styleDirection}"`,
      description: 'Hero screen establishes the visual foundation for all subsequent screens'
    },
    status: 'pending',
    createdAt: new Date().toISOString()
  };
}

/**
 * Creates an anchor approval gate
 */
export function createAnchorApprovalGate(
  anchor: Anchor
): ValidationGate {
  return {
    id: `gate-anchor-${anchor.slot}-${Date.now()}`,
    type: 'anchor_approval',
    request: {
      anchorSlot: anchor.slot,
      anchorType: anchor.type,
      imagePaths: [anchor.imagePath],
      prompt: `Review ${anchor.name} (Slot ${anchor.slot})`,
      description: anchor.description
    },
    status: 'pending',
    createdAt: new Date().toISOString()
  };
}

/**
 * Creates a batch approval gate for multiple anchors
 */
export function createBatchApprovalGate(
  anchors: Anchor[],
  batchName: string
): ValidationGate {
  return {
    id: `gate-batch-${Date.now()}`,
    type: 'batch_approval',
    request: {
      anchorSlot: 0, // Not applicable for batch
      anchorType: anchors[0]?.type || 'screen',
      imagePaths: anchors.map(a => a.imagePath),
      prompt: `Review ${batchName} (${anchors.length} anchors)`,
      description: `Batch review of ${anchors.map(a => a.name).join(', ')}`
    },
    status: 'pending',
    createdAt: new Date().toISOString()
  };
}

// ============================================================================
// Prompt Formatting
// ============================================================================

/**
 * Formats validation request for CLI display
 */
export function formatValidationPrompt(gate: ValidationGate): string {
  const lines: string[] = [];

  // Header
  lines.push('='.repeat(60));
  lines.push(`VALIDATION GATE: ${gate.type.replace('_', ' ').toUpperCase()}`);
  lines.push('='.repeat(60));
  lines.push('');

  // Request details
  lines.push(gate.request.prompt);
  if (gate.request.description) {
    lines.push('');
    lines.push(`Description: ${gate.request.description}`);
  }
  lines.push('');

  // Image paths
  if (gate.type === 'hero_selection') {
    lines.push('Variant Options:');
    gate.request.imagePaths.forEach((path, index) => {
      lines.push(`  ${index + 1}. ${path}`);
    });
    lines.push('');
    lines.push('Actions:');
    lines.push('  - Enter a number (1-4) to select a variant');
    lines.push('  - Enter "r" to regenerate all variants');
    lines.push('  - Enter "q" to quit and save progress');
  } else if (gate.type === 'anchor_approval') {
    lines.push(`Image: ${gate.request.imagePaths[0]}`);
    lines.push('');
    lines.push('Actions:');
    lines.push('  - Enter "y" or "yes" to approve');
    lines.push('  - Enter "n" or "no" to reject and regenerate');
    lines.push('  - Enter feedback to provide specific adjustments');
  } else {
    lines.push('Images to review:');
    gate.request.imagePaths.forEach((path, index) => {
      lines.push(`  ${index + 1}. ${path}`);
    });
    lines.push('');
    lines.push('Actions:');
    lines.push('  - Enter "y" to approve all');
    lines.push('  - Enter numbers to reject (e.g., "1,3" to reject items 1 and 3)');
  }

  lines.push('');
  lines.push('-'.repeat(60));

  return lines.join('\n');
}

/**
 * Generates review instructions for a specific anchor type
 */
export function generateReviewInstructions(
  anchorType: AnchorType,
  imagePath: string
): string[] {
  const baseInstructions = [
    `Review the generated ${anchorType} anchor at:`,
    `  ${imagePath}`,
    ''
  ];

  const typeSpecificInstructions: Record<AnchorType, string[]> = {
    hero: [
      'Check for:',
      '  - Overall visual direction matches your style preference',
      '  - Color palette is appealing and accessible',
      '  - Typography is clear and readable',
      '  - Layout establishes good hierarchy',
      '  - Professional, production-ready quality'
    ],
    screen: [
      'Check for:',
      '  - Style consistency with hero screen',
      '  - Same color palette applied correctly',
      '  - Typography matches established style',
      '  - Screen layout is appropriate for content',
      '  - UI elements are consistent'
    ],
    component: [
      'Check for:',
      '  - Component isolation is clear',
      '  - All states/variants are shown',
      '  - Style matches established anchors',
      '  - Clean white background',
      '  - Professional quality'
    ],
    typography: [
      'Check for:',
      '  - Clear font hierarchy (H1-H6, body, captions)',
      '  - Readable at all sizes',
      '  - Consistent with overall style direction',
      '  - Appropriate weights shown',
      '  - Good contrast against background'
    ],
    state: [
      'Check for:',
      '  - State purpose is clear (loading/empty/error/success)',
      '  - Style matches established anchors',
      '  - Helpful messaging or feedback',
      '  - Appropriate visual indicators',
      '  - Consistent with overall aesthetic'
    ],
    iconography: [
      'Check for:',
      '  - Consistent icon style throughout',
      '  - Appropriate stroke weight',
      '  - Color matches accent from palette',
      '  - All common icons present',
      '  - Clean, crisp edges'
    ]
  };

  return [
    ...baseInstructions,
    ...typeSpecificInstructions[anchorType]
  ];
}

// ============================================================================
// Response Processing
// ============================================================================

/**
 * Processes user response to validation gate
 */
export function processUserResponse(
  gate: ValidationGate,
  response: UserValidationResponse
): ProcessedResponse {
  const result: ProcessedResponse = {
    proceed: false
  };

  switch (gate.type) {
    case 'hero_selection':
      if (response.selectedIndex !== undefined && response.selectedIndex >= 0) {
        result.proceed = true;
        result.selectedPath = gate.request.imagePaths[response.selectedIndex];
      } else if (response.requestRegeneration) {
        result.regenerate = true;
        if (response.feedback) {
          result.adjustments = [response.feedback];
        }
      }
      break;

    case 'anchor_approval':
      if (response.accepted) {
        result.proceed = true;
        result.selectedPath = gate.request.imagePaths[0];
      } else if (response.requestRegeneration || !response.accepted) {
        result.regenerate = true;
        if (response.feedback) {
          result.adjustments = [response.feedback];
        }
      }
      break;

    case 'batch_approval':
      result.proceed = response.accepted;
      if (!response.accepted && response.feedback) {
        // Parse feedback for specific rejections
        const rejectedIndices = parseRejectionIndices(response.feedback);
        if (rejectedIndices.length > 0) {
          result.adjustments = rejectedIndices.map(i =>
            `Regenerate anchor at index ${i}`
          );
          result.regenerate = true;
        }
      }
      break;
  }

  return result;
}

/**
 * Parses rejection indices from feedback (e.g., "1,3" -> [0, 2])
 */
function parseRejectionIndices(feedback: string): number[] {
  const matches = feedback.match(/\d+/g);
  if (!matches) return [];

  return matches.map(m => parseInt(m, 10) - 1).filter(n => n >= 0);
}

// ============================================================================
// Gate Management
// ============================================================================

/**
 * Updates gate status with response
 */
export function resolveGate(
  gate: ValidationGate,
  response: UserValidationResponse,
  status: ValidationGateStatus
): ValidationGate {
  return {
    ...gate,
    status,
    resolvedAt: new Date().toISOString(),
    response
  };
}

/**
 * Checks if gate is pending
 */
export function isGatePending(gate: ValidationGate): boolean {
  return gate.status === 'pending';
}

/**
 * Checks if gate was approved
 */
export function isGateApproved(gate: ValidationGate): boolean {
  return gate.status === 'approved';
}

/**
 * Gets rejection reason from gate
 */
export function getRejectionReason(gate: ValidationGate): string | undefined {
  if (gate.status === 'rejected' && gate.response?.feedback) {
    return gate.response.feedback;
  }
  return undefined;
}

// ============================================================================
// CLI Helpers
// ============================================================================

/**
 * Formats gate status for display
 */
export function formatGateStatus(gate: ValidationGate): string {
  const statusIcons: Record<ValidationGateStatus, string> = {
    pending: '[?]',
    approved: '[ok]',
    rejected: '[x]',
    regenerate: '[~]'
  };

  return `${statusIcons[gate.status]} ${gate.type}: Slot ${gate.request.anchorSlot} (${gate.status})`;
}

/**
 * Gets user prompt for validation
 */
export function getUserPrompt(gate: ValidationGate): string {
  switch (gate.type) {
    case 'hero_selection':
      return 'Enter variant number (1-4), "r" to regenerate, or "q" to quit: ';
    case 'anchor_approval':
      return 'Approve? (y/n) or enter feedback: ';
    case 'batch_approval':
      return 'Approve all? (y) or enter numbers to reject: ';
    default:
      return 'Enter response: ';
  }
}

/**
 * Parses user input into validation response
 */
export function parseUserInput(
  input: string,
  gateType: ValidationGateType
): UserValidationResponse {
  const trimmed = input.trim().toLowerCase();

  switch (gateType) {
    case 'hero_selection':
      if (trimmed === 'r') {
        return { accepted: false, requestRegeneration: true };
      }
      if (trimmed === 'q') {
        return { accepted: false };
      }
      const num = parseInt(trimmed, 10);
      if (!isNaN(num) && num >= 1 && num <= 4) {
        return { accepted: true, selectedIndex: num - 1 };
      }
      return { accepted: false, feedback: input };

    case 'anchor_approval':
      if (trimmed === 'y' || trimmed === 'yes') {
        return { accepted: true };
      }
      if (trimmed === 'n' || trimmed === 'no') {
        return { accepted: false, requestRegeneration: true };
      }
      return { accepted: false, requestRegeneration: true, feedback: input };

    case 'batch_approval':
      if (trimmed === 'y' || trimmed === 'yes') {
        return { accepted: true };
      }
      return { accepted: false, feedback: input };

    default:
      return { accepted: false, feedback: input };
  }
}

/**
 * Gets expected image count for gate type
 */
export function getExpectedImageCount(gateType: ValidationGateType): number {
  switch (gateType) {
    case 'hero_selection':
      return 4; // Default 4 variants
    case 'anchor_approval':
      return 1;
    case 'batch_approval':
      return -1; // Variable
    default:
      return 1;
  }
}
