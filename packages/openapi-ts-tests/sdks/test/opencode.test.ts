import fs from 'node:fs';
import path from 'node:path';

import { createClient } from '@hey-api/openapi-ts';
import { describe, expect, it } from 'vitest';

import { getFilePaths, getSpecsPath } from '../../utils';
import {
  createSdkConfig,
  getSnapshotsPath,
  getTempSnapshotsPath,
} from './utils';

const namespace = 'opencode';

const outputDir = path.join(getTempSnapshotsPath(), namespace);
const snapshotsDir = path.join(getSnapshotsPath(), namespace);

const specPath = path.join(getSpecsPath(), '3.1.x', 'opencode.yaml');

describe(`SDK: ${namespace}`, () => {
  const createConfig = createSdkConfig({
    outputDir,
  });

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
