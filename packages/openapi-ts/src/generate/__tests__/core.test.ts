import fs from 'node:fs';
import path from 'node:path';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Config } from '../../types/config';
import { setConfig } from '../../utils/config';
import { generateLegacyCore } from '../core';
import { mockTemplates } from './mocks';

vi.mock('node:fs');

describe('generateLegacyCore', () => {
  let templates: Parameters<typeof generateLegacyCore>[2];
  beforeEach(() => {
    templates = mockTemplates;
  });

  it('writes to filesystem', async () => {
    const client: Parameters<typeof generateLegacyCore>[1] = {
      config: {} as Config,
      models: [],
      server: 'http://localhost:8080',
      services: [],
      types: {},
      version: '1.0',
    };

    setConfig({
      configFile: '',
      dryRun: false,
      experimentalParser: false,
      exportCore: true,
      input: {
        path: '',
      },
      logs: {
        level: 'info',
        path: process.cwd(),
      },
      name: 'AppClient',
      output: {
        path: '',
      },
      pluginOrder: [
        '@hey-api/typescript',
        '@hey-api/schemas',
        'legacy/fetch',
        '@hey-api/sdk',
      ],
      plugins: {
        '@hey-api/schemas': {
          _handler: () => {},
          _handlerLegacy: () => {},
          name: '@hey-api/schemas',
        },
        '@hey-api/sdk': {
          _handler: () => {},
          _handlerLegacy: () => {},
          name: '@hey-api/sdk',
        },
        '@hey-api/typescript': {
          _handler: () => {},
          _handlerLegacy: () => {},
          enums: 'javascript',
          name: '@hey-api/typescript',
        },
        'legacy/fetch': {
          _handler: () => {},
          _handlerLegacy: () => {},
          _tags: ['client'],
          name: 'legacy/fetch',
        },
      },
      useOptions: true,
      watch: {
        enabled: false,
        interval: 1_000,
        timeout: 60_000,
      },
    });

    await generateLegacyCore('/', client, templates);

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      path.resolve('/', '/OpenAPI.ts'),
      'settings',
    );
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      path.resolve('/', '/ApiError.ts'),
      'apiError',
    );
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      path.resolve('/', '/ApiRequestOptions.ts'),
      'apiRequestOptions',
    );
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      path.resolve('/', '/ApiResult.ts'),
      'apiResult',
    );
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      path.resolve('/', '/CancelablePromise.ts'),
      'cancelablePromise',
    );
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      path.resolve('/', '/request.ts'),
      'request',
    );
  });

  it('uses client server value for base', async () => {
    const client: Parameters<typeof generateLegacyCore>[1] = {
      config: {} as Config,
      models: [],
      server: 'http://localhost:8080',
      services: [],
      types: {},
      version: '1.0',
    };

    const config = setConfig({
      configFile: '',
      dryRun: false,
      experimentalParser: false,
      exportCore: true,
      input: {
        path: '',
      },
      logs: {
        level: 'info',
        path: process.cwd(),
      },
      name: 'AppClient',
      output: {
        path: '',
      },
      pluginOrder: [
        '@hey-api/typescript',
        '@hey-api/schemas',
        'legacy/fetch',
        '@hey-api/sdk',
      ],
      plugins: {
        '@hey-api/schemas': {
          _handler: () => {},
          _handlerLegacy: () => {},
          name: '@hey-api/schemas',
        },
        '@hey-api/sdk': {
          _handler: () => {},
          _handlerLegacy: () => {},
          name: '@hey-api/sdk',
        },
        '@hey-api/typescript': {
          _handler: () => {},
          _handlerLegacy: () => {},
          enums: 'javascript',
          name: '@hey-api/typescript',
        },
        'legacy/fetch': {
          _handler: () => {},
          _handlerLegacy: () => {},
          _tags: ['client'],
          name: 'legacy/fetch',
        },
      },
      useOptions: true,
      watch: {
        enabled: false,
        interval: 1_000,
        timeout: 60_000,
      },
    });

    await generateLegacyCore('/', client, templates);

    expect(templates.core.settings).toHaveBeenCalledWith({
      $config: config,
      httpRequest: 'FetchHttpRequest',
      server: 'http://localhost:8080',
      version: '1.0',
    });
  });

  it('uses custom value for base', async () => {
    const client: Parameters<typeof generateLegacyCore>[1] = {
      config: {} as Config,
      models: [],
      server: 'http://localhost:8080',
      services: [],
      types: {},
      version: '1.0',
    };

    const config = setConfig({
      base: 'foo',
      configFile: '',
      dryRun: false,
      experimentalParser: false,
      exportCore: true,
      input: {
        path: '',
      },
      logs: {
        level: 'info',
        path: process.cwd(),
      },
      name: 'AppClient',
      output: {
        path: '',
      },
      pluginOrder: [
        '@hey-api/typescript',
        '@hey-api/schemas',
        'legacy/fetch',
        '@hey-api/sdk',
      ],
      plugins: {
        '@hey-api/schemas': {
          _handler: () => {},
          _handlerLegacy: () => {},
          name: '@hey-api/schemas',
        },
        '@hey-api/sdk': {
          _handler: () => {},
          _handlerLegacy: () => {},
          name: '@hey-api/sdk',
        },
        '@hey-api/typescript': {
          _handler: () => {},
          _handlerLegacy: () => {},
          enums: 'javascript',
          name: '@hey-api/typescript',
        },
        'legacy/fetch': {
          _handler: () => {},
          _handlerLegacy: () => {},
          _tags: ['client'],
          name: 'legacy/fetch',
        },
      },
      useOptions: true,
      watch: {
        enabled: false,
        interval: 1_000,
        timeout: 60_000,
      },
    });

    await generateLegacyCore('/', client, templates);

    expect(templates.core.settings).toHaveBeenCalledWith({
      $config: config,
      httpRequest: 'FetchHttpRequest',
      server: 'foo',
      version: '1.0',
    });
  });
});
