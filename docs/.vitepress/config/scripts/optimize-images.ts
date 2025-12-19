import fs from 'node:fs';
import path from 'node:path';

import type { FormatEnum } from 'sharp';
import sharp from 'sharp';

const allowedImageExtensions = [
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.svg',
] as const;
const images: ReadonlyArray<{
  formats?: ReadonlyArray<keyof FormatEnum>;
  sizes: ReadonlyArray<{
    formats: ReadonlyArray<keyof FormatEnum>;
    width: number;
  }>;
  source: string;
}> = [
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
      {
        formats: ['png'],
        width: 920,
      },
    ],
    source: 'hero.png',
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
        formats: ['png'],
        width: 300,
      },
    ],
    source: 'logo-astronaut.png',
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
      {
        formats: ['png'],
        width: 1280,
      },
    ],
    source: 'openapi-ts-hero.png',
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

const outputDir = 'public/assets/.gen';

if (fs.existsSync(outputDir)) {
  fs.rmSync(outputDir, { force: true, recursive: true });
}

fs.mkdirSync(outputDir, { recursive: true });

export async function processImages() {
  for (const image of images) {
    const inputPath = path.join('public', 'assets', 'raw', image.source);
    const ext = path.extname(image.source).toLowerCase();
    const name = path.basename(image.source, ext);

    if (
      !allowedImageExtensions.includes(
        ext as (typeof allowedImageExtensions)[number],
      )
    ) {
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
