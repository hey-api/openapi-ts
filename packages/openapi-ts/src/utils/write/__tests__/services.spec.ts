import { writeFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it, vi } from 'vitest';

import { TypeScriptFile } from '../../../compiler';
import { setConfig } from '../../config';
import { processServices } from '../services';

vi.mock('node:fs');

describe('processServices', () => {
  it('writes to filesystem', async () => {
    setConfig({
      client: 'fetch',
      debug: false,
      dryRun: false,
      enums: false,
      exportCore: true,
      format: false,
      input: '',
      lint: false,
      operationId: true,
      output: '',
      schemas: {},
      services: {},
      types: {},
      useDateType: false,
      useOptions: false,
    });

    const client: Parameters<typeof processServices>[0]['client'] = {
      enumNames: [],
      models: [],
      server: 'http://localhost:8080',
      services: [
        {
          $refs: [],
          imports: [],
          name: 'User',
          operations: [],
        },
      ],
      version: 'v1',
    };

    const file = new TypeScriptFile({
      dir: '/',
      name: 'services.ts',
    });
    const files = {
      services: file,
    };

    await processServices({ client, files });

    file.write();

    expect(writeFileSync).toHaveBeenCalledWith(
      path.resolve('/services.gen.ts'),
      expect.anything(),
    );
  });
});
