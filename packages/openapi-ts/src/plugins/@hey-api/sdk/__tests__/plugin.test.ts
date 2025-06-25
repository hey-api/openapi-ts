import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it, vi } from 'vitest';

import { openApi } from '../../../../generate/__tests__/mocks';
import { TypeScriptFile } from '../../../../generate/files';
import type { Operation } from '../../../../types/client';
import type { Config } from '../../../../types/config';
import type { Files } from '../../../../types/utils';
import { setConfig } from '../../../../utils/config';
import { PluginInstance } from '../../../shared/utils/instance';
import { handlerLegacy } from '../plugin-legacy';

vi.mock('node:fs');

describe('handlerLegacy', () => {
  it('writes to filesystem', async () => {
    setConfig({
      configFile: '',
      dryRun: false,
      experimentalParser: false,
      exportCore: true,
      input: {
        path: '',
        watch: {
          enabled: false,
          interval: 1_000,
          timeout: 60_000,
        },
      },
      logs: {
        file: true,
        level: 'info',
        path: process.cwd(),
      },
      output: {
        path: '',
      },
      parser: {
        pagination: {
          keywords: [],
        },
        transforms: {
          enums: 'off',
        },
        validate_EXPERIMENTAL: false,
      },
      pluginOrder: [
        '@hey-api/typescript',
        '@hey-api/schemas',
        'legacy/fetch',
        '@hey-api/sdk',
      ],
      plugins: {
        '@hey-api/schemas': {
          config: {
            name: '@hey-api/schemas',
          },
          handler: () => {},
          name: '@hey-api/schemas',
          output: '',
        },
        '@hey-api/sdk': {
          config: {
            asClass: true,
            name: '@hey-api/sdk',
          },
          handler: () => {},
          name: '@hey-api/sdk',
          output: '',
        },
        '@hey-api/typescript': {
          config: {
            name: '@hey-api/typescript',
          },
          handler: () => {},
          name: '@hey-api/typescript',
          output: '',
        },
        'legacy/fetch': {
          config: {
            name: 'legacy/fetch',
          },
          handler: () => {},
          name: 'legacy/fetch',
          output: '',
          tags: ['client'],
        },
      },
      useOptions: false,
    });

    const client: Parameters<typeof handlerLegacy>[0]['client'] = {
      config: {} as Config,
      models: [],
      server: 'http://localhost:8080',
      services: [
        {
          $refs: [],
          imports: [],
          name: 'User',
          operations: [
            {
              $refs: [],
              deprecated: false,
              description: null,
              id: null,
              imports: [],
              method: 'GET',
              name: '',
              parameters: [],
              parametersBody: null,
              parametersCookie: [],
              parametersForm: [],
              parametersHeader: [],
              parametersPath: [],
              parametersQuery: [],
              path: '/api/v1/foo',
              responseHeader: null,
              responses: [],
              service: '',
              summary: null,
            },
          ],
        },
      ],
      types: {},
      version: 'v1',
    };

    const files: Files = {};

    files.types = new TypeScriptFile({
      dir: '/',
      id: 'types',
      name: 'types.ts',
    });

    await handlerLegacy({
      client,
      files,
      openApi,
      plugin: new PluginInstance({
        config: {
          exportFromIndex: false,
        },
        context: {} as any,
        dependencies: [],
        handler: () => {},
        name: '@hey-api/sdk',
        output: '',
      }),
    });

    files.sdk!.write();

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining(path.resolve('sdk.gen.ts')),
      expect.anything(),
    );
  });
});

