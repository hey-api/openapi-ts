import fs from 'node:fs';
import path from 'node:path';

import { createClient } from '@hey-api/openapi-ts';

import { getFilePaths } from '../../../utils';
import { snapshotsDir, tmpDir } from './constants';
import { createConfigFactory, zodVersions } from './utils';

const version = '3.1.x';

for (const zodVersion of zodVersions) {
  const outputDir = path.join(tmpDir, version, zodVersion.folder);

  describe(`OpenAPI ${version} Zod formats`, () => {
    const createConfig = createConfigFactory({
      openApiVersion: version,
      outputDir,
      zodVersion,
    });

    const scenarios = [
      {
        config: createConfig({
          input: 'zoom-video-sdk.json',
          output: 'webhooks',
          plugins: [
            {
              compatibilityVersion: zodVersion.compatibilityVersion,
              name: 'zod',
            },
          ],
        }),
        description: 'webhook schemas',
      },
      {
        config: createConfig({
          input: 'string-with-format.yaml',
          output: 'string-with-format',
          plugins: [
            {
              compatibilityVersion: zodVersion.compatibilityVersion,
              name: 'zod',
            },
          ],
        }),
        description: 'generates anyOf string and binary string',
      },
      {
        config: createConfig({
          input: 'string-with-guid-format.yaml',
          output: 'string-with-guid-format',
          plugins: [
            {
              compatibilityVersion: zodVersion.compatibilityVersion,
              name: 'zod',
            },
          ],
        }),
        description: 'handles string guid format',
      },
    ];

    it.each(scenarios)('$description', async ({ config }) => {
      await createClient(config);

      const filePaths = getFilePaths(config.output);

      await Promise.all(
        filePaths.map(async (filePath) => {
          const fileContent = fs.readFileSync(filePath, 'utf-8');
          await expect(fileContent).toMatchFileSnapshot(
            path.join(
              snapshotsDir,
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
