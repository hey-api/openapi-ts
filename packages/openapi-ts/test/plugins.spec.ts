import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it, vi } from 'vitest';

import { createClient } from '../';
import type { PluginConfig } from '../src/plugins/types';
import type { UserConfig } from '../src/types/config';
import { getFilePaths } from './utils';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const versions = ['3.0.x', '3.1.x'];

for (const version of versions) {
  const namespace = 'plugins';

  const outputDir = path.join(__dirname, 'generated', version, namespace);

  describe(`OpenAPI ${version} ${namespace}`, () => {
    const createConfig = (
      userConfig: Omit<UserConfig, 'input'> &
        Pick<Required<UserConfig>, 'plugins'>,
    ): UserConfig => ({
      client: '@hey-api/client-fetch',
      experimentalParser: true,
      ...userConfig,
      input: path.join(__dirname, 'spec', version, 'full.json'),
      output: path.join(
        outputDir,
        typeof userConfig.plugins[0] === 'string'
          ? userConfig.plugins[0]
          : userConfig.plugins[0].name,
        typeof userConfig.output === 'string' ? userConfig.output : '',
      ),
    });

    const scenarios = [
      {
        config: createConfig({
          output: 'fetch',
          plugins: ['@tanstack/angular-query-experimental'],
        }),
        description:
          'generate Fetch API client with TanStack Angular Query Experimental plugin',
      },
      {
        config: createConfig({
          output: 'fetch',
          plugins: ['@tanstack/react-query'],
        }),
        description:
          'generate Fetch API client with TanStack React Query plugin',
      },
      {
        config: createConfig({
          output: 'fetch',
          plugins: ['@tanstack/solid-query'],
        }),
        description:
          'generate Fetch API client with TanStack Solid Query plugin',
      },
      {
        config: createConfig({
          output: 'fetch',
          plugins: ['@tanstack/svelte-query'],
        }),
        description:
          'generate Fetch API client with TanStack Svelte Query plugin',
      },
      {
        config: createConfig({
          output: 'fetch',
          plugins: ['@tanstack/vue-query'],
        }),
        description: 'generate Fetch API client with TanStack Vue Query plugin',
      },
      {
        config: createConfig({
          client: '@hey-api/client-axios',
          output: 'axios',
          plugins: ['@tanstack/angular-query-experimental'],
        }),
        description:
          'generate Axios client with TanStack Angular Query Experimental plugin',
      },
      {
        config: createConfig({
          client: '@hey-api/client-axios',
          output: 'axios',
          plugins: ['@tanstack/react-query'],
        }),
        description: 'generate Axios client with TanStack React Query plugin',
      },
      {
        config: createConfig({
          client: '@hey-api/client-axios',
          output: 'axios',
          plugins: ['@tanstack/solid-query'],
        }),
        description: 'generate Axios client with TanStack Solid Query plugin',
      },
      {
        config: createConfig({
          client: '@hey-api/client-axios',
          output: 'axios',
          plugins: ['@tanstack/svelte-query'],
        }),
        description: 'generate Axios client with TanStack Svelte Query plugin',
      },
      {
        config: createConfig({
          client: '@hey-api/client-axios',
          output: 'axios',
          plugins: ['@tanstack/vue-query'],
        }),
        description: 'generate Axios client with TanStack Vue Query plugin',
      },
      {
        config: createConfig({
          output: 'asClass',
          plugins: [
            '@tanstack/angular-query-experimental',
            {
              asClass: true,
              name: '@hey-api/services',
            },
          ],
        }),
        description:
          'generate Fetch API client with TanStack Angular Query Experimental plugin using class-based services',
      },
      {
        config: createConfig({
          output: 'asClass',
          plugins: [
            '@tanstack/react-query',
            {
              asClass: true,
              name: '@hey-api/services',
            },
          ],
        }),
        description:
          'generate Fetch API client with TanStack React Query plugin using class-based services',
      },
      {
        config: createConfig({
          output: 'asClass',
          plugins: [
            '@tanstack/solid-query',
            {
              asClass: true,
              name: '@hey-api/services',
            },
          ],
        }),
        description:
          'generate Fetch API client with TanStack Solid Query plugin using class-based services',
      },
      {
        config: createConfig({
          output: 'asClass',
          plugins: [
            '@tanstack/svelte-query',
            {
              asClass: true,
              name: '@hey-api/services',
            },
          ],
        }),
        description:
          'generate Fetch API client with TanStack Svelte Query plugin using class-based services',
      },
      {
        config: createConfig({
          output: 'asClass',
          plugins: [
            '@tanstack/vue-query',
            {
              asClass: true,
              name: '@hey-api/services',
            },
          ],
        }),
        description:
          'generate Fetch API client with TanStack Vue Query plugin using class-based services',
      },
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
          plugins: ['@hey-api/services'],
        }),
        description: 'generate services',
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
          // @ts-expect-error
          plugins: ['zod'],
        }),
        description: 'generate Zod schemas with Zod plugin',
      },
    ];

    it.each(scenarios)('$description', async ({ config }) => {
      await createClient(config);

      const outputPath = typeof config.output === 'string' ? config.output : '';
      const filePaths = getFilePaths(outputPath);

      filePaths.forEach((filePath) => {
        const fileContent = readFileSync(filePath, 'utf-8');
        expect(fileContent).toMatchFileSnapshot(
          path.join(
            __dirname,
            '__snapshots__',
            version,
            namespace,
            filePath.slice(outputDir.length + 1),
          ),
        );
      });
    });
  });

  describe('custom plugin', () => {
    it('handles a custom plugin', async () => {
      const myPlugin: PluginConfig<{
        customOption: boolean;
        name: string;
        output: string;
      }> = {
        _dependencies: ['@hey-api/types'],
        _handler: vi.fn(),
        _handlerLegacy: vi.fn(),
        customOption: true,
        name: 'my-plugin',
        output: 'my-plugin',
      };

      await createClient({
        client: '@hey-api/client-fetch',
        experimentalParser: true,
        input: path.join(__dirname, 'spec', '3.1.x', 'full.json'),
        output: path.join(outputDir, myPlugin.name, 'default'),
        // @ts-expect-error
        plugins: [myPlugin],
      });

      expect(myPlugin._handler).toHaveBeenCalled();
      expect(myPlugin._handlerLegacy).not.toHaveBeenCalled();
    });

    it('throws on invalid dependency', async () => {
      const myPlugin: PluginConfig<{
        name: string;
        output: string;
      }> = {
        // @ts-expect-error
        _dependencies: ['@hey-api/oops'],
        _handler: vi.fn(),
        _handlerLegacy: vi.fn(),
        name: 'my-plugin',
        output: 'my-plugin',
      };

      await expect(() =>
        createClient({
          client: '@hey-api/client-fetch',
          experimentalParser: true,
          input: path.join(__dirname, 'spec', '3.1.x', 'full.json'),
          output: path.join(outputDir, myPlugin.name, 'default'),
          // @ts-expect-error
          plugins: [myPlugin],
        }),
      ).rejects.toThrowError(/unknown plugin/g);

      expect(myPlugin._handler).not.toHaveBeenCalled();
      expect(myPlugin._handlerLegacy).not.toHaveBeenCalled();
    });

    it('throws on native plugin override', async () => {
      const myPlugin: PluginConfig<{
        name: string;
        output: string;
      }> = {
        _handler: vi.fn(),
        _handlerLegacy: vi.fn(),
        name: '@hey-api/types',
        output: 'my-plugin',
      };

      await expect(() =>
        createClient({
          client: '@hey-api/client-fetch',
          experimentalParser: true,
          input: path.join(__dirname, 'spec', '3.1.x', 'full.json'),
          output: path.join(outputDir, myPlugin.name, 'default'),
          // @ts-expect-error
          plugins: [myPlugin],
        }),
      ).rejects.toThrowError(/cannot register plugin/g);

      expect(myPlugin._handler).not.toHaveBeenCalled();
      expect(myPlugin._handlerLegacy).not.toHaveBeenCalled();
    });
  });
}
