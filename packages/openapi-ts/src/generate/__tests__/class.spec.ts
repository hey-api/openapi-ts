import { writeFileSync } from 'node:fs';

import { describe, expect, it, vi } from 'vitest';

import { setConfig } from '../../utils/config';
import { generateClientClass } from '../class';
import { mockTemplates, openApi } from './mocks';

vi.mock('node:fs');

describe('generateClientClass', () => {
  it('writes to filesystem', async () => {
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

    const client: Parameters<typeof generateClientClass>[2] = {
      models: [],
      operationIds: new Map(),
      server: 'http://localhost:8080',
      services: [],
      types: {},
      version: 'v1',
    };

    await generateClientClass(openApi, './dist', client, mockTemplates);

    expect(writeFileSync).toHaveBeenCalled();
  });
});
