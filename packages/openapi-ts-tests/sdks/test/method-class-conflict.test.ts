import fs from 'node:fs';
import path from 'node:path';

import { createClient } from '@hey-api/openapi-ts';

import { getFilePaths, getSpecsPath } from '../../utils';
import { createSdkConfig, getSnapshotsPath, getTempSnapshotsPath } from './utils';

const namespace = 'method-class-conflict';

const outputDir = path.join(getTempSnapshotsPath(), namespace);
const snapshotsDir = path.join(getSnapshotsPath(), namespace);

const specPath = path.join(getSpecsPath(), '3.0.x', 'sdk-method-class-conflict.yaml');

describe(`SDK: ${namespace}`, () => {
  const createConfig = createSdkConfig({
    outputDir,
  });

  const scenarios = [
    {
      config: createConfig({
        input: specPath,
        output: {
          entryFile: false,
          path: 'class',
        },
        plugins: [
          {
            asClass: true,
            instance: false,
            name: '@hey-api/sdk',
          },
        ],
      }),
      description: 'class',
    },
    {
      config: createConfig({
        input: specPath,
        output: {
          entryFile: false,
          path: 'flat',
        },
        plugins: [
          {
            asClass: false,
            instance: false,
            name: '@hey-api/sdk',
          },
        ],
      }),
      description: 'flat',
    },
    {
      config: createConfig({
        input: specPath,
        output: {
          entryFile: false,
          path: 'instance',
        },
        plugins: [
          {
            instance: true,
            name: '@hey-api/sdk',
          },
        ],
      }),
      description: 'instance',
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
