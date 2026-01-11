/**
 * Phase Orchestrator for UX Overhaul Skill
 * Chains all 7 slices into a unified pipeline
 */

import { ensureDir, fileExists } from './utils/file';
import {
  Manifest,
  readManifest,
  manifestExists,
  getCurrentPhase,
  canStartPhase,
  getManifestSummary,
  isProjectComplete,
  getProgressPercentage
} from './utils/manifest';

// Phase names in execution order
export const PHASE_ORDER = [
  'capture',
  'audit',
  'anchoring',
  'propagation',
  'states',
  'coherence',
  'specs'
] as const;

export type PhaseName = typeof PHASE_ORDER[number];

export type ViewportType = 'mobile' | 'tablet' | 'desktop' | 'desktop-xl';

export interface OrchestratorConfig {
  outputDir: string;
  viewport: ViewportType;
  flowDefinitionPath?: string;  // Required for capture phase
  styleDirection?: string;      // Optional style override
  themeReferencePath?: string;  // Optional CSS theme file (TweakCN colors)
  resumeFromPhase?: PhaseName;  // For --phase option
}

export interface PhaseExecutionResult {
  success: boolean;
  phase: PhaseName;
  manifest?: Manifest;
  artifacts?: Record<string, unknown>;
  error?: string;
  requiresUserInput?: boolean;
  userPrompt?: string;
}

export interface PipelineResult {
  success: boolean;
  manifest?: Manifest;
  completedPhases: PhaseName[];
  currentPhase?: PhaseName;
  error?: string;
  stoppedForUserInput?: boolean;
  userPrompt?: string;
}

export interface UserValidationGate {
  gateType: 'hero_selection' | 'anchor_approval' | 'coherence_review';
  phase: PhaseName;
  prompt: string;
  options?: string[];
  requiresResponse: boolean;
}

/**
 * Creates orchestrator configuration with defaults
 */
export function createOrchestratorConfig(
  viewport: ViewportType,
  options?: Partial<OrchestratorConfig>
): OrchestratorConfig {
  const defaultOutputDir = './ux-overhaul-output';

  return {
    outputDir: options?.outputDir || defaultOutputDir,
    viewport,
    flowDefinitionPath: options?.flowDefinitionPath,
    styleDirection: options?.styleDirection || 'modern minimal with subtle shadows',
    themeReferencePath: options?.themeReferencePath,
    resumeFromPhase: options?.resumeFromPhase
  };
}

/**
 * Validates orchestrator configuration
 */
