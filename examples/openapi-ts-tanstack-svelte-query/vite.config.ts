import { fileURLToPath } from 'node:url';

import { createVitestConfig } from '@config/vite-base';
import { sveltekit } from '@sveltejs/kit/vite';

export default async () => {
  const sveltekitPlugins = await sveltekit();
  return createVitestConfig(fileURLToPath(new URL('./', import.meta.url)), {
    plugins: [sveltekitPlugins],
    test: {
      include: ['src/**/*.{test,spec}.{js,ts}'],
    },
  });
};
