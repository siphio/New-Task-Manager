/**
 * States Generation Script - Generate loading/empty/error/success variants
 * Only for screens that need them (Home, Calendar, Analytics)
 */

import fs from 'fs';

const FAL_API_KEY = process.env.FAL_KEY;
const BASE_URL = 'https://fal.run/fal-ai';

const STYLE_BASE = `Modern dark mode task app with purple (#7c5cff) accents.
Dark charcoal background (#1a1d23), rounded cards (#222830), soft shadows.`;

const STATE_SCREENS = [
  {
    screen: 'home',
    input: 'generated/screens/home-propagated.png',
    states: [
      { type: 'loading', prompt: 'Show skeleton loading state with animated shimmer placeholders for the daily goals card and task list area. Subtle pulsing animation indicators.' },
      { type: 'empty', prompt: 'Show friendly empty state with a cute illustration of a completed checklist or relaxed character. Message: "All caught up! Add a task to get started." Encouraging tone.' },
      { type: 'error', prompt: 'Show error state with a subtle warning icon and message: "Unable to load tasks. Tap to retry." Include a retry button. Use coral accent for error, not aggressive red.' }
    ]
  },
  {
    screen: 'calendar',
    input: 'generated/screens/calendar-propagated.png',
    states: [
      { type: 'loading', prompt: 'Show skeleton loading state with shimmer placeholders for the week selector and task area.' },
      { type: 'with-tasks', prompt: 'Show calendar with 3 task cards for the selected day. Tasks have checkboxes, titles, category chips, and time indicators. Mix of completed and pending tasks.' }
    ]
  },
  {
    screen: 'analytics',
    input: 'generated/screens/analytics-propagated.png',
    states: [
      { type: 'loading', prompt: 'Show skeleton loading state with shimmer placeholders for stats, chart, and category breakdown.' },
      { type: 'with-data', prompt: 'Show analytics with real data: 47 tasks completed, 12 day streak, 78% rate. Activity chart with varying bar heights. Category breakdown showing Work 45%, Personal 30%, Team 15%, Self 10%.' }
    ]
  }
];

async function imageToBase64(imagePath) {
  const buffer = fs.readFileSync(imagePath);
  return `data:image/png;base64,${buffer.toString('base64')}`;
}

async function generateState(screen, state, heroRef) {
  const inputDataUrl = await imageToBase64(screen.input);
  const heroDataUrl = await imageToBase64(heroRef);

  const prompt = `${state.prompt}
${STYLE_BASE}
Maintain exact visual style from reference. High fidelity mobile UI.`;

  console.log(`  Generating ${screen.screen}/${state.type}...`);

  const response = await fetch(`${BASE_URL}/nano-banana-pro/edit`, {
    method: 'POST',
    headers: {
      'Authorization': `Key ${FAL_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt,
      image_urls: [inputDataUrl, heroDataUrl],
      num_images: 1,
      aspect_ratio: '9:16',
      resolution: '1K',
      output_format: 'png',
      strength: 0.55
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data = await response.json();
  if (!data.images?.[0]) throw new Error('No image');

  const outputDir = `generated/states/${screen.screen}`;
  fs.mkdirSync(outputDir, { recursive: true });

  const outputPath = `${outputDir}/${state.type}.png`;
  const imgResponse = await fetch(data.images[0].url);
  fs.writeFileSync(outputPath, Buffer.from(await imgResponse.arrayBuffer()));

  console.log(`  ✓ ${outputPath}`);
  return outputPath;
}

async function main() {
  const heroRef = 'generated/anchors/anchor-01-hero.png';
  let completed = 0;
  const results = [];

  console.log('Generating state variants...\n');

  for (const screen of STATE_SCREENS) {
    console.log(`${screen.screen}:`);
    for (const state of screen.states) {
      try {
        const path = await generateState(screen, state, heroRef);
        results.push({ screen: screen.screen, state: state.type, path });
        completed++;
        await new Promise(r => setTimeout(r, 500));
      } catch (err) {
        console.error(`  ✗ ${state.type}: ${err.message}`);
      }
    }
  }

  console.log(`\nStates complete: ${completed} variants`);
  console.log(`Cost: ~$${(completed * 0.15).toFixed(2)}`);

  fs.writeFileSync('states_report.json', JSON.stringify({
    completedAt: new Date().toISOString(),
    variants: results,
    count: completed,
    cost: completed * 0.15
  }, null, 2));
}

main().catch(console.error);
