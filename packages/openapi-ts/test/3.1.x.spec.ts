import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { createClient } from '../';
import type { UserConfig } from '../src/types/config';
import { getFilePaths } from './utils';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VERSION = '3.1.x';

const outputDir = path.join(__dirname, 'generated', VERSION);

describe(`OpenAPI ${VERSION}`, () => {
  const createConfig = (userConfig: UserConfig): UserConfig => ({
    client: '@hey-api/client-fetch',
    experimentalParser: true,
    plugins: ['@hey-api/types'],
    ...userConfig,
    input: path.join(
      __dirname,
      'spec',
      VERSION,
      typeof userConfig.input === 'string' ? userConfig.input : '',
    ),
    output: path.join(
      outputDir,
      typeof userConfig.output === 'string' ? userConfig.output : '',
    ),
  });

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
        input: 'enum-null.json',
        output: 'enum-null',
      }),
      description: 'handles null enums',
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
        input: 'operation-204.json',
        output: 'operation-204',
        plugins: [
          {
            name: '@hey-api/types',
            tree: true,
          },
        ],
      }),
      description: 'handles empty response status codes',
    },
    {
      config: createConfig({
        input: 'required-all-of-ref.json',
        output: 'required-all-of-ref',
        plugins: [
          {
            name: '@hey-api/types',
            tree: false,
          },
        ],
      }),
      description: 'sets allOf composition ref model properties as required',
    },
    {
      config: createConfig({
        input: 'required-any-of-ref.json',
        output: 'required-any-of-ref',
        plugins: [
          {
            name: '@hey-api/types',
            tree: false,
          },
        ],
      }),
      description:
        'does not set anyOf composition ref model properties as required',
    },
    {
      config: createConfig({
        input: 'required-one-of-ref.json',
        output: 'required-one-of-ref',
        plugins: [
          {
            name: '@hey-api/types',
            tree: false,
          },
        ],
      }),
      description:
        'does not set oneOf composition ref model properties as required',
    },
  ];

  it.each(scenarios)('$description', async ({ config }) => {
    await createClient(config);

    const outputPath = typeof config.output === 'string' ? config.output : '';
    const filePaths = getFilePaths(outputPath);

    filePaths.forEach((filePath) => {
      const fileContent = readFileSync(filePath, 'utf-8');
      expect(fileContent).toMatchFileSnapshot(
        path.join(
          __dirname,
          '__snapshots__',
          VERSION,
          filePath.slice(outputDir.length + 1),
        ),
      );
    });
  });
});
