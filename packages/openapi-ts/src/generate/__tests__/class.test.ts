import fs from 'node:fs';

import { describe, expect, it, vi } from 'vitest';

import { setConfig } from '../../utils/config';
import { generateLegacyClientClass } from '../class';
import { mockTemplates, openApi } from './mocks';

vi.mock('node:fs');

describe('generateLegacyClientClass', () => {
  it('writes to filesystem', async () => {
    setConfig({
      client: {
        name: 'legacy/fetch',
      },
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
      pluginOrder: [],
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
      },
      useOptions: true,
    });

    const client: Parameters<typeof generateLegacyClientClass>[2] = {
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
