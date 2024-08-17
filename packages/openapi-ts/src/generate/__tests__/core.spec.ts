import { writeFileSync } from 'node:fs';
import path from 'node:path';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { setConfig } from '../../utils/config';
import { generateCore } from '../core';
import { mockTemplates } from './mocks';

vi.mock('node:fs');

describe('generateCore', () => {
  let templates: Parameters<typeof generateCore>[2];
  beforeEach(() => {
    templates = mockTemplates;
  });

  it('writes to filesystem', async () => {
    const client: Parameters<typeof generateCore>[1] = {
      models: [],
      operationIds: new Map(),
      server: 'http://localhost:8080',
      services: [],
      types: {},
      version: '1.0',
    };

    setConfig({
      client: {
        name: 'fetch',
      },
      configFile: '',
      debug: false,
      dryRun: false,
      experimental_parser: false,
      exportCore: true,
      input: '',
      name: 'AppClient',
      output: {
        path: '',
      },
      plugins: [],
      schemas: {},
      services: {},
      types: {
        enums: 'javascript',
      },
      useOptions: true,
    });

    await generateCore('/', client, templates);

    expect(writeFileSync).toHaveBeenCalledWith(
      path.resolve('/', '/OpenAPI.ts'),
      'settings',
    );
    expect(writeFileSync).toHaveBeenCalledWith(
      path.resolve('/', '/ApiError.ts'),
      'apiError',
    );
    expect(writeFileSync).toHaveBeenCalledWith(
      path.resolve('/', '/ApiRequestOptions.ts'),
      'apiRequestOptions',
    );
    expect(writeFileSync).toHaveBeenCalledWith(
      path.resolve('/', '/ApiResult.ts'),
      'apiResult',
    );
    expect(writeFileSync).toHaveBeenCalledWith(
      path.resolve('/', '/CancelablePromise.ts'),
      'cancelablePromise',
    );
    expect(writeFileSync).toHaveBeenCalledWith(
      path.resolve('/', '/request.ts'),
      'request',
    );
  });

  it('uses client server value for base', async () => {
    const client: Parameters<typeof generateCore>[1] = {
      models: [],
      operationIds: new Map(),
      server: 'http://localhost:8080',
      services: [],
      types: {},
      version: '1.0',
    };

    const config = setConfig({
      client: {
        name: 'fetch',
      },
      configFile: '',
      debug: false,
      dryRun: false,
      experimental_parser: false,
      exportCore: true,
      input: '',
      name: 'AppClient',
      output: {
        path: '',
      },
      plugins: [],
      schemas: {},
      services: {},
      types: {
        enums: 'javascript',
      },
      useOptions: true,
    });

    await generateCore('/', client, templates);

    expect(templates.core.settings).toHaveBeenCalledWith({
      $config: config,
      httpRequest: 'FetchHttpRequest',
      server: 'http://localhost:8080',
      version: '1.0',
    });
  });

  it('uses custom value for base', async () => {
    const client: Parameters<typeof generateCore>[1] = {
      models: [],
      operationIds: new Map(),
      server: 'http://localhost:8080',
      services: [],
      types: {},
      version: '1.0',
    };

    const config = setConfig({
      base: 'foo',
      client: {
        name: 'fetch',
      },
      configFile: '',
      debug: false,
      dryRun: false,
      experimental_parser: false,
      exportCore: true,
      input: '',
      name: 'AppClient',
      output: {
        path: '',
      },
      plugins: [],
      schemas: {},
      services: {},
      types: {
        enums: 'javascript',
      },
      useOptions: true,
    });

    await generateCore('/', client, templates);

    expect(templates.core.settings).toHaveBeenCalledWith({
      $config: config,
      httpRequest: 'FetchHttpRequest',
      server: 'foo',
      version: '1.0',
    });
  });
});
