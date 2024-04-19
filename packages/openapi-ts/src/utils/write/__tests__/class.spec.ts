import { writeFileSync } from 'node:fs';

import { describe, expect, it, vi } from 'vitest';

import { setConfig } from '../../config';
import { writeClientClass } from '../class';
import { mockTemplates } from './mocks';
import { openApi } from './models';

vi.mock('node:fs');

describe('writeClientClass', () => {
  it('writes to filesystem', async () => {
    setConfig({
      client: 'fetch',
      debug: false,
      dryRun: false,
      enums: 'javascript',
      exportCore: true,
      format: false,
      input: '',
      lint: false,
      name: 'AppClient',
      operationId: true,
      output: '',
      schemas: {},
      serviceResponse: 'body',
      services: {},
      types: {},
      useDateType: false,
      useOptions: true,
    });

    const client: Parameters<typeof writeClientClass>[2] = {
      enumNames: [],
      models: [],
      server: 'http://localhost:8080',
      services: [],
      version: 'v1',
    };

    await writeClientClass(openApi, './dist', client, mockTemplates);

    expect(writeFileSync).toHaveBeenCalled();
  });
});
