import { platform } from 'node:os';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      exclude: ['bin', 'dist', 'src/**/*.d.ts'],
      include: ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.vue'],
      provider: 'v8',
    },
    globals: true,
    projects: [
      'examples/*/vitest.config.ts',
      {
        extends: true,
        test: {
          name: '@hey-api/codegen-core',
          root: 'packages/codegen-core',
        },
      },
      {
        extends: true,
        test: {
          name: '@hey-api/openapi-python',
          root: 'packages/openapi-python',
          setupFiles: ['./vitest.setup.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: '@hey-api/openapi-ts',
          root: 'packages/openapi-ts',
          setupFiles: ['./vitest.setup.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: '@hey-api/shared',
          root: 'packages/shared',
        },
      },
      {
        extends: true,
        test: {
          name: '@test/openapi-ts',
          root: 'packages/openapi-ts-tests/main',
          setupFiles: ['./vitest.setup.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: '@test/openapi-ts-sdks',
          root: 'packages/openapi-ts-tests/sdks',
          setupFiles: ['./vitest.setup.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: '@test/openapi-ts-zod-v3',
          root: 'packages/openapi-ts-tests/zod/v3',
          setupFiles: ['./vitest.setup.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: '@test/openapi-ts-zod-v4',
          root: 'packages/openapi-ts-tests/zod/v4',
          setupFiles: ['./vitest.setup.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: '@hey-api/custom-client',
          root: 'packages/custom-client',
        },
      },
    ],
    testTimeout: platform() === 'win32' ? 10000 : 5000,
  },
});
