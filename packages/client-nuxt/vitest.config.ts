import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      exclude: ['dist', 'src/**/*.d.ts'],
      include: ['src/**/*.ts'],
      provider: 'v8',
    },
    root: fileURLToPath(new URL('./', import.meta.url)),
  },
});
