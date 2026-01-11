/**
 * Playwright MCP Adapter for UX Overhaul Skill
 * Abstracts Playwright MCP tool calls for capture operations
 *
 * NOTE: This adapter is designed to work with the Microsoft Playwright MCP server.
 * The actual MCP calls are made by Claude Code - this module provides the structure
 * and types for organizing capture operations.
 */

export interface NavigationOptions {
  waitAfterNavigation?: number;
}

export interface ScreenshotOptions {
  fullPage?: boolean;
  filename?: string;
}

export interface ClickOptions {
  doubleClick?: boolean;
  button?: 'left' | 'right' | 'middle';
}

export interface TypeOptions {
  submit?: boolean;
  slowly?: boolean;
}

export interface PlaywrightAction {
  type: 'navigate' | 'screenshot' | 'click' | 'type' | 'hover' | 'select' | 'wait' | 'scroll' | 'snapshot';
  params: Record<string, unknown>;
}

export interface PlaywrightResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface ViewportConfig {
  width: number;
  height: number;
  deviceScaleFactor?: number;
  isMobile?: boolean;
  hasTouch?: boolean;
}

/**
 * Builds a navigation action
 */
export function buildNavigateAction(url: string, options?: NavigationOptions): PlaywrightAction {
  return {
    type: 'navigate',
    params: {
      url,
      ...options
    }
  };
}

/**
 * Builds a screenshot action
 */
export function buildScreenshotAction(options?: ScreenshotOptions): PlaywrightAction {
  return {
    type: 'screenshot',
    params: {
      fullPage: options?.fullPage ?? true,
      filename: options?.filename
    }
  };
}

/**
 * Builds a click action
 */
export function buildClickAction(
  selector: string,
  options?: ClickOptions
): PlaywrightAction {
  return {
    type: 'click',
    params: {
      element: selector,
      ...options
    }
  };
}

/**
 * Builds a type action
 */
export function buildTypeAction(
  selector: string,
  text: string,
  options?: TypeOptions
): PlaywrightAction {
  return {
    type: 'type',
    params: {
      element: selector,
      text,
      ...options
    }
  };
}

/**
 * Builds a hover action
 */
export function buildHoverAction(selector: string): PlaywrightAction {
  return {
    type: 'hover',
    params: { element: selector }
  };
}

/**
 * Builds a select action
 */
export function buildSelectAction(selector: string, values: string[]): PlaywrightAction {
  return {
    type: 'select',
    params: {
      element: selector,
      values
    }
  };
}

/**
 * Builds a wait action
 */
export function buildWaitAction(ms: number): PlaywrightAction {
  return {
    type: 'wait',
    params: { ms }
  };
}

/**
 * Builds a scroll action
 */
export function buildScrollAction(direction: 'up' | 'down', amount?: number): PlaywrightAction {
  return {
    type: 'scroll',
    params: { direction, amount }
  };
}

/**
 * Builds an accessibility snapshot action
 */
export function buildSnapshotAction(): PlaywrightAction {
  return {
    type: 'snapshot',
    params: {}
  };
}

/**
 * Converts a flow step to Playwright actions
 */
export function flowStepToActions(step: {
  action: string;
  url?: string;
  selector?: string;
  text?: string;
  name?: string;
  waitMs?: number;
}): PlaywrightAction[] {
  const actions: PlaywrightAction[] = [];

  switch (step.action) {
    case 'navigate':
      if (step.url) {
        actions.push(buildNavigateAction(step.url));
      }
      break;

    case 'click':
      if (step.selector) {
        actions.push(buildClickAction(step.selector));
      }
      break;

    case 'type':
      if (step.selector && step.text) {
        actions.push(buildTypeAction(step.selector, step.text));
      }
      break;

    case 'screenshot':
      actions.push(buildScreenshotAction({ filename: step.name }));
      break;

    case 'wait':
      actions.push(buildWaitAction(step.waitMs || 1000));
      break;

    case 'hover':
      if (step.selector) {
        actions.push(buildHoverAction(step.selector));
      }
      break;

    case 'scroll':
      actions.push(buildScrollAction('down'));
      break;

    case 'select':
      if (step.selector && step.text) {
        actions.push(buildSelectAction(step.selector, [step.text]));
      }
      break;
  }

  return actions;
}

/**
 * Generates MCP tool call instructions for Claude Code
 * This returns human-readable instructions that map to MCP tools
 */
export function generateMcpInstructions(actions: PlaywrightAction[]): string[] {
  return actions.map(action => {
    switch (action.type) {
      case 'navigate':
        return `Use browser_navigate to go to: ${action.params.url}`;
      case 'screenshot':
        return `Use browser_take_screenshot${action.params.fullPage ? ' with fullPage: true' : ''}${action.params.filename ? ` saving as ${action.params.filename}` : ''}`;
      case 'click':
        return `Use browser_click on element: ${action.params.element}`;
      case 'type':
        return `Use browser_type to enter "${action.params.text}" into: ${action.params.element}`;
      case 'hover':
        return `Use browser_hover on element: ${action.params.element}`;
      case 'select':
        return `Use browser_select_option on: ${action.params.element}`;
      case 'wait':
        return `Wait for ${action.params.ms}ms`;
      case 'snapshot':
        return `Use browser_snapshot to capture accessibility tree`;
      default:
        return `Unknown action: ${action.type}`;
    }
  });
}

/**
 * Creates viewport configuration for Playwright
 */
export function createViewportConfig(preset: string): ViewportConfig | null {
  const presets: Record<string, ViewportConfig> = {
    'mobile': {
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true
    },
    'tablet': {
      width: 768,
      height: 1024,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true
    },
    'desktop': {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: false
    },
    'desktop-xl': {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: false
    }
  };

  return presets[preset] || null;
}

/**
 * Builds launch browser instructions
 */
export function buildLaunchInstructions(viewport: ViewportConfig): string {
  return `Launch browser with viewport: ${viewport.width}x${viewport.height}, ` +
    `deviceScaleFactor: ${viewport.deviceScaleFactor}, ` +
    `mobile: ${viewport.isMobile}, touch: ${viewport.hasTouch}`;
}
