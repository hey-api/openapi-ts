import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createClient, type UserConfig } from '@hey-api/openapi-ts';
import { describe, expect, it } from 'vitest';

import { getFilePaths, getSpecsPath } from '../../../utils';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const version = '3.1.x';

const zodVersions = [
  {
    compatibilityVersion: 3,
    folder: 'v3',
  },
  {
    compatibilityVersion: 4,
    folder: 'v4',
  },
  {
    compatibilityVersion: 'mini',
    folder: 'mini',
  },
] as const;

for (const zodVersion of zodVersions) {
  const outputDir = path.join(
    __dirname,
    '..',
    '.gen',
    'snapshots',
    version,
    zodVersion.folder,
  );

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
        plugins: [
          {
            compatibilityVersion: zodVersion.compatibilityVersion,
            name: 'zod',
          },
        ],
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
          input: 'array-items-one-of-length-1.yaml',
          output: 'array-items-one-of-length-1',
        }),
        description:
          'generates correct array when items are oneOf array with single item',
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
          input: 'schema-const.yaml',
          output: 'schema-const',
        }),
        description: 'handles various constants',
      },
      {
        config: createConfig({
          input: 'validators.yaml',
          output: 'validators',
        }),
        description: 'generates validator schemas',
      },
      {
        config: createConfig({
          input: 'validators.yaml',
          output: 'validators-dates',
          plugins: [
            {
              compatibilityVersion: zodVersion.compatibilityVersion,
              dates: {
                offset: true,
              },
              name: 'zod',
            },
          ],
        }),
        description: 'generates validator schemas with any offset',
      },
      {
        config: createConfig({
          input: 'validators.yaml',
          output: 'validators-metadata',
          plugins: [
            {
              compatibilityVersion: zodVersion.compatibilityVersion,
              metadata: true,
              name: 'zod',
            },
          ],
        }),
        description: 'generates validator schemas with metadata',
      },
      {
        config: createConfig({
          input: 'validators.yaml',
          output: 'validators-types',
          plugins: [
            {
              compatibilityVersion: zodVersion.compatibilityVersion,
              name: 'zod',
              types: {
                infer: true,
              },
            },
          ],
        }),
        description: 'generates validator schemas with types',
      },
      {
        config: createConfig({
          input: 'validators-bigint-min-max.json',
          output: 'validators-bigint-min-max',
        }),
        description: 'validator schemas with BigInt and min/max constraints',
      },
      {
        config: createConfig({
          input: 'validators-circular-ref.json',
          output: 'validators-circular-ref',
        }),
        description: 'validator schemas with circular reference',
      },
      {
        config: createConfig({
          input: 'validators-circular-ref-2.yaml',
          output: 'validators-circular-ref-2',
        }),
        description: 'validator schemas with circular reference 2',
      },
      {
        config: createConfig({
          input: 'validators-union-merge.json',
          output: 'validators-union-merge',
        }),
        description:
          "validator schemas with merged unions (can't use .merge())",
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
              '..',
              '__snapshots__',
              version,
              zodVersion.folder,
              filePath.slice(outputDir.length + 1),
            ),
          );
        }),
      );
    });
  });
}
