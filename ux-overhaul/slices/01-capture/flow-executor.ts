/**
 * Flow Executor for UX Overhaul Skill
 * Orchestrates execution of flow definitions for capture
 */

import {
  flowStepToActions,
  generateMcpInstructions,
  PlaywrightAction,
  ViewportConfig,
  createViewportConfig
} from './playwright-adapter';

export interface FlowStep {
  action: 'navigate' | 'click' | 'type' | 'screenshot' | 'wait' | 'scroll' | 'select' | 'hover';
  url?: string;
  selector?: string;
  text?: string;
  name?: string;
  description?: string;
  waitMs?: number;
  captureStates?: ('default' | 'loading' | 'empty' | 'error' | 'filled' | 'hover' | 'focus')[];
}

export interface Flow {
  name: string;
  description?: string;
  steps: FlowStep[];
}

export interface AuthConfig {
  type: 'none' | 'form' | 'oauth' | 'basic' | 'manual';
  loginUrl?: string;
  usernameSelector?: string;
  passwordSelector?: string;
  submitSelector?: string;
  credentials?: {
    username: string;
    password: string;
  };
}

export interface FlowDefinition {
  appName: string;
  baseUrl: string;
  auth?: AuthConfig;
  flows: Flow[];
}

export interface ExecutionStep {
  flowName: string;
  stepIndex: number;
  step: FlowStep;
  actions: PlaywrightAction[];
  instructions: string[];
}

export interface ExecutionPlan {
  appName: string;
  baseUrl: string;
  viewport: ViewportConfig;
  authSteps: ExecutionStep[];
  flowSteps: ExecutionStep[];
  totalScreenshots: number;
  estimatedDuration: number; // in seconds
}

export interface CapturedScreen {
  id: string;
  name: string;
  description?: string;
  flowName: string;
  order: number;
  url: string;
  screenshotPath: string;
  states: { type: string; screenshotPath: string }[];
}

/**
 * Validates a flow definition
 */
