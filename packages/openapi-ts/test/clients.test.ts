import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { createClient } from '../';
import type { PluginClientNames } from '../src/plugins/types';
import type { UserConfig } from '../src/types/config';
import { getFilePaths } from './utils';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clients: ReadonlyArray<PluginClientNames> = [
  '@hey-api/client-axios',
  '@hey-api/client-fetch',
  '@hey-api/client-next',
  '@hey-api/client-nuxt',
];

for (const client of clients) {
  const namespace = 'clients';

  const outputDir = path.join(
    __dirname,
    'generated',
    '3.1.x',
    namespace,
    client,
  );

  describe(client, () => {
    const createConfig = (
      userConfig: Omit<UserConfig, 'input'> &
        Pick<Partial<UserConfig>, 'input'>,
    ): UserConfig => ({
      ...userConfig,
      input: path.join(__dirname, 'spec', '3.1.x', 'full.json'),
      output: path.join(
        outputDir,
        typeof userConfig.output === 'string' ? userConfig.output : '',
      ),
    });

    const scenarios = [
      {
        config: createConfig({
          output: 'default',
          plugins: [client],
        }),
        description: 'default output',
      },
      {
        config: createConfig({
          output: 'bundle',
          plugins: [
            {
              bundle: true,
              name: client,
            },
          ],
        }),
        description: 'default output with bundled client',
      },
      {
        config: createConfig({
          output: 'sdk-client-optional',
          plugins: [
            client,
            {
              client: true,
              name: '@hey-api/sdk',
            },
          ],
        }),
        description: 'SDK with optional client option',
      },
      {
        config: createConfig({
          output: 'sdk-client-required',
          plugins: [
            client,
            {
              client: false,
              name: '@hey-api/sdk',
            },
          ],
        }),
        description: 'SDK with required client option',
      },
    ];

    it.each(scenarios)('$description', async ({ config }) => {
      await createClient(config);

      const outputPath = typeof config.output === 'string' ? config.output : '';
      const filePaths = getFilePaths(outputPath);

      filePaths.forEach((filePath) => {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        expect(fileContent).toMatchFileSnapshot(
          path.join(
            __dirname,
            '__snapshots__',
            '3.1.x',
            namespace,
            client,
            filePath.slice(outputDir.length + 1),
          ),
        );
      });
    });
  });
}
