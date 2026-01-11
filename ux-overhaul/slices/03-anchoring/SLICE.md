# Slice 03: Anchoring

## Purpose

Establishes the visual foundation for UI redesign through a 14-slot anchor system. Validated reference images propagate consistent styling across all subsequent screen generations in Phase 4 (Propagation).

## Inputs

- `app_understanding.json` - Captured screens from Phase 1 (Capture)
- `improvement_plan.json` - Audit recommendations from Phase 2 (Audit)
- User style preferences (optional color palette, style direction)

## Outputs

- `style_config.json` - Complete style configuration with color palette
- `generated/anchors/` - 14 validated anchor images
- Updated `manifest.json` with anchoring phase complete

## 14-Slot Allocation

| Slot | Type | Purpose |
|------|------|---------|
| 1 | Hero | Entry screen establishing visual direction |
| 2-6 | Screen | Key user flow screens |
| 7 | Typography | Heading specimens (H1-H6) |
| 8 | Typography | Body text specimens |
| 9 | Typography | UI text (labels, buttons, captions) |
| 10 | State | Loading/skeleton state |
| 11 | State | Empty state |
| 12 | State | Error state |
| 13 | State | Success state |
| 14 | Iconography | Icon set specimen |

## Key Components

### anchoring.ts

Main orchestrator with types and lifecycle functions:

```typescript
// Types
AnchorType, Anchor, ColorPalette, StyleConfig, AnchoringConfig, AnchoringResult

// Functions
initializeAnchoring(config)    // Set up anchoring session
runAnchoring(config, appUnderstanding, plan)  // Execute anchor generation
completeAnchoring(outputDir, styleConfig, anchors)  // Finalize and save
createAnchoringConfig(outputDir, options)  // Create config from arguments
getAnchoringSummary(styleConfig)  // Human-readable summary
loadAppUnderstanding(outputDir)  // Load Phase 1 output
loadImprovementPlan(outputDir)  // Load Phase 2 output
```

### anchor-generator.ts

Core generation engine with progressive referencing:

```typescript
// Constants
ANCHOR_SLOTS  // 14-slot allocation
STRENGTH_SETTINGS  // Strength by anchor type

// Functions
generateHeroVariants(...)  // Generate hero options for user selection
generateAnchor(request)  // Generate single anchor with validation
generateScreenAnchor(...)  // Generate screen anchor (slots 2-6)
generateTypographyAnchor(...)  // Generate typography specimen
generateStateAnchor(...)  // Generate state indicator
generateIconographyAnchor(...)  // Generate icon set (slot 14)
buildReferenceArray(anchors)  // Convert anchors to fal.ai references
```

### validation/pre-validator.ts

AI pre-validation before user review:

```typescript
// Types
ValidationCheck, PreValidationResult

// Functions
preValidateAnchor(imagePath, colors, anchors, type)  // Run validation checks
formatValidationResult(result)  // Format for display
shouldRegenerate(result)  // Check if regeneration needed
```

Checks performed:
- Image existence and validity
- Dimensions match viewport expectations
- File size is reasonable
- Style consistency with previous anchors

### validation/user-validator.ts

User validation gate utilities:

```typescript
// Types
UserValidationRequest, UserValidationResponse, ValidationGate

// Functions
createHeroSelectionGate(variants)  // Hero selection prompt
createAnchorApprovalGate(anchor)  // Anchor approval prompt
formatValidationPrompt(gate)  // Format for CLI display
processUserResponse(gate, response)  // Process user input
generateReviewInstructions(type, path)  // Review guidance
```

### style-extractor.ts

Style extraction and compilation:

```typescript
// Types
ExtractedColors, ExtractedStyle

// Functions
extractColorsFromAnchor(path)  // Extract dominant colors (MVP: defaults)
buildColorPalette(extracted, userProvided)  // Build palette
compileStyleConfig(anchors, palette, viewport, direction)  // Compile config
getDefaultPalette(styleDirection)  // Get defaults for style
inferStyleCharacteristics(direction)  // Infer border radius, shadows, etc.
```

## Validation Flow

```
1. Generate anchor with fal.ai
              ↓
2. Run AI pre-validation (file, dimensions, style)
              ↓
   ┌──────────┴──────────┐
   │                     │
   ↓                     ↓
PASSED                FAILED
   │                     │
   ↓                     ↓
3. Present to user    Regenerate with
   for approval       adjusted prompt
   │                  (max 3 attempts)
   ↓                     │
   ┌─────────────────────┘
   │
4. User approves or requests regeneration
              ↓
5. Approved anchor added to reference pool
   for next generation
```

## Progressive Reference Building

Each anchor generation includes all previously validated anchors as references:

```
Slot 1 (Hero): No references (establishes style)
Slot 2: References [1]
Slot 3: References [1, 2]
Slot 4: References [1, 2, 3]
...
Slot 14: References [1-13]
```

This progressive approach ensures each subsequent anchor inherits and reinforces the visual consistency established by earlier anchors.

## Strength Settings

| Type | Strength | Rationale |
|------|----------|-----------|
| Hero | 0.70 | Strong style establishment |
| Screen | 0.65 | Balance structure/style |
| Component | 0.60 | Component isolation |
| Typography | 0.55 | Typography preservation |
| State | 0.55 | State variant clarity |
| Iconography | 0.50 | Icon crispness |

Higher strength = more faithful to prompt, lower = more reference influence.

## Usage

### CLI Invocation

```bash
/ux-overhaul anchoring --style "modern minimal" --colors "#3B82F6,#10B981"
```

### Resume from Manifest

```bash
/ux-overhaul resume
```

### Programmatic

```typescript
import {
  createAnchoringConfig,
  initializeAnchoring,
  loadAppUnderstanding,
  loadImprovementPlan
} from './slices/03-anchoring/anchoring';

const config = createAnchoringConfig('./output', {
  viewport: 'mobile',
  styleDirection: 'modern minimal',
  colorPalette: ['#3B82F6', '#10B981']
});

const initResult = initializeAnchoring(config);
if (!initResult.success) {
  console.error(initResult.error);
  return;
}

const appUnderstanding = loadAppUnderstanding('./output').data;
const improvementPlan = loadImprovementPlan('./output').data;

// Run anchoring (interactive)
const result = await runAnchoring(config, appUnderstanding, improvementPlan);
```

## Cost Estimation

- 4 hero variants: 4 images
- 13 other anchors: 13 images
- With regenerations (~1.5x): ~25 images
- **Cost: ~$3.75 per viewport** at $0.15/image

## Available Style Directions

Built-in defaults available:

- `modern minimal` - Clean, neutral grays, single accent
- `bold vibrant` - Saturated colors, high contrast
- `dark professional` - Dark mode, professional aesthetic
- `soft organic` - Warm colors, natural feel
- `corporate clean` - Business-focused, trustworthy

Custom directions are supported; inferred characteristics apply.

## Error Handling

| Error | Resolution |
|-------|------------|
| Audit not complete | Complete Phase 2 first |
| No screens found | Check app_understanding.json |
| Generation fails 3x | Escalate to user with options |
| fal.ai API unavailable | Retry or check FAL_KEY |
| Validation threshold not met | Auto-regenerate with adjusted prompt |

## Next Phase

After anchoring completes, proceed to **Slice 04: Propagation** to generate redesigned versions of all application screens using the 14 validated anchors as references.
