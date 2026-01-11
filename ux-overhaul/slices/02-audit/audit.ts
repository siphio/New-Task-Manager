/**
 * Audit Orchestrator for UX Overhaul Skill
 * Main entry point for the audit phase
 */

import * as path from 'path';
import { readJson, writeJson, FileResult } from '../../core/utils/file';
import {
  readManifest,
  writeManifest,
  updatePhaseStatus,
  canStartPhase,
  Manifest
} from '../../core/utils/manifest';
import { AppUnderstanding } from '../01-capture/capture';
import { DomAnalysis } from '../01-capture/dom-analyzer';
import { CapturedScreen } from '../01-capture/flow-executor';
import { evaluateScreen, Framework } from './evaluator';
import { generateImprovementPlan } from './issue-prioritizer';

// ============================================================================
// Types
// ============================================================================

export type Severity = 'critical' | 'high' | 'medium' | 'low';

/**
 * Single audit finding
 */
export interface Issue {
  id: string;
  principle: string;
  principleId: string;
  category: string;
  severity: Severity;
  description: string;
  affectedElements?: string[];
  recommendation: string;
  promptInjection: string;
}

/**
 * Per-screen audit results
 */
export interface ScreenAudit {
  screenId: string;
  screenName: string;
  screenType: string;
  issues: Issue[];
  issueCount: number;
}

/**
 * Aggregated audit summary
 */
export interface AuditSummary {
  totalIssues: number;
  bySeverity: Record<Severity, number>;
  byPrinciple: Record<string, number>;
  byCategory: Record<string, number>;
  topIssues: Issue[];
}

/**
 * Complete audit report
 */
export interface AuditReport {
  auditedAt: string;
  appName: string;
  viewport: string;
  screens: ScreenAudit[];
  summary: AuditSummary;
}

/**
 * Prompt-ready improvement recommendation
 */
export interface Improvement {
  id: string;
  principle: string;
  principleId: string;
  category: string;
  severity: Severity;
  recommendation: string;
  promptText: string;
  affectedScreens: string[];
}

/**
 * Per-screen improvement recommendations
 */
export interface ScreenImprovement {
  screenId: string;
  screenName: string;
  screenType: string;
  improvements: Improvement[];
  promptInjections: string[];
}

/**
 * Aggregated improvement plan
 */
export interface ImprovementPlan {
  generatedAt: string;
  appName: string;
  globalImprovements: Improvement[];
  prioritizedImprovements: Improvement[];
  screenImprovements: ScreenImprovement[];
}

/**
 * Audit configuration
 */
export interface AuditConfig {
  outputDir: string;
  frameworks?: Framework[];
  severityThreshold?: Severity;
}

/**
 * Audit operation result
 */
export interface AuditResult {
  success: boolean;
  manifest?: Manifest;
  auditReport?: AuditReport;
  improvementPlan?: ImprovementPlan;
  error?: string;
}

// ============================================================================
// Configuration
// ============================================================================

const DEFAULT_FRAMEWORKS: Framework[] = ['nielsen', 'laws-of-ux', 'wcag'];
const DEFAULT_SEVERITY_THRESHOLD: Severity = 'low';

/**
 * Creates audit config from arguments
 */
export function createAuditConfig(
  outputDir: string,
  options?: Partial<AuditConfig>
): AuditConfig {
  return {
    outputDir,
    frameworks: options?.frameworks || DEFAULT_FRAMEWORKS,
    severityThreshold: options?.severityThreshold || DEFAULT_SEVERITY_THRESHOLD
  };
}

// ============================================================================
// Initialization
// ============================================================================

/**
 * Initializes audit session
 */
export function initializeAudit(config: AuditConfig): AuditResult {
  // Read manifest
  const manifestResult = readManifest(config.outputDir);
  if (!manifestResult.success || !manifestResult.data) {
    return { success: false, error: `Failed to read manifest: ${manifestResult.error}` };
  }

  const manifest = manifestResult.data;

  // Check if audit can start
  const canStart = canStartPhase(manifest, 'audit');
  if (!canStart.canStart) {
    return { success: false, error: canStart.reason };
  }

  // Update phase status
  updatePhaseStatus(manifest, 'audit', 'in_progress');

  // Write manifest
  const writeResult = writeManifest(config.outputDir, manifest);
  if (!writeResult.success) {
    return { success: false, error: writeResult.error };
  }

  return { success: true, manifest };
}

// ============================================================================
// Audit Execution
// ============================================================================

/**
 * Runs audit on all captured screens
 */
export function runAudit(
  config: AuditConfig,
  appUnderstanding: AppUnderstanding,
  screenAnalyses: Map<string, DomAnalysis>
): AuditResult {
  const frameworks = config.frameworks || DEFAULT_FRAMEWORKS;
  const screenAudits: ScreenAudit[] = [];

  // Process each screen
  for (const screen of appUnderstanding.screens) {
    const analysis = screenAnalyses.get(screen.id);
    if (!analysis) {
      continue; // Skip screens without analysis
    }

    const result = evaluateScreen(screen, analysis, frameworks);
    if (!result.success || !result.data) {
      continue; // Skip failed evaluations
    }

    // Filter by severity threshold
    const filteredIssues = filterBySeverity(
      result.data.issues,
      config.severityThreshold || DEFAULT_SEVERITY_THRESHOLD
    );

    screenAudits.push({
      screenId: screen.id,
      screenName: screen.name,
      screenType: result.data.screenType,
      issues: filteredIssues,
      issueCount: filteredIssues.length
    });
  }

  // Generate summary
  const summary = generateAuditSummary(screenAudits);

  // Build report
  const auditReport: AuditReport = {
    auditedAt: new Date().toISOString(),
    appName: appUnderstanding.appName,
    viewport: appUnderstanding.viewport.name,
    screens: screenAudits,
    summary
  };

  // Generate improvement plan
  const improvementPlan = generateImprovementPlan(auditReport);

  return {
    success: true,
    auditReport,
    improvementPlan
  };
}

