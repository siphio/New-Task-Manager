/**
 * Manifest utilities for UX Overhaul Skill
 * Handles progress tracking and state persistence
 */

import * as path from 'path';
import { readJson, writeJson, fileExists, FileResult } from './file';

export type PhaseStatus = 'pending' | 'in_progress' | 'complete' | 'skipped' | 'failed';

export interface PhaseState {
  status: PhaseStatus;
  startedAt?: string;
  completedAt?: string;
  currentBatch?: number;
  screensCompleted?: number;
  anchorsGenerated?: number;
  error?: string;
}

export interface Manifest {
  projectId: string;
  createdAt: string;
  updatedAt: string;
  viewport: 'mobile' | 'tablet' | 'desktop' | 'desktop-xl';
  appUrl: string;
  phases: {
    capture: PhaseState;
    audit: PhaseState;
    anchoring: PhaseState;
    propagation: PhaseState;
    states: PhaseState;
    coherence: PhaseState;
    specs: PhaseState;
  };
  totalScreens: number;
  styleConfig?: Record<string, unknown>;
}

const MANIFEST_FILENAME = 'manifest.json';

/**
 * Creates a new manifest with default values
 */
export function createManifest(
  projectId: string,
  appUrl: string,
  viewport: Manifest['viewport']
): Manifest {
  const now = new Date().toISOString();

  const defaultPhase: PhaseState = { status: 'pending' };

  return {
    projectId,
    createdAt: now,
    updatedAt: now,
    viewport,
    appUrl,
    phases: {
      capture: { ...defaultPhase },
      audit: { ...defaultPhase },
      anchoring: { ...defaultPhase },
      propagation: { ...defaultPhase },
      states: { ...defaultPhase },
      coherence: { ...defaultPhase },
      specs: { ...defaultPhase }
    },
    totalScreens: 0
  };
}

/**
 * Reads manifest from project directory
 */
export function readManifest(outputDir: string): FileResult<Manifest> {
  const manifestPath = path.join(outputDir, MANIFEST_FILENAME);
  return readJson<Manifest>(manifestPath);
}

/**
 * Writes manifest to project directory
 */
export function writeManifest(outputDir: string, manifest: Manifest): FileResult<void> {
  manifest.updatedAt = new Date().toISOString();
  const manifestPath = path.join(outputDir, MANIFEST_FILENAME);
  return writeJson(manifestPath, manifest);
}

/**
 * Checks if a manifest exists in the output directory
 */
export function manifestExists(outputDir: string): boolean {
  const manifestPath = path.join(outputDir, MANIFEST_FILENAME);
  return fileExists(manifestPath);
}

/**
 * Updates a specific phase status
 */
export function updatePhaseStatus(
  manifest: Manifest,
  phase: keyof Manifest['phases'],
  status: PhaseStatus,
  additionalData?: Partial<PhaseState>
): Manifest {
  const now = new Date().toISOString();

  manifest.phases[phase] = {
    ...manifest.phases[phase],
    status,
    ...additionalData
  };

  if (status === 'in_progress' && !manifest.phases[phase].startedAt) {
    manifest.phases[phase].startedAt = now;
  }

  if (status === 'complete' || status === 'failed') {
    manifest.phases[phase].completedAt = now;
  }

  manifest.updatedAt = now;
  return manifest;
}

/**
 * Gets the current phase (first non-complete phase)
 */
export function getCurrentPhase(manifest: Manifest): keyof Manifest['phases'] | null {
  const phaseOrder: (keyof Manifest['phases'])[] = [
    'capture', 'audit', 'anchoring', 'propagation', 'states', 'coherence', 'specs'
  ];

  for (const phase of phaseOrder) {
    if (manifest.phases[phase].status !== 'complete' &&
        manifest.phases[phase].status !== 'skipped') {
      return phase;
    }
  }

  return null; // All phases complete
}

/**
 * Checks if a specific phase can be started
 */
