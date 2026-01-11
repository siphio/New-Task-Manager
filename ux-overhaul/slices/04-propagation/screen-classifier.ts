/**
 * Screen Classifier for UX Overhaul Skill
 * Classifies screens by type for appropriate prompt and strength selection
 */

import { CapturedScreen } from '../01-capture/flow-executor';

// ============================================================================
// Screen Type Constants
// ============================================================================

/**
 * Supported screen types for classification
 */
export type ScreenType =
  | 'dashboard'
  | 'list'
  | 'detail'
  | 'form'
  | 'settings'
  | 'auth'
  | 'landing'
  | 'modal'
  | 'empty'
  | 'error'
  | 'generic';

/**
 * Strength settings by screen type
 * Lower = more style influence from references
 * Higher = more structure preservation from original
 */
export const SCREEN_TYPE_STRENGTHS: Record<ScreenType, number> = {
  dashboard: 0.60,    // Medium - data-heavy, need style but preserve layout
  list: 0.55,         // Lower - uniform styling important
  detail: 0.60,       // Medium - content structure matters
  form: 0.65,         // Higher - form layout critical
  settings: 0.60,     // Medium
  auth: 0.55,         // Lower - strong branding
  landing: 0.55,      // Lower - marketing focus
  modal: 0.65,        // Higher - structure critical
  empty: 0.50,        // Lower - illustration-focused
  error: 0.50,        // Lower - consistent messaging
  generic: 0.60       // Default medium
};

/**
 * Display names for screen types
 */
const SCREEN_TYPE_DISPLAY_NAMES: Record<ScreenType, string> = {
  dashboard: 'Dashboard',
  list: 'List View',
  detail: 'Detail View',
  form: 'Form',
  settings: 'Settings',
  auth: 'Authentication',
  landing: 'Landing Page',
  modal: 'Modal Dialog',
  empty: 'Empty State',
  error: 'Error State',
  generic: 'Screen'
};

// ============================================================================
// Classification
// ============================================================================

/**
 * Classifies screen type from captured screen and optional type hint
 */
export function classifyScreen(
  screen: CapturedScreen,
  screenType?: string
): ScreenType {
  // Use provided screenType if it's a valid ScreenType
  if (screenType && isValidScreenType(screenType)) {
    return screenType as ScreenType;
  }

  // Otherwise infer from screen name
  return inferScreenTypeFromName(screen.name);
}

/**
 * Checks if a string is a valid ScreenType
 */
export function isValidScreenType(type: string): boolean {
  return Object.keys(SCREEN_TYPE_STRENGTHS).includes(type);
}

/**
 * Infers screen type from screen name patterns
 */
export function inferScreenTypeFromName(screenName: string): ScreenType {
  const nameLower = screenName.toLowerCase();

  // Auth patterns (check first since 'sign up' might otherwise match 'form')
  if (nameLower.includes('login') ||
      nameLower.includes('signin') ||
      nameLower.includes('sign-in') ||
      nameLower.includes('sign in') ||
      nameLower.includes('signup') ||
      nameLower.includes('sign-up') ||
      nameLower.includes('sign up') ||
      nameLower.includes('register') ||
      nameLower.includes('forgot') ||
      nameLower.includes('reset-password')) {
    return 'auth';
  }

  // Empty state patterns (check before list since 'no-results' contains 'results')
  if (nameLower.includes('empty') ||
      nameLower.includes('no-data') ||
      nameLower.includes('no data') ||
      nameLower.includes('no-results') ||
      nameLower.includes('no results')) {
    return 'empty';
  }

  // Dashboard patterns
  if (nameLower.includes('dashboard') ||
      nameLower.includes('overview') ||
      nameLower.includes('home') ||
      nameLower.includes('main')) {
    return 'dashboard';
  }

  // List patterns
  if (nameLower.includes('list') ||
      nameLower.includes('browse') ||
      nameLower.includes('catalog') ||
      nameLower.includes('search') ||
      nameLower.includes('results')) {
    return 'list';
  }

  // Form patterns
  if (nameLower.includes('form') ||
      nameLower.includes('edit') ||
      nameLower.includes('create') ||
      nameLower.includes('add') ||
      nameLower.includes('new')) {
    return 'form';
  }

  // Settings patterns
  if (nameLower.includes('settings') ||
      nameLower.includes('preferences') ||
      nameLower.includes('config') ||
      nameLower.includes('account') ||
      nameLower.includes('profile-settings')) {
    return 'settings';
  }

  // Detail patterns
  if (nameLower.includes('detail') ||
      nameLower.includes('view') ||
      nameLower.includes('profile') ||
      nameLower.includes('item') ||
      nameLower.includes('single')) {
    return 'detail';
  }

  // Landing patterns
  if (nameLower.includes('landing') ||
      nameLower.includes('welcome') ||
      nameLower.includes('onboard') ||
      nameLower.includes('intro') ||
      nameLower.includes('hero')) {
    return 'landing';
  }

  // Modal patterns
  if (nameLower.includes('modal') ||
      nameLower.includes('dialog') ||
      nameLower.includes('popup') ||
      nameLower.includes('confirm')) {
    return 'modal';
  }

  // Error state patterns
  if (nameLower.includes('error') ||
      nameLower.includes('404') ||
      nameLower.includes('500') ||
      nameLower.includes('not-found')) {
    return 'error';
  }

  return 'generic';
}

// ============================================================================
// Strength & Display
// ============================================================================

/**
 * Gets appropriate strength for screen type
 */
export function getStrengthForScreenType(screenType: ScreenType): number {
  return SCREEN_TYPE_STRENGTHS[screenType] || SCREEN_TYPE_STRENGTHS.generic;
}

/**
 * Gets screen type display name
 */
export function getScreenTypeDisplayName(screenType: ScreenType): string {
  return SCREEN_TYPE_DISPLAY_NAMES[screenType] || 'Screen';
}

/**
 * Gets all available screen types
 */
export function getAllScreenTypes(): ScreenType[] {
  return Object.keys(SCREEN_TYPE_STRENGTHS) as ScreenType[];
}

/**
 * Gets strength range info
 */
export function getStrengthInfo(): { min: number; max: number; default: number } {
  const values = Object.values(SCREEN_TYPE_STRENGTHS);
  return {
    min: Math.min(...values),
    max: Math.max(...values),
    default: SCREEN_TYPE_STRENGTHS.generic
  };
}

// ============================================================================
// Batch Classification
// ============================================================================

/**
 * Classifies multiple screens at once
 */
export function classifyScreens(
  screens: CapturedScreen[]
): Map<string, ScreenType> {
  const classifications = new Map<string, ScreenType>();

  for (const screen of screens) {
    classifications.set(screen.id, classifyScreen(screen));
  }

  return classifications;
}

/**
 * Gets classification statistics for a set of screens
 */
export function getClassificationStats(
  classifications: Map<string, ScreenType>
): Record<ScreenType, number> {
  const stats: Partial<Record<ScreenType, number>> = {};

  for (const type of classifications.values()) {
    stats[type] = (stats[type] || 0) + 1;
  }

  return stats as Record<ScreenType, number>;
}
