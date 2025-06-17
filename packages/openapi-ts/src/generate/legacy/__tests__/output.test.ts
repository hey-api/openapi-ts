import fs from 'node:fs';

import { describe, expect, it, vi } from 'vitest';

import type { Client } from '../../../types/client';
import type { Config } from '../../../types/config';
import { setConfig } from '../../../utils/config';
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
      input: {
        path: '',
        validate_EXPERIMENTAL: false,
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
        format: 'prettier',
        path: './dist',
      },
      pluginOrder: [
        '@hey-api/typescript',
        '@hey-api/schemas',
        'legacy/fetch',
        '@hey-api/sdk',
      ],
      plugins: {
        '@hey-api/schemas': {
          config: {},
          handler: () => {},
          handlerLegacy: () => {},
          name: '@hey-api/schemas',
        },
        '@hey-api/sdk': {
          config: {},
          handler: () => {},
          handlerLegacy: () => {},
          name: '@hey-api/sdk',
        },
        '@hey-api/typescript': {
          config: {
            enums: 'javascript',
          },
          handler: () => {},
          handlerLegacy: () => {},
          name: '@hey-api/typescript',
        },
        'legacy/fetch': {
          config: {},
          handler: () => {},
          handlerLegacy: () => {},
          name: 'legacy/fetch',
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
