# Slice 04: Propagation

## Purpose

The Propagation phase applies the validated 14-anchor style system to all captured screens, producing redesigned versions with consistent styling and audit-driven UX improvements. This is where the actual screen redesigns are generated.

## Inputs

| Input | Source | Description |
|-------|--------|-------------|
| `app_understanding.json` | Capture Phase | Screen inventory and metadata |
| `style_config.json` | Anchoring Phase | Color palette, typography, 14 validated anchors |
| `improvement_plan.json` | Audit Phase | Prompt injections per screen |
| `manifest.json` | All Phases | Progress tracking |

## Outputs

| Output | Description |
|--------|-------------|
| `generated/screens/*.png` | Redesigned screen images |
| `propagation_report.json` | Complete propagation results |
| Updated `manifest.json` | Phase status and progress |

## Key Components

### propagation.ts (Orchestrator)
Main entry point coordinating the propagation process:
- `initializePropagation()` - Sets up output directories, validates phase prerequisites
- `runPropagation()` - Full batch processing with progress tracking
- `completePropagation()` - Writes final report, updates manifest
- Load helpers and summary generation functions

### screen-classifier.ts
Classifies screens for appropriate prompt and strength selection:

```typescript
type ScreenType = 'dashboard' | 'list' | 'detail' | 'form' | 'settings' |
                  'auth' | 'landing' | 'modal' | 'empty' | 'error' | 'generic';
```

**Strength Settings by Screen Type:**

| Screen Type | Strength | Rationale |
|-------------|----------|-----------|
| dashboard | 0.60 | Data-heavy, need style but preserve layout |
| list | 0.55 | Uniform styling important |
| detail | 0.60 | Content structure matters |
| form | 0.65 | Form layout critical |
| settings | 0.60 | Medium balance |
| auth | 0.55 | Strong branding focus |
| landing | 0.55 | Marketing focus |
| modal | 0.65 | Structure critical |
| empty | 0.50 | Illustration-focused |
| error | 0.50 | Consistent messaging |
| generic | 0.60 | Default |

*Lower strength = more style influence from references*
*Higher strength = more structure preservation from original*

### propagator.ts (Engine)
Core propagation logic with fal.ai integration:
- `propagateScreen()` - Single screen with retry logic
- `propagateBatch()` - Multiple screens in sequence
- `buildReferenceArray()` - Converts anchors to data URLs
- `adjustPromptForRetry()` - Strengthens prompt on failure
- `estimatePropagationCost()` - Cost estimation

### validators/propagation-validator.ts
Pre-validation checks for generated images:
- File exists check
- File size validation (10KB - 10MB)
- PNG format validation (magic bytes)

## Processing Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    runPropagation()                          │
├─────────────────────────────────────────────────────────────┤
│  1. Load artifacts (app understanding, style config, plan)  │
│  2. Validate anchors available                               │
│  3. Classify all screens by type                             │
│  4. Extract color palette from style config                  │
├─────────────────────────────────────────────────────────────┤
│  For each batch (default 5 screens):                         │
│    ┌──────────────────────────────────────────────────────┐ │
│    │  For each screen:                                     │ │
│    │    1. Get screen type classification                  │ │
│    │    2. Get prompt injections from improvement plan     │ │
│    │    3. Build full prompt with style + improvements     │ │
│    │    4. Call fal.ai with all 14 anchors as references   │ │
│    │    5. Download and save generated image               │ │
│    │    6. Retry on failure (up to 3 attempts)             │ │
│    └──────────────────────────────────────────────────────┘ │
│    Update manifest progress after batch                      │
├─────────────────────────────────────────────────────────────┤
│  5. Generate propagation report                              │
│  6. Return results                                           │
└─────────────────────────────────────────────────────────────┘
```

## Usage

### Programmatic Usage

```typescript
import {
  createPropagationConfig,
  initializePropagation,
  runPropagation,
  completePropagation,
  loadAppUnderstanding,
  loadStyleConfig,
  loadImprovementPlan
} from './propagation';

// Configuration
const config = createPropagationConfig('./output', {
  viewport: 'mobile',
  batchSize: 5,
  maxRegenerations: 3
});

// Initialize
const initResult = initializePropagation(config);
if (!initResult.success) {
  console.error(initResult.error);
  process.exit(1);
}

// Load dependencies
const appUnderstanding = loadAppUnderstanding('./output').data!;
const styleConfig = loadStyleConfig('./output').data!;
const improvementPlan = loadImprovementPlan('./output').data!;

// Run propagation
const result = await runPropagation(
  config,
  appUnderstanding,
  styleConfig,
  improvementPlan
);

// Complete
if (result.success && result.propagationReport) {
  completePropagation(
    './output',
    result.propagatedScreens!,
    result.propagationReport
  );
}
```

### Cost Estimation

```typescript
import { estimatePropagationCost } from './propagation';

// Estimate cost for 10 screens at 1K resolution
const cost = estimatePropagationCost(10, '1K');
console.log(`Estimated cost: $${cost.toFixed(2)}`);
// Output: Estimated cost: $1.95 (includes ~30% buffer for regenerations)
```

## Cost Model

| Resolution | Cost per Image | With Regenerations |
|------------|---------------|-------------------|
| 1K | $0.15 | ~$0.20 |
| 2K | $0.15 | ~$0.20 |
| 4K | $0.30 | ~$0.39 |

*Estimate: screens x 1.3 x cost per image*

## Error Handling

### Retry Strategy
1. First attempt: Standard prompt
2. Second attempt: Add style enforcement
3. Third attempt: Add structure preservation
4. Fail: Record error, continue to next screen

### Common Errors
- `No validated anchors available`: Anchoring phase incomplete
- `API timeout`: fal.ai server issue, retry usually succeeds
- `Download failed`: Network issue, retry usually succeeds
- `Generation failed`: Prompt issue, adjusted on retry

## Resumability

Propagation supports resuming from interruption:

1. Manifest tracks `currentBatch` and `screensCompleted`
2. On resume, skip already-generated screens
3. Output files are named by screen ID, preventing duplicates

To resume:
```typescript
// Read manifest to check progress
const manifest = readManifest('./output').data!;
const completed = manifest.phases.propagation.screensCompleted || 0;
console.log(`Already completed: ${completed} screens`);

// Run will continue from where it left off based on existing files
```

## Configuration Options

| Option | Default | Description |
|--------|---------|-------------|
| `batchSize` | 5 | Screens per batch |
| `maxRegenerations` | 3 | Max retry attempts |
| `strengthOverride` | - | Override per-type strength |
| `viewport` | 'mobile' | Target viewport |

## Related Files

- Schema: `core/schemas/propagation-report.schema.json`
- Example: `templates/propagation-report.example.json`
- Tests: `propagation.test.ts`
