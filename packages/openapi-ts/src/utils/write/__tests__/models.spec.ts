import { writeFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it, vi } from 'vitest';

import { TypeScriptFile } from '../../../compiler';
import { setConfig } from '../../config';
import { processTypes } from '../types';

vi.mock('node:fs');

describe('processTypes', () => {
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
      schemas: {},
      services: {},
      types: {
        enums: 'javascript',
      },
      useOptions: true,
    });

    const client: Parameters<typeof processTypes>[0]['client'] = {
      models: [
        {
          $refs: [],
          base: 'User',
          description: null,
          enum: [],
          enums: [],
          export: 'interface',
          imports: [],
          in: '',
          isDefinition: true,
          isNullable: false,
          isReadOnly: false,
          isRequired: false,
          link: null,
          meta: {
            $ref: '#/components/schemas/User',
            name: 'User',
          },
          name: 'User',
          properties: [],
          template: null,
          type: 'User',
        },
      ],
      server: 'http://localhost:8080',
      services: [],
      types: {},
      version: 'v1',
    };

    const files = {
      types: new TypeScriptFile({
        dir: '/',
        name: 'models.ts',
      }),
    };

    await processTypes({
      client,
      files,
    });

    files.types.write();

    expect(writeFileSync).toHaveBeenCalledWith(
      path.resolve('/models.gen.ts'),
      expect.anything(),
    );
  });
});
