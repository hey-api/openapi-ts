import fs from 'node:fs';
import path from 'node:path';

import { createClient } from '@hey-api/openapi-ts';

import { getFilePaths, getSpecsPath } from '../../utils';
import { createConfigFactory, getSnapshotsPath, getTempSnapshotsPath } from './utils';

const namespace = 'opencode';

const outputDir = path.join(getTempSnapshotsPath(), namespace);
const snapshotsDir = path.join(getSnapshotsPath(), namespace);

const specPath = path.join(getSpecsPath(), '3.1.x', 'opencode.yaml');

describe(`SDK: ${namespace}`, () => {
  const createConfig = createConfigFactory({ outputDir });

  const scenarios = [
    {
      config: createConfig({
        input: specPath,
        output: {
          path: 'export-all',
          preferExportAll: true,
        },
        plugins: [
          {
            name: '@hey-api/sdk',
            paramsStructure: 'flat',
          },
        ],
      }),
      description: 'export all',
    },
    {
      config: createConfig({
        input: specPath,
        output: 'flat',
        plugins: [
          {
            name: '@hey-api/sdk',
            paramsStructure: 'flat',
          },
        ],
      }),
      description: 'flat',
    },
    {
      config: createConfig({
        input: specPath,
        output: 'grouped',
        plugins: [
          {
            name: '@hey-api/sdk',
            paramsStructure: 'grouped',
          },
        ],
      }),
      description: 'grouped',
    },
    {
      config: createConfig({
        input: specPath,
        output: 'metadata-by-tags',
        plugins: [
          'zod',
          {
            metadata: true,
            name: '@hey-api/sdk',
            operations: {
              strategy: 'byTags',
            },
            paramsStructure: 'flat',
            validator: true,
          },
        ],
      }),
      description: 'metadata by tags',
    },
    {
      config: createConfig({
        input: specPath,
        output: 'metadata-flat',
        plugins: [
          'zod',
          {
            metadata: true,
            name: '@hey-api/sdk',
            paramsStructure: 'flat',
            validator: true,
          },
        ],
      }),
      description: 'metadata flat',
    },
    {
      config: createConfig({
        input: specPath,
        output: 'metadata-single',
        plugins: [
          'zod',
          {
            metadata: true,
            name: '@hey-api/sdk',
            operations: {
              containerName: 'OpenCode',
              strategy: 'single',
            },
            paramsStructure: 'flat',
            validator: true,
          },
        ],
      }),
      description: 'metadata single',
    },
    {
      config: createConfig({
        input: specPath,
        output: 'metadata-partial',
        plugins: [
          'zod',
          {
            metadata: {
              id: true,
              method: false,
              responseSchema: false,
              tags: true,
              url: true,
            },
            name: '@hey-api/sdk',
            paramsStructure: 'flat',
            validator: true,
          },
        ],
      }),
      description: 'metadata partial',
    },
  ];

  it.each(scenarios)(
    '$description',
    async ({ config }) => {
      await createClient(config);

      const filePaths = getFilePaths(
        typeof config.output === 'string' ? config.output : config.output.path,
      );

      await Promise.all(
        filePaths.map(async (filePath) => {
          const fileContent = fs.readFileSync(filePath, 'utf-8');
          await expect(fileContent).toMatchFileSnapshot(
            path.join(snapshotsDir, filePath.slice(outputDir.length + 1)),
          );
        }),
      );
    },
    15_000,
  );
});
