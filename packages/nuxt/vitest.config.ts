import { fileURLToPath } from 'node:url';

import { defineVitestConfig } from '@nuxt/test-utils/config';

export default defineVitestConfig({
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
    root: fileURLToPath(new URL('./', import.meta.url)),
  },
});
