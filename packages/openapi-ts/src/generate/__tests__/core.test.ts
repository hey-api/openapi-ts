import fs from 'node:fs';
import path from 'node:path';

import type ts from 'typescript';
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
        watch: {
          enabled: false,
          interval: 1_000,
          timeout: 60_000,
        },
      },
      interactive: false,
      logs: {
        file: true,
        level: 'info',
        path: process.cwd(),
      },
      name: 'AppClient',
      output: {
        clean: false,
        fileName: {
          case: 'preserve',
          name: '{{name}}',
          suffix: '.gen',
        },
        format: null,
        importFileExtension: undefined,
        indexFile: true,
        lint: null,
        path: '',
        tsConfig: null,
        tsConfigPath: null,
      },
      parser: {
        hooks: {},
        pagination: {
          keywords: [],
        },
        transforms: {
          enums: {
            case: 'preserve',
            enabled: false,
            mode: 'root',
            name: '',
          },
          propertiesRequiredByDefault: false,
          readWrite: {
            enabled: false,
            requests: {
              case: 'preserve',
              name: '',
            },
            responses: {
              case: 'preserve',
              name: '',
            },
          },
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
          api: {
            getSelector: () => [],
          },
          config: {
            name: '@hey-api/schemas',
          },
          handler: () => {},
          name: '@hey-api/schemas',
          output: '',
        },
        '@hey-api/sdk': {
          api: {
            getSelector: () => [],
          },
          config: {
            name: '@hey-api/sdk',
          },
          handler: () => {},
          name: '@hey-api/sdk',
          output: '',
        },
        '@hey-api/typescript': {
          api: {
            getSelector: () => [],
            schemaToType: () => ({}) as ts.TypeNode,
          },
          config: {
            enums: 'javascript',
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
      useOptions: true,
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
        watch: {
          enabled: false,
          interval: 1_000,
          timeout: 60_000,
        },
      },
      interactive: false,
      logs: {
        file: true,
        level: 'info',
        path: process.cwd(),
      },
      name: 'AppClient',
      output: {
        clean: false,
        fileName: {
          case: 'preserve',
          name: '{{name}}',
          suffix: '.gen',
        },
        format: null,
        importFileExtension: undefined,
        indexFile: true,
        lint: null,
        path: '',
        tsConfig: null,
        tsConfigPath: null,
      },
      parser: {
        hooks: {},
        pagination: {
          keywords: [],
        },
        transforms: {
          enums: {
            case: 'preserve',
            enabled: false,
            mode: 'root',
            name: '',
          },
          propertiesRequiredByDefault: false,
          readWrite: {
            enabled: false,
            requests: {
              case: 'preserve',
              name: '',
            },
            responses: {
              case: 'preserve',
              name: '',
            },
          },
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
          api: {
            getSelector: () => [],
          },
          config: {
            name: '@hey-api/schemas',
          },
          handler: () => {},
          name: '@hey-api/schemas',
          output: '',
        },
        '@hey-api/sdk': {
          api: {
            getSelector: () => [],
          },
          config: {
            name: '@hey-api/sdk',
          },
          handler: () => {},
          name: '@hey-api/sdk',
          output: '',
        },
        '@hey-api/typescript': {
          api: {
            getSelector: () => [],
            schemaToType: () => ({}) as ts.TypeNode,
          },
          config: {
            enums: 'javascript',
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
      useOptions: true,
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
        watch: {
          enabled: false,
          interval: 1_000,
          timeout: 60_000,
        },
      },
      interactive: false,
      logs: {
        file: true,
        level: 'info',
        path: process.cwd(),
      },
      name: 'AppClient',
      output: {
        clean: false,
        fileName: {
          case: 'preserve',
          name: '{{name}}',
          suffix: '.gen',
        },
        format: null,
        importFileExtension: undefined,
        indexFile: true,
        lint: null,
        path: '',
        tsConfig: null,
        tsConfigPath: null,
      },
      parser: {
        hooks: {},
        pagination: {
          keywords: [],
        },
        transforms: {
          enums: {
            case: 'preserve',
            enabled: false,
            mode: 'root',
            name: '',
          },
          propertiesRequiredByDefault: false,
          readWrite: {
            enabled: false,
            requests: {
              case: 'preserve',
              name: '',
            },
            responses: {
              case: 'preserve',
              name: '',
            },
          },
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
          api: {
            getSelector: () => [],
          },
          config: {
            name: '@hey-api/schemas',
          },
          handler: () => {},
          name: '@hey-api/schemas',
          output: '',
        },
        '@hey-api/sdk': {
          api: {
            getSelector: () => [],
          },
          config: {
            name: '@hey-api/sdk',
          },
          handler: () => {},
          name: '@hey-api/sdk',
          output: '',
        },
        '@hey-api/typescript': {
          api: {
            getSelector: () => [],
            schemaToType: () => ({}) as ts.TypeNode,
          },
          config: {
            enums: 'javascript',
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
      useOptions: true,
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
