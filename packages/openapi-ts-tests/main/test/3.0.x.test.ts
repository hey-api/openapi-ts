import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createClient, type UserConfig } from '@hey-api/openapi-ts';
import { describe, expect, it } from 'vitest';

import { getFilePaths, getSpecsPath } from '../../utils';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const version = '3.0.x';

const outputDir = path.join(__dirname, 'generated', version);

describe(`OpenAPI ${version}`, () => {
  const createConfig = (userConfig: UserConfig): UserConfig => {
    const inputPath = path.join(
      getSpecsPath(),
      version,
      typeof userConfig.input === 'string'
        ? userConfig.input
        : Array.isArray(userConfig.input)
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
        typeof userConfig.output === 'string'
          ? userConfig.output
          : Array.isArray(userConfig.output)
            ? typeof userConfig.output[0] === 'string'
              ? userConfig.output[0]
              : (userConfig.output[0] as any).path || ''
            : (userConfig.output as any).path || '',
      ),
    };
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
        input: 'additional-properties-undefined.json',
        output: 'additional-properties-undefined',
      }),
      description: 'allows arbitrary properties on objects',
    },
    {
      config: createConfig({
        input: 'array-items-one-of-length-1.yaml',
        output: 'array-items-one-of-length-1',
        plugins: ['@hey-api/typescript', 'valibot'],
      }),
      description:
        'generates correct array when items are oneOf array with single item',
    },
    {
      config: createConfig({
        input: 'array-nested-one-of.yaml',
        output: 'array-nested-one-of',
      }),
      description: 'generates union of arrays when items use nested oneOf',
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
        input: 'case.yaml',
        output: 'case-preserve',
        plugins: [
          {
            case: 'preserve',
            name: '@hey-api/typescript',
          },
        ],
      }),
      description: 'handles preserved identifier casing',
    },
    {
      config: createConfig({
        input: 'case.yaml',
        output: 'case-PascalCase',
        plugins: [
          {
            case: 'PascalCase',
            name: '@hey-api/typescript',
          },
        ],
      }),
      description: 'handles PascalCase identifier casing',
    },
    {
      config: createConfig({
        input: 'case.yaml',
        output: 'case-camelCase',
        plugins: [
          {
            case: 'camelCase',
            name: '@hey-api/typescript',
          },
        ],
      }),
      description: 'handles camelCase identifier casing',
    },
    {
      config: createConfig({
        input: 'case.yaml',
        output: 'case-snake_case',
        plugins: [
          {
            case: 'snake_case',
            name: '@hey-api/typescript',
          },
        ],
      }),
      description: 'handles snake_case identifier casing',
    },
    {
      config: createConfig({
        input: 'components-request-bodies.json',
        output: 'components-request-bodies',
      }),
      description: 'handles reusable request bodies',
    },
    {
      config: createConfig({
        input: 'content-binary.json',
        output: 'content-binary',
      }),
      description: 'handles binary content',
    },
    {
      config: createConfig({
        input: 'content-types.yaml',
        output: 'content-types',
        plugins: [
          '@hey-api/client-axios',
          '@hey-api/typescript',
          '@hey-api/sdk',
        ],
      }),
      description: 'handles content types',
    },
    {
      config: createConfig({
        input: 'discriminator-all-of.yaml',
        output: 'discriminator-all-of',
      }),
      description: 'handles discriminator with and without mapping',
    },
    {
      config: createConfig({
        input: 'discriminator-any-of.yaml',
        output: 'discriminator-any-of',
      }),
      description: 'handles discriminator with and without mapping',
    },
    {
      config: createConfig({
        input: 'discriminator-mapped-many.yaml',
        output: 'discriminator-mapped-many',
      }),
      description: 'handles discriminator with multiple mappings',
    },
    {
      config: createConfig({
        input: 'discriminator-one-of.yaml',
        output: 'discriminator-one-of',
      }),
      description: 'handles discriminator with and without mapping',
    },
    {
      config: createConfig({
        input: 'enum-escape.json',
        output: 'enum-escape',
      }),
      description: 'escapes enum values',
    },
    {
      config: createConfig({
        input: 'enum-inline.json',
        output: 'enum-inline',
        parser: {
          transforms: {
            enums: 'root',
          },
        },
        plugins: ['@hey-api/typescript'],
      }),
      description: 'exports inline enums',
    },
    {
      config: createConfig({
        input: 'enum-inline.json',
        output: 'enum-inline-javascript',
        parser: {
          transforms: {
            enums: 'root',
          },
        },
        plugins: [
          {
            enums: 'javascript',
            name: '@hey-api/typescript',
          },
        ],
      }),
      description: 'exports inline enums (JavaScript)',
    },
    {
      config: createConfig({
        input: 'enum-inline.json',
        output: 'enum-inline-typescript',
        parser: {
          transforms: {
            enums: 'root',
          },
        },
        plugins: [
          {
            enums: 'typescript',
            name: '@hey-api/typescript',
          },
        ],
      }),
      description: 'exports inline enums (TypeScript)',
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
        output: 'enum-names-values-javascript-ignore-null',
        plugins: [
          {
            enums: {
              case: 'preserve',
              constantsIgnoreNull: true,
              mode: 'javascript',
            },
            name: '@hey-api/typescript',
          },
        ],
      }),
      description:
        'handles various enum names and values (JavaScript, preserve, ignore null)',
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
        input: 'enum-null.json',
        output: 'enum-null',
        plugins: ['@hey-api/typescript', 'valibot'],
      }),
      description: 'handles null enums',
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
        input: 'internal-name-conflict.json',
        output: 'internal-name-conflict',
        plugins: ['@hey-api/client-fetch', '@tanstack/react-query'],
      }),
      description:
        'handles conflict between generated code and internal artifacts',
    },
    {
      config: createConfig({
        input: 'operation-204.json',
        output: 'operation-204',
      }),
      description: 'handles empty response status codes',
    },
    {
      config: createConfig({
        input: 'parameter-explode-false.json',
        output: 'parameter-explode-false',
        plugins: ['@hey-api/client-fetch', '@hey-api/sdk'],
      }),
      description: 'handles non-exploded array query parameters',
    },
    {
      config: createConfig({
        input: 'parameter-explode-false.json',
        output: 'parameter-explode-false-axios',
        plugins: ['@hey-api/client-axios', '@hey-api/sdk'],
      }),
      description: 'handles non-exploded array query parameters (Axios)',
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
        input: 'security-http-bearer.json',
        output: 'security-http-bearer',
        plugins: [
          '@hey-api/client-fetch',
          {
            auth: true,
            name: '@hey-api/sdk',
          },
        ],
      }),
      description: 'generates SDK functions with auth (Bearer token)',
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
        input: 'security-open-id-connect.yaml',
        output: 'security-open-id-connect',
        plugins: [
          '@hey-api/client-fetch',
          {
            auth: true,
            name: '@hey-api/sdk',
          },
        ],
      }),
      description: 'generates SDK functions with auth (OpenID Connect)',
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
        input: 'transformers-all-of.yaml',
        output: 'transformers-all-of',
        plugins: ['@hey-api/client-fetch', '@hey-api/transformers'],
      }),
      description: 'transforms nested date in all of composition',
    },
    {
      config: createConfig({
        input: 'transformers-any-of-null.json',
        output: 'transformers-any-of-null',
        plugins: ['@hey-api/client-fetch', '@hey-api/transformers'],
      }),
      description: 'transforms nullable date property',
    },
    {
      config: createConfig({
        input: 'transformers-array.json',
        output: 'transformers-array',
        plugins: ['@hey-api/client-fetch', '@hey-api/transformers'],
      }),
      description: 'transforms an array',
    },
    {
      config: createConfig({
        input: 'type-invalid.json',
        output: 'type-invalid',
      }),
      description: 'gracefully handles invalid type',
    },
    {
      config: createConfig({
        input: 'validators.json',
        output: 'validators',
        plugins: ['valibot'],
      }),
      description: 'generates validator schemas',
    },
  ];

  it.each(scenarios)('$description', async ({ config }) => {
    await createClient(config);

    const outputPath =
      typeof config.output === 'string'
        ? config.output
        : Array.isArray(config.output)
          ? typeof config.output[0] === 'string'
            ? config.output[0]
            : (config.output[0] as any).path
          : (config.output as any).path;
    const filePaths = getFilePaths(outputPath);

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
        input: 'enum-inline.json',
        output: 'multi-enum-inline',
        parser: { transforms: { enums: 'root' } },
      });

      await createClient([configA, configB]);

      const outputPathA =
        typeof configA.output === 'string'
          ? configA.output
          : Array.isArray(configA.output)
            ? typeof configA.output[0] === 'string'
              ? configA.output[0]
              : (configA.output[0] as any).path
            : (configA.output as any).path;
      const outputPathB =
        typeof configB.output === 'string'
          ? configB.output
          : Array.isArray(configB.output)
            ? typeof configB.output[0] === 'string'
              ? configB.output[0]
              : (configB.output[0] as any).path
            : (configB.output as any).path;

      const filesA = getFilePaths(outputPathA);
      const filesB = getFilePaths(outputPathB);

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
            { path: path.join(specsBase, 'multi-a.yaml') },
            path.join(specsBase, 'multi-b.yaml'),
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
