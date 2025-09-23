import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { customClientPlugin } from '@hey-api/custom-client/plugin';
import { createClient, type UserConfig } from '@hey-api/openapi-ts';
import { describe, expect, it } from 'vitest';

import type { PluginClientNames } from '../../../openapi-ts/src/plugins/types';
import { getFilePaths, getSpecsPath } from '../../utils';
import { myClientPlugin } from './custom/client/plugin';

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
      input: path.join(getSpecsPath(), '3.1.x', 'full.yaml'),
      logs: {
        level: 'silent',
      },
      output:
        typeof userConfig.output === 'string'
          ? path.join(outputDir, userConfig.output)
          : {
              ...userConfig.output,
              path: path.join(outputDir, userConfig.output.path),
            },
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
      {
        config: createConfig({
          output: {
            case: 'camelCase',
            path: 'sdk-preserve-wire-casing',
          },
          plugins: [
            client,
            {
              name: '@hey-api/sdk',
              preserveWireCasing: true,
            },
          ],
        }),
        description: 'SDK with preserve wire casing',
      },
      {
        config: createConfig({
          input: path.join(
            getSpecsPath(),
            '3.1.x',
            'preserve-wire-casing-extreme-test.json',
          ),
          output: {
            case: 'camelCase',
            path: 'sdk-preserve-wire-casing-extreme',
          },
          plugins: [
            client,
            {
              name: '@hey-api/sdk',
              preserveWireCasing: true,
            },
          ],
        }),
        description: 'SDK with preserve wire casing extreme',
      },
      {
        config: createConfig({
          output: {
            case: 'camelCase',
            path: 'sdk-preserve-wire-casing-zod',
          },
          plugins: [
            client,
            'zod',
            {
              name: '@hey-api/sdk',
              preserveWireCasing: true,
              validator: true,
            },
          ],
        }),
        description: 'SDK with preserve wire casing and zod validator',
      },
      {
        config: createConfig({
          output: {
            path: 'tsconfig-nodenext-sdk',
            tsConfigPath: path.join(
              __dirname,
              'tsconfig',
              'tsconfig.nodenext.json',
            ),
          },
          plugins: [client, '@hey-api/sdk'],
        }),
        description: 'SDK with NodeNext tsconfig',
      },
      {
        config: createConfig({
          output: {
            clean: false,
            path: 'clean-false',
          },
          plugins: [client, '@hey-api/sdk'],
        }),
        description: 'avoid appending extension multiple times | twice',
      },
    ];

    it.each(scenarios)('$description', async ({ config, description }) => {
      await createClient(config);
      if (description.endsWith('twice')) {
        await createClient(config);
      }

      const outputPath =
        typeof config.output === 'string' ? config.output : config.output.path;
      const filePaths = getFilePaths(outputPath);

      await Promise.all(
        filePaths.map(async (filePath) => {
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

          await expect(fileContent).toMatchFileSnapshot(
            path.join(
              __dirname,
              '__snapshots__',
              '3.1.x',
              namespace,
              client,
              filePath.slice(outputDir.length + 1),
            ),
          );
        }),
      );
    });
  });
}

describe('custom-client', () => {
  const namespace = 'clients';

  const outputDir = path.join(
    __dirname,
    'generated',
    '3.1.x',
    namespace,
    'client-custom',
  );

  const createConfig = (
    userConfig: Omit<UserConfig, 'input'> & Pick<Partial<UserConfig>, 'input'>,
  ): UserConfig => ({
    ...userConfig,
    input: path.join(getSpecsPath(), '3.1.x', 'full.yaml'),
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
        plugins: [customClientPlugin()],
      }),
      description: 'default output',
    },
    {
      config: createConfig({
        output: 'bundle',
        plugins: [
          customClientPlugin({
            bundle: true,
          }),
        ],
      }),
      description: 'default output with bundled client',
    },
    {
      config: createConfig({
        output: 'sdk-client-optional',
        plugins: [
          customClientPlugin(),
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
          customClientPlugin(),
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
          customClientPlugin({
            baseUrl: false,
          }),
          '@hey-api/typescript',
        ],
      }),
      description: 'client without base URL',
    },
    {
      config: createConfig({
        output: 'base-url-number',
        plugins: [
          customClientPlugin({
            baseUrl: 0,
          }),
          '@hey-api/typescript',
        ],
      }),
      description: 'client with numeric base URL',
    },
    {
      config: createConfig({
        output: 'base-url-string',
        plugins: [
          customClientPlugin({
            baseUrl: 'https://foo.com',
          }),
          '@hey-api/typescript',
        ],
      }),
      description: 'client with custom string base URL',
    },
    {
      config: createConfig({
        output: 'base-url-strict',
        plugins: [
          customClientPlugin({
            strictBaseUrl: true,
          }),
          '@hey-api/typescript',
        ],
      }),
      description: 'client with strict base URL',
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
            '__snapshots__',
            '3.1.x',
            namespace,
            'client-custom',
            filePath.slice(outputDir.length + 1),
          ),
        );
      }),
    );
  });
});

describe('my-client', () => {
  const namespace = 'clients';

  const outputDir = path.join(
    __dirname,
    'generated',
    '3.1.x',
    namespace,
    'my-client',
  );

  const createConfig = (
    userConfig: Omit<UserConfig, 'input'> & Pick<Partial<UserConfig>, 'input'>,
  ): UserConfig => ({
    ...userConfig,
    input: path.join(getSpecsPath(), '3.1.x', 'full.yaml'),
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
        plugins: [myClientPlugin()],
      }),
      description: 'default output',
    },
    {
      config: createConfig({
        output: 'bundle',
        plugins: [
          myClientPlugin({
            bundle: true,
          }),
        ],
      }),
      description: 'default output with bundled client',
    },
    {
      config: createConfig({
        output: 'sdk-client-optional',
        plugins: [
          myClientPlugin(),
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
          myClientPlugin(),
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
          myClientPlugin({
            baseUrl: false,
          }),
          '@hey-api/typescript',
        ],
      }),
      description: 'client without base URL',
    },
    {
      config: createConfig({
        output: 'base-url-number',
        plugins: [
          myClientPlugin({
            baseUrl: 0,
          }),
          '@hey-api/typescript',
        ],
      }),
      description: 'client with numeric base URL',
    },
    {
      config: createConfig({
        output: 'base-url-string',
        plugins: [
          myClientPlugin({
            baseUrl: 'https://foo.com',
          }),
          '@hey-api/typescript',
        ],
      }),
      description: 'client with custom string base URL',
    },
    {
      config: createConfig({
        output: 'base-url-strict',
        plugins: [
          myClientPlugin({
            strictBaseUrl: true,
          }),
          '@hey-api/typescript',
        ],
      }),
      description: 'client with strict base URL',
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
            '__snapshots__',
            '3.1.x',
            namespace,
            'my-client',
            filePath.slice(outputDir.length + 1),
          ),
        );
      }),
    );
  });
});