export function canStartPhase(
  manifest: Manifest,
  phase: keyof Manifest['phases']
): { canStart: boolean; reason?: string } {
  const phaseOrder: (keyof Manifest['phases'])[] = [
    'capture', 'audit', 'anchoring', 'propagation', 'states', 'coherence', 'specs'
  ];

  const phaseIndex = phaseOrder.indexOf(phase);

  // Check if previous phases are complete
  for (let i = 0; i < phaseIndex; i++) {
    const prevPhase = phaseOrder[i];
    const status = manifest.phases[prevPhase].status;
    if (status !== 'complete' && status !== 'skipped') {
      return {
        canStart: false,
        reason: `Phase "${prevPhase}" must be completed first`
      };
    }
  }

  return { canStart: true };
}

/**
 * Increments batch progress for propagation/states phases
 */
export function incrementBatchProgress(
  manifest: Manifest,
  phase: 'propagation' | 'states',
  screensInBatch: number
): Manifest {
  const currentBatch = manifest.phases[phase].currentBatch || 1;
  const screensCompleted = (manifest.phases[phase].screensCompleted || 0) + screensInBatch;

  manifest.phases[phase].currentBatch = currentBatch + 1;
  manifest.phases[phase].screensCompleted = screensCompleted;
  manifest.updatedAt = new Date().toISOString();

  return manifest;
}

/**
 * Gets a summary of manifest status for display
 */
export function getManifestSummary(manifest: Manifest): string {
  const lines = [
    `Project: ${manifest.projectId}`,
    `Viewport: ${manifest.viewport}`,
    `App URL: ${manifest.appUrl}`,
    `Total Screens: ${manifest.totalScreens}`,
    '',
    'Phase Status:'
  ];

  for (const [phase, state] of Object.entries(manifest.phases)) {
    const status = state.status.toUpperCase().padEnd(12);
    lines.push(`  ${phase.padEnd(12)} ${status}`);
  }

  return lines.join('\n');
}

/**
 * Checks if all phases are complete
 */
export function isProjectComplete(manifest: Manifest): boolean {
  return Object.values(manifest.phases).every(
    phase => phase.status === 'complete' || phase.status === 'skipped'
  );
}

/**
 * Gets the next phase to work on
 */
export function getNextPhase(manifest: Manifest): keyof Manifest['phases'] | null {
  return getCurrentPhase(manifest);
}

/**
 * Calculates overall progress percentage
 */
export function getProgressPercentage(manifest: Manifest): number {
  const phases = Object.values(manifest.phases);
  const completed = phases.filter(p => p.status === 'complete' || p.status === 'skipped').length;
  return Math.round((completed / phases.length) * 100);
}

/**
 * Sets total screens count
 */
export function setTotalScreens(manifest: Manifest, count: number): Manifest {
  manifest.totalScreens = count;
  manifest.updatedAt = new Date().toISOString();
  return manifest;
}

/**
 * Sets style configuration
 */
export function setStyleConfig(manifest: Manifest, config: Record<string, unknown>): Manifest {
  manifest.styleConfig = config;
  manifest.updatedAt = new Date().toISOString();
  return manifest;
}

// ============================================================================
// Anchoring Phase Helpers
// ============================================================================

/**
 * Sets anchor count in manifest
 */
export function setAnchorCount(manifest: Manifest, count: number): Manifest {
  if (!manifest.phases.anchoring.anchorsGenerated) {
    manifest.phases.anchoring.anchorsGenerated = 0;
  }
  manifest.phases.anchoring.anchorsGenerated = count;
  manifest.updatedAt = new Date().toISOString();
  return manifest;
}

/**
 * Increments anchor progress
 */
export function incrementAnchorProgress(manifest: Manifest): Manifest {
  if (!manifest.phases.anchoring.anchorsGenerated) {
    manifest.phases.anchoring.anchorsGenerated = 0;
  }
  manifest.phases.anchoring.anchorsGenerated++;
  manifest.updatedAt = new Date().toISOString();
  return manifest;
}

/**
 * Gets current anchor count
 */
export function getAnchorCount(manifest: Manifest): number {
  return manifest.phases.anchoring.anchorsGenerated || 0;
}

/**
 * Checks if anchoring is complete (14 anchors generated)
 */
export function isAnchoringComplete(manifest: Manifest): boolean {
  return (manifest.phases.anchoring.anchorsGenerated || 0) >= 14;
}
