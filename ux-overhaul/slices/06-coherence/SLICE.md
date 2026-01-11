# Slice 06: Coherence

## Purpose

Validates visual consistency across all generated designs from Phases 4 (Propagation) and 5 (States). Detects outliers showing style drift and orchestrates regeneration of non-conforming screens until the entire design system is coherent.

## Inputs

| Input | Source | Description |
|-------|--------|-------------|
| `propagation_report.json` | Phase 4 | Successfully propagated screens |
| `states_report.json` | Phase 5 | Generated state variants |
| `style_config.json` | Phase 3 | Color palette, 14 validated anchors |
| `app_understanding.json` | Phase 1 | Screen flow order |
| `manifest.json` | All Phases | Progress tracking |

## Outputs

| Output | Description |
|--------|-------------|
| `coherence_report.json` | Complete coherence validation results |
| `generated/screens/*-backup-*.png` | Backup of regenerated screens |
| Regenerated screens | Replaced in `generated/screens/` |

## Validation Checks

| Check | Description |
|-------|-------------|
| Flow coherence | Do transitions between screens feel natural? |
| Component consistency | Same buttons, cards, nav across screens? |
| Color adherence | All screens using validated palette? |
| Typography consistency | Heading/body styles uniform? |

## Thresholds

| Constant | Value | Purpose |
|----------|-------|---------|
| `OUTLIER_THRESHOLD` | 30 | Score above this = outlier |
| `REGENERATION_THRESHOLD` | 50 | Score above this = must regenerate |
| `DEFAULT_COHERENCE_THRESHOLD` | 85 | Minimum overall coherence score |
| `DEFAULT_MAX_PASSES` | 2 | Max validation passes |

## Key Components

### coherence.ts (Orchestrator)
- `initializeCoherence()` - Setup and prerequisites
- `runCoherence()` - Main validation loop
- `completeCoherence()` - Finalization

### flow-analyzer.ts (Flow Analysis)
- `analyzeFlow()` - Single flow analysis
- `analyzeAllFlows()` - All flows
- `calculateTransitionScore()` - Transition scoring

### outlier-detector.ts (Outlier Detection)
- `detectOutliers()` - Main detection
- `calculateOutlierScore()` - Score single screen
- `getOutliersForRegeneration()` - Filter for regeneration

### regenerator.ts (Regeneration Engine)
- `regenerateScreen()` - Single screen with retry
- `regenerateBatch()` - Batch regeneration
- `buildRegenerationPrompt()` - Prompt with fix recommendations

### validators/coherence-validator.ts
- File integrity, color adherence, style consistency checks

## Usage

```typescript
import {
  createCoherenceConfig, initializeCoherence, runCoherence, completeCoherence,
  loadPropagationReport, loadStatesReport, loadStyleConfig
} from './coherence';

const config = createCoherenceConfig('./output', { viewport: 'mobile' });
const initResult = initializeCoherence(config);
const propagationReport = loadPropagationReport('./output').data!;
const statesReport = loadStatesReport('./output').data!;
const styleConfig = loadStyleConfig('./output').data!;

const result = await runCoherence(config, propagationReport, statesReport, styleConfig);
if (result.success) {
  completeCoherence('./output', result.coherenceReport!);
}
```

## Cost Model

- Regeneration at $0.15 per screen
- Average ~20% screens need regeneration
- 10-screen app: ~$0.30-$0.60 regeneration cost
- Max 2 regeneration attempts per outlier

## Error Handling

1. First pass: Detect all outliers
2. Regenerate outliers with adjusted prompts
3. Second pass: Re-validate regenerated screens
4. If still failing after max passes: Report as unresolved, continue

## Coherence Flow

```
┌─────────────────┐
│ Load Reports    │
│ (Propagation,   │
│  States, Style) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Flow Analysis   │
│ (Transitions)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Outlier         │
│ Detection       │
└────────┬────────┘
         │
    ┌────┴────┐
    │ Outliers? │
    └────┬────┘
         │
    ┌────┴────┐
   No        Yes
    │         │
    │         ▼
    │    ┌─────────────────┐
    │    │ Regenerate      │
    │    │ Outliers        │
    │    └────────┬────────┘
    │             │
    │    ┌────────▼────────┐
    │    │ Pass < Max?     │
    │    └────────┬────────┘
    │             │
    │         Yes │──────┐
    │             │      │
    │             ▼      │
    │    ┌─────────────────┐
    │    │ Re-validate     │◄─┘
    │    └────────┬────────┘
    │             │
    ▼             ▼
┌─────────────────────────┐
│ Generate Report         │
│ Complete Phase          │
└─────────────────────────┘
```

## Related Files

- Schema: `core/schemas/coherence-report.schema.json`
- Example: `templates/coherence-report.example.json`
- Tests: `coherence.test.ts`
