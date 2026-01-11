/**
 * Single Anchor Generation Script
 * Generates one anchor at a time using hero as reference
 */

import fs from 'fs';
import path from 'path';

const FAL_API_KEY = process.env.FAL_KEY;
const BASE_URL = 'https://fal.run/fal-ai';

const STYLE_CONFIG = {
  styleDirection: 'Modern, elegant task management app with cool purple-blue accent colors. Rounded corners (20px radius), soft layered shadows, Plus Jakarta Sans typography. Dark mode with deep charcoal background. Enhanced FAB glow effect, subtle gradients.',
  colors: {
    background: '#1a1d23',
    card: '#222830',
    primary: '#7c5cff',
    foreground: '#e8ecf4',
    muted: '#9ca3af',
    destructive: '#f87171'
  }
};

async function imageToBase64(imagePath) {
  const buffer = fs.readFileSync(imagePath);
  const base64 = buffer.toString('base64');
  return `data:image/png;base64,${base64}`;
}

async function generateAnchor(inputScreenPath, heroReferencePath, outputPath, screenDescription) {
  const inputDataUrl = await imageToBase64(inputScreenPath);
  const heroDataUrl = await imageToBase64(heroReferencePath);

  const prompt = `Redesign this mobile app screen matching the exact visual style of the reference image.
${screenDescription}
${STYLE_CONFIG.styleDirection}
Use these exact colors:
- Background: ${STYLE_CONFIG.colors.background}
- Card surfaces: ${STYLE_CONFIG.colors.card}
- Primary accent: ${STYLE_CONFIG.colors.primary}
- Text: ${STYLE_CONFIG.colors.foreground}
High fidelity UI design, professional mobile app mockup.
Keep the exact same screen structure and content, only transform the visual style to match the reference.`;

  console.log(`Generating anchor...`);
  console.log(`Input: ${inputScreenPath}`);
  console.log(`Reference: ${heroReferencePath}`);

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
      strength: 0.65
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  const data = await response.json();

  if (!data.images || data.images.length === 0) {
    throw new Error('No images returned');
  }

  // Download and save
  const imageUrl = data.images[0].url;
  const imgResponse = await fetch(imageUrl);
  const arrayBuffer = await imgResponse.arrayBuffer();
  fs.writeFileSync(outputPath, Buffer.from(arrayBuffer));

  console.log(`✓ Saved: ${outputPath}`);
  console.log(`Cost: ~$0.15`);
}

// Get arguments
const args = process.argv.slice(2);
if (args.length < 4) {
  console.log('Usage: node generate-single-anchor.mjs <input> <reference> <output> <description>');
  process.exit(1);
}

const [input, reference, output, ...descParts] = args;
const description = descParts.join(' ');

generateAnchor(input, reference, output, description).catch(console.error);