describe('methodNameBuilder', () => {
  // If the generated text has the expected method, tests are considered pass.

  const operation: Operation = {
    $refs: [],
    deprecated: false,
    description: null,
    id: 'User_get',
    imports: [],
    method: 'GET',
    name: 'userGet',
    parameters: [],
    parametersBody: null,
    parametersCookie: [],
    parametersForm: [],
    parametersHeader: [],
    parametersPath: [],
    parametersQuery: [],
    path: '/users',
    responseHeader: null,
    responses: [],
    service: 'User',
    summary: null,
  };

  const client: Parameters<typeof handlerLegacy>[0]['client'] = {
    config: {} as Config,
    models: [],
    server: 'http://localhost:8080',
    services: [
      {
        $refs: [],
        imports: [],
        name: 'User',
        operations: [operation],
      },
    ],
    types: {},
    version: 'v1',
  };

  it('use default name', async () => {
    setConfig({
      configFile: '',
      dryRun: false,
      experimentalParser: false,
      exportCore: true,
      input: {
        path: '',
        watch: {
          enabled: false,
          interval: 1_000,
          timeout: 60_000,
        },
      },
      logs: {
        file: true,
        level: 'info',
        path: process.cwd(),
      },
      output: {
        path: '',
      },
      parser: {
        pagination: {
          keywords: [],
        },
        transforms: {
          enums: 'off',
        },
        validate_EXPERIMENTAL: false,
      },
      pluginOrder: [
        '@hey-api/typescript',
        '@hey-api/schemas',
        'legacy/fetch',
        '@hey-api/sdk',
      ],
      plugins: {
        '@hey-api/schemas': {
          config: {
            name: '@hey-api/schemas',
          },
          handler: () => {},
          name: '@hey-api/schemas',
          output: '',
        },
        '@hey-api/sdk': {
          config: {
            asClass: true,
            name: '@hey-api/sdk',
          },
          handler: () => {},
          name: '@hey-api/sdk',
          output: '',
        },
        '@hey-api/typescript': {
          config: {
            name: '@hey-api/typescript',
          },
          handler: () => {},
          name: '@hey-api/typescript',
          output: '',
        },
        'legacy/fetch': {
          config: {
            name: 'legacy/fetch',
          },
          handler: () => {},
          name: 'legacy/fetch',
          output: '',
          tags: ['client'],
        },
      },
      useOptions: false,
    });

    const files: Files = {};

    files.types = new TypeScriptFile({
      dir: '/',
      id: 'types',
      name: 'types.ts',
    });

    await handlerLegacy({
      client,
      files,
      openApi,
      plugin: new PluginInstance({
        config: {
          exportFromIndex: false,
        },
        context: {} as any,
        dependencies: [],
        handler: () => {},
        name: '@hey-api/sdk',
        output: '',
      }),
    });

    files.sdk!.write();

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining(path.resolve('sdk.gen.ts')),
      expect.stringContaining('public static userGet()'),
    );
  });

  it('use methodNameBuilder when asClass is true', async () => {
    const methodNameBuilder = vi.fn().mockReturnValue('customName');

    setConfig({
      configFile: '',
      dryRun: false,
      experimentalParser: false,
      exportCore: true,
      input: {
        path: '',
        watch: {
          enabled: false,
          interval: 1_000,
          timeout: 60_000,
        },
      },
      logs: {
        file: true,
        level: 'info',
        path: process.cwd(),
      },
      output: {
        path: '',
      },
      parser: {
        pagination: {
          keywords: [],
        },
        transforms: {
          enums: 'off',
        },
        validate_EXPERIMENTAL: false,
      },
      pluginOrder: [
        '@hey-api/typescript',
        '@hey-api/schemas',
        'legacy/fetch',
        '@hey-api/sdk',
      ],
      plugins: {
        '@hey-api/schemas': {
          config: {
            name: '@hey-api/schemas',
          },
          handler: () => {},
          name: '@hey-api/schemas',
          output: '',
        },
        '@hey-api/sdk': {
          config: {
            asClass: true,
            methodNameBuilder,
            name: '@hey-api/sdk',
          },
          handler: () => {},
          name: '@hey-api/sdk',
          output: '',
        },
        '@hey-api/typescript': {
          config: {
            name: '@hey-api/typescript',
          },
          handler: () => {},
          name: '@hey-api/typescript',
          output: '',
        },
        'legacy/fetch': {
          config: {
            name: 'legacy/fetch',
          },
          handler: () => {},
          name: 'legacy/fetch',
          output: '',
          tags: ['client'],
        },
      },
      useOptions: false,
    });

    const files: Files = {};

    files.types = new TypeScriptFile({
      dir: '/',
      id: 'types',
      name: 'types.ts',
    });

    await handlerLegacy({
      client,
      files,
      openApi,
      plugin: new PluginInstance({
        config: {
          exportFromIndex: false,
        },
        context: {} as any,
        dependencies: [],
        handler: () => {},
        name: '@hey-api/sdk',
        output: '',
      }),
    });

    files.sdk!.write();

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining(path.resolve('sdk.gen.ts')),
      expect.stringContaining('public static customName()'),
    );

    expect(methodNameBuilder).toHaveBeenCalledWith(operation);
  });

  it('use methodNameBuilder when asClass is false', async () => {
    const methodNameBuilder = vi.fn().mockReturnValue('customName');

    setConfig({
      configFile: '',
      dryRun: false,
      experimentalParser: false,
      exportCore: true,
      input: {
        path: '',
        watch: {
          enabled: false,
          interval: 1_000,
          timeout: 60_000,
        },
      },
      logs: {
        file: true,
        level: 'info',
        path: process.cwd(),
      },
      output: {
        path: '',
      },
      parser: {
        pagination: {
          keywords: [],
        },
        transforms: {
          enums: 'off',
        },
        validate_EXPERIMENTAL: false,
      },
      pluginOrder: [
        '@hey-api/typescript',
        '@hey-api/schemas',
        'legacy/fetch',
        '@hey-api/sdk',
      ],
      plugins: {
        '@hey-api/schemas': {
          config: {
            name: '@hey-api/schemas',
          },
          handler: () => {},
          name: '@hey-api/schemas',
          output: '',
        },
        '@hey-api/sdk': {
          config: {
            asClass: false,
            methodNameBuilder,
            name: '@hey-api/sdk',
          },
          handler: () => {},
          name: '@hey-api/sdk',
          output: '',
        },
        '@hey-api/typescript': {
          config: {
            name: '@hey-api/typescript',
          },
          handler: () => {},
          name: '@hey-api/typescript',
          output: '',
        },
        'legacy/fetch': {
          config: {
            name: 'legacy/fetch',
          },
          handler: () => {},
          name: 'legacy/fetch',
          output: '',
          tags: ['client'],
        },
      },
      useOptions: false,
    });

    const files: Files = {};

    files.types = new TypeScriptFile({
      dir: '/',
      id: 'types',
      name: 'types.ts',
    });

    await handlerLegacy({
      client,
      files,
      openApi,
      plugin: new PluginInstance({
        config: {
          exportFromIndex: false,
        },
        context: {} as any,
        dependencies: [],
        handler: () => {},
        name: '@hey-api/sdk',
        output: '',
      }),
    });

    files.sdk!.write();

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining(path.resolve('sdk.gen.ts')),
      expect.stringContaining('public static customName()'),
    );

    expect(methodNameBuilder).toHaveBeenCalledWith(operation);
  });
});
