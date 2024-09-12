import { writeFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it, vi } from 'vitest';

import type { OpenApiV3Schema } from '../../openApi';
import type { Files } from '../../types/utils';
import { setConfig } from '../../utils/config';
import { generateSchemas } from '../schemas';
import { openApi } from './mocks';

vi.mock('node:fs');

describe('generateSchemas', () => {
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
      name: 'AppClient',
      output: {
        path: '',
      },
      plugins: [],
      schemas: {
        export: true,
      },
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

    const files: Files = {};

    await generateSchemas({ files, openApi });

    files.schemas.write();

    expect(writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining(path.resolve('schemas.gen.ts')),
      expect.anything(),
    );
  });

  it('uses custom schema name', async () => {
    const nameFn = vi.fn().mockReturnValue('customName');

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
      name: 'AppClient',
      output: {
        path: '',
      },
      plugins: [],
      schemas: {
        export: true,
        name: nameFn,
      },
      services: {},
      types: {
        enums: 'javascript',
      },
      useOptions: true,
    });

    const schema: OpenApiV3Schema = {
      type: 'object',
    };

    if ('openapi' in openApi) {
      openApi.components = {
        schemas: {
          foo: schema,
        },
      };
    }

    const files: Files = {};

    await generateSchemas({ files, openApi });

    files.schemas.write();

    expect(writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining(path.resolve('schemas.gen.ts')),
      expect.anything(),
    );

    expect(nameFn).toHaveBeenCalledWith('foo', schema);
  });

  it('removes duplicate nulls in oneOf union types', async () => {
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
      name: 'AppClient',
      output: {
        path: '',
      },
      plugins: [],
      schemas: {
        export: true,
      },
      services: {},
      types: {
        enums: 'javascript',
      },
      useOptions: true,
    });

    const schemaWithDuplicateNulls: OpenApiV3Schema = {
      nullable: true,
      oneOf: [
        { type: 'string' },
        { nullable: true, type: 'string' },
        null as unknown as OpenApiV3Schema,
      ],
    };

    if ('openapi' in openApi) {
      openApi.components = {
        schemas: {
          foo: schemaWithDuplicateNulls,
        },
      };
    }

    const files: Files = {};

    await generateSchemas({ files, openApi });

    files.schemas.write();

    expect(writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining(path.resolve('schemas.gen.ts')),
      expect.stringContaining(`oneOf: [`),
    );

    expect(writeFileSync).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringMatching(
        /oneOf:\s*\[\s*{\s*type:\s*'string'\s*},\s*{\s*type:\s*'string',\s*nullable:\s*true\s*}\s*]/,
      ),
    );
  });
});
