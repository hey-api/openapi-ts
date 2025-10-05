import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createClient, type UserConfig } from '@hey-api/openapi-ts';
import { describe, expect, it } from 'vitest';

import { getFilePaths, getSpecsPath } from '../../utils';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const version = '2.0.x';

const outputDir = path.join(__dirname, 'generated', version);

describe(`OpenAPI ${version}`, () => {
  const createConfig = (userConfig: UserConfig) => {
    const inputPath = path.join(
      getSpecsPath(),
      version,
      typeof userConfig.input === 'string'
        ? userConfig.input
        : userConfig.input instanceof Array
          ? (userConfig.input[0] as any).path || userConfig.input[0]
          : (userConfig.input as any).path,
    );
    return {
      plugins: ['@hey-api/typescript'],
      ...userConfig,
      input:
        typeof userConfig.input === 'string'
          ? inputPath
          : {
              ...userConfig.input,
              path: inputPath,
            },
      logs: {
        level: 'silent',
      },
      output: path.join(
        outputDir,
        typeof userConfig.output === 'string' ? userConfig.output : '',
      ),
    } as const satisfies UserConfig;
  };

  const scenarios = [
    {
      config: createConfig({
        input: 'external.yaml',
        output: 'external',
      }),
      description: 'handles external references',
    },
    {
      config: createConfig({
        input: 'additional-properties-false.json',
        output: 'additional-properties-false',
      }),
      description: 'forbids arbitrary properties on objects',
    },
    {
      config: createConfig({
        input: 'additional-properties-true.json',
        output: 'additional-properties-true',
      }),
      description: 'allows arbitrary properties on objects',
    },
    {
      config: createConfig({
        input: 'body-response-text-plain.yaml',
        output: 'body-response-text-plain',
        plugins: [
          '@hey-api/client-fetch',
          '@hey-api/typescript',
          '@hey-api/sdk',
        ],
      }),
      description: 'handle text/plain content type',
    },
    {
      config: createConfig({
        input: 'enum-names-values.json',
        output: 'enum-names-values',
      }),
      description: 'handles various enum names and values',
    },
    {
      config: createConfig({
        input: 'enum-names-values.json',
        output: 'enum-names-values-javascript-SCREAMING_SNAKE_CASE',
        plugins: [
          {
            enums: {
              case: 'SCREAMING_SNAKE_CASE',
              mode: 'javascript',
            },
            name: '@hey-api/typescript',
          },
        ],
      }),
      description:
        'handles various enum names and values (JavaScript, SCREAMING_SNAKE_CASE)',
    },
    {
      config: createConfig({
        input: 'enum-names-values.json',
        output: 'enum-names-values-javascript-PascalCase',
        plugins: [
          {
            enums: {
              case: 'PascalCase',
              mode: 'javascript',
            },
            name: '@hey-api/typescript',
          },
        ],
      }),
      description:
        'handles various enum names and values (JavaScript, PascalCase)',
    },
    {
      config: createConfig({
        input: 'enum-names-values.json',
        output: 'enum-names-values-javascript-camelCase',
        plugins: [
          {
            enums: {
              case: 'camelCase',
              mode: 'javascript',
            },
            name: '@hey-api/typescript',
          },
        ],
      }),
      description:
        'handles various enum names and values (JavaScript, camelCase)',
    },
    {
      config: createConfig({
        input: 'enum-names-values.json',
        output: 'enum-names-values-javascript-snake_case',
        plugins: [
          {
            enums: {
              case: 'snake_case',
              mode: 'javascript',
            },
            name: '@hey-api/typescript',
          },
        ],
      }),
      description:
        'handles various enum names and values (JavaScript, snake_case)',
    },
    {
      config: createConfig({
        input: 'enum-names-values.json',
        output: 'enum-names-values-javascript-preserve',
        plugins: [
          {
            enums: {
              case: 'preserve',
              mode: 'javascript',
            },
            name: '@hey-api/typescript',
          },
        ],
      }),
      description:
        'handles various enum names and values (JavaScript, preserve)',
    },
    {
      config: createConfig({
        input: 'enum-names-values.json',
        output: 'enum-names-values-typescript-SCREAMING_SNAKE_CASE',
        plugins: [
          {
            enums: {
              case: 'SCREAMING_SNAKE_CASE',
              mode: 'typescript',
            },
            name: '@hey-api/typescript',
          },
        ],
      }),
      description:
        'handles various enum names and values (TypeScript, SCREAMING_SNAKE_CASE)',
    },
    {
      config: createConfig({
        input: 'enum-names-values.json',
        output: 'enum-names-values-typescript-PascalCase',
        plugins: [
          {
            enums: {
              case: 'PascalCase',
              mode: 'typescript',
            },
            name: '@hey-api/typescript',
          },
        ],
      }),
      description:
        'handles various enum names and values (TypeScript, PascalCase)',
    },
    {
      config: createConfig({
        input: 'enum-names-values.json',
        output: 'enum-names-values-typescript-camelCase',
        plugins: [
          {
            enums: {
              case: 'camelCase',
              mode: 'typescript',
            },
            name: '@hey-api/typescript',
          },
        ],
      }),
      description:
        'handles various enum names and values (TypeScript, camelCase)',
    },
    {
      config: createConfig({
        input: 'enum-names-values.json',
        output: 'enum-names-values-typescript-snake_case',
        plugins: [
          {
            enums: {
              case: 'snake_case',
              mode: 'typescript',
            },
            name: '@hey-api/typescript',
          },
        ],
      }),
      description:
        'handles various enum names and values (TypeScript, snake_case)',
    },
    {
      config: createConfig({
        input: 'enum-names-values.json',
        output: 'enum-names-values-typescript-preserve',
        plugins: [
          {
            enums: {
              case: 'preserve',
              mode: 'typescript',
            },
            name: '@hey-api/typescript',
          },
        ],
      }),
      description:
        'handles various enum names and values (TypeScript, preserve)',
    },
    {
      config: createConfig({
        input: 'enum-names-values.json',
        output: 'enum-names-values-typescript-const',
        plugins: [
          {
            enums: {
              case: 'camelCase',
              mode: 'typescript-const',
            },
            name: '@hey-api/typescript',
          },
        ],
      }),
      description: 'handles TypeScript const enum modifier',
    },
    {
      config: createConfig({
        input: 'exclude-deprecated.yaml',
        output: 'exclude-deprecated',
        parser: {
          filters: {
            deprecated: false,
          },
        },
      }),
      description: 'excludes deprecated fields',
    },
    {
      config: createConfig({
        input: 'form-data.json',
        output: 'form-data',
        plugins: ['@hey-api/client-fetch', '@hey-api/sdk'],
      }),
      description: 'handles form data',
    },
    {
      config: createConfig({
        input: 'transforms-read-write.yaml',
        output: 'transforms-read-write',
        plugins: ['@hey-api/client-fetch', '@hey-api/typescript'],
      }),
      description: 'handles read-only and write-only types',
    },
    {
      config: createConfig({
        input: 'schema-unknown.yaml',
        output: 'schema-unknown',
        plugins: ['@hey-api/client-fetch', '@hey-api/sdk'],
      }),
      description: 'generates correct schemas instead of unknown',
    },
    {
      config: createConfig({
        input: 'security-api-key.json',
        output: 'security-api-key',
        plugins: [
          '@hey-api/client-fetch',
          {
            auth: true,
            name: '@hey-api/sdk',
          },
        ],
      }),
      description: 'generates SDK functions with auth (api key)',
    },
    {
      config: createConfig({
        input: 'security-basic.json',
        output: 'security-basic',
        plugins: [
          '@hey-api/client-fetch',
          {
            auth: true,
            name: '@hey-api/sdk',
          },
        ],
      }),
      description: 'generates SDK functions with auth (basic)',
    },
    {
      config: createConfig({
        input: 'security-oauth2.yaml',
        output: 'security-oauth2',
        plugins: [
          '@hey-api/client-fetch',
          {
            auth: true,
            name: '@hey-api/sdk',
          },
        ],
      }),
      description: 'generates SDK functions with auth (oauth2)',
    },
    {
      config: createConfig({
        input: 'security-oauth2.yaml',
        output: 'security-false',
        plugins: [
          '@hey-api/client-fetch',
          {
            auth: false,
            name: '@hey-api/sdk',
          },
        ],
      }),
      description: 'generates SDK functions without auth',
    },
    {
      config: createConfig({
        input: 'servers.yaml',
        output: 'servers',
        plugins: ['@hey-api/client-fetch', '@hey-api/typescript'],
      }),
      description: 'generates baseUrl',
    },
    {
      config: createConfig({
        input: 'servers-base-path.yaml',
        output: 'servers-base-path',
        plugins: ['@hey-api/client-fetch', '@hey-api/typescript'],
      }),
      description: 'generates baseUrl from basePath',
    },
    {
      config: createConfig({
        input: 'servers-host.yaml',
        output: 'servers-host',
        plugins: ['@hey-api/client-fetch', '@hey-api/typescript'],
      }),
      description: 'generates baseUrl from host',
    },
  ];

  it.each(scenarios)('$description', async ({ config }) => {
    await createClient(config);

    const filePaths = getFilePaths(config.output);

    await Promise.all(
      filePaths.map(async (filePath) => {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        await expect(fileContent).toMatchFileSnapshot(
          path.join(
            __dirname,
            '__snapshots__',
            version,
            filePath.slice(outputDir.length + 1),
          ),
        );
      }),
    );
  });

  describe('multi config', () => {
    it('generates outputs for all configs', async () => {
      const configA = createConfig({
        input: 'external.yaml',
        output: 'multi-external',
      });
      const configB = createConfig({
        input: 'enum-names-values.json',
        output: 'multi-enum-names-values',
      });

      await createClient([configA, configB]);

      const filesA = getFilePaths(configA.output);
      const filesB = getFilePaths(configB.output);

      await Promise.all(
        filesA.map(async (filePath) => {
          const fileContent = fs.readFileSync(filePath, 'utf-8');
          await expect(fileContent).toMatchFileSnapshot(
            path.join(
              __dirname,
              '__snapshots__',
              version,
              filePath.slice(outputDir.length + 1),
            ),
          );
        }),
      );

      await Promise.all(
        filesB.map(async (filePath) => {
          const fileContent = fs.readFileSync(filePath, 'utf-8');
          await expect(fileContent).toMatchFileSnapshot(
            path.join(
              __dirname,
              '__snapshots__',
              version,
              filePath.slice(outputDir.length + 1),
            ),
          );
        }),
      );
    });
  });

  describe('multi input', () => {
    it('parses multiple inputs (object + string) without errors', async () => {
      const specsBase = path.join(getSpecsPath(), version);
      await expect(
        createClient({
          dryRun: true,
          input: [
            { path: path.join(specsBase, 'multi-a.json') },
            path.join(specsBase, 'multi-b.json'),
          ],
          logs: { level: 'silent' },
          output: path.join(outputDir, 'multi-input'),
          plugins: ['@hey-api/typescript'],
        }),
      ).resolves.not.toThrow();
    });
  });

  describe('multi output', () => {
    it('generates multiple string outputs without errors', async () => {
      const results = await createClient({
        input: path.join(getSpecsPath(), version, 'external.yaml'),
        logs: { level: 'silent' },
        output: [
          path.join(outputDir, 'multi-output-string-1'),
          path.join(outputDir, 'multi-output-string-2'),
        ],
        plugins: ['@hey-api/typescript'],
      });

      expect(results).toHaveLength(2);

      // Verify both output directories were created
      expect(fs.existsSync(path.join(outputDir, 'multi-output-string-1'))).toBe(
        true,
      );
      expect(fs.existsSync(path.join(outputDir, 'multi-output-string-2'))).toBe(
        true,
      );
    });

    it('generates multiple output objects with different configurations', async () => {
      const results = await createClient({
        input: path.join(getSpecsPath(), version, 'external.yaml'),
        logs: { level: 'silent' },
        output: [
          {
            clean: true,
            indexFile: true,
            path: path.join(outputDir, 'multi-output-config-1'),
          },
          {
            clean: false,
            indexFile: false,
            path: path.join(outputDir, 'multi-output-config-2'),
          },
        ],
        plugins: ['@hey-api/typescript'],
      });

      expect(results).toHaveLength(2);

      // Verify both output directories were created
      expect(fs.existsSync(path.join(outputDir, 'multi-output-config-1'))).toBe(
        true,
      );
      expect(fs.existsSync(path.join(outputDir, 'multi-output-config-2'))).toBe(
        true,
      );

      // Verify index files are created/not created based on configuration
      expect(
        fs.existsSync(
          path.join(outputDir, 'multi-output-config-1', 'index.ts'),
        ),
      ).toBe(true);
      expect(
        fs.existsSync(
          path.join(outputDir, 'multi-output-config-2', 'index.ts'),
        ),
      ).toBe(false);
    });

    it('generates mixed string and object outputs', async () => {
      const results = await createClient({
        input: path.join(getSpecsPath(), version, 'external.yaml'),
        logs: { level: 'silent' },
        output: [
          path.join(outputDir, 'multi-output-mixed-string'),
          {
            indexFile: false,
            path: path.join(outputDir, 'multi-output-mixed-object'),
          },
        ],
        plugins: ['@hey-api/typescript'],
      });

      expect(results).toHaveLength(2);

      // Verify both output directories were created
      expect(
        fs.existsSync(path.join(outputDir, 'multi-output-mixed-string')),
      ).toBe(true);
      expect(
        fs.existsSync(path.join(outputDir, 'multi-output-mixed-object')),
      ).toBe(true);
    });

    it('preserves global configuration across multiple outputs', async () => {
      const results = await createClient({
        experimentalParser: true,
        input: path.join(getSpecsPath(), version, 'external.yaml'),
        logs: { level: 'silent' },
        output: [
          path.join(outputDir, 'multi-output-global-1'),
          path.join(outputDir, 'multi-output-global-2'),
        ],
        plugins: ['@hey-api/typescript', '@hey-api/sdk'],
      });

      expect(results).toHaveLength(2);

      // Both results should have the same global configuration
      results.forEach((result) => {
        if ('config' in result) {
          expect(result.config.experimentalParser).toBe(true);
          expect(result.config.plugins['@hey-api/typescript']).toBeDefined();
          expect(result.config.plugins['@hey-api/sdk']).toBeDefined();
        }
      });
    });
  });
});
