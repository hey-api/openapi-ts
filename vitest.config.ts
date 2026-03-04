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
          name: '@hey-api/json-schema-ref-parser',
          root: 'packages/json-schema-ref-parser',
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
          name: '@test/openapi-ts-core',
          root: 'packages/openapi-ts-tests/core/test',
          setupFiles: ['./vitest.setup.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: '@test/openapi-ts-clients',
          root: 'packages/openapi-ts-tests/clients/test',
          setupFiles: ['./vitest.setup.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: '@test/openapi-ts-formats',
          root: 'packages/openapi-ts-tests/formats/test',
          setupFiles: ['./vitest.setup.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: '@test/openapi-ts-constraints',
          root: 'packages/openapi-ts-tests/constraints/test',
          setupFiles: ['./vitest.setup.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: '@test/openapi-ts-additional-props',
          root: 'packages/openapi-ts-tests/additional-props/test',
          setupFiles: ['./vitest.setup.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: '@test/openapi-ts-plugins',
          root: 'packages/openapi-ts-tests/plugins/test',
          setupFiles: ['./vitest.setup.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: '@test/openapi-ts-meta',
          root: 'packages/openapi-ts-tests/meta/test',
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
