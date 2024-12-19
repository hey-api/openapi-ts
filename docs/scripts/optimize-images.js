import fs from 'node:fs';
import path from 'node:path';

import sharp from 'sharp';

const inputDir = 'public/raw';
const outputDir = 'public/images';

const supportedExtensions = ['.png', '.jpg', '.jpeg', '.webp'];
const sizes = [480, 768, 1200];
const formats = ['png', 'webp', 'jpeg'];

if (fs.existsSync(outputDir)) {
  fs.rmSync(outputDir, { force: true, recursive: true });
}

fs.mkdirSync(outputDir, { recursive: true });

async function processImages() {
  const files = fs.readdirSync(inputDir);

  for (const file of files) {
    const inputPath = path.join(inputDir, file);
    const ext = path.extname(file).toLowerCase();
    const baseName = path.basename(file, ext);

    if (!supportedExtensions.includes(ext)) {
      continue;
    }

    console.log(`Processing ${file}...`);

    for (const size of sizes) {
      for (const format of formats) {
        const outputFileName = `${baseName}-${size}w.${format}`;
        const outputPath = path.join(outputDir, outputFileName);

        let image = sharp(inputPath).resize(size).toFormat(format, {
          quality: 80,
        });

        if (format === 'jpeg') {
          image = image.flatten({ background: '#ffffff' });
        }

        await image.toFile(outputPath);

        console.log(`Generated: ${outputFileName}`);
      }
    }
  }
  console.log('✅ Image optimization complete!');
}

processImages().catch((err) => {
  console.error('❌ Error optimizing images:', err);
});
