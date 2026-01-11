# Slice 07: Specs (Developer Handoff)

## Purpose

Transform validated design artifacts into actionable developer deliverables. Produces design tokens, design system documentation, per-screen implementation specs, component mappings to shadcn/ui, and dependency-aware implementation order.

## Inputs

- `style_config.json` - Validated style configuration from anchoring phase
- `propagation_report.json` - All propagated screens with metadata
- `states_report.json` - State variants for each screen (optional)
- `coherence_report.json` - Coherence validation results (optional)
- `app_understanding.json` - App structure and flow definitions
- `improvement_plan.json` - UX requirements from audit phase

## Outputs

- `design_tokens.json` - TweakCN-compatible design tokens
- `design_tokens.css` - CSS custom properties version
- `design_system.md` - Complete design system documentation
- `specs_report.json` - Machine-readable specs report
- `specs/` - Directory with per-screen markdown specs
- `implementation_checklist.md` - Ordered implementation guide

## Key Components

### token-extractor.ts
Extracts design tokens from style configuration:
- Colors (semantic naming: primary, secondary, accent, etc.)
- Typography (font family, sizes, weights, line heights)
- Spacing (scale values in rem/px)
- Border radius (none, sm, md, lg, full)
- Shadows (none, sm, md, lg, xl)

Output formats: JSON (TweakCN), CSS custom properties, Tailwind config

### doc-generator.ts
Generates design system documentation:
- Color palette with hex values and usage descriptions
- Typography scale with examples
- Spacing scale with pixel values
- Component guidelines and patterns
- Copy-paste-ready code snippets

### screen-spec-generator.ts
Creates per-screen implementation specifications:
- Layout structure description
- Component breakdown with shadcn/ui mappings
- Token references for each element
- State variant specifications
- UX requirements from audit
- Implementation notes and complexity estimate

### component-mapper.ts
Maps screen types to shadcn/ui components:
- Screen type to component recommendations
- Import statements generation
- Prop suggestions per component
- Layout pattern descriptions

### implementation-order.ts
Calculates optimal build sequence:
- Screen dependency analysis
- Topological sort for ordering
- Phase grouping (Foundation, Core, Enhancement)
- Parallelization suggestions
- Implementation checklist generation

### validators/specs-validator.ts
Validates spec completeness:
- Token completeness checks
- Documentation section validation
- Screen spec coverage verification
- Completeness score calculation

## Usage

```typescript
import {
  createSpecsConfig,
  initializeSpecs,
  runSpecs,
  completeSpecs
} from './specs';

// Create configuration
const config = createSpecsConfig('./output', {
  viewport: 'mobile',
  outputFormats: ['json', 'css'],
  generateMarkdown: true
});

// Initialize phase
const initResult = initializeSpecs(config);

// Run specs generation
const result = await runSpecs(
  config,
  propagationReport,
  statesReport,
  coherenceReport,
  styleConfig,
  appUnderstanding,
  improvementPlan
);

// Complete phase
const finalResult = completeSpecs(config.outputDir, result.specsReport);
```

## Cost Model

This phase has no external API costs - it only processes existing artifacts.

**Compute**: Minimal - primarily JSON/markdown generation

## Design Decisions

1. **TweakCN Compatibility**: Tokens structured for direct import into TweakCN
2. **Multiple Formats**: JSON, CSS, and Tailwind outputs for stack flexibility
3. **Markdown Output**: Human-readable, version-control-friendly documentation
4. **Heuristic Mapping**: Component suggestions based on screen types (MVP)
5. **Flow-Based Order**: Implementation sequence follows user flow dependencies

## Output Example

```
output/
├── design_tokens.json          # TweakCN-compatible tokens
├── design_tokens.css           # CSS custom properties
├── design_system.md            # Complete design system doc
├── specs_report.json           # Machine-readable report
├── specs/
│   ├── screen-dashboard.md     # Per-screen spec
│   ├── screen-transactions.md
│   ├── screen-settings.md
│   └── ...
└── implementation_checklist.md # Ordered implementation guide
```
