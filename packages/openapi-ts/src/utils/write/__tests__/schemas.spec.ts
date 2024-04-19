import { writeFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it, vi } from 'vitest';

import { TypeScriptFile } from '../../../compiler';
import { setConfig } from '../../config';
import { processSchemas } from '../schemas';
import { openApi } from './models';

vi.mock('node:fs');

describe('processSchemas', () => {
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
      services: {},
      types: {},
      useOptions: true,
    });

    if ('openapi' in openApi) {
      openApi.components = {
        schemas: {
          foo: {
            type: 'object',
          },
        },
      };
    }

    const file = new TypeScriptFile({
      dir: '/',
      name: 'schemas.ts',
    });

    await processSchemas({ file, openApi });

    file.write();

    expect(writeFileSync).toHaveBeenCalledWith(
      path.resolve('/schemas.gen.ts'),
      expect.anything(),
    );
  });
});
