import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { createClient } from '../';
import type { Client, UserConfig } from '../src/types/config';
import { getFilePaths } from './utils';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clients: ReadonlyArray<Client> = [
  '@hey-api/client-axios',
  '@hey-api/client-fetch',
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
      client,
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
        }),
        description: 'default output',
      },
      {
        config: createConfig({
          client: {
            bundle: true,
            name: client,
          },
          output: 'bundle',
        }),
        description: 'default output with bundled client',
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
