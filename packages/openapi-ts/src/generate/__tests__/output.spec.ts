import { mkdirSync, rmSync, writeFileSync } from 'node:fs';

import { describe, expect, it, vi } from 'vitest';

import type { Client } from '../../types/client';
import { setConfig } from '../../utils/config';
import { generateLegacyOutput } from '../output';
import { mockTemplates, openApi } from './mocks';

vi.mock('node:fs');

describe('generateLegacyOutput', () => {
  it('writes to filesystem', async () => {
    setConfig({
      client: {
        name: 'legacy/fetch',
      },
      configFile: '',
      debug: false,
      dryRun: false,
      experimental_parser: false,
      exportCore: true,
      input: '',
      output: {
        format: 'prettier',
        path: './dist',
      },
      plugins: [],
      schemas: {},
      services: {},
      types: {
        enums: 'javascript',
      },
      useOptions: false,
    });

    const client: Client = {
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

    expect(rmSync).toHaveBeenCalled();
    expect(mkdirSync).toHaveBeenCalled();
    expect(writeFileSync).toHaveBeenCalled();
  });
});
