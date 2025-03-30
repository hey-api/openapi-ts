import { fileURLToPath } from 'node:url';

import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [],
  test: {
    coverage: {
      exclude: ['bin', 'dist', 'src/**/*.d.ts'],
      include: ['src/**/*.ts'],
      provider: 'v8',
    },
    exclude: [...configDefaults.exclude, 'test/e2e/**/*.test.ts'],
    root: fileURLToPath(new URL('./', import.meta.url)),
  },
});
