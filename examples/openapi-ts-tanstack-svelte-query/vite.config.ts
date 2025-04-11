import { fileURLToPath } from 'node:url';

import { createVitestConfig } from '@config/vite-base';
import { sveltekit } from '@sveltejs/kit/vite';

export default async () => {
  const sveltekitPlugins = await sveltekit();
  return createVitestConfig(fileURLToPath(new URL('./', import.meta.url)), {
    cacheDir: '../../node_modules/.vite/openapi-ts-tanstack-svelte-query',
    plugins: [sveltekitPlugins],
    test: {
      include: ['src/**/*.{test,spec}.{js,ts}'],
    },
  });
};
