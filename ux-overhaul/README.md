# UX Overhaul Skill

A Claude Code skill that transforms MVP applications into professionally designed products with consistent, world-class UI/UX.

## Overview

Unlike one-off AI image generation that produces inconsistent, "AI-looking" interfaces, UX Overhaul treats UI/UX redesign as a systematic process with validated reference images that propagate consistent styling across all screens.

### Key Features

- **Systematic Capture**: Forensic capture of existing applications with DOM analysis
- **Professional Audit**: Evaluation against Nielsen's Heuristics and Laws of UX
- **Consistent Design**: 14-slot anchor system ensures visual coherence
- **AI Pre-validation**: Automatic quality checks on generated designs
- **Implementation-Ready**: Detailed specs for coding assistants to execute

## Quick Start

### 1. Set Up Environment

```bash
# Set your fal.ai API key
export FAL_KEY=your_api_key_here
```

### 2. Create a Flow Definition

Create a `flow-definition.json` file describing your application:

```json
{
  "appName": "MyApp",
  "baseUrl": "http://localhost:3000",
  "flows": [
    {
      "name": "main",
      "steps": [
        { "action": "navigate", "url": "/dashboard" },
        { "action": "screenshot", "name": "dashboard" }
      ]
    }
  ]
}
```

### 3. Run the Skill

```
/ux-overhaul mobile --flow ./flow-definition.json
```

## Requirements

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `FAL_KEY` | Yes | fal.ai API key for image generation |

### MCP Servers

| Server | Required | Purpose |
|--------|----------|---------|
| Playwright MCP | Yes | Browser automation for capture |
| Archon MCP | Optional | Task management and progress tracking |
| SHAD-CN MCP | Phase 7 | Component library mapping |

## Installation

1. Clone or copy the `ux-overhaul/` directory to your project
2. Ensure MCP servers are configured in Claude Code
3. Set the `FAL_KEY` environment variable

## Project Structure

```
ux-overhaul/
├── SKILL.md                    # Skill definition
├── README.md                   # This file
├── core/
│   ├── config/                 # Viewport and default configurations
│   ├── schemas/                # JSON schemas for validation
│   ├── utils/                  # File, image, manifest utilities
│   ├── clients/                # fal.ai API client
│   └── prompts/                # Prompt template system
├── slices/
│   └── 01-capture/             # Capture phase implementation
├── knowledge/                  # UX principles and patterns (Phase 2+)
└── projects/                   # User project outputs
```

## Phases

| Phase | Purpose | Key Output |
|-------|---------|------------|
| 1. Capture | Screenshot and analyze existing app | `app_understanding.json` |
| 2. Audit | Evaluate against UX standards | `audit_report.json` |
| 3. Anchoring | Establish visual foundation | 14 anchor images |
| 4. Propagation | Generate redesigned screens | `generated/screens/` |
| 5. States | Generate state variants | `generated/states/` |
| 6. Coherence | Validate visual consistency | Regenerated outliers |
| 7. Specs | Create implementation docs | `design_tokens.json` |

## Cost Estimation

- fal.ai nano-banana-pro: ~$0.15 per image
- Typical 20-screen app with states: ~$20-30 total

## Viewports

| Preset | Dimensions | Device |
|--------|------------|--------|
| `mobile` | 390x844 | iPhone 14 Pro |
| `tablet` | 768x1024 | iPad |
| `desktop` | 1440x900 | Standard laptop |
| `desktop-xl` | 1920x1080 | Full HD monitor |

## Flow Definition Schema

See `slices/01-capture/templates/flow-definition.example.json` for a complete example.

### Actions

| Action | Required Fields | Description |
|--------|-----------------|-------------|
| `navigate` | `url` | Navigate to URL |
| `click` | `selector` | Click element |
| `type` | `selector`, `text` | Type into input |
| `screenshot` | `name` | Capture screenshot |
| `wait` | `waitMs` | Wait for duration |
| `scroll` | - | Scroll page |
| `hover` | `selector` | Hover over element |
| `select` | `selector`, `text` | Select dropdown option |

## Resume Capability

Progress is persisted via `manifest.json`. Resume anytime:

```
/ux-overhaul resume
```

Or jump to a specific phase:

```
/ux-overhaul mobile --phase anchoring
```

## Contributing

This skill is part of the UX Overhaul project. See the PRD for full specifications.

## License

MIT
