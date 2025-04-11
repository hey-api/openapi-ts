import { fileURLToPath } from 'node:url';

import { defineVitestConfig } from '@nuxt/test-utils/config';

const config = await defineVitestConfig({
  cacheDir: '../../node_modules/.vite/client-nuxt',
  root: fileURLToPath(new URL('./', import.meta.url)),
  test: {
    coverage: {
      exclude: ['dist', 'src/**/*.d.ts'],
      include: ['src/**/*.ts'],
      provider: 'v8',
    },
    environment: 'nuxt',
    environmentOptions: {
      nuxt: {
        domEnvironment: 'jsdom',
      },
    },
  },
});

export default config;
