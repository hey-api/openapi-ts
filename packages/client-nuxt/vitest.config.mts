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
    // Use process forks instead of worker threads on Windows to avoid tinypool issues
    pool: process.platform === 'win32' ? 'forks' : 'threads',

    root: fileURLToPath(new URL('./', import.meta.url)),
    // Increase timeout for Windows
    testTimeout: process.platform === 'win32' ? 15000 : 5000,
  },
});
