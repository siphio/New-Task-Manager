# Slice 02: Audit

## Purpose

The Audit slice evaluates captured screens against established UX principles: Nielsen's 10 Usability Heuristics, Laws of UX, and WCAG 2.2 accessibility guidelines. It produces a prioritized audit report with prompt-ready improvements that feed directly into Phase 4 (Propagation).

## Inputs

- **`app_understanding.json`**: Complete application analysis from Capture phase
- **Captured Screens**: Screen data with DOM analysis from Phase 1
- **Audit Config**: Optional framework selection and severity thresholds

## Outputs

- **`audit_report.json`**: Complete audit with per-screen issues
- **`improvement_plan.json`**: Prioritized improvements with prompt injections
- **Global Issues**: Systemic issues appearing across multiple screens

## Key Components

### audit.ts

Main orchestrator for the audit phase:

- `initializeAudit(appUnderstanding, config)` - Set up audit session
- `runAudit(screens, config)` - Execute evaluation across all screens
- `completeAudit(auditResult)` - Finalize and format results
- `getAuditSummary(screenAudits)` - Generate severity summary
- `loadAppUnderstanding(outputDir)` - Load app understanding from file

### evaluator.ts

Core evaluation engine with shared utilities:

- `evaluateScreen(screen, analysis, frameworks)` - Run all framework evaluators
- `createIssue(...)` - Factory for standardized issue objects
- `checkHeadingHierarchy(headings)` - Analyze heading structure
- `hasProperFormLabels(forms)` - Check form labeling
- `countElementsByPurpose(elements)` - Count elements by inferred purpose
- `findSmallButtons(elements)` - Find potentially small touch targets
- `findPoorLinkText(elements)` - Find non-descriptive link text

### heuristics/nielsen.ts

Nielsen's 10 Usability Heuristics evaluator:

- `evaluateNielsenHeuristics(screen, analysis, screenType)` - Main evaluator
- Evaluates: H1 (System Status), H3 (User Control), H5 (Error Prevention), H6 (Recognition), H7 (Flexibility), H8 (Aesthetic Design), H9 (Error Recovery), H10 (Help)

### heuristics/laws-of-ux.ts

Laws of UX evaluator with quantitative thresholds:

- `evaluateLawsOfUx(screen, analysis, screenType)` - Main evaluator
- **Fitts's Law**: Target size (min 44px) and CTA prominence
- **Hick's Law**: Navigation items (max 7), action buttons (max 5)
- **Miller's Law**: Form fields (max 9), section count
- **Law of Proximity**: Label-input association

### heuristics/accessibility.ts

WCAG 2.2 Level A/AA accessibility evaluator:

- `evaluateAccessibility(screen, analysis, screenType)` - Main evaluator
- WCAG 1.1.1: Image alt text
- WCAG 1.3.1: Heading hierarchy
- WCAG 3.3.2: Form labels
- WCAG 2.4.4: Link text quality
- WCAG 4.1.2: Landmark regions
- WCAG 2.1.1: Keyboard accessibility

### issue-prioritizer.ts

Severity scoring and improvement plan generation:

- `calculatePriorityScore(issue)` - Score based on severity and category
- `prioritizeIssues(issues)` - Sort by priority (highest first)
- `findGlobalIssues(screenAudits)` - Find systemic issues (2+ screens)
- `generateImprovementPlan(auditReport)` - Create complete improvement plan
- `getPromptInjectionsForScreen(issues, global, max)` - Get prompt injections
- `formatImprovementPlanSummary(plan)` - Human-readable summary

## Usage

### Via Skill Invocation

```
/ux-overhaul audit --output ./output
```

### Programmatic

```typescript
import { initializeAudit, runAudit, completeAudit } from './audit';
import { generateImprovementPlan } from './issue-prioritizer';

// Initialize audit
const initResult = initializeAudit(appUnderstanding, {
  frameworks: ['nielsen', 'laws-of-ux', 'wcag'],
  severityThreshold: 'low'
});

// Run audit on screens
const auditResult = runAudit(screens, initResult.config);

// Complete and generate report
const report = completeAudit(auditResult);

// Generate improvement plan
const plan = generateImprovementPlan(report);
```

## Severity Levels

Issues are classified by severity with corresponding weights:

| Severity | Weight | Description |
|----------|--------|-------------|
| critical | 4 | Blocks core functionality or accessibility |
| high | 3 | Significant usability or a11y problem |
| medium | 2 | Notable issue affecting user experience |
| low | 1 | Minor improvement opportunity |

## Category Weights

Categories are weighted by impact for prioritization:

| Category | Weight | Focus Area |
|----------|--------|------------|
| perceivable | 1.3 | WCAG - Can users perceive content |
| prevention | 1.2 | Nielsen - Prevent errors before they occur |
| errors | 1.2 | Nielsen - Error recognition and recovery |
| operable | 1.2 | WCAG - Can users operate interface |
| cognitive | 1.1 | Laws of UX - Mental load |
| feedback | 1.1 | Nielsen - System status visibility |
| control | 1.1 | Nielsen - User freedom |
| design | 0.9 | Aesthetic and layout concerns |
| efficiency | 0.8 | Power user features |
| help | 0.8 | Documentation and guidance |

## Issue ID Format

Issues follow the pattern: `{PRINCIPLE}-{SCREEN}-{CHECK}`

Examples:
- `NH5-dashboard-form-validation` - Nielsen H5 form validation on dashboard
- `A11Y-login-img-alt` - WCAG alt text issue on login screen
- `MILLER-settings-form-overload` - Miller's Law form overload on settings

## Prompt Injection

Each issue generates a `promptInjection` field - a concise, action-oriented instruction ready for inclusion in UI generation prompts:

```typescript
// Issue recommendation
"Add confirmation dialog for delete and other destructive actions"

// Becomes prompt injection
"Add confirmation dialog for delete and other destructive actions"
```

## Dependencies

- **Capture Slice**: Provides `app_understanding.json` and screen data
- **Core Utilities**: File, manifest handling
- **Knowledge Base**: Principle definitions in `knowledge/principles/`

## Knowledge Base

The audit system references principle definitions:

- `knowledge/principles/nielsens-heuristics.json` - NH1-NH10 with checks
- `knowledge/principles/laws-of-ux.json` - FITTS, HICK, MILLER, etc.
- `knowledge/principles/wcag-essentials.json` - WCAG 2.2 A/AA criteria

## Next Phase

After audit completes, proceed to **Slice 03: Anchoring** to establish design anchor points from the analysis.
