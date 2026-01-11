/**
 * DOM Analyzer for UX Overhaul Skill
 * Extracts patterns and metadata from captured DOM snapshots
 */

export interface InteractiveElement {
  type: 'button' | 'link' | 'input' | 'select' | 'checkbox' | 'radio' | 'textarea';
  selector: string;
  text?: string;
  purpose?: string;
  ariaLabel?: string;
}

export interface HeadingElement {
  level: number;
  text: string;
}

export interface FormInfo {
  id?: string;
  fields: number;
  hasLabels: boolean;
  hasValidation: boolean;
}

export interface ImageInfo {
  total: number;
  withAlt: number;
  decorative: number;
}

export interface DomAnalysis {
  interactiveElements: InteractiveElement[];
  headings: HeadingElement[];
  forms: FormInfo[];
  images: ImageInfo;
  landmarks: string[];
  colorPatterns: ColorPattern[];
  textContent: TextAnalysis;
}

export interface ColorPattern {
  hex: string;
  usage: 'background' | 'text' | 'border' | 'accent' | 'unknown';
  frequency: number;
}

export interface TextAnalysis {
  totalTextNodes: number;
  averageLength: number;
  hasProperHeadings: boolean;
}

/**
 * Parses an accessibility snapshot to extract interactive elements
 * Note: The actual snapshot comes from Playwright MCP browser_snapshot
 */
export function parseAccessibilitySnapshot(snapshot: string): Partial<DomAnalysis> {
  const analysis: Partial<DomAnalysis> = {
    interactiveElements: [],
    headings: [],
    landmarks: []
  };

  // Parse button elements
  const buttonMatches = snapshot.match(/button\s+"([^"]+)"/g) || [];
  for (const match of buttonMatches) {
    const text = match.match(/"([^"]+)"/)?.[1];
    if (text) {
      analysis.interactiveElements!.push({
        type: 'button',
        selector: `button:has-text("${text}")`,
        text,
        purpose: inferPurpose(text, 'button')
      });
    }
  }

  // Parse link elements
  const linkMatches = snapshot.match(/link\s+"([^"]+)"/g) || [];
  for (const match of linkMatches) {
    const text = match.match(/"([^"]+)"/)?.[1];
    if (text) {
      analysis.interactiveElements!.push({
        type: 'link',
        selector: `a:has-text("${text}")`,
        text,
        purpose: inferPurpose(text, 'link')
      });
    }
  }

  // Parse heading elements
  const headingMatches = snapshot.match(/heading\s+"([^"]+)"\s+\[level=(\d)\]/g) || [];
  for (const match of headingMatches) {
    const parts = match.match(/heading\s+"([^"]+)"\s+\[level=(\d)\]/);
    if (parts) {
      analysis.headings!.push({
        text: parts[1],
        level: parseInt(parts[2], 10)
      });
    }
  }

  // Parse landmarks
  const landmarkTypes = ['banner', 'navigation', 'main', 'contentinfo', 'complementary', 'form', 'search'];
  for (const landmark of landmarkTypes) {
    if (snapshot.toLowerCase().includes(landmark)) {
      analysis.landmarks!.push(landmark);
    }
  }

  return analysis;
}

/**
 * Infers the purpose of an interactive element from its text
 */
export function inferPurpose(text: string, type: string): string {
  const lowerText = text.toLowerCase();

  // Common action patterns
  const patterns: [RegExp, string][] = [
    [/submit|save|confirm|done|apply/i, 'submission'],
    [/cancel|close|dismiss|back/i, 'dismissal'],
    [/add|create|new|plus/i, 'creation'],
    [/edit|modify|update|change/i, 'modification'],
    [/delete|remove|trash/i, 'deletion'],
    [/search|find|filter/i, 'search'],
    [/login|sign\s*in|authenticate/i, 'authentication'],
    [/logout|sign\s*out/i, 'logout'],
    [/register|sign\s*up|join/i, 'registration'],
    [/next|continue|proceed/i, 'navigation-forward'],
    [/prev|previous|back/i, 'navigation-backward'],
    [/menu|hamburger|nav/i, 'menu-toggle'],
    [/settings|preferences|config/i, 'settings'],
    [/help|\?|support/i, 'help'],
    [/share|export/i, 'sharing'],
    [/download|export/i, 'download'],
    [/upload|import/i, 'upload']
  ];

  for (const [pattern, purpose] of patterns) {
    if (pattern.test(lowerText)) {
      return purpose;
    }
  }

  return type === 'link' ? 'navigation' : 'action';
}

/**
 * Classifies screen type based on DOM analysis
 */
