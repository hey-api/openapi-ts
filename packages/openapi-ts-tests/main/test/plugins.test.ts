import fs from 'node:fs';
import path from 'node:path';

import type { DefinePlugin, UserConfig } from '@hey-api/openapi-ts';
import { createClient, plugins } from '@hey-api/openapi-ts';

import { getFilePaths, getSpecsPath } from '../../utils';

const versions = ['2.0.x', '3.0.x', '3.1.x'];

for (const version of versions) {
  const namespace = 'plugins';

  const outputDir = path.join(import.meta.dirname, 'generated', version, namespace);

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
        plugins: userConfig.plugins ?? [plugins.clientFetch()],
      }) as const satisfies UserConfig;

    const scenarios = [
      {
        config: createConfig({
          output: 'default',
          plugins: [plugins.schemas()],
        }),
        description: 'generate schemas',
      },
      {
        config: createConfig({
          output: 'default',
          plugins: [plugins.sdk(), plugins.clientFetch()],
        }),
        description: 'generate SDK',
      },
      {
        config: createConfig({
          output: 'brand',
          plugins: [
            plugins.typescript({
              brand: true,
            }),
            plugins.sdk(),
            plugins.clientFetch(),
          ],
        }),
        description: 'generate SDK with branded types',
      },
      {
        config: createConfig({
          output: 'throwOnError',
          plugins: [
            plugins.sdk(),
            plugins.clientFetch({
              throwOnError: true,
            }),
          ],
        }),
        description: 'generate SDK that throws on error',
      },
      {
        config: createConfig({
          input: 'sdk-instance.yaml',
          output: 'instance',
          plugins: [
            plugins.sdk({
              instance: true,
            }),
            plugins.clientFetch(),
          ],
        }),
        description: 'generate SDK instance',
      },
      {
        config: createConfig({
          output: 'default',
          plugins: [plugins.fastify()],
        }),
        description: 'generate Fastify types with Fastify plugin',
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
          plugins: [plugins.typescript(), plugins.clientFetch()],
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
          plugins: [plugins.typescript(), plugins.clientFetch()],
        }),
        description: 'custom read-only and write-only naming',
      },
      {
        config: createConfig({
          input: 'sdk-nested-classes.yaml',
          output: 'sdk-nested-classes',
          plugins: [
            plugins.clientFetch(),
            plugins.sdk({
              asClass: true,
              classStructure: 'auto',
            }),
          ],
        }),
        description: 'generate nested classes with auto class structure',
      },
      {
        config: createConfig({
          input: 'sdk-nested-classes.yaml',
          output: 'sdk-nested-classes-instance',
          plugins: [
            plugins.clientFetch(),
            plugins.sdk({
              asClass: true,
              classStructure: 'auto',
              instance: 'NestedSdkWithInstance',
            }),
          ],
        }),
        description: 'generate nested classes with auto class structure',
      },
      {
        config: createConfig({
          output: 'fetch',
          plugins: [plugins.piniaColada(), plugins.clientFetch()],
        }),
        description: 'generate Fetch API client with Pinia Colada plugin',
      },
      {
        config: createConfig({
          input: 'sdk-instance.yaml',
          output: 'asClass',
          plugins: [
            plugins.piniaColada(),
            plugins.clientFetch(),
            plugins.sdk({
              asClass: true,
              classNameBuilder: '{{name}}Service',
            }),
          ],
        }),
        description: 'generate Fetch API client with Pinia Colada plugin using class-based SDKs',
      },
      {
        config: createConfig({
          output: 'default',
          plugins: [plugins.angularCommon(), plugins.clientAngular()],
        }),
        description: 'generate Angular requests and resources',
      },
      {
        config: createConfig({
          output: 'default-class',
          plugins: [
            plugins.angularCommon({
              httpRequests: {
                containerName: '{{name}}ServiceRequests',
                segmentName: '{{name}}Service',
                strategy: 'byTags',
              },
              httpResources: {
                containerName: '{{name}}ServiceResources',
                segmentName: '{{name}}Service',
                strategy: 'byTags',
              },
            }),
            plugins.clientAngular(),
          ],
        }),
        description: 'generate Angular requests and resources (class)',
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
              import.meta.dirname,
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
}

describe('custom plugin', () => {
  it('handles a custom plugin', async () => {
    const myPlugin: DefinePlugin<{
      customOption: boolean;
      name: any;
    }>['Config'] = {
      api: undefined,
      config: {
        customOption: true,
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
      output: path.join(import.meta.dirname, 'generated', 'my-plugin', 'default'),
      plugins: [myPlugin, plugins.clientFetch()],
    });

    expect(myPlugin.handler).toHaveBeenCalled();
  });

  it.skip('throws on invalid dependency', async () => {
    const myPlugin: DefinePlugin<{
      name: any;
    }>['Config'] = {
      api: undefined,
      config: {},
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
        output: path.join(import.meta.dirname, 'generated', 'my-plugin', 'default'),
        plugins: [myPlugin, plugins.clientFetch()],
      }),
    ).rejects.toThrowError(/Found 1 configuration error./g);

    expect(myPlugin.handler).not.toHaveBeenCalled();
  });
});
