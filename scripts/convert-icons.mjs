import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const iconsDir = path.resolve('public/icons');
const sizes = [192, 512];

const svgFiles = fs.readdirSync(iconsDir).filter(f => f.endsWith('.svg'));

for (const svgFile of svgFiles) {
  const svgPath = path.join(iconsDir, svgFile);
  const baseName = svgFile.replace('.svg', '');
  const svgBuffer = fs.readFileSync(svgPath);

  for (const size of sizes) {
    const outPath = path.join(iconsDir, `${baseName}-${size}.png`);
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outPath);
    console.log(`Created: ${outPath}`);
  }
}

console.log('Done!');
