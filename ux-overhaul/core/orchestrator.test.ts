/**
 * Tests for Phase Orchestrator
 */

import {
  PHASE_ORDER,
  createOrchestratorConfig,
  validateConfig,
  initializePipeline,
  getPhaseInstructions,
  phaseRequiresUserInput,
  getUserValidationGates,
  formatUserPrompt,
  getPipelineProgress,
  PhaseName,
  ViewportType
} from './orchestrator';
import { createManifest, Manifest } from './utils/manifest';

describe('Phase Orchestrator', () => {
  describe('PHASE_ORDER', () => {
    it('should have exactly 7 phases', () => {
      expect(PHASE_ORDER).toHaveLength(7);
    });

    it('should have phases in correct order', () => {
      expect(PHASE_ORDER).toEqual([
        'capture',
        'audit',
        'anchoring',
        'propagation',
        'states',
        'coherence',
        'specs'
      ]);
    });

    it('should match manifest phase keys', () => {
      const manifest = createManifest('test', 'http://test.com', 'mobile');
      const manifestPhases = Object.keys(manifest.phases);
      expect(PHASE_ORDER).toEqual(manifestPhases);
    });
  });

  describe('createOrchestratorConfig', () => {
    it('should create config with required viewport', () => {
      const config = createOrchestratorConfig('mobile');
      expect(config.viewport).toBe('mobile');
      expect(config.outputDir).toBe('./ux-overhaul-output');
    });

    it('should apply custom options', () => {
      const config = createOrchestratorConfig('desktop', {
        outputDir: '/custom/path',
        flowDefinitionPath: './flow.json',
        styleDirection: 'dark modern'
      });
      expect(config.outputDir).toBe('/custom/path');
      expect(config.flowDefinitionPath).toBe('./flow.json');
      expect(config.styleDirection).toBe('dark modern');
    });

    it('should use default style direction', () => {
      const config = createOrchestratorConfig('tablet');
      expect(config.styleDirection).toBe('modern minimal with subtle shadows');
    });

    it('should handle resumeFromPhase option', () => {
      const config = createOrchestratorConfig('mobile', {
        resumeFromPhase: 'propagation'
      });
      expect(config.resumeFromPhase).toBe('propagation');
    });

    const viewports: ViewportType[] = ['mobile', 'tablet', 'desktop', 'desktop-xl'];
    viewports.forEach(viewport => {
      it(`should accept ${viewport} viewport`, () => {
        const config = createOrchestratorConfig(viewport);
        expect(config.viewport).toBe(viewport);
      });
    });
  });

  describe('validateConfig', () => {
    it('should validate correct config', () => {
      const config = createOrchestratorConfig('mobile');
      const result = validateConfig(config);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid viewport', () => {
      const config = createOrchestratorConfig('invalid' as ViewportType);
      const result = validateConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Invalid viewport');
    });

    it('should reject invalid phase', () => {
      const config = createOrchestratorConfig('mobile', {
        resumeFromPhase: 'invalid' as PhaseName
      });
      const result = validateConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Invalid phase');
    });

    it('should allow undefined resumeFromPhase', () => {
      const config = createOrchestratorConfig('mobile');
      const result = validateConfig(config);
      expect(result.valid).toBe(true);
    });

    PHASE_ORDER.forEach(phase => {
      it(`should accept ${phase} as resumeFromPhase`, () => {
        const config = createOrchestratorConfig('mobile', { resumeFromPhase: phase });
        const result = validateConfig(config);
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('getPhaseInstructions', () => {
    const config = createOrchestratorConfig('mobile', {
      flowDefinitionPath: './flow.json',
      styleDirection: 'modern minimal'
    });

    PHASE_ORDER.forEach(phase => {
      it(`should return instructions for ${phase} phase`, () => {
        const instructions = getPhaseInstructions(phase, config);
        expect(instructions).toBeDefined();
        expect(instructions.length).toBeGreaterThan(0);
        expect(instructions[0]).toContain('Phase');
      });

      it(`should include config values in ${phase} instructions`, () => {
        const instructions = getPhaseInstructions(phase, config);
        const joined = instructions.join('\n');
        expect(joined).toContain(config.outputDir);
      });
    });

    it('should include user interaction warning for anchoring', () => {
      const instructions = getPhaseInstructions('anchoring', config);
      const joined = instructions.join('\n');
      expect(joined).toContain('USER INTERACTION REQUIRED');
    });

    it('should include batch processing note for propagation', () => {
      const instructions = getPhaseInstructions('propagation', config);
      const joined = instructions.join('\n');
      expect(joined).toContain('batch');
      expect(joined).toContain('5 screens');
    });

    it('should include state types for states phase', () => {
      const instructions = getPhaseInstructions('states', config);
      const joined = instructions.join('\n');
      expect(joined).toContain('loading');
      expect(joined).toContain('empty');
      expect(joined).toContain('error');
      expect(joined).toContain('success');
    });

    it('should include completion message for specs', () => {
      const instructions = getPhaseInstructions('specs', config);
      const joined = instructions.join('\n');
      expect(joined).toContain('PROJECT COMPLETE');
    });

    it('should include viewport in anchoring instructions', () => {
      const instructions = getPhaseInstructions('anchoring', config);
      const joined = instructions.join('\n');
      expect(joined).toContain(config.viewport);
    });

    it('should include style direction in anchoring instructions', () => {
      const instructions = getPhaseInstructions('anchoring', config);
      const joined = instructions.join('\n');
      expect(joined).toContain(config.styleDirection!);
    });
  });

  describe('phaseRequiresUserInput', () => {
    it('should return true for anchoring', () => {
      expect(phaseRequiresUserInput('anchoring')).toBe(true);
    });

    const nonInteractivePhases: PhaseName[] = ['capture', 'audit', 'propagation', 'states', 'coherence', 'specs'];
    nonInteractivePhases.forEach(phase => {
      it(`should return false for ${phase}`, () => {
        expect(phaseRequiresUserInput(phase)).toBe(false);
      });
    });
  });

  describe('getUserValidationGates', () => {
    it('should return gates for anchoring phase', () => {
      const gates = getUserValidationGates('anchoring');
      expect(gates).toHaveLength(2);
      expect(gates[0].gateType).toBe('hero_selection');
      expect(gates[1].gateType).toBe('anchor_approval');
    });

    it('should have correct properties for hero selection gate', () => {
      const gates = getUserValidationGates('anchoring');
      const heroGate = gates[0];
      expect(heroGate.phase).toBe('anchoring');
      expect(heroGate.prompt).toContain('hero screen variants');
      expect(heroGate.options).toContain('Variant 1');
      expect(heroGate.options).toContain('Regenerate all');
      expect(heroGate.requiresResponse).toBe(true);
    });

    it('should have correct properties for anchor approval gate', () => {
      const gates = getUserValidationGates('anchoring');
      const anchorGate = gates[1];
      expect(anchorGate.phase).toBe('anchoring');
      expect(anchorGate.prompt).toContain('14 generated anchors');
      expect(anchorGate.options).toContain('Approve all');
      expect(anchorGate.requiresResponse).toBe(true);
    });

    it('should return empty array for non-anchoring phases', () => {
      const phases: PhaseName[] = ['capture', 'audit', 'propagation', 'states', 'coherence', 'specs'];
      phases.forEach(phase => {
        const gates = getUserValidationGates(phase);
        expect(gates).toHaveLength(0);
      });
    });

    it('should have required response for all anchoring gates', () => {
      const gates = getUserValidationGates('anchoring');
      gates.forEach(gate => {
        expect(gate.requiresResponse).toBe(true);
      });
    });
  });

  describe('formatUserPrompt', () => {
    it('should format gate with options', () => {
      const gate = getUserValidationGates('anchoring')[0];
      const prompt = formatUserPrompt(gate);
      expect(prompt).toContain('HERO SELECTION');
      expect(prompt).toContain('Options:');
      expect(prompt).toContain('Variant 1');
    });

    it('should include gate prompt text', () => {
      const gate = getUserValidationGates('anchoring')[1];
      const prompt = formatUserPrompt(gate);
      expect(prompt).toContain('14 generated anchors');
    });

    it('should format gate type with spaces', () => {
      const gate = getUserValidationGates('anchoring')[0];
      const prompt = formatUserPrompt(gate);
      expect(prompt).toContain('HERO SELECTION');
      expect(prompt).not.toContain('hero_selection');
    });

    it('should number options', () => {
      const gate = getUserValidationGates('anchoring')[0];
      const prompt = formatUserPrompt(gate);
      expect(prompt).toContain('1. Variant 1');
      expect(prompt).toContain('2. Variant 2');
    });
  });

  describe('getPipelineProgress', () => {
    it('should show progress percentage', () => {
      const manifest = createManifest('test', 'http://test.com', 'mobile');
      const progress = getPipelineProgress(manifest);
      expect(progress).toContain('Progress: 0%');
    });

    it('should show current phase', () => {
      const manifest = createManifest('test', 'http://test.com', 'mobile');
      const progress = getPipelineProgress(manifest);
      expect(progress).toContain('Current Phase: capture');
    });

    it('should show project info', () => {
      const manifest = createManifest('test-project', 'http://test.com', 'mobile');
      const progress = getPipelineProgress(manifest);
      expect(progress).toContain('test-project');
      expect(progress).toContain('mobile');
    });

    it('should show all phases complete when done', () => {
      const manifest = createManifest('test', 'http://test.com', 'mobile');
      // Mark all phases complete
      PHASE_ORDER.forEach(phase => {
        manifest.phases[phase].status = 'complete';
      });
      const progress = getPipelineProgress(manifest);
      expect(progress).toContain('All phases complete!');
    });
  });

  describe('initializePipeline', () => {
    it('should fail with invalid config', () => {
      const config = createOrchestratorConfig('invalid' as ViewportType);
      const result = initializePipeline(config);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid configuration');
    });

    it('should require flow definition for new pipeline', () => {
      const config = createOrchestratorConfig('mobile', {
        outputDir: '/tmp/test-ux-' + Date.now()
      });
      const result = initializePipeline(config);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Flow definition path required');
    });

    it('should fail if flow definition file not found', () => {
      const config = createOrchestratorConfig('mobile', {
        outputDir: '/tmp/test-ux-' + Date.now(),
        flowDefinitionPath: '/nonexistent/flow.json'
      });
      const result = initializePipeline(config);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Flow definition not found');
    });

    it('should return empty completedPhases for new pipeline', () => {
      const config = createOrchestratorConfig('invalid' as ViewportType);
      const result = initializePipeline(config);
      expect(result.completedPhases).toEqual([]);
    });
  });

  describe('Phase Order Validation', () => {
    it('should have capture as first phase', () => {
      expect(PHASE_ORDER[0]).toBe('capture');
    });

    it('should have specs as last phase', () => {
      expect(PHASE_ORDER[PHASE_ORDER.length - 1]).toBe('specs');
    });

    it('should have anchoring before propagation', () => {
      const anchoringIndex = PHASE_ORDER.indexOf('anchoring');
      const propagationIndex = PHASE_ORDER.indexOf('propagation');
      expect(anchoringIndex).toBeLessThan(propagationIndex);
    });

    it('should have audit before anchoring', () => {
      const auditIndex = PHASE_ORDER.indexOf('audit');
      const anchoringIndex = PHASE_ORDER.indexOf('anchoring');
      expect(auditIndex).toBeLessThan(anchoringIndex);
    });

    it('should have coherence before specs', () => {
      const coherenceIndex = PHASE_ORDER.indexOf('coherence');
      const specsIndex = PHASE_ORDER.indexOf('specs');
      expect(coherenceIndex).toBeLessThan(specsIndex);
    });
  });
});
