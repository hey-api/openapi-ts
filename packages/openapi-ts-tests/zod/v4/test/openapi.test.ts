import fs from 'node:fs';
import path from 'node:path';

import { createClient } from '@hey-api/openapi-ts';
import { describe, expect, it } from 'vitest';

import { getFilePaths } from '../../../utils';
import {
  createZodConfig,
  getSnapshotsPath,
  getTempSnapshotsPath,
  zodVersions,
} from './utils';

const versions = ['2.0.x', '3.0.x', '3.1.x'];

for (const version of versions) {
  for (const zodVersion of zodVersions) {
    const outputDir = path.join(
      getTempSnapshotsPath(),
      version,
      zodVersion.folder,
    );
    const snapshotsDir = path.join(
      getSnapshotsPath(),
      version,
      zodVersion.folder,
    );

    describe(`OpenAPI ${version}`, () => {
      const createConfig = createZodConfig({
        openApiVersion: version,
        outputDir,
        zodVersion,
      });

      const scenarios = [
        {
          config: createConfig({
            input:
              'array-items-all-of.' + (version === '2.0.x' ? 'json' : 'yaml'),
            output: 'array-items-all-of',
          }),
          description:
            'generates correct array when items use allOf (intersection)',
        },
        {
          config: createConfig({
            input: 'full.yaml',
            output: 'default',
          }),
          description: 'generate Zod schemas with Zod plugin',
        },
        {
          config: createConfig({
            input: 'type-format.yaml',
            output: 'type-format-zod',
          }),
          description: 'handles various schema types and formats',
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
}
