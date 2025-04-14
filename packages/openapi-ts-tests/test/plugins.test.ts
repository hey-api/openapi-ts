import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  createClient,
  type Plugin,
  type UserConfig,
} from '@hey-api/openapi-ts';
import { describe, expect, it, vi } from 'vitest';

import { getFilePaths } from './utils';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const versions = ['2.0.x', '3.0.x', '3.1.x'];

for (const version of versions) {
  const namespace = 'plugins';

  const outputDir = path.join(__dirname, 'generated', version, namespace);

  describe(`OpenAPI ${version} ${namespace}`, () => {
    const createConfig = (
      userConfig: Omit<UserConfig, 'input'> &
        Pick<Required<UserConfig>, 'plugins'> &
        Pick<Partial<UserConfig>, 'input'>,
    ): UserConfig => ({
      ...userConfig,
      input: path.join(
        __dirname,
        'spec',
        version,
        typeof userConfig.input === 'string' ? userConfig.input : 'full.json',
      ),
      logs: {
        level: 'silent',
      },
      output: path.join(
        outputDir,
        typeof userConfig.plugins[0] === 'string'
          ? userConfig.plugins[0]
          : userConfig.plugins[0]!.name,
        typeof userConfig.output === 'string' ? userConfig.output : '',
      ),
      plugins: userConfig.plugins ?? ['@hey-api/client-fetch'],
    });

    const scenarios = [
      {
        config: createConfig({
          output: 'fetch',
          plugins: [
            '@tanstack/angular-query-experimental',
            '@hey-api/client-fetch',
          ],
        }),
        description:
          'generate Fetch API client with TanStack Angular Query Experimental plugin',
      },
      {
        config: createConfig({
          output: 'fetch',
          plugins: ['@tanstack/react-query', '@hey-api/client-fetch'],
        }),
        description:
          'generate Fetch API client with TanStack React Query plugin',
      },
      {
        config: createConfig({
          output: 'fetch',
          plugins: ['@tanstack/solid-query', '@hey-api/client-fetch'],
        }),
        description:
          'generate Fetch API client with TanStack Solid Query plugin',
      },
      {
        config: createConfig({
          output: 'fetch',
          plugins: ['@tanstack/svelte-query', '@hey-api/client-fetch'],
        }),
        description:
          'generate Fetch API client with TanStack Svelte Query plugin',
      },
      {
        config: createConfig({
          output: 'fetch',
          plugins: ['@tanstack/vue-query', '@hey-api/client-fetch'],
        }),
        description: 'generate Fetch API client with TanStack Vue Query plugin',
      },
      {
        config: createConfig({
          output: 'axios',
          plugins: [
            '@tanstack/angular-query-experimental',
            '@hey-api/client-axios',
          ],
        }),
        description:
          'generate Axios client with TanStack Angular Query Experimental plugin',
      },
      {
        config: createConfig({
          output: 'axios',
          plugins: ['@tanstack/react-query', '@hey-api/client-axios'],
        }),
        description: 'generate Axios client with TanStack React Query plugin',
      },
      {
        config: createConfig({
          output: 'axios',
          plugins: ['@tanstack/solid-query', '@hey-api/client-axios'],
        }),
        description: 'generate Axios client with TanStack Solid Query plugin',
      },
      {
        config: createConfig({
          output: 'axios',
          plugins: ['@tanstack/svelte-query', '@hey-api/client-axios'],
        }),
        description: 'generate Axios client with TanStack Svelte Query plugin',
      },
      {
        config: createConfig({
          output: 'axios',
          plugins: ['@tanstack/vue-query', '@hey-api/client-axios'],
        }),
        description: 'generate Axios client with TanStack Vue Query plugin',
      },
      {
        config: createConfig({
          output: 'asClass',
          plugins: [
            '@tanstack/angular-query-experimental',
            '@hey-api/client-fetch',
            {
              asClass: true,
              name: '@hey-api/sdk',
            },
          ],
        }),
        description:
          'generate Fetch API client with TanStack Angular Query Experimental plugin using class-based SDKs',
      },
      {
        config: createConfig({
          output: 'asClass',
          plugins: [
            '@tanstack/react-query',
            '@hey-api/client-fetch',
            {
              asClass: true,
              name: '@hey-api/sdk',
            },
          ],
        }),
        description:
          'generate Fetch API client with TanStack React Query plugin using class-based SDKs',
      },
      {
        config: createConfig({
          output: 'asClass',
          plugins: [
            '@tanstack/solid-query',
            '@hey-api/client-fetch',
            {
              asClass: true,
              name: '@hey-api/sdk',
            },
          ],
        }),
        description:
          'generate Fetch API client with TanStack Solid Query plugin using class-based SDKs',
      },
      {
        config: createConfig({
          output: 'asClass',
          plugins: [
            '@tanstack/svelte-query',
            '@hey-api/client-fetch',
            {
              asClass: true,
              name: '@hey-api/sdk',
            },
          ],
        }),
        description:
          'generate Fetch API client with TanStack Svelte Query plugin using class-based SDKs',
      },
      {
        config: createConfig({
          output: 'asClass',
          plugins: [
            '@tanstack/vue-query',
            '@hey-api/client-fetch',
            {
              asClass: true,
              name: '@hey-api/sdk',
            },
          ],
        }),
        description:
          'generate Fetch API client with TanStack Vue Query plugin using class-based SDKs',
      },
      {
        config: createConfig({
          output: 'default',
          plugins: ['@pinia/colada', '@hey-api/client-fetch'],
        }),
        description: 'generate with plugin Pinia Colada',
      },
      /* {
        config: createConfig({
          output: 'asFileSdk',
          plugins: [
            {
              groupByTag: true,
              name: '@pinia/colada',
            },
          ],
        }),
        description: 'generate with plugin Pinia Colada using file-based SDK',
      }, */
      {
        config: createConfig({
          output: 'default',
          plugins: ['@hey-api/schemas'],
        }),
        description: 'generate schemas',
      },
      {
        config: createConfig({
          output: 'default',
          plugins: ['@hey-api/sdk', '@hey-api/client-fetch'],
        }),
        description: 'generate SDK',
      },
      {
        config: createConfig({
          output: 'throwOnError',
          plugins: [
            '@hey-api/sdk',
            {
              name: '@hey-api/client-fetch',
              throwOnError: true,
            },
          ],
        }),
        description: 'generate SDK that throws on error',
      },
      {
        config: createConfig({
          output: 'default',
          plugins: ['fastify'],
        }),
        description: 'generate Fastify types with Fastify plugin',
      },
      {
        config: createConfig({
          output: 'default',
          plugins: ['zod'],
        }),
        description: 'generate Zod schemas with Zod plugin',
      },
      {
        config: createConfig({
          input: 'type-format.yaml',
          output: 'type-format',
          plugins: [
            '@hey-api/transformers',
            '@hey-api/client-fetch',
            'zod',
            {
              name: '@hey-api/sdk',
              transformer: true,
              validator: true,
            },
          ],
        }),
        description: 'handles various schema types and formats',
      },
      {
        config: createConfig({
          input: 'read-write-only.yaml',
          output: 'read-write-only-ignore',
          plugins: [
            {
              name: '@hey-api/typescript',
              readOnlyWriteOnlyBehavior: 'off',
            },
            '@hey-api/client-fetch',
          ],
        }),
        description: 'ignores read-only and write-only handling',
      },
      {
        config: createConfig({
          input: 'read-write-only.yaml',
          output: 'read-write-only-custom-name',
          plugins: [
            {
              name: '@hey-api/typescript',
              readOnlyWriteOnlyBehavior: 'split',
              readableNameBuilder: 'Readable{{name}}',
              writableNameBuilder: 'Writable{{name}}',
            },
            '@hey-api/client-fetch',
          ],
        }),
        description: 'custom read-only and write-only naming',
      },
    ];

    it.only.each(scenarios)('$description', async ({ config }) => {
      await createClient(config);

      const outputPath = typeof config.output === 'string' ? config.output : '';
      const filePaths = getFilePaths(outputPath);

      await Promise.all(
        filePaths.map(async (filePath) => {
          const fileContent = fs.readFileSync(filePath, 'utf-8');
          await expect(fileContent).toMatchFileSnapshot(
            path.join(
              __dirname,
              '__snapshots__',
              version,
              namespace,
              filePath.slice(outputDir.length + 1),
            ),
          );
        }),
      );
    });
  });

  describe('custom plugin', () => {
    it('handles a custom plugin', async () => {
      const myPlugin: Plugin.Config<{
        customOption: boolean;
        name: any;
        output: string;
      }> = {
        _dependencies: ['@hey-api/typescript'],
        _handler: vi.fn(),
        _handlerLegacy: vi.fn(),
        customOption: true,
        name: 'my-plugin',
        output: 'my-plugin',
      };

      await createClient({
        input: path.join(__dirname, 'spec', '3.1.x', 'full.json'),
        logs: {
          level: 'silent',
        },
        output: path.join(outputDir, myPlugin.name, 'default'),
        plugins: [myPlugin, '@hey-api/client-fetch'],
      });

      expect(myPlugin._handler).toHaveBeenCalled();
      expect(myPlugin._handlerLegacy).not.toHaveBeenCalled();
    });

    it('throws on invalid dependency', async () => {
      const myPlugin: Plugin.Config<{
        name: any;
        output: string;
      }> = {
        _dependencies: ['@hey-api/oops'],
        _handler: vi.fn(),
        _handlerLegacy: vi.fn(),
        name: 'my-plugin',
        output: 'my-plugin',
      };

      await expect(() =>
        createClient({
          input: path.join(__dirname, 'spec', '3.1.x', 'full.json'),
          logs: {
            level: 'silent',
          },
          output: path.join(outputDir, myPlugin.name, 'default'),
          plugins: [myPlugin, '@hey-api/client-fetch'],
        }),
      ).rejects.toThrowError(/unknown plugin/g);

      expect(myPlugin._handler).not.toHaveBeenCalled();
      expect(myPlugin._handlerLegacy).not.toHaveBeenCalled();
    });

    it('throws on native plugin override', async () => {
      const myPlugin: Plugin.Config<{
        name: any;
        output: string;
      }> = {
        _handler: vi.fn(),
        _handlerLegacy: vi.fn(),
        name: '@hey-api/typescript',
        output: 'my-plugin',
      };

      await expect(() =>
        createClient({
          input: path.join(__dirname, 'spec', '3.1.x', 'full.json'),
          logs: {
            level: 'silent',
          },
          output: path.join(outputDir, myPlugin.name, 'default'),
          plugins: [myPlugin, '@hey-api/client-fetch'],
        }),
      ).rejects.toThrowError(/cannot register plugin/g);

      expect(myPlugin._handler).not.toHaveBeenCalled();
      expect(myPlugin._handlerLegacy).not.toHaveBeenCalled();
    });
  });
}
