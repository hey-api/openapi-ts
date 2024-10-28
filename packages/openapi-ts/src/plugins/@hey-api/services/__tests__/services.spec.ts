import { writeFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it, vi } from 'vitest';

import { openApi } from '../../../../generate/__tests__/mocks';
import { TypeScriptFile } from '../../../../generate/files';
import type { Operation } from '../../../../types/client';
import type { Files } from '../../../../types/utils';
import { setConfig } from '../../../../utils/config';
import { handlerLegacy } from '../plugin-legacy';

vi.mock('node:fs');

describe('generateLegacyServices', () => {
  it('writes to filesystem', async () => {
    setConfig({
      client: {
        name: 'legacy/fetch',
      },
      configFile: '',
      debug: false,
      dryRun: false,
      experimentalParser: false,
      exportCore: true,
      input: '',
      output: {
        path: '',
      },
      pluginOrder: ['@hey-api/types', '@hey-api/schemas', '@hey-api/services'],
      plugins: {
        '@hey-api/schemas': {
          _handler: () => {},
          _handlerLegacy: () => {},
          name: '@hey-api/schemas',
        },
        '@hey-api/services': {
          _handler: () => {},
          _handlerLegacy: () => {},
          asClass: true,
          name: '@hey-api/services',
        },
        '@hey-api/types': {
          _handler: () => {},
          _handlerLegacy: () => {},
          name: '@hey-api/types',
        },
      },
      useOptions: false,
    });

    const client: Parameters<typeof handlerLegacy>[0]['client'] = {
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
      name: 'types.ts',
    });

    await handlerLegacy({
      client,
      files,
      openApi,
      plugin: {
        output: '',
      },
    });

    files.services.write();

    expect(writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining(path.resolve('services.gen.ts')),
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
      client: {
        name: 'legacy/fetch',
      },
      configFile: '',
      debug: false,
      dryRun: false,
      experimentalParser: false,
      exportCore: true,
      input: '',
      output: {
        path: '',
      },
      pluginOrder: ['@hey-api/types', '@hey-api/schemas', '@hey-api/services'],
      plugins: {
        '@hey-api/schemas': {
          _handler: () => {},
          _handlerLegacy: () => {},
          name: '@hey-api/schemas',
        },
        '@hey-api/services': {
          _handler: () => {},
          _handlerLegacy: () => {},
          asClass: true,
          name: '@hey-api/services',
        },
        '@hey-api/types': {
          _handler: () => {},
          _handlerLegacy: () => {},
          name: '@hey-api/types',
        },
      },
      useOptions: false,
    });

    const files: Files = {};

    files.types = new TypeScriptFile({
      dir: '/',
      name: 'types.ts',
    });

    await handlerLegacy({
      client,
      files,
      openApi,
      plugin: {
        output: '',
      },
    });

    files.services.write();

    expect(writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining(path.resolve('services.gen.ts')),
      expect.stringContaining('public static userGet()'),
    );
  });

  it('use methodNameBuilder when asClass is true', async () => {
    const methodNameBuilder = vi.fn().mockReturnValue('customName');

    setConfig({
      client: {
        name: 'legacy/fetch',
      },
      configFile: '',
      debug: false,
      dryRun: false,
      experimentalParser: false,
      exportCore: true,
      input: '',
      output: {
        path: '',
      },
      pluginOrder: ['@hey-api/types', '@hey-api/schemas', '@hey-api/services'],
      plugins: {
        '@hey-api/schemas': {
          _handler: () => {},
          _handlerLegacy: () => {},
          name: '@hey-api/schemas',
        },
        '@hey-api/services': {
          _handler: () => {},
          _handlerLegacy: () => {},
          asClass: true,
          methodNameBuilder,
          name: '@hey-api/services',
        },
        '@hey-api/types': {
          _handler: () => {},
          _handlerLegacy: () => {},
          name: '@hey-api/types',
        },
      },
      useOptions: false,
    });

    const files: Files = {};

    files.types = new TypeScriptFile({
      dir: '/',
      name: 'types.ts',
    });

    await handlerLegacy({
      client,
      files,
      openApi,
      plugin: {
        output: '',
      },
    });

    files.services.write();

    expect(writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining(path.resolve('services.gen.ts')),
      expect.stringContaining('public static customName()'),
    );

    expect(methodNameBuilder).toHaveBeenCalledWith(operation);
  });

  it('use methodNameBuilder when asClass is false', async () => {
    const methodNameBuilder = vi.fn().mockReturnValue('customName');

    setConfig({
      client: {
        name: 'legacy/fetch',
      },
      configFile: '',
      debug: false,
      dryRun: false,
      experimentalParser: false,
      exportCore: true,
      input: '',
      output: {
        path: '',
      },
      pluginOrder: ['@hey-api/types', '@hey-api/schemas', '@hey-api/services'],
      plugins: {
        '@hey-api/schemas': {
          _handler: () => {},
          _handlerLegacy: () => {},
          name: '@hey-api/schemas',
        },
        '@hey-api/services': {
          _handler: () => {},
          _handlerLegacy: () => {},
          asClass: false,
          methodNameBuilder,
          name: '@hey-api/services',
        },
        '@hey-api/types': {
          _handler: () => {},
          _handlerLegacy: () => {},
          name: '@hey-api/types',
        },
      },
      useOptions: false,
    });

    const files: Files = {};

    files.types = new TypeScriptFile({
      dir: '/',
      name: 'types.ts',
    });

    await handlerLegacy({
      client,
      files,
      openApi,
      plugin: {
        output: '',
      },
    });

    files.services.write();

    expect(writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining(path.resolve('services.gen.ts')),
      expect.stringContaining('public static customName()'),
    );

    expect(methodNameBuilder).toHaveBeenCalledWith(operation);
  });
});