export function classifyScreenType(analysis: DomAnalysis): string {
  // Check for form-heavy screens
  if (analysis.forms.length > 0 && analysis.forms.some(f => f.fields > 3)) {
    // Check for auth patterns
    const hasPasswordField = analysis.interactiveElements.some(
      el => el.type === 'input' && el.text?.toLowerCase().includes('password')
    );
    if (hasPasswordField) {
      return 'auth';
    }
    return 'form';
  }

  // Check for dashboard patterns (multiple data sections, metrics)
  const hasMultipleHeadings = analysis.headings.length > 3;
  const hasDataElements = analysis.interactiveElements.filter(
    el => el.purpose === 'action' || el.purpose === 'navigation'
  ).length > 5;
  if (hasMultipleHeadings && hasDataElements) {
    return 'dashboard';
  }

  // Check for list patterns
  const hasListStructure = analysis.landmarks.includes('list') ||
    analysis.interactiveElements.filter(el => el.type === 'link').length > 5;
  if (hasListStructure) {
    return 'list';
  }

  // Check for settings patterns
  const hasSettingsElements = analysis.interactiveElements.some(
    el => el.purpose === 'settings' || el.type === 'checkbox' || el.type === 'radio'
  );
  if (hasSettingsElements) {
    return 'settings';
  }

  // Check for detail/content pages
  const hasLongContent = analysis.textContent?.averageLength > 100;
  if (hasLongContent && analysis.headings.length <= 3) {
    return 'detail';
  }

  // Default
  return 'general';
}

/**
 * Extracts color patterns from computed styles
 * Note: This requires additional style extraction during capture
 */
export function extractColorPatterns(styles: Record<string, string>[]): ColorPattern[] {
  const colorCounts: Record<string, { count: number; usage: ColorPattern['usage'] }> = {};

  for (const style of styles) {
    // Background colors
    if (style.backgroundColor && style.backgroundColor !== 'transparent') {
      const hex = rgbToHex(style.backgroundColor);
      if (hex) {
        colorCounts[hex] = colorCounts[hex] || { count: 0, usage: 'background' };
        colorCounts[hex].count++;
      }
    }

    // Text colors
    if (style.color) {
      const hex = rgbToHex(style.color);
      if (hex) {
        colorCounts[hex] = colorCounts[hex] || { count: 0, usage: 'text' };
        colorCounts[hex].count++;
      }
    }

    // Border colors
    if (style.borderColor && style.borderColor !== 'transparent') {
      const hex = rgbToHex(style.borderColor);
      if (hex) {
        colorCounts[hex] = colorCounts[hex] || { count: 0, usage: 'border' };
        colorCounts[hex].count++;
      }
    }
  }

  return Object.entries(colorCounts)
    .map(([hex, data]) => ({ hex, usage: data.usage, frequency: data.count }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 10);
}

/**
 * Converts RGB color string to hex
 */
function rgbToHex(rgb: string): string | null {
  const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return null;

  const r = parseInt(match[1], 10);
  const g = parseInt(match[2], 10);
  const b = parseInt(match[3], 10);

  return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
}

/**
 * Generates a summary of DOM analysis for audit
 */
export function generateAnalysisSummary(analysis: DomAnalysis): string {
  const lines = [
    `Interactive Elements: ${analysis.interactiveElements.length}`,
    `  - Buttons: ${analysis.interactiveElements.filter(e => e.type === 'button').length}`,
    `  - Links: ${analysis.interactiveElements.filter(e => e.type === 'link').length}`,
    `  - Inputs: ${analysis.interactiveElements.filter(e => e.type === 'input').length}`,
    `Headings: ${analysis.headings.length}`,
    `Forms: ${analysis.forms.length}`,
    `Landmarks: ${analysis.landmarks.join(', ') || 'None detected'}`,
    `Color Patterns: ${analysis.colorPatterns.length} unique colors`
  ];

  return lines.join('\n');
}

/**
 * Creates an empty DOM analysis structure
 */
export function createEmptyAnalysis(): DomAnalysis {
  return {
    interactiveElements: [],
    headings: [],
    forms: [],
    images: { total: 0, withAlt: 0, decorative: 0 },
    landmarks: [],
    colorPatterns: [],
    textContent: { totalTextNodes: 0, averageLength: 0, hasProperHeadings: false }
  };
}

/**
 * Merges multiple DOM analyses (for multi-state capture)
 */
export function mergeAnalyses(analyses: DomAnalysis[]): DomAnalysis {
  if (analyses.length === 0) return createEmptyAnalysis();
  if (analyses.length === 1) return analyses[0];

  const merged = createEmptyAnalysis();

  for (const analysis of analyses) {
    // Dedupe interactive elements by selector
    const existingSelectors = new Set(merged.interactiveElements.map(e => e.selector));
    for (const el of analysis.interactiveElements) {
      if (!existingSelectors.has(el.selector)) {
        merged.interactiveElements.push(el);
        existingSelectors.add(el.selector);
      }
    }

    // Dedupe headings by text
    const existingHeadings = new Set(merged.headings.map(h => h.text));
    for (const h of analysis.headings) {
      if (!existingHeadings.has(h.text)) {
        merged.headings.push(h);
        existingHeadings.add(h.text);
      }
    }

    // Merge forms
    merged.forms.push(...analysis.forms);

    // Merge landmarks (dedupe)
    for (const landmark of analysis.landmarks) {
      if (!merged.landmarks.includes(landmark)) {
        merged.landmarks.push(landmark);
      }
    }
  }

  return merged;
}
