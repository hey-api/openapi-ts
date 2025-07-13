import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createClient, type UserConfig } from '@hey-api/openapi-ts';
import { describe, expect, it } from 'vitest';

import { getFilePaths } from './utils';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const version = '2.0.x';

const outputDir = path.join(__dirname, 'generated', version);

describe(`OpenAPI ${version}`, () => {
  const createConfig = (userConfig: UserConfig): UserConfig => {
    const inputPath = path.join(
      __dirname,
      'spec',
      version,
      typeof userConfig.input === 'string'
        ? userConfig.input
        : (userConfig.input.path as string),
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
    };
  };

  const scenarios = [
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
            $name: '@hey-api/typescript',
            enums: {
              case: 'SCREAMING_SNAKE_CASE',
              mode: 'javascript',
            },
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
            $name: '@hey-api/typescript',
            enums: {
              case: 'PascalCase',
              mode: 'javascript',
            },
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
            $name: '@hey-api/typescript',
            enums: {
              case: 'camelCase',
              mode: 'javascript',
            },
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
            $name: '@hey-api/typescript',
            enums: {
              case: 'snake_case',
              mode: 'javascript',
            },
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
            $name: '@hey-api/typescript',
            enums: {
              case: 'preserve',
              mode: 'javascript',
            },
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
            $name: '@hey-api/typescript',
            enums: {
              case: 'SCREAMING_SNAKE_CASE',
              mode: 'typescript',
            },
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
            $name: '@hey-api/typescript',
            enums: {
              case: 'PascalCase',
              mode: 'typescript',
            },
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
            $name: '@hey-api/typescript',
            enums: {
              case: 'camelCase',
              mode: 'typescript',
            },
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
            $name: '@hey-api/typescript',
            enums: {
              case: 'snake_case',
              mode: 'typescript',
            },
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
            $name: '@hey-api/typescript',
            enums: {
              case: 'preserve',
              mode: 'typescript',
            },
          },
        ],
      }),
      description:
        'handles various enum names and values (TypeScript, preserve)',
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
            $name: '@hey-api/sdk',
            auth: true,
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
            $name: '@hey-api/sdk',
            auth: true,
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
            $name: '@hey-api/sdk',
            auth: true,
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
            $name: '@hey-api/sdk',
            auth: false,
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

    const outputPath =
      typeof config.output === 'string' ? config.output : config.output.path;
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
});
