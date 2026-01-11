# Slice 05: States

## Purpose

Generates state variants (loading, empty, error, success) for all propagated screens from Phase 4.

## Inputs

| Input | Source | Description |
|-------|--------|-------------|
| `propagation_report.json` | Phase 4 | Successfully propagated screens |
| `style_config.json` | Phase 3 | Color palette, 14 validated anchors |
| `manifest.json` | All Phases | Progress tracking |

## Outputs

| Output | Description |
|--------|-------------|
| `generated/states/*.png` | State variant images |
| `states_report.json` | Complete states results |

## State Types

| Type | Strength | Purpose |
|------|----------|---------|
| loading | 0.50 | Skeleton/shimmer placeholders |
| empty | 0.52 | Friendly illustration with guidance |
| error | 0.52 | Clear error with recovery options |
| success | 0.55 | Confirmation with next steps |

## Key Components

### states.ts (Orchestrator)
- `initializeStates()` - Setup and prerequisites
- `runStates()` - Batch processing
- `completeStates()` - Finalization

### state-generator.ts (Engine)
- `generateState()` - Single state with retry
- `generateScreenStates()` - All 4 states for one screen
- `buildReferenceArray()` - Anchors to data URLs

### validators/state-validator.ts
- File exists, size, PNG format checks

## Usage

```typescript
import {
  createStatesConfig, initializeStates, runStates, completeStates,
  loadPropagationReport, loadStyleConfig
} from './states';

const config = createStatesConfig('./output', { viewport: 'mobile' });
const initResult = initializeStates(config);
const propagationReport = loadPropagationReport('./output').data!;
const styleConfig = loadStyleConfig('./output').data!;

const result = await runStates(config, propagationReport, styleConfig);
if (result.success) {
  completeStates('./output', result.statesReport!.screens, result.statesReport!);
}
```

## Cost Model

- 4 states per screen at $0.15 each = ~$0.78/screen (with regenerations)
- 10-screen app: ~$7.80 total

## Error Handling

1. First attempt: Standard prompt
2. Second attempt: State-specific enforcement
3. Third attempt: Strengthen style matching
4. Fail: Record error, continue

## Related Files

- Schema: `core/schemas/states-report.schema.json`
- Example: `templates/states-report.example.json`
- Tests: `states.test.ts`