export function validateFlowDefinition(definition: FlowDefinition): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!definition.appName) {
    errors.push('appName is required');
  }

  if (!definition.baseUrl) {
    errors.push('baseUrl is required');
  }

  if (!definition.flows || definition.flows.length === 0) {
    errors.push('At least one flow is required');
  }

  for (const flow of definition.flows || []) {
    if (!flow.name) {
      errors.push('Each flow must have a name');
    }
    if (!flow.steps || flow.steps.length === 0) {
      errors.push(`Flow "${flow.name}" must have at least one step`);
    }

    for (let i = 0; i < (flow.steps || []).length; i++) {
      const step = flow.steps[i];
      if (!step.action) {
        errors.push(`Step ${i + 1} in flow "${flow.name}" must have an action`);
      }
      if (step.action === 'navigate' && !step.url) {
        errors.push(`Navigate step ${i + 1} in flow "${flow.name}" requires a url`);
      }
      if (['click', 'type', 'hover', 'select'].includes(step.action) && !step.selector) {
        errors.push(`${step.action} step ${i + 1} in flow "${flow.name}" requires a selector`);
      }
      if (step.action === 'type' && !step.text) {
        errors.push(`Type step ${i + 1} in flow "${flow.name}" requires text`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Builds an execution plan from a flow definition
 */
export function buildExecutionPlan(
  definition: FlowDefinition,
  viewportPreset: string
): ExecutionPlan {
  const viewport = createViewportConfig(viewportPreset);
  if (!viewport) {
    throw new Error(`Unknown viewport preset: ${viewportPreset}`);
  }

  const authSteps: ExecutionStep[] = [];
  const flowSteps: ExecutionStep[] = [];
  let totalScreenshots = 0;

  // Build auth steps if needed
  if (definition.auth && definition.auth.type === 'form') {
    const auth = definition.auth;
    if (auth.loginUrl) {
      authSteps.push(createExecutionStep('auth', 0, {
        action: 'navigate',
        url: auth.loginUrl
      }));
    }
    if (auth.usernameSelector && auth.credentials?.username) {
      authSteps.push(createExecutionStep('auth', 1, {
        action: 'type',
        selector: auth.usernameSelector,
        text: auth.credentials.username
      }));
    }
    if (auth.passwordSelector && auth.credentials?.password) {
      authSteps.push(createExecutionStep('auth', 2, {
        action: 'type',
        selector: auth.passwordSelector,
        text: auth.credentials.password
      }));
    }
    if (auth.submitSelector) {
      authSteps.push(createExecutionStep('auth', 3, {
        action: 'click',
        selector: auth.submitSelector
      }));
      authSteps.push(createExecutionStep('auth', 4, {
        action: 'wait',
        waitMs: 2000
      }));
    }
  }

  // Build flow steps
  for (const flow of definition.flows) {
    for (let i = 0; i < flow.steps.length; i++) {
      const step = flow.steps[i];
      flowSteps.push(createExecutionStep(flow.name, i, step));

      if (step.action === 'screenshot') {
        totalScreenshots++;
        // Add additional states if specified
        if (step.captureStates) {
          totalScreenshots += step.captureStates.length - 1; // -1 for default already counted
        }
      }
    }
  }

  // Estimate duration: ~3 seconds per step on average
  const estimatedDuration = (authSteps.length + flowSteps.length) * 3;

  return {
    appName: definition.appName,
    baseUrl: definition.baseUrl,
    viewport,
    authSteps,
    flowSteps,
    totalScreenshots,
    estimatedDuration
  };
}

/**
 * Creates an execution step from a flow step
 */
function createExecutionStep(flowName: string, stepIndex: number, step: FlowStep): ExecutionStep {
  const actions = flowStepToActions(step);
  const instructions = generateMcpInstructions(actions);

  return {
    flowName,
    stepIndex,
    step,
    actions,
    instructions
  };
}

/**
 * Generates auth steps for form-based authentication
 */
export function generateAuthSteps(auth: AuthConfig): FlowStep[] {
  const steps: FlowStep[] = [];

  if (auth.type !== 'form') {
    return steps;
  }

  if (auth.loginUrl) {
    steps.push({ action: 'navigate', url: auth.loginUrl });
  }

  if (auth.usernameSelector && auth.credentials?.username) {
    steps.push({
      action: 'type',
      selector: auth.usernameSelector,
      text: auth.credentials.username
    });
  }

  if (auth.passwordSelector && auth.credentials?.password) {
    steps.push({
      action: 'type',
      selector: auth.passwordSelector,
      text: auth.credentials.password
    });
  }

  if (auth.submitSelector) {
    steps.push({ action: 'click', selector: auth.submitSelector });
    steps.push({ action: 'wait', waitMs: 2000 });
  }

  return steps;
}

/**
 * Estimates execution time for a flow definition
 */
export function estimateExecutionTime(definition: FlowDefinition): number {
  let totalSteps = 0;

  if (definition.auth?.type === 'form') {
    totalSteps += 4; // Navigate, username, password, submit
  }

  for (const flow of definition.flows) {
    totalSteps += flow.steps.length;
  }

  // ~3 seconds per step average
  return totalSteps * 3;
}

/**
 * Gets all screenshot steps from a flow definition
 */
export function getScreenshotSteps(definition: FlowDefinition): { flow: string; step: FlowStep }[] {
  const screenshots: { flow: string; step: FlowStep }[] = [];

  for (const flow of definition.flows) {
    for (const step of flow.steps) {
      if (step.action === 'screenshot') {
        screenshots.push({ flow: flow.name, step });
      }
    }
  }

  return screenshots;
}

/**
 * Generates a unique screen ID
 */
export function generateScreenId(flowName: string, screenName: string): string {
  const safeName = screenName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const safeFlow = flowName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return `${safeFlow}-${safeName}`;
}

/**
 * Creates a CapturedScreen record
 */
export function createCapturedScreen(
  flowName: string,
  step: FlowStep,
  order: number,
  url: string,
  screenshotPath: string
): CapturedScreen {
  return {
    id: generateScreenId(flowName, step.name || `screen-${order}`),
    name: step.name || `Screen ${order}`,
    description: step.description,
    flowName,
    order,
    url,
    screenshotPath,
    states: [{ type: 'default', screenshotPath }]
  };
}

/**
 * Formats execution plan as human-readable summary
 */
export function formatExecutionPlanSummary(plan: ExecutionPlan): string {
  const lines = [
    `Execution Plan for: ${plan.appName}`,
    `Base URL: ${plan.baseUrl}`,
    `Viewport: ${plan.viewport.width}x${plan.viewport.height}`,
    '',
    `Auth Steps: ${plan.authSteps.length}`,
    `Flow Steps: ${plan.flowSteps.length}`,
    `Total Screenshots: ${plan.totalScreenshots}`,
    `Estimated Duration: ${Math.ceil(plan.estimatedDuration / 60)} minutes`,
    '',
    'Steps:'
  ];

  for (const step of [...plan.authSteps, ...plan.flowSteps]) {
    lines.push(`  [${step.flowName}] ${step.step.action}${step.step.name ? `: ${step.step.name}` : ''}`);
  }

  return lines.join('\n');
}
