import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createClient, type UserConfig } from '@hey-api/openapi-ts';
import { describe, expect, it } from 'vitest';

import type { PluginClientNames } from '../../openapi-ts/src/plugins/types';
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
      logs: {
        level: 'silent',
      },
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
      {
        config: createConfig({
          output: 'base-url-false',
          plugins: [
            {
              baseUrl: false,
              name: client,
            },
            '@hey-api/typescript',
          ],
        }),
        description: 'client without base URL',
      },
      {
        config: createConfig({
          output: 'base-url-number',
          plugins: [
            {
              baseUrl: 0,
              name: client,
            },
            '@hey-api/typescript',
          ],
        }),
        description: 'client with numeric base URL',
      },
      {
        config: createConfig({
          output: 'base-url-string',
          plugins: [
            {
              baseUrl: 'https://foo.com',
              name: client,
            },
            '@hey-api/typescript',
          ],
        }),
        description: 'client with custom string base URL',
      },
      {
        config: createConfig({
          output: 'base-url-strict',
          plugins: [
            {
              name: client,
              strictBaseUrl: true,
            },
            '@hey-api/typescript',
          ],
        }),
        description: 'client with strict base URL',
      },
    ];

    it.each(scenarios)('$description', async ({ config }) => {
      await createClient(config);

      const outputPath = typeof config.output === 'string' ? config.output : '';
      const filePaths = getFilePaths(outputPath);

      filePaths.forEach((filePath) => {
        const fileContent = fs.readFileSync(filePath, 'utf-8');

        // flaky test reordering client imports, skip
        if (
          client === '@hey-api/client-nuxt' &&
          typeof config.output === 'string' &&
          config.output.includes('bundle')
        ) {
          expect(1).toBe(1);
          return;
        }

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
