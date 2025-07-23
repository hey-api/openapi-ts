import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createClient, type UserConfig } from '@hey-api/openapi-ts';
import { describe, expect, it } from 'vitest';

import { getFilePaths, getSpecsPath } from '../../utils';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const version = '3.1.x';

const outputDir = path.join(__dirname, 'generated', version);

describe(`OpenAPI ${version}`, () => {
  const createConfig = (userConfig: UserConfig): UserConfig => {
    const inputPath = path.join(
      getSpecsPath(),
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
        input: 'const.json',
        output: 'const',
      }),
      description: 'handles const keyword',
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
        input: 'duplicate-null.json',
        output: 'duplicate-null',
      }),
      description: 'does not generate duplicate null',
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
        input: 'enum-inline.yaml',
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
        input: 'enum-inline.yaml',
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
        input: 'enum-inline.yaml',
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
        input: 'enum-names-values.yaml',
        output: 'enum-names-values',
      }),
      description: 'handles various enum names and values',
    },
    {
      config: createConfig({
        input: 'enum-names-values.yaml',
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
        input: 'enum-names-values.yaml',
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
        input: 'enum-names-values.yaml',
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
        input: 'enum-names-values.yaml',
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
        input: 'enum-names-values.yaml',
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
        input: 'enum-names-values.yaml',
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
        input: 'enum-names-values.yaml',
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
        input: 'enum-names-values.yaml',
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
        input: 'enum-names-values.yaml',
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
        input: 'enum-names-values.yaml',
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
        input: 'enum-names-values.yaml',
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
        input: 'headers.yaml',
        output: 'headers',
        plugins: [
          '@hey-api/client-fetch',
          '@hey-api/typescript',
          '@hey-api/sdk',
        ],
      }),
      description: 'handles various headers',
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
        input: 'negative-property-names.json',
        output: 'negative-property-names',
      }),
      description: 'handles negative property names correctly',
    },
    {
      config: createConfig({
        input: 'object-properties-all-of.json',
        output: 'object-properties-all-of',
      }),
      description:
        'sets correct logical operator and brackets on object with properties and allOf composition',
    },
    {
      config: createConfig({
        input: 'object-properties-any-of.json',
        output: 'object-properties-any-of',
      }),
      description:
        'sets correct logical operator and brackets on object with properties and anyOf composition',
    },
    {
      config: createConfig({
        input: 'object-properties-one-of.json',
        output: 'object-properties-one-of',
      }),
      description:
        'sets correct logical operator and brackets on object with properties and oneOf composition',
    },
    {
      config: createConfig({
        input: 'object-property-names.yaml',
        output: 'object-property-names',
      }),
      description:
        'sets correct index signature type on object with property names',
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
        input: 'pagination-ref.yaml',
        output: 'pagination-ref',
        plugins: ['@hey-api/client-fetch', '@tanstack/react-query'],
      }),
      description: 'detects pagination fields',
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
        input: 'parameter-tuple.json',
        output: 'parameter-tuple',
      }),
      description: 'handles tuple query parameters',
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
        input: 'ref-type.json',
        output: 'ref-type',
      }),
      description: 'handles extended $ref with type keyword',
    },
    {
      config: createConfig({
        input: 'required-all-of-ref.json',
        output: 'required-all-of-ref',
      }),
      description: 'sets allOf composition ref model properties as required',
    },
    {
      config: createConfig({
        input: 'required-any-of-ref.json',
        output: 'required-any-of-ref',
      }),
      description:
        'does not set anyOf composition ref model properties as required',
    },
    {
      config: createConfig({
        input: 'required-one-of-ref.json',
        output: 'required-one-of-ref',
      }),
      description:
        'does not set oneOf composition ref model properties as required',
    },
    {
      config: createConfig({
        input: 'schema-const.yaml',
        output: 'schema-const',
        plugins: ['@hey-api/typescript', 'valibot'],
      }),
      description: 'handles various constants',
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
        input: 'validators.yaml',
        output: 'validators',
        plugins: ['valibot'],
      }),
      description: 'generates validator schemas',
    },
    {
      config: createConfig({
        input: 'validators.yaml',
        output: 'validators-metadata',
        plugins: [
          {
            metadata: true,
            name: 'valibot',
          },
        ],
      }),
      description: 'generates validator schemas with metadata',
    },
    {
      config: createConfig({
        input: 'validators.yaml',
        output: 'validators-types',
        plugins: ['valibot'],
      }),
      description: 'generates validator schemas with types',
    },
    {
      config: createConfig({
        input: 'validators-bigint-min-max.json',
        output: 'validators-bigint-min-max',
        plugins: ['valibot'],
      }),
      description: 'validator schemas with BigInt and min/max constraints',
    },
    {
      config: createConfig({
        input: 'validators-circular-ref.json',
        output: 'validators-circular-ref',
        plugins: ['valibot'],
      }),
      description: 'validator schemas with circular reference',
    },
    {
      config: createConfig({
        input: 'validators-circular-ref-2.yaml',
        output: 'validators-circular-ref-2',
        plugins: ['valibot'],
      }),
      description: 'validator schemas with circular reference 2',
    },
    {
      config: createConfig({
        input: 'validators-union-merge.json',
        output: 'validators-union-merge',
        plugins: ['valibot'],
      }),
      description: "validator schemas with merged unions (can't use .merge())",
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
