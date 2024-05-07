import { mkdirSync, rmSync, writeFileSync } from 'node:fs';

import { describe, expect, it, vi } from 'vitest';

import { setConfig } from '../../config';
import { writeClient } from '../client';
import { mockTemplates } from './mocks';
import { openApi } from './models';

vi.mock('node:fs');

describe('writeClient', () => {
  it('writes to filesystem', async () => {
    setConfig({
      client: 'fetch',
      debug: false,
      dryRun: false,
      exportCore: true,
      format: 'prettier',
      input: '',
      lint: false,
      output: './dist',
      schemas: {},
      services: {},
      types: {
        enums: 'javascript',
      },
      useOptions: false,
    });

    const client: Parameters<typeof writeClient>[1] = {
      models: [],
      server: 'http://localhost:8080',
      services: [],
      types: {},
      version: 'v1',
    };

    await writeClient(openApi, client, mockTemplates);

    expect(rmSync).toHaveBeenCalled();
    expect(mkdirSync).toHaveBeenCalled();
    expect(writeFileSync).toHaveBeenCalled();
  });
});
