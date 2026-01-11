/**
 * Propagation Script - Regenerate all screens with validated style
 */

import fs from 'fs';
import path from 'path';

const FAL_API_KEY = process.env.FAL_KEY;
const BASE_URL = 'https://fal.run/fal-ai';

const STYLE_PROMPT = `Modern, elegant task management app with cool purple-blue accent colors (#7c5cff).
Rounded corners (20px radius), soft layered shadows, Plus Jakarta Sans typography.
Dark mode with deep charcoal background (#1a1d23). Card surfaces (#222830).
Enhanced glow effects on interactive elements. Professional high-fidelity UI design.`;

const SCREENS = [
  { input: 'screenshots/login.png', output: 'generated/screens/login-propagated.png', desc: 'Login screen with email/password form, Sign In button, Continue as Guest option' },
  { input: 'screenshots/home-dashboard.png', output: 'generated/screens/home-propagated.png', desc: 'Home dashboard with daily goals progress ring, today tasks section, FAB button' },
  { input: 'screenshots/task-drawer-create.png', output: 'generated/screens/task-drawer-propagated.png', desc: 'Task creation drawer with form fields, category chips, priority toggles' },
  { input: 'screenshots/calendar-week-view.png', output: 'generated/screens/calendar-propagated.png', desc: 'Calendar week view with day selector, empty state, navigation' },
  { input: 'screenshots/analytics-dashboard.png', output: 'generated/screens/analytics-propagated.png', desc: 'Analytics dashboard with progress stats, activity chart, category breakdown' },
  { input: 'screenshots/profile-settings.png', output: 'generated/screens/profile-propagated.png', desc: 'Profile settings with avatar, stats, settings list, no FAB on this screen' }
];

async function imageToBase64(imagePath) {
  const buffer = fs.readFileSync(imagePath);
  return `data:image/png;base64,${buffer.toString('base64')}`;
}

async function propagateScreen(screen, heroRef) {
  const inputDataUrl = await imageToBase64(screen.input);
  const heroDataUrl = await imageToBase64(heroRef);

  const prompt = `Redesign this mobile app screen with exact visual consistency to the reference.
${screen.desc}
${STYLE_PROMPT}
Match colors, typography, spacing, and component styles exactly from reference.
Keep the same content and layout structure.`;

  console.log(`Propagating: ${screen.input}...`);

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
      strength: 0.60
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }

  const data = await response.json();
  if (!data.images?.[0]) throw new Error('No image returned');

  const imgResponse = await fetch(data.images[0].url);
  fs.writeFileSync(screen.output, Buffer.from(await imgResponse.arrayBuffer()));
  console.log(`✓ Saved: ${screen.output}`);
}

async function main() {
  const heroRef = 'generated/anchors/anchor-01-hero.png';
  let completed = 0;
  let failed = 0;

  console.log('Starting propagation...\n');

  for (const screen of SCREENS) {
    try {
      await propagateScreen(screen, heroRef);
      completed++;
      await new Promise(r => setTimeout(r, 500)); // Small delay
    } catch (err) {
      console.error(`✗ Failed: ${screen.input} - ${err.message}`);
      failed++;
    }
  }

  console.log(`\nPropagation complete: ${completed}/${SCREENS.length} screens`);
  console.log(`Cost: ~$${(completed * 0.15).toFixed(2)}`);

  fs.writeFileSync('propagation_report.json', JSON.stringify({
    completedAt: new Date().toISOString(),
    screens: SCREENS.map(s => s.output),
    completed,
    failed,
    cost: completed * 0.15
  }, null, 2));
}

main().catch(console.error);
