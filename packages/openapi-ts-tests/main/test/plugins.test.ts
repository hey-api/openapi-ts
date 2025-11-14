import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  createClient,
  type DefinePlugin,
  type UserConfig,
} from '@hey-api/openapi-ts';
import { describe, expect, it, vi } from 'vitest';

import { getFilePaths, getSpecsPath } from '../../utils';

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
    ) =>
      ({
        ...userConfig,
        input: path.join(
          getSpecsPath(),
          version,
          typeof userConfig.input === 'string' ? userConfig.input : 'full.yaml',
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
      }) as const satisfies UserConfig;

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
          input: 'sdk-instance.yaml',
          output: 'asClass',
          plugins: [
            '@tanstack/angular-query-experimental',
            '@hey-api/client-fetch',
            {
              asClass: true,
              classNameBuilder: '{{name}}Service',
              name: '@hey-api/sdk',
            },
          ],
        }),
        description:
          'generate Fetch API client with TanStack Angular Query Experimental plugin using class-based SDKs',
      },
      {
        config: createConfig({
          input: 'sdk-instance.yaml',
          output: 'asClass',
          plugins: [
            '@tanstack/react-query',
            '@hey-api/client-fetch',
            {
              asClass: true,
              classNameBuilder: '{{name}}Service',
              name: '@hey-api/sdk',
            },
          ],
        }),
        description:
          'generate Fetch API client with TanStack React Query plugin using class-based SDKs',
      },
      {
        config: createConfig({
          input: 'sdk-instance.yaml',
          output: 'asClass',
          plugins: [
            '@tanstack/solid-query',
            '@hey-api/client-fetch',
            {
              asClass: true,
              classNameBuilder: '{{name}}Service',
              name: '@hey-api/sdk',
            },
          ],
        }),
        description:
          'generate Fetch API client with TanStack Solid Query plugin using class-based SDKs',
      },
      {
        config: createConfig({
          input: 'sdk-instance.yaml',
          output: 'asClass',
          plugins: [
            '@tanstack/svelte-query',
            '@hey-api/client-fetch',
            {
              asClass: true,
              classNameBuilder: '{{name}}Service',
              name: '@hey-api/sdk',
            },
          ],
        }),
        description:
          'generate Fetch API client with TanStack Svelte Query plugin using class-based SDKs',
      },
      {
        config: createConfig({
          input: 'sdk-instance.yaml',
          output: 'asClass',
          plugins: [
            '@tanstack/vue-query',
            '@hey-api/client-fetch',
            {
              asClass: true,
              classNameBuilder: '{{name}}Service',
              name: '@hey-api/sdk',
            },
          ],
        }),
        description:
          'generate Fetch API client with TanStack Vue Query plugin using class-based SDKs',
      },
      {
        config: createConfig({
          input: 'sdk-instance.yaml',
          output: 'name-builder',
          plugins: [
            {
              infiniteQueryKeys: {
                name: '{{name}}A',
              },
              infiniteQueryOptions: {
                name: '{{name}}B',
              },
              mutationOptions: {
                name: '{{name}}C',
              },
              name: '@tanstack/angular-query-experimental',
              queryKeys: {
                name: '{{name}}D',
              },
              queryOptions: {
                name: '{{name}}E',
              },
            },
            '@hey-api/client-fetch',
            '@hey-api/sdk',
          ],
        }),
        description:
          'generate Fetch API client with TanStack Angular Query Experimental plugin with custom names',
      },
      {
        config: createConfig({
          input: 'sdk-instance.yaml',
          output: 'name-builder',
          plugins: [
            {
              infiniteQueryKeys: {
                name: '{{name}}A',
              },
              infiniteQueryOptions: {
                name: '{{name}}B',
              },
              mutationOptions: {
                name: '{{name}}C',
              },
              name: '@tanstack/react-query',
              queryKeys: {
                name: '{{name}}D',
              },
              queryOptions: {
                name: '{{name}}E',
              },
            },
            '@hey-api/client-fetch',
            '@hey-api/sdk',
          ],
        }),
        description:
          'generate Fetch API client with TanStack React Query plugin with custom names',
      },
      {
        config: createConfig({
          input: 'sdk-instance.yaml',
          output: 'name-builder',
          plugins: [
            {
              infiniteQueryKeys: {
                name: '{{name}}A',
              },
              infiniteQueryOptions: {
                name: '{{name}}B',
              },
              mutationOptions: {
                name: '{{name}}C',
              },
              name: '@tanstack/solid-query',
              queryKeys: {
                name: '{{name}}D',
              },
              queryOptions: {
                name: '{{name}}E',
              },
            },
            '@hey-api/client-fetch',
            '@hey-api/sdk',
          ],
        }),
        description:
          'generate Fetch API client with TanStack Solid Query plugin with custom names',
      },
      {
        config: createConfig({
          input: 'sdk-instance.yaml',
          output: 'name-builder',
          plugins: [
            {
              infiniteQueryKeys: {
                name: '{{name}}A',
              },
              infiniteQueryOptions: {
                name: '{{name}}B',
              },
              mutationOptions: {
                name: '{{name}}C',
              },
              name: '@tanstack/svelte-query',
              queryKeys: {
                name: '{{name}}D',
              },
              queryOptions: {
                name: '{{name}}E',
              },
            },
            '@hey-api/client-fetch',
            '@hey-api/sdk',
          ],
        }),
        description:
          'generate Fetch API client with TanStack Svelte Query plugin with custom names',
      },
      {
        config: createConfig({
          input: 'sdk-instance.yaml',
          output: 'name-builder',
          plugins: [
            {
              infiniteQueryKeys: {
                name: '{{name}}A',
              },
              infiniteQueryOptions: {
                name: '{{name}}B',
              },
              mutationOptions: {
                name: '{{name}}C',
              },
              name: '@tanstack/vue-query',
              queryKeys: {
                name: '{{name}}D',
              },
              queryOptions: {
                name: '{{name}}E',
              },
            },
            '@hey-api/client-fetch',
            '@hey-api/sdk',
          ],
        }),
        description:
          'generate Fetch API client with TanStack Vue Query plugin with custom names',
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
          input: 'sdk-instance.yaml',
          output: 'instance',
          plugins: [
            {
              instance: true,
              name: '@hey-api/sdk',
            },
            '@hey-api/client-fetch',
          ],
        }),
        description: 'generate SDK instance',
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
          plugins: ['valibot'],
        }),
        description: 'generate Valibot schemas with Valibot plugin',
      },
      {
        config: createConfig({
          input: 'type-format.yaml',
          output: 'type-format-valibot',
          plugins: [
            '@hey-api/transformers',
            '@hey-api/client-fetch',
            'valibot',
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
          input: 'type-format.yaml',
          output: 'type-format-zod',
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
          input: 'transforms-read-write.yaml',
          output: 'transforms-read-write-ignore',
          parser: {
            transforms: {
              readWrite: false,
            },
          },
          plugins: ['@hey-api/typescript', '@hey-api/client-fetch'],
        }),
        description: 'ignores read-only and write-only handling',
      },
      {
        config: createConfig({
          input: 'transforms-read-write.yaml',
          output: 'transforms-read-write-custom-name',
          parser: {
            transforms: {
              readWrite: {
                requests: 'Writable{{name}}',
                responses: 'Readable{{name}}',
              },
            },
          },
          plugins: ['@hey-api/typescript', '@hey-api/client-fetch'],
        }),
        description: 'custom read-only and write-only naming',
      },
      {
        config: createConfig({
          input: 'sdk-nested-classes.yaml',
          output: 'sdk-nested-classes',
          plugins: [
            '@hey-api/client-fetch',
            {
              asClass: true,
              classStructure: 'auto',
              name: '@hey-api/sdk',
            },
          ],
        }),
        description: 'generate nested classes with auto class structure',
      },
      {
        config: createConfig({
          input: 'sdk-nested-classes.yaml',
          output: 'sdk-nested-classes-instance',
          plugins: [
            '@hey-api/client-fetch',
            {
              asClass: true,
              classStructure: 'auto',
              instance: 'NestedSdkWithInstance',
              name: '@hey-api/sdk',
            },
          ],
        }),
        description: 'generate nested classes with auto class structure',
      },
      {
        config: createConfig({
          output: 'fetch',
          plugins: ['@pinia/colada', '@hey-api/client-fetch'],
        }),
        description: 'generate Fetch API client with Pinia Colada plugin',
      },
      {
        config: createConfig({
          input: 'sdk-instance.yaml',
          output: 'asClass',
          plugins: [
            '@pinia/colada',
            '@hey-api/client-fetch',
            {
              asClass: true,
              classNameBuilder: '{{name}}Service',
              name: '@hey-api/sdk',
            },
          ],
        }),
        description:
          'generate Fetch API client with Pinia Colada plugin using class-based SDKs',
      },
      {
        config: createConfig({
          output: 'default',
          plugins: ['@angular/common', '@hey-api/client-angular'],
        }),
        description: 'generate Angular requests and resources',
      },
      {
        config: createConfig({
          output: 'default-class',
          plugins: [
            {
              httpRequests: {
                asClass: true,
              },
              httpResources: {
                asClass: true,
              },
              name: '@angular/common',
            },
            '@hey-api/client-angular',
          ],
        }),
        description: 'generate Angular requests and resources (class)',
      },
      {
        config: createConfig({
          output: 'fetch',
          plugins: ['swr', '@hey-api/client-fetch'],
        }),
        description: 'generate Fetch API client with SWR plugin',
      },
      {
        config: createConfig({
          output: 'axios',
          plugins: ['swr', '@hey-api/client-axios'],
        }),
        description: 'generate Axios client with SWR plugin',
      },
      {
        config: createConfig({
          input: 'sdk-instance.yaml',
          output: 'asClass',
          plugins: [
            'swr',
            '@hey-api/client-fetch',
            {
              asClass: true,
              classNameBuilder: '{{name}}Service',
              name: '@hey-api/sdk',
            },
          ],
        }),
        description:
          'generate Fetch API client with SWR plugin using class-based SDKs',
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
      const myPlugin: DefinePlugin<{
        customOption: boolean;
        name: any;
        output: string;
      }>['Config'] = {
        api: undefined,
        config: {
          customOption: true,
          output: 'my-plugin',
        },
        dependencies: ['@hey-api/typescript'],
        handler: vi.fn(),
        name: 'my-plugin',
      };

      await createClient({
        input: path.join(getSpecsPath(), '3.1.x', 'full.yaml'),
        logs: {
          level: 'silent',
        },
        output: path.join(outputDir, myPlugin.name, 'default'),
        plugins: [myPlugin, '@hey-api/client-fetch'],
      });

      expect(myPlugin.handler).toHaveBeenCalled();
    });

    it('throws on invalid dependency', async () => {
      const myPlugin: DefinePlugin<{
        name: any;
        output: string;
      }>['Config'] = {
        api: undefined,
        config: {
          output: 'my-plugin',
        },
        dependencies: ['@hey-api/oops'],
        handler: vi.fn(),
        name: 'my-plugin',
      };

      await expect(() =>
        createClient({
          input: path.join(getSpecsPath(), '3.1.x', 'full.yaml'),
          logs: {
            level: 'silent',
          },
          output: path.join(outputDir, myPlugin.name, 'default'),
          plugins: [myPlugin, '@hey-api/client-fetch'],
        }),
      ).rejects.toThrowError(/Found 1 configuration error./g);

      expect(myPlugin.handler).not.toHaveBeenCalled();
    });
  });
}