/**
 * Filters issues by severity threshold
 */
function filterBySeverity(issues: Issue[], threshold: Severity): Issue[] {
  const severityOrder: Severity[] = ['critical', 'high', 'medium', 'low'];
  const thresholdIndex = severityOrder.indexOf(threshold);

  return issues.filter(issue => {
    const issueIndex = severityOrder.indexOf(issue.severity);
    return issueIndex <= thresholdIndex;
  });
}

/**
 * Generates aggregated audit summary
 */
function generateAuditSummary(screenAudits: ScreenAudit[]): AuditSummary {
  const allIssues: Issue[] = screenAudits.flatMap(s => s.issues);

  // Count by severity
  const bySeverity: Record<Severity, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0
  };

  // Count by principle and category
  const byPrinciple: Record<string, number> = {};
  const byCategory: Record<string, number> = {};

  for (const issue of allIssues) {
    bySeverity[issue.severity]++;
    byPrinciple[issue.principle] = (byPrinciple[issue.principle] || 0) + 1;
    byCategory[issue.category] = (byCategory[issue.category] || 0) + 1;
  }

  // Get top issues (sorted by severity then by occurrence)
  const topIssues = [...allIssues]
    .sort((a, b) => {
      const severityOrder: Severity[] = ['critical', 'high', 'medium', 'low'];
      return severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity);
    })
    .slice(0, 10);

  return {
    totalIssues: allIssues.length,
    bySeverity,
    byPrinciple,
    byCategory,
    topIssues
  };
}

// ============================================================================
// Completion
// ============================================================================

/**
 * Completes audit phase
 */
export function completeAudit(
  outputDir: string,
  auditReport: AuditReport,
  improvementPlan: ImprovementPlan
): AuditResult {
  // Write audit report
  const reportPath = path.join(outputDir, 'audit_report.json');
  const reportResult = writeJson(reportPath, auditReport);
  if (!reportResult.success) {
    return { success: false, error: `Failed to write audit report: ${reportResult.error}` };
  }

  // Write improvement plan
  const planPath = path.join(outputDir, 'improvement_plan.json');
  const planResult = writeJson(planPath, improvementPlan);
  if (!planResult.success) {
    return { success: false, error: `Failed to write improvement plan: ${planResult.error}` };
  }

  // Update manifest
  const manifestResult = readManifest(outputDir);
  if (!manifestResult.success || !manifestResult.data) {
    return { success: false, error: `Failed to read manifest: ${manifestResult.error}` };
  }

  const manifest = manifestResult.data;
  updatePhaseStatus(manifest, 'audit', 'complete');

  const writeManifestResult = writeManifest(outputDir, manifest);
  if (!writeManifestResult.success) {
    return { success: false, error: writeManifestResult.error };
  }

  return {
    success: true,
    manifest,
    auditReport,
    improvementPlan
  };
}

// ============================================================================
// Summary & Display
// ============================================================================

/**
 * Generates human-readable audit summary
 */
export function getAuditSummary(report: AuditReport): string {
  const { summary } = report;
  const lines = [
    `Audit Complete: ${report.appName}`,
    `Viewport: ${report.viewport}`,
    `Audited At: ${report.auditedAt}`,
    '',
    `Total Issues: ${summary.totalIssues}`,
    '',
    'Issues by Severity:',
    `  Critical: ${summary.bySeverity.critical}`,
    `  High:     ${summary.bySeverity.high}`,
    `  Medium:   ${summary.bySeverity.medium}`,
    `  Low:      ${summary.bySeverity.low}`,
    ''
  ];

  if (summary.topIssues.length > 0) {
    lines.push('Top Issues:');
    for (const issue of summary.topIssues.slice(0, 5)) {
      lines.push(`  [${issue.severity.toUpperCase()}] ${issue.principleId}: ${issue.description}`);
    }
  }

  return lines.join('\n');
}

/**
 * Gets a brief status line
 */
export function getAuditStatusLine(report: AuditReport): string {
  const { summary } = report;
  return `${summary.totalIssues} issues found (${summary.bySeverity.critical} critical, ${summary.bySeverity.high} high)`;
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Loads app understanding from output directory
 */
export function loadAppUnderstanding(outputDir: string): FileResult<AppUnderstanding> {
  const filePath = path.join(outputDir, 'app_understanding.json');
  return readJson<AppUnderstanding>(filePath);
}

/**
 * Loads saved audit report
 */
export function loadAuditReport(outputDir: string): FileResult<AuditReport> {
  const filePath = path.join(outputDir, 'audit_report.json');
  return readJson<AuditReport>(filePath);
}

/**
 * Loads saved improvement plan
 */
export function loadImprovementPlan(outputDir: string): FileResult<ImprovementPlan> {
  const filePath = path.join(outputDir, 'improvement_plan.json');
  return readJson<ImprovementPlan>(filePath);
}
