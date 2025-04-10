import { fileURLToPath } from 'node:url';

import { configDefaults, mergeConfig } from 'vitest/config';

import { createBaseConfig } from '../../vitest.config.base';

const baseConfig = createBaseConfig(
  fileURLToPath(new URL('./', import.meta.url)),
);

export default mergeConfig(baseConfig, {
  test: {
    coverage: {
      exclude: ['bin', 'dist', 'src/**/*.d.ts'],
    },
    exclude: [...configDefaults.exclude, 'test/e2e/**/*.test.ts'],
    name: 'openapi-ts-unit',
  },
});
