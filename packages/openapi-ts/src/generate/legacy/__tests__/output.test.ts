import fs from 'node:fs';

import type ts from 'typescript';
import { describe, expect, it, vi } from 'vitest';

import type { Client } from '~/types/client';
import type { Config } from '~/types/config';
import { setConfig } from '~/utils/config';

import { mockTemplates, openApi } from '../../__tests__/mocks';
import { generateLegacyOutput } from '../output';

vi.mock('node:fs', () => {
  const exports = {
    existsSync: vi.fn(),
    mkdirSync: vi.fn(),
    readdirSync: vi.fn().mockReturnValue([]),
    rmSync: vi.fn(),
    writeFileSync: vi.fn(),
  };
  return {
    ...exports,
    default: exports,
  };
});

describe('generateLegacyOutput', () => {
  it('writes to filesystem', async () => {
    setConfig({
      configFile: '',
      dryRun: false,
      experimentalParser: false,
      exportCore: true,
      input: [
        {
          path: '',
          watch: {
            enabled: false,
            interval: 1_000,
            timeout: 60_000,
          },
        },
      ],
      interactive: false,
      logs: {
        file: true,
        level: 'info',
        path: process.cwd(),
      },
      output: {
        clean: false,
        fileName: {
          case: 'preserve',
          name: '{{name}}',
          suffix: '.gen',
        },
        format: 'prettier',
        importFileExtension: undefined,
        indexFile: true,
        lint: null,
        path: './dist',
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
            selector: () => [],
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
            selector: () => [],
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
      useOptions: false,
    });

    const client: Client = {
      config: {} as Config,
      models: [],
      server: 'http://localhost:8080',
      services: [],
      types: {},
      version: 'v1',
    };

    await generateLegacyOutput({
      client,
      openApi,
      templates: mockTemplates,
    });

    expect(fs.rmSync).toHaveBeenCalled();
    expect(fs.mkdirSync).toHaveBeenCalled();
    expect(fs.writeFileSync).toHaveBeenCalled();
  });
});
