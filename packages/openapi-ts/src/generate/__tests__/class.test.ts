import fs from 'node:fs';

import type ts from 'typescript';
import { describe, expect, it, vi } from 'vitest';

import type { Config } from '../../types/config';
import { setConfig } from '../../utils/config';
import { generateLegacyClientClass } from '../class';
import { mockTemplates, openApi } from './mocks';

vi.mock('node:fs');

describe('generateLegacyClientClass', () => {
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
      interactive: false,
      logs: {
        file: true,
        level: 'info',
        path: process.cwd(),
      },
      name: 'AppClient',
      output: {
        path: '',
      },
      parser: {
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
        'legacy/fetch',
        '@hey-api/schemas',
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
            name: '@hey-api/sdk',
          },
          handler: () => {},
          name: '@hey-api/sdk',
          output: '',
        },
        '@hey-api/typescript': {
          api: {
            getId: () => '',
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

    const client: Parameters<typeof generateLegacyClientClass>[2] = {
      config: {} as Config,
      models: [],
      server: 'http://localhost:8080',
      services: [],
      types: {},
      version: 'v1',
    };

    await generateLegacyClientClass(openApi, './dist', client, mockTemplates);

    expect(fs.writeFileSync).toHaveBeenCalled();
  });
});
