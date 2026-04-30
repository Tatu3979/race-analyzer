import sharp from 'sharp';
import { readFileSync, statSync } from 'node:fs';

const src = 'public/logo.svg.bak';
const before = statSync(src).size;
console.log(`source: ${before} bytes (svg with embedded PNG)`);

const svgBuf = readFileSync(src);
const base = sharp(svgBuf, { density: 400 }).resize(1440, 360, {
  fit: 'contain',
  background: { r: 0, g: 0, b: 0, alpha: 0 },
});

const variants = [
  { ext: 'png', opts: { compressionLevel: 9 } },
  { ext: 'webp', opts: { quality: 90 } },
  { ext: 'webp', opts: { quality: 80 }, suffix: '-q80' },
];

for (const v of variants) {
  const dst = `public/logo${v.suffix ?? ''}.${v.ext}`;
  await base.clone()[v.ext](v.opts).toFile(dst);
  const after = statSync(dst).size;
  console.log(`  ${dst}: ${after} bytes (${(((before - after) / before) * 100).toFixed(1)}% smaller)`);
}
