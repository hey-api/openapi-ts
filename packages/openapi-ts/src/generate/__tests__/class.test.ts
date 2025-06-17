import fs from 'node:fs';

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
      name: 'AppClient',
      output: {
        path: '',
      },
      pluginOrder: [
        '@hey-api/typescript',
        'legacy/fetch',
        '@hey-api/schemas',
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
