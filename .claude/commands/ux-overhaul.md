---
description: Transform MVP applications into professionally designed products
argument-hint: <viewport> [--flow <path>] [--resume] [--phase <name>]
---

# UX Overhaul Skill

Transform your MVP application into a professionally designed product with consistent, world-class UI/UX.

## Arguments

**Viewport** (required for new projects): `$ARGUMENTS`
- `mobile` - 390x844 (iPhone 14 Pro)
- `tablet` - 768x1024 (iPad)
- `desktop` - 1440x900 (Standard desktop)
- `desktop-xl` - 1920x1080 (Full HD)

**Options:**
- `--flow <path>` - Path to flow definition JSON (required for new projects)
- `--theme <path>` - Path to CSS theme file (TweakCN colors) to use as style reference
- `--resume` - Resume from last checkpoint
- `--phase <name>` - Start from specific phase (capture, audit, anchoring, propagation, states, coherence, specs)

## Execution

### Step 1: Parse Arguments

Parse the arguments from `$ARGUMENTS`:

1. Extract viewport (first positional argument: mobile, tablet, desktop, desktop-xl)
2. Check for `--flow <path>` option - extract the path
3. Check for `--theme <path>` option - extract the CSS theme file path
4. Check for `--resume` flag
5. Check for `--phase <name>` option - extract the phase name

If `$ARGUMENTS` is "resume", treat as `--resume` flag.

**If `--theme` is provided:**
- Read the CSS file contents
- Extract color variables (CSS custom properties like `--primary`, `--background`, etc.)
- Pass these as `themeReference` to the anchoring phase for style guidance

### Step 2: Initialize Pipeline

Read the orchestrator module and initialize:

```typescript
import {
  createOrchestratorConfig,
  initializePipeline,
  getPipelineProgress,
  getPhaseInstructions,
  phaseRequiresUserInput,
  getUserValidationGates,
  formatUserPrompt
} from './ux-overhaul/core/orchestrator';

const config = createOrchestratorConfig(viewport, {
  flowDefinitionPath: flowPath,  // from --flow
  themeReferencePath: themePath, // from --theme (optional CSS file)
  outputDir: './ux-overhaul-output',
  resumeFromPhase: phase  // from --phase
});

const result = initializePipeline(config);
```

**Error Handling:**
- If `--resume` is specified and no manifest exists, error: "No existing project found to resume"
- If no `--flow` and no manifest exists, error: "Flow definition required for new project. Use --flow <path>"
- If invalid viewport, error: "Invalid viewport. Must be: mobile, tablet, desktop, or desktop-xl"

### Step 3: Display Progress

If resuming, show current progress:

```typescript
if (result.manifest) {
  console.log(getPipelineProgress(result.manifest));
}
```

### Step 4: Execute Current Phase

Based on `result.currentPhase`, get and follow the phase instructions:

```typescript
const instructions = getPhaseInstructions(result.currentPhase, config, result.manifest);
```

**Execute the instructions using the appropriate slice functions and tools.**

### Step 5: Handle User Validation Gates

For the **anchoring** phase, pause and request user input:

```typescript
if (phaseRequiresUserInput(currentPhase)) {
  const gates = getUserValidationGates(currentPhase);
  for (const gate of gates) {
    const prompt = formatUserPrompt(gate);
    // Present to user and wait for response
  }
}
```

**User Interaction Points:**
1. **Hero Selection**: Present hero variants (images), wait for user choice
2. **Anchor Approval**: Show all 14 anchors, allow regeneration requests

Use natural conversation to gather user feedback. Do not proceed until user approves.

### Step 6: Continue to Next Phase

After completing a phase:
1. Update manifest with phase completion
2. Display progress: `getPipelineProgress(manifest)`
3. Get instructions for next phase
4. Continue execution

Repeat until all phases complete or user stops.

### Step 7: Completion

When all phases are complete (or `specs` phase finishes):
1. Display final summary
2. Show output directory structure
3. Highlight key deliverables

**Key Deliverables:**
- `specs/design_system.md` - Design system documentation
- `specs/design_tokens.json` - TweakCN-compatible tokens
- `specs/screen-*.md` - Per-screen implementation specs

## Phase Reference

| Phase | Description | User Input | Key Output |
|-------|-------------|------------|------------|
| capture | Screenshot all screens | No | app_understanding.json |
| audit | Evaluate against UX standards | No | audit_report.json |
| anchoring | Generate style anchors | **Yes** | style_config.json, 14 anchors |
| propagation | Redesign all screens | No | propagation_report.json |
| states | Generate state variants | No | states_report.json |
| coherence | Validate visual consistency | No | coherence_report.json |
| specs | Generate implementation specs | No | design_tokens.json, specs/ |

## Example Workflows

### New Project (Mobile)
```
/ux-overhaul mobile --flow ./my-app-flow.json
```

### New Project (Desktop)
```
/ux-overhaul desktop --flow ./flows/app-flows.json
```

### New Project with Custom Theme
```
/ux-overhaul mobile --flow ./flow.json --theme ./my-tweakcn-theme.css
```

### Resume Interrupted Work
```
/ux-overhaul resume
```
or
```
/ux-overhaul mobile --resume
```

### Start from Specific Phase
```
/ux-overhaul mobile --phase propagation
```

### Skip to Specs (after manual design)
```
/ux-overhaul mobile --phase specs
```

## Output Structure

```
ux-overhaul-output/
├── manifest.json           # Progress tracking
├── app_understanding.json  # Captured screens data
├── audit_report.json       # UX issues found
├── improvement_plan.json   # Prioritized fixes
├── style_config.json       # Design tokens & anchors
├── propagation_report.json # Redesign results
├── states_report.json      # State variants
├── coherence_report.json   # Consistency validation
├── screenshots/            # Original captures
│   └── {screen-name}.png
├── generated/
│   ├── anchors/           # 14 reference images
│   │   ├── hero.png
│   │   ├── slot-01.png
│   │   └── ...
│   ├── screens/           # Redesigned screens
│   │   └── {screen-name}-propagated.png
│   └── states/            # State variants
│       └── {screen-name}/
│           ├── loading.png
│           ├── empty.png
│           ├── error.png
│           └── success.png
└── specs/
    ├── design_system.md   # Design documentation
    ├── design_tokens.json # TweakCN tokens
    ├── design_tokens.css  # CSS custom properties
    ├── implementation_checklist.md
    └── screen-{id}.md     # Per-screen specs
```

## Error Handling

- **Phase fails**: Manifest tracks the failure with error message
- **Resume after failure**: Will attempt to restart the failed phase
- **Manual restart**: Use `--phase <name>` to restart from a specific phase
- **API errors**: Retries automatically (max 3 attempts per generation)

## Requirements

### Environment Variables
- **FAL_KEY**: fal.ai API key for image generation (~$0.15/image)

### MCP Servers
- **Playwright MCP**: Browser automation for capture phase
- **Archon MCP** (optional): Task management integration

### Cost Estimate
- Typical 20-screen app: ~$20-30 total
- ~$0.15 per image generation
- States phase adds 4 variants per screen

## Flow Definition Format

Create a JSON file defining your app's user flows:

```json
{
  "appName": "MyApp",
  "baseUrl": "http://localhost:3000",
  "flows": [
    {
      "name": "main_flow",
      "steps": [
        { "action": "navigate", "url": "/" },
        { "action": "screenshot", "name": "home" },
        { "action": "click", "selector": "#login-btn" },
        { "action": "screenshot", "name": "login" }
      ]
    }
  ]
}
```

See `ux-overhaul/slices/01-capture/templates/` for examples.
