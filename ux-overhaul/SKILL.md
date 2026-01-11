# UX Overhaul Skill

Transform MVP applications into professionally designed products with consistent, world-class UI/UX.

## Invocation

```
/ux-overhaul <viewport> [options]
```

### Viewports

- `mobile` - 390x844 (iPhone 14 Pro equivalent)
- `tablet` - 768x1024 (iPad equivalent)
- `desktop` - 1440x900 (Standard desktop)
- `desktop-xl` - 1920x1080 (Full HD desktop)

### Options

- `--flow <path>` - Path to flow definition JSON
- `--resume` - Resume from last checkpoint
- `--phase <name>` - Start from specific phase

## Phases

### Phase 1: Capture

Systematically captures your application screens with DOM analysis.

```
/ux-overhaul mobile --flow ./flows/my-app.json
```

**Outputs:**
- `manifest.json` - Progress tracking
- `app_understanding.json` - Complete application analysis
- `screenshots/` - Captured screens

### Phase 2: Audit

Evaluates captured screens against professional UX standards.

**Checks:**
- Nielsen's 10 Usability Heuristics
- Laws of UX (Fitts, Hick, Miller, etc.)
- Accessibility (WCAG essentials)

**Outputs:**
- `audit_report.json` - Issues with severity and recommendations
- `improvement_plan.json` - Prioritized improvements

### Phase 3: Anchoring

Establishes visual foundation through validated reference images.

**Creates 14 anchor slots:**
- Slots 1-6: User flow screens
- Slots 7-9: Typography specimens
- Slots 10-13: State indicators
- Slot 14: Iconography

**Outputs:**
- 14 validated anchor images
- `style_config.json` - Extracted style system

### Phase 4: Propagation

Generates redesigned versions of all application screens.

**Features:**
- AI pre-validation per generation
- Batch processing (5 screens per batch)
- All 14 anchors referenced for consistency

**Outputs:**
- Redesigned screens in `generated/screens/`

### Phase 5: States

Generates state variants for each screen.

**States:**
- Loading/skeleton states
- Empty states
- Error states
- Success states

**Outputs:**
- State variants in `generated/states/`

### Phase 6: Coherence

Validates all generated designs work together as a unified product.

**Checks:**
- Flow coherence
- Component consistency
- Color adherence
- Typography consistency

**Outputs:**
- `coherence_report.json`
- Regenerated outliers if needed

### Phase 7: Specs

Produces actionable implementation specifications.

**Outputs:**
- `design_system.md` - Complete design system
- `design_tokens.json` - Design tokens (compatible with TweakCN)
- Per-screen `IMPLEMENTATION.md` files

## Resume Capability

The skill persists progress via `manifest.json`. To resume:

```
/ux-overhaul resume
```

Or start from a specific phase:

```
/ux-overhaul mobile --phase anchoring
```

## Requirements

### Environment Variables

- `FAL_KEY` - fal.ai API key for image generation

### MCP Servers

- **Playwright MCP** - Browser automation for capture
- **Archon MCP** - Task management (optional)
- **SHAD-CN MCP** - Component mapping (Phase 7)

## Cost Estimation

- Image generation: ~$0.15 per image
- Typical 20-screen app: ~$20-30 total

## Example Workflow

1. Create flow definition for your app
2. Run capture phase: `/ux-overhaul mobile --flow ./my-app.json`
3. Review audit results
4. Validate hero screen selection
5. Review generated designs
6. Get implementation specs

## Directory Structure

```
ux-overhaul-output/
├── manifest.json
├── app_understanding.json
├── audit_report.json
├── style_config.json
├── screenshots/
├── generated/
│   ├── anchors/
│   ├── screens/
│   └── states/
└── specs/
    ├── design_system.md
    ├── design_tokens.json
    └── screens/
```
