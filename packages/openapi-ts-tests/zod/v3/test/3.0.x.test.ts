import fs from 'node:fs';
import path from 'node:path';

import { createClient } from '@hey-api/openapi-ts';

import { getFilePaths } from '../../../utils';
import { createZodConfig, getSnapshotsPath, getTempSnapshotsPath, zodVersions } from './utils';

const version = '3.0.x';

for (const zodVersion of zodVersions) {
  const outputDir = path.join(getTempSnapshotsPath(), version, zodVersion.folder);
  const snapshotsDir = path.join(getSnapshotsPath(), version, zodVersion.folder);

  describe(`OpenAPI ${version}`, () => {
    const createConfig = createZodConfig({
      openApiVersion: version,
      outputDir,
      zodVersion,
    });

    const scenarios = [
      {
        config: createConfig({
          input: 'array-items-one-of-length-1.yaml',
          output: 'array-items-one-of-length-1',
        }),
        description: 'generates correct array when items are oneOf array with single item',
      },
      {
        config: createConfig({
          input: 'circular.yaml',
          output: 'circular',
        }),
        description: 'generates circular schemas',
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
          input: 'validators.json',
          output: 'validators',
        }),
        description: 'generates validator schemas',
      },
    ];

    it.each(scenarios)('$description', async ({ config }) => {
      await createClient(config);

      const filePaths = getFilePaths(config.output);

      await Promise.all(
        filePaths.map(async (filePath) => {
          const fileContent = fs.readFileSync(filePath, 'utf-8');
          await expect(fileContent).toMatchFileSnapshot(
            path.join(snapshotsDir, filePath.slice(outputDir.length + 1)),
          );
        }),
      );
    });
  });
}
