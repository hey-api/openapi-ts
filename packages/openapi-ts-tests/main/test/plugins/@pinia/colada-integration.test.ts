import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createClient, type UserConfig } from '@hey-api/openapi-ts';
import { describe, expect, it } from 'vitest';

import { getFilePaths, getSpecsPath } from '../../../../utils';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const version = '3.1.x';
const outputDir = path.join(__dirname, 'generated', version, 'integration');

describe('@pinia/colada integration tests', () => {
  const createConfig = (
    userConfig: Omit<UserConfig, 'input'> & Pick<Partial<UserConfig>, 'input'>,
  ): UserConfig => {
    const inputPath = path.join(getSpecsPath(), version, 'petstore.yaml');
    return {
      logs: {
        level: 'silent',
      },
      ...userConfig,
      input: userConfig.input ?? inputPath,
      output:
        userConfig.output ??
        path.join(
          outputDir,
          typeof userConfig.output === 'string' ? userConfig.output : '',
        ),
    };
  };

  const scenarios = [
    {
      config: createConfig({
        output: 'client-fetch',
        plugins: ['@hey-api/client-fetch', '@hey-api/sdk', '@pinia/colada'],
      }),
      description: 'works with @hey-api/client-fetch',
      expectedClient: 'client-fetch',
    },
    {
      config: createConfig({
        output: 'client-axios',
        plugins: ['@hey-api/client-axios', '@hey-api/sdk', '@pinia/colada'],
      }),
      description: 'works with @hey-api/client-axios',
      expectedClient: 'client-axios',
    },
    {
      config: createConfig({
        output: 'multiple-plugins',
        plugins: [
          '@hey-api/client-fetch',
          '@hey-api/schemas',
          '@hey-api/sdk',
          '@hey-api/typescript',
          '@pinia/colada',
        ],
      }),
      description: 'works with multiple plugins',
      expectedFiles: [
        '@pinia/colada.gen.ts',
        'schemas.gen.ts',
        'sdk.gen.ts',
        'types.gen.ts',
      ],
    },
    {
      config: createConfig({
        output: 'with-transformers',
        plugins: [
          '@hey-api/client-fetch',
          {
            name: '@hey-api/sdk',
            // @ts-expect-error
            transformer: {
              name: 'custom',
            },
          },
          '@pinia/colada',
        ],
      }),
      description: 'works with custom SDK transformers',
    },
    {
      config: createConfig({
        output: 'response-style-data',
        plugins: [
          '@hey-api/client-fetch',
          {
            name: '@hey-api/sdk',
            responseStyle: 'data',
          },
          '@pinia/colada',
        ],
      }),
      description: 'works with responseStyle: data',
    },
    {
      config: createConfig({
        output: 'as-class',
        plugins: [
          '@hey-api/client-fetch',
          {
            asClass: true,
            name: '@hey-api/sdk',
          },
          '@pinia/colada',
        ],
      }),
      description: 'works with SDK asClass option',
    },
    {
      config: createConfig({
        output: 'different-cases',
        plugins: [
          '@hey-api/client-fetch',
          {
            // @ts-expect-error
            case: 'PascalCase',
            name: '@hey-api/sdk',
          },
          {
            case: 'camelCase',
            name: '@pinia/colada',
          },
        ],
      }),
      description: 'works with different case settings between plugins',
    },
    {
      config: createConfig({
        output: 'enums-typescript',
        plugins: [
          '@hey-api/client-fetch',
          {
            enums: 'typescript',
            name: '@hey-api/typescript',
          },
          '@hey-api/sdk',
          '@pinia/colada',
        ],
      }),
      description: 'works with TypeScript enums',
    },
    {
      config: createConfig({
        output: 'enums-javascript',
        plugins: [
          '@hey-api/client-fetch',
          {
            enums: 'javascript',
            name: '@hey-api/typescript',
          },
          '@hey-api/sdk',
          '@pinia/colada',
        ],
      }),
      description: 'works with JavaScript enums',
    },
  ];

  it.each(scenarios)(
    '$description',
    async ({ config, expectedClient, expectedFiles }) => {
      await createClient(config);

      const outputPath =
        typeof config.output === 'string' ? config.output : config.output.path;
      const filePaths = getFilePaths(outputPath);

      // Verify that the Pinia Colada file was generated
      const piniaFiles = filePaths.filter(
        (path) => path.includes('@pinia/colada') && path.endsWith('.gen.ts'),
      );
      expect(piniaFiles.length).toBeGreaterThan(0);

      // Check for expected files if specified
      if (expectedFiles) {
        expectedFiles.forEach((expectedFile) => {
          const fileExists = filePaths.some((filePath) =>
            filePath.endsWith(expectedFile),
          );
          expect(fileExists).toBe(true);
        });
      }

      // Verify content of main Pinia Colada file
      const mainPiniaFile = piniaFiles.find(
        (path) => !path.includes('/') || path.endsWith('@pinia/colada.gen.ts'),
      );
      if (mainPiniaFile) {
        const content = fs.readFileSync(mainPiniaFile, 'utf-8');

        // Should import from the correct client
        if (expectedClient) {
          expect(content).toContain(`from '../client.gen'`);
        }

        // Should have query and mutation functions
        expect(content).toMatch(/export const \w+Query/);
        expect(content).toMatch(/export const \w+Mutation/);

        // Should import SDK functions
        expect(content).toContain(`from '../sdk.gen'`);

        // Should import types
        expect(content).toContain(`from '../types.gen'`);
      }
    },
  );

  describe('Plugin dependency validation', () => {
    it('should require @hey-api/sdk plugin', async () => {
      const config = createConfig({
        output: 'no-sdk',
        plugins: [
          '@hey-api/client-fetch',
          '@pinia/colada', // Missing @hey-api/sdk
        ],
      });

      // This should throw or handle the missing dependency
      await expect(createClient(config)).rejects.toThrow();
    });

    it('should require @hey-api/typescript plugin', async () => {
      const config = createConfig({
        output: 'no-typescript',
        plugins: [
          '@hey-api/client-fetch',
          '@hey-api/sdk',
          '@pinia/colada', // Missing @hey-api/typescript
        ],
      });

      // This should throw or handle the missing dependency
      await expect(createClient(config)).rejects.toThrow();
    });
  });

  describe('Generated code compilation', () => {
    it('should generate TypeScript-compliant code', async () => {
      const config = createConfig({
        output: 'typescript-check',
        plugins: [
          '@hey-api/client-fetch',
          '@hey-api/typescript',
          '@hey-api/sdk',
          '@pinia/colada',
        ],
      });

      await createClient(config);

      const outputPath =
        typeof config.output === 'string' ? config.output : config.output.path;
      const filePaths = getFilePaths(outputPath);
      const piniaFile = filePaths.find(
        (path) => path.includes('@pinia/colada') && path.endsWith('.gen.ts'),
      );

      if (piniaFile) {
        const content = fs.readFileSync(piniaFile, 'utf-8');

        // Basic TypeScript syntax checks
        expect(content).not.toContain('import {');
        expect(content).toMatch(/export const \w+: /); // Should have type annotations
        expect(content).not.toContain('any;'); // Should avoid any types

        // Should have proper imports
        expect(content).toMatch(/import.*from/);

        // Should have proper exports
        expect(content).toMatch(/export const/);
      }
    });
  });

  describe('OpenAPI version compatibility', () => {
    const versions = ['2.0.x', '3.0.x', '3.1.x'];

    it.each(versions)('should work with OpenAPI %s', async (version) => {
      // Use a simple spec for each version
      const specFile = version === '2.0.x' ? 'minimal.json' : 'petstore.yaml';
      const inputPath = path.join(getSpecsPath(), version, specFile);

      // Skip if spec doesn't exist for this version
      if (!fs.existsSync(inputPath)) {
        return;
      }

      const config = createConfig({
        input: inputPath,
        output: `openapi-${version}`,
        plugins: [
          '@hey-api/client-fetch',
          '@hey-api/typescript',
          '@hey-api/sdk',
          '@pinia/colada',
        ],
      });

      await expect(createClient(config)).resolves.not.toThrow();
    });
  });

  describe('Error handling', () => {
    it('should handle empty OpenAPI specs gracefully', async () => {
      // Create a minimal valid OpenAPI spec
      const minimalSpec = {
        info: { title: 'Test', version: '1.0.0' },
        openapi: '3.1.0',
        paths: {},
      };

      const tempSpecPath = path.join(outputDir, 'minimal-spec.json');
      fs.writeFileSync(tempSpecPath, JSON.stringify(minimalSpec, null, 2));

      const config = createConfig({
        input: tempSpecPath,
        output: 'minimal-spec',
        plugins: [
          '@hey-api/client-fetch',
          '@hey-api/typescript',
          '@hey-api/sdk',
          '@pinia/colada',
        ],
      });

      await expect(createClient(config)).resolves.not.toThrow();

      // Should still generate basic structure even with no operations
      const outputPath =
        typeof config.output === 'string' ? config.output : config.output.path;
      const filePaths = getFilePaths(outputPath);
      const piniaFile = filePaths.find((path) =>
        path.includes('@pinia/colada'),
      );

      if (piniaFile) {
        const content = fs.readFileSync(piniaFile, 'utf-8');
        expect(content).toContain('// This file is auto-generated');
      }
    });
  });
});
