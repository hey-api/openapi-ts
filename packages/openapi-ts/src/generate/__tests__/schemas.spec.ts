import { writeFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it, vi } from 'vitest';

import { TypeScriptFile } from '../../compiler';
import { setConfig } from '../../utils/config';
import { generateSchemas } from '../schemas';
import { openApi } from './mocks';

vi.mock('node:fs');

describe('generateSchemas', () => {
  it('writes to filesystem', async () => {
    setConfig({
      client: 'fetch',
      configFile: '',
      debug: false,
      dryRun: false,
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

    await generateSchemas({ file, openApi });

    file.write();

    expect(writeFileSync).toHaveBeenCalledWith(
      path.resolve('/schemas.gen.ts'),
      expect.anything(),
    );
  });
});
