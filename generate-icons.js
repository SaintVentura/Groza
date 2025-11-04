const { createCanvas, registerFont } = require('canvas');
const fs = require('fs');
const path = require('path');

// Uncomment if you want to use Jost font and have it available
// registerFont('./groza/assets/fonts/Jost-VariableFont_wght.ttf', { family: 'Jost' });

const ICONS = [
  { name: 'icon.png', size: 1024, bg: '#000', fg: '#fff', text: 'GROZA' },
  { name: 'adaptive-icon.png', size: 512, bg: '#000', fg: '#fff', text: 'GROZA' },
  { name: 'splash-icon.png', size: 200, bg: '#000', fg: '#fff', text: 'GROZA' },
  { name: 'favicon.png', size: 32, bg: '#000', fg: '#fff', text: 'GROZA' },
  { name: 'home-logo.png', size: 1024, bg: '#fff', fg: '#000', text: 'GROZA' },
];

const OUTPUT_DIR = './groza/assets/images';

function drawIcon(size, filename, bg, fg, text) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  // Text
  ctx.fillStyle = fg;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  // Make the text a bit smaller (was 0.32, now 0.22)
  ctx.font = `bold ${Math.floor(size * 0.22)}px "Jost", "Arial", sans-serif`;
  ctx.fillText(text, size / 2, size / 2);

  // Save
  const out = fs.createWriteStream(path.join(OUTPUT_DIR, filename));
  const stream = canvas.createPNGStream();
  stream.pipe(out);
  out.on('finish', () => console.log(`Created ${filename}`));
}

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

ICONS.forEach(icon => drawIcon(icon.size, icon.name, icon.bg, icon.fg, icon.text)); 