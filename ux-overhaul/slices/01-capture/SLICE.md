# Slice 01: Capture

## Purpose

The Capture slice creates a complete forensic understanding of an existing web application. It systematically navigates through defined user flows, captures screenshots at each screen, analyzes the DOM structure, and produces a structured `app_understanding.json` document.

## Inputs

- **Flow Definition** (`flow-definition.json`): Defines the application URL, authentication, and user flows to capture
- **Viewport Preset**: One of `mobile`, `tablet`, `desktop`, `desktop-xl`

## Outputs

- **`manifest.json`**: Progress tracking document
- **`app_understanding.json`**: Complete application analysis
- **`screenshots/`**: Directory containing captured screenshots

## Key Components

### playwright-adapter.ts

Abstracts Playwright MCP tool calls into structured actions. Provides builders for common operations:

- `buildNavigateAction(url)` - Navigate to URL
- `buildScreenshotAction(options)` - Capture screenshot
- `buildClickAction(selector)` - Click element
- `buildTypeAction(selector, text)` - Type into input
- `flowStepToActions(step)` - Convert flow step to actions
- `generateMcpInstructions(actions)` - Generate human-readable MCP instructions

### dom-analyzer.ts

Extracts patterns and metadata from captured DOM snapshots:

- `parseAccessibilitySnapshot(snapshot)` - Extract elements from a11y tree
- `inferPurpose(text, type)` - Infer element purpose from text
- `classifyScreenType(analysis)` - Classify screen type (dashboard, form, list, etc.)
- `extractColorPatterns(styles)` - Extract color usage patterns

### flow-executor.ts

Orchestrates execution of flow definitions:

- `validateFlowDefinition(definition)` - Validate flow structure
- `buildExecutionPlan(definition, viewport)` - Create execution plan
- `generateAuthSteps(auth)` - Generate authentication steps
- `estimateExecutionTime(definition)` - Estimate capture duration

### capture.ts

Main orchestrator for the capture phase:

- `initializeCapture(config)` - Set up capture session
- `createAppUnderstanding(...)` - Build app understanding document
- `completeCapture(...)` - Finalize and save results
- `generateCaptureInstructions(plan)` - Generate capture instructions for Claude

## Usage

### Via Skill Invocation

```
/ux-overhaul capture mobile --flow ./flows/my-app.json
```

### Programmatic

```typescript
import { initializeCapture, createCaptureConfig } from './capture';

const config = createCaptureConfig(
  './flow-definition.json',
  './output',
  'mobile'
);

const result = initializeCapture(config);
if (result.success) {
  console.log('Execution plan:', result.executionPlan);
}
```

## Flow Definition Format

See `templates/flow-definition.example.json` for a complete example.

```json
{
  "appName": "MyApp",
  "baseUrl": "http://localhost:3000",
  "auth": {
    "type": "form",
    "loginUrl": "/login",
    "usernameSelector": "input[name='email']",
    "passwordSelector": "input[name='password']",
    "submitSelector": "button[type='submit']"
  },
  "flows": [
    {
      "name": "main-flow",
      "steps": [
        { "action": "navigate", "url": "/dashboard" },
        { "action": "screenshot", "name": "dashboard" }
      ]
    }
  ]
}
```

## Dependencies

- **Playwright MCP**: Browser automation
- **Core Utilities**: File, manifest, image handling

## Next Phase

After capture completes, proceed to **Slice 02: Audit** to analyze the captured screens against UX heuristics.