export function validateConfig(config: OrchestratorConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  const validViewports: ViewportType[] = ['mobile', 'tablet', 'desktop', 'desktop-xl'];
  if (!validViewports.includes(config.viewport)) {
    errors.push(`Invalid viewport: ${config.viewport}. Must be one of: ${validViewports.join(', ')}`);
  }

  if (config.resumeFromPhase && !PHASE_ORDER.includes(config.resumeFromPhase)) {
    errors.push(`Invalid phase: ${config.resumeFromPhase}. Must be one of: ${PHASE_ORDER.join(', ')}`);
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Initializes a new pipeline or resumes existing one
 */
export function initializePipeline(config: OrchestratorConfig): PipelineResult {
  // Validate config
  const validation = validateConfig(config);
  if (!validation.valid) {
    return {
      success: false,
      completedPhases: [],
      error: `Invalid configuration: ${validation.errors.join(', ')}`
    };
  }

  // Ensure output directory exists
  const dirResult = ensureDir(config.outputDir);
  if (!dirResult.success) {
    return { success: false, completedPhases: [], error: dirResult.error };
  }

  // Check for existing manifest (resume scenario)
  if (manifestExists(config.outputDir)) {
    return resumePipeline(config);
  }

  // New pipeline - requires flow definition
  if (!config.flowDefinitionPath) {
    return {
      success: false,
      completedPhases: [],
      error: 'Flow definition path required for new pipeline. Use --flow <path>'
    };
  }

  // Validate flow definition exists
  if (!fileExists(config.flowDefinitionPath)) {
    return {
      success: false,
      completedPhases: [],
      error: `Flow definition not found: ${config.flowDefinitionPath}`
    };
  }

  return {
    success: true,
    completedPhases: [],
    currentPhase: 'capture'
  };
}

/**
 * Resumes pipeline from existing manifest
 */
export function resumePipeline(config: OrchestratorConfig): PipelineResult {
  const manifestResult = readManifest(config.outputDir);
  if (!manifestResult.success || !manifestResult.data) {
    return {
      success: false,
      completedPhases: [],
      error: `Failed to read manifest: ${manifestResult.error}`
    };
  }

  const manifest = manifestResult.data;

  // Get completed phases
  const completedPhases = PHASE_ORDER.filter(
    phase => manifest.phases[phase].status === 'complete' ||
             manifest.phases[phase].status === 'skipped'
  ) as PhaseName[];

  // Determine current/next phase
  const currentPhase = getCurrentPhase(manifest);

  // Check if resuming from specific phase
  if (config.resumeFromPhase) {
    const { canStart, reason } = canStartPhase(manifest, config.resumeFromPhase);
    if (!canStart) {
      return {
        success: false,
        manifest,
        completedPhases,
        error: `Cannot resume from ${config.resumeFromPhase}: ${reason}`
      };
    }
    return {
      success: true,
      manifest,
      completedPhases,
      currentPhase: config.resumeFromPhase
    };
  }

  // Check if project is complete
  if (isProjectComplete(manifest)) {
    return {
      success: true,
      manifest,
      completedPhases,
      currentPhase: undefined
    };
  }

  return {
    success: true,
    manifest,
    completedPhases,
    currentPhase: (currentPhase as PhaseName) || undefined
  };
}

/**
 * Generates instructions for executing a specific phase
 * These instructions guide Claude on what slice functions to call
 */
export function getPhaseInstructions(
  phase: PhaseName,
  config: OrchestratorConfig,
  _manifest?: Manifest
): string[] {
  const instructions: string[] = [];

  switch (phase) {
    case 'capture':
      instructions.push(
        '## Phase 1: Capture',
        '',
        'Execute the capture phase to screenshot all application screens.',
        '',
        '### Steps:',
        `1. Import capture functions from \`slices/01-capture/capture.ts\``,
        `2. Call \`createCaptureConfig("${config.flowDefinitionPath}", "${config.outputDir}", "${config.viewport}")\``,
        `3. Call \`initializeCapture(config)\` to validate and create execution plan`,
        `4. Use Playwright MCP to execute the capture plan`,
        `5. Call \`completeCapture(outputDir, manifest, appUnderstanding)\``,
        '',
        '### Required Actions:',
        '- Launch browser at specified viewport',
        '- Navigate through all flows defined in flow definition',
        '- Screenshot each screen',
        '- Capture DOM analysis for each screen',
        '',
        '### Completion Criteria:',
        '- All screens captured and saved to screenshots/',
        '- app_understanding.json created',
        '- manifest.json updated with capture: complete'
      );
      break;

    case 'audit':
      instructions.push(
        '## Phase 2: Audit',
        '',
        'Evaluate captured screens against UX best practices.',
        '',
        '### Steps:',
        `1. Import audit functions from \`slices/02-audit/audit.ts\``,
        `2. Call \`createAuditConfig("${config.outputDir}")\``,
        `3. Read app_understanding.json`,
        `4. Call \`initializeAudit(config)\``,
        `5. Call \`runAudit(config, appUnderstanding)\``,
        `6. Call \`completeAudit(outputDir, auditReport, improvementPlan)\``,
        '',
        '### Completion Criteria:',
        '- audit_report.json created with issues by severity',
        '- improvement_plan.json created with prioritized recommendations',
        '- manifest.json updated with audit: complete'
      );
      break;

    case 'anchoring':
      instructions.push(
        '## Phase 3: Anchoring',
        '',
        'Establish visual foundation through validated reference images.',
        '',
        '**USER INTERACTION REQUIRED**: This phase requires user validation.',
        ''
      );

      // Add theme reference instructions if provided
      if (config.themeReferencePath) {
        instructions.push(
          '### Theme Reference',
          `A CSS theme file has been provided: \`${config.themeReferencePath}\``,
          '',
          '**IMPORTANT**: Read this CSS file and extract the color variables.',
          'Use these colors as the PRIMARY style foundation for all generated designs:',
          '- Extract `--primary`, `--secondary`, `--background`, `--foreground`, etc.',
          '- Map these to the style_config.json color palette',
          '- Ensure all generated anchors and screens use these exact colors',
          ''
        );
      }

      instructions.push(
        '### Steps:',
        `1. Import anchoring functions from \`slices/03-anchoring/anchoring.ts\``,
        `2. Call \`createAnchoringConfig("${config.outputDir}", { viewport: "${config.viewport}", styleDirection: "${config.styleDirection}" })\``,
        config.themeReferencePath
          ? `3. Read the theme CSS file at \`${config.themeReferencePath}\` and extract color variables`
          : `3. Read app_understanding.json and improvement_plan.json`,
        `4. Call \`initializeAnchoring(config)\``,
        `5. Generate hero screen variants (4-6 options) ${config.themeReferencePath ? 'using the theme colors' : ''}`,
        `6. **PAUSE FOR USER**: Present hero variants for selection`,
        `7. After user selects hero, generate remaining anchors`,
        `8. **PAUSE FOR USER**: Allow anchor review/regeneration`,
        `9. Call \`completeAnchoring(outputDir, styleConfig, anchors)\``,
        '',
        '### User Validation Gates:',
        '- Hero Selection: Present 4-6 hero variants, user picks preferred style',
        '- Anchor Approval: Show all 14 anchors, allow regeneration requests',
        '',
        '### Completion Criteria:',
        '- 14 validated anchor images in generated/anchors/',
        '- style_config.json created with color palette and tokens',
        '- manifest.json updated with anchoring: complete'
      );
      break;

    case 'propagation':
      instructions.push(
        '## Phase 4: Propagation',
        '',
        'Generate redesigned versions of all application screens.',
        '',
        '### Steps:',
        `1. Import propagation functions from \`slices/04-propagation/propagation.ts\``,
        `2. Call \`createPropagationConfig("${config.outputDir}", { viewport: "${config.viewport}" })\``,
        `3. Read style_config.json and improvement_plan.json`,
        `4. Call \`initializePropagation(config)\``,
        `5. Call \`runPropagation(config, screens, styleConfig, improvements)\``,
        `   - Processes in batches of 5 screens`,
        `   - Each batch updates manifest progress`,
        `6. Call \`completePropagation(outputDir, propagationReport)\``,
        '',
        '### Batch Processing:',
        '- Default batch size: 5 screens',
        '- Manifest updated after each batch (checkpoint)',
        '- Can resume from last completed batch',
        '',
        '### Completion Criteria:',
        '- All screens regenerated in generated/screens/',
        '- propagation_report.json created',
        '- manifest.json updated with propagation: complete'
      );
      break;

    case 'states':
      instructions.push(
        '## Phase 5: States',
        '',
        'Generate state variants (loading, empty, error, success) for each screen.',
        '',
        '### Steps:',
        `1. Import states functions from \`slices/05-states/states.ts\``,
        `2. Call \`createStatesConfig("${config.outputDir}", { viewport: "${config.viewport}" })\``,
        `3. Read propagation_report.json and style_config.json`,
        `4. Call \`initializeStates(config)\``,
        `5. Call \`runStates(config, propagatedScreens, styleConfig)\``,
        `6. Call \`completeStates(outputDir, statesReport)\``,
        '',
        '### State Types Generated:',
        '- loading: Skeleton/shimmer placeholders',
        '- empty: Friendly empty state with CTA',
        '- error: Helpful error message',
        '- success: Confirmation/success feedback',
        '',
        '### Completion Criteria:',
        '- State variants in generated/states/{screenId}/',
        '- states_report.json created',
        '- manifest.json updated with states: complete'
      );
      break;

    case 'coherence':
      instructions.push(
        '## Phase 6: Coherence',
        '',
        'Validate all generated designs work together as a unified product.',
        '',
        '### Steps:',
        `1. Import coherence functions from \`slices/06-coherence/coherence.ts\``,
        `2. Call \`createCoherenceConfig("${config.outputDir}", { viewport: "${config.viewport}" })\``,
        `3. Read all previous reports and style_config.json`,
        `4. Call \`initializeCoherence(config)\``,
        `5. Call \`runCoherence(config, propagatedScreens, stateScreens, styleConfig)\``,
        `   - Multi-pass validation (max 2 passes)`,
        `   - Detects visual outliers`,
        `   - Regenerates inconsistent screens`,
        `6. Call \`completeCoherence(outputDir, coherenceReport)\``,
        '',
        '### Validation Checks:',
        '- Flow coherence: Natural transitions between screens',
        '- Component consistency: Same buttons, cards, nav everywhere',
        '- Color adherence: All screens use validated palette',
        '- Typography consistency: Uniform heading/body styles',
        '',
        '### Completion Criteria:',
        '- coherence_report.json created with coherence scores',
        '- Outliers regenerated (if any)',
        '- manifest.json updated with coherence: complete'
      );
      break;

    case 'specs':
      instructions.push(
        '## Phase 7: Specs',
        '',
        'Generate implementation specifications for developer handoff.',
        '',
        '### Steps:',
        `1. Import specs functions from \`slices/07-specs/specs.ts\``,
        `2. Call \`createSpecsConfig("${config.outputDir}", { viewport: "${config.viewport}" })\``,
        `3. Read all previous reports and artifacts`,
        `4. Call \`initializeSpecs(config)\``,
        `5. Call \`runSpecs(config, propagatedScreens, stateScreens, styleConfig, appUnderstanding)\``,
        `6. Call \`completeSpecs(outputDir, specsReport)\``,
        '',
        '### Generated Artifacts:',
        '- design_tokens.json: TweakCN-compatible tokens',
        '- design_tokens.css: CSS custom properties',
        '- design_system.md: Design system documentation',
        '- specs/screen-{id}.md: Per-screen implementation specs',
        '- implementation_checklist.md: Build order guide',
        '',
        '### Completion Criteria:',
        '- All spec files generated in specs/',
        '- specs_report.json created',
        '- manifest.json updated with specs: complete',
        '- **PROJECT COMPLETE**'
      );
      break;
  }

  return instructions;
}

/**
 * Gets progress summary for display
 */
export function getPipelineProgress(manifest: Manifest): string {
  const progress = getProgressPercentage(manifest);
  const current = getCurrentPhase(manifest);
  const summary = getManifestSummary(manifest);

  return [
    `Progress: ${progress}%`,
    current ? `Current Phase: ${current}` : 'All phases complete!',
    '',
    summary
  ].join('\n');
}

/**
 * Checks if current phase requires user input
 */
export function phaseRequiresUserInput(phase: PhaseName): boolean {
  return phase === 'anchoring';
}

/**
 * Gets user validation gates for a phase
 */
export function getUserValidationGates(phase: PhaseName): UserValidationGate[] {
  if (phase !== 'anchoring') {
    return [];
  }

  return [
    {
      gateType: 'hero_selection',
      phase: 'anchoring',
      prompt: 'Please review the hero screen variants and select your preferred style direction. Which variant best represents the visual direction you want for your app?',
      options: ['Variant 1', 'Variant 2', 'Variant 3', 'Variant 4', 'Regenerate all'],
      requiresResponse: true
    },
    {
      gateType: 'anchor_approval',
      phase: 'anchoring',
      prompt: 'Please review all 14 generated anchors. Are you satisfied with the visual consistency? You can request regeneration for any specific anchors.',
      options: ['Approve all', 'Regenerate specific anchors'],
      requiresResponse: true
    }
  ];
}

/**
 * Formats user prompt for a validation gate
 */
export function formatUserPrompt(gate: UserValidationGate): string {
  const lines = [
    `### ${gate.gateType.replace(/_/g, ' ').toUpperCase()}`,
    '',
    gate.prompt,
    ''
  ];

  if (gate.options && gate.options.length > 0) {
    lines.push('**Options:**');
    gate.options.forEach((opt, i) => {
      lines.push(`${i + 1}. ${opt}`);
    });
  }

  return lines.join('\n');
}

// Re-export manifest utilities for convenience
export {
  Manifest,
  getCurrentPhase,
  canStartPhase,
  isProjectComplete,
  getProgressPercentage
} from './utils/manifest';
