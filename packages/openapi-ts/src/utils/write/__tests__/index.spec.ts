import { writeFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it, vi } from 'vitest';

import { TypeScriptFile } from '../../../compiler';
import { setConfig } from '../../config';
import { processIndex } from '../index';

vi.mock('node:fs');

describe('processIndex', () => {
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
      operationId: true,
      output: '',
      schemas: {},
      services: {},
      types: {},
      useOptions: true,
    });

    const files: Parameters<typeof processIndex>[0]['files'] = {
      enums: new TypeScriptFile({
        dir: '/',
        name: 'enums.ts',
      }),
      index: new TypeScriptFile({
        dir: '/',
        name: 'index.ts',
      }),
      schemas: new TypeScriptFile({
        dir: '/',
        name: 'schemas.ts',
      }),
      services: new TypeScriptFile({
        dir: '/',
        name: 'services.ts',
      }),
      types: new TypeScriptFile({
        dir: '/',
        name: 'models.ts',
      }),
    };

    await processIndex({ files });

    files.index.write();

    expect(writeFileSync).toHaveBeenCalledWith(
      path.resolve('/', '/index.ts'),
      expect.anything(),
    );
  });
});
