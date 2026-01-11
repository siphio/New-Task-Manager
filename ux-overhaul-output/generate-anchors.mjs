/**
 * Anchor Generation Script for TaskFlow UX Overhaul
 * Generates hero variants using fal.ai nano-banana-pro
 */

import fs from 'fs';
import path from 'path';

const FAL_API_KEY = process.env.FAL_KEY;
const BASE_URL = 'https://fal.run/fal-ai';

// Style configuration from cool-tones.css theme
const STYLE_CONFIG = {
  styleDirection: 'Modern, elegant task management app with cool purple-blue accent colors. Rounded corners (20px radius), soft layered shadows, Plus Jakarta Sans typography. Dark mode with deep charcoal background.',
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
  const ext = path.extname(imagePath).slice(1);
  const mimeType = ext === 'png' ? 'image/png' : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png';
  return `data:${mimeType};base64,${base64}`;
}

async function generateHeroVariant(inputImagePath, variantNum) {
  const inputDataUrl = await imageToBase64(inputImagePath);

  const prompt = `Redesign this mobile app screen with a ${STYLE_CONFIG.styleDirection}.
Variant ${variantNum} interpretation. Use these exact colors:
- Background: ${STYLE_CONFIG.colors.background}
- Card surfaces: ${STYLE_CONFIG.colors.card}
- Primary accent: ${STYLE_CONFIG.colors.primary}
- Text: ${STYLE_CONFIG.colors.foreground}
High fidelity UI design, professional mobile app mockup,
clean layout, consistent with modern iOS/Android design language.
Keep the exact same screen structure and content, only transform the visual style.`;

  console.log(`Generating hero variant ${variantNum}...`);

  // Use image_urls array as required by the API
  const response = await fetch(`${BASE_URL}/nano-banana-pro/edit`, {
    method: 'POST',
    headers: {
      'Authorization': `Key ${FAL_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt,
      image_urls: [inputDataUrl], // Array format required
      num_images: 1,
      aspect_ratio: '9:16',
      resolution: '1K',
      output_format: 'png',
      strength: 0.70
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

  return data.images[0].url;
}

async function downloadImage(url, outputPath) {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  fs.writeFileSync(outputPath, Buffer.from(arrayBuffer));
  console.log(`Saved: ${outputPath}`);
}

async function main() {
  const inputScreenPath = './screenshots/home-dashboard.png';
  const outputDir = './generated/anchors/hero-variants';

  if (!FAL_API_KEY) {
    console.error('FAL_KEY environment variable is not set');
    process.exit(1);
  }

  // Ensure output directory exists
  fs.mkdirSync(outputDir, { recursive: true });

  console.log('Starting hero variant generation...');
  console.log(`Input: ${inputScreenPath}`);
  console.log(`Output: ${outputDir}`);
  console.log('');

  const variants = [];

  for (let i = 1; i <= 4; i++) {
    try {
      const imageUrl = await generateHeroVariant(inputScreenPath, i);
      const outputPath = path.join(outputDir, `hero-variant-${i}.png`);
      await downloadImage(imageUrl, outputPath);
      variants.push(outputPath);
      console.log(`✓ Variant ${i} complete`);
    } catch (error) {
      console.error(`✗ Variant ${i} failed:`, error.message);
    }

    // Small delay between requests
    if (i < 4) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  console.log('');
  console.log(`Generated ${variants.length}/4 hero variants`);
  console.log('Cost: ~$' + (variants.length * 0.15).toFixed(2));

  // Write generation log
  fs.writeFileSync(
    path.join(outputDir, 'generation-log.json'),
    JSON.stringify({
      generatedAt: new Date().toISOString(),
      variants: variants,
      styleConfig: STYLE_CONFIG,
      cost: variants.length * 0.15
    }, null, 2)
  );
}

main().catch(console.error);
