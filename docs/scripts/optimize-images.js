import fs from 'node:fs';
import path from 'node:path';

import sharp from 'sharp';

const allowedImageExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.svg'];
const images = [
  {
    sizes: [
      {
        formats: ['png'],
        width: 300,
      },
      {
        formats: ['png'],
        width: 640,
      },
    ],
    source: 'blueprint.png',
  },
  {
    sizes: [
      {
        formats: ['png'],
        width: 300,
      },
      {
        formats: ['png'],
        width: 640,
      },
    ],
    source: 'bricks.png',
  },
  {
    sizes: [
      {
        formats: ['png'],
        width: 16,
      },
      {
        formats: ['png'],
        width: 32,
      },
      {
        formats: ['png'],
        width: 48,
      },
      {
        formats: ['png'],
        width: 300,
      },
      {
        formats: ['png'],
        width: 640,
      },
    ],
    source: 'logo.png',
  },
  {
    sizes: [
      {
        formats: ['png'],
        width: 300,
      },
    ],
    source: 'logo-astronaut.png',
  },
  {
    sizes: [
      {
        formats: ['jpeg', 'webp'],
        width: 480,
      },
      {
        formats: ['webp'],
        width: 768,
      },
      {
        formats: ['png', 'webp'],
        width: 1200,
      },
    ],
    source: 'cella-logo-wordmark.png',
  },
  {
    sizes: [
      {
        formats: ['jpeg', 'webp'],
        width: 480,
      },
      {
        formats: ['webp'],
        width: 768,
      },
      {
        formats: ['png', 'webp'],
        width: 1200,
      },
    ],
    source: 'kinde-logo-wordmark.png',
  },
  {
    sizes: [
      {
        formats: ['jpeg', 'webp'],
        width: 480,
      },
      {
        formats: ['webp'],
        width: 768,
      },
      {
        formats: ['png', 'webp'],
        width: 1200,
      },
    ],
    source: 'kinde-logo-wordmark-dark.png',
  },
  {
    sizes: [
      {
        formats: ['jpeg', 'webp'],
        width: 480,
      },
      {
        formats: ['webp'],
        width: 768,
      },
      {
        formats: ['png', 'webp'],
        width: 1200,
      },
    ],
    source: 'openstatus-logo.svg',
  },
  {
    sizes: [
      {
        formats: ['jpeg', 'webp'],
        width: 480,
      },
      {
        formats: ['webp'],
        width: 768,
      },
      {
        formats: ['png', 'webp'],
        width: 1200,
      },
    ],
    source: 'scalar-logo-wordmark.png',
  },
  {
    sizes: [
      {
        formats: ['jpeg', 'webp'],
        width: 480,
      },
      {
        formats: ['webp'],
        width: 768,
      },
      {
        formats: ['png', 'webp'],
        width: 1200,
      },
    ],
    source: 'stainless-logo-wordmark.png',
  },
];

const outputDir = 'public/images';

if (fs.existsSync(outputDir)) {
  fs.rmSync(outputDir, { force: true, recursive: true });
}

fs.mkdirSync(outputDir, { recursive: true });

async function processImages() {
  for (const image of images) {
    const inputPath = path.join('public', image.source);
    const ext = path.extname(image.source).toLowerCase();
    const name = path.basename(image.source, ext);

    if (!allowedImageExtensions.includes(ext)) {
      continue;
    }

    for (const imageSize of image.sizes) {
      const size = typeof imageSize === 'object' ? imageSize.width : imageSize;
      const formats =
        typeof imageSize === 'object'
          ? imageSize.formats || image.formats
          : image.formats;
      for (const format of formats) {
        const outputFileName = `${name}-${size}w.${format}`;
        const outputPath = path.join(outputDir, outputFileName);

        let image = sharp(inputPath).resize(size).toFormat(format, {
          quality: 80,
        });

        if (format === 'jpeg') {
          image = image.flatten({ background: '#ffffff' });
        }

        await image.toFile(outputPath);
      }
    }
  }
}

processImages().catch((err) => {
  console.error('❌ Error optimizing images:', err);
});
