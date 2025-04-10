import { fileURLToPath } from 'node:url';

import { createVitestConfig } from '@config/vite-base';
import { configDefaults } from 'vitest/config';

export default createVitestConfig(
  fileURLToPath(new URL('./', import.meta.url)),
  {
    test: {
      exclude: [...configDefaults.exclude, 'test/e2e/**/*.test.ts'],
      name: 'openapi-ts-unit',
    },
  },
);
