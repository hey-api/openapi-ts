import { writeFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it, vi } from 'vitest';

import { TypeScriptFile } from '../../compiler';
import { setConfig } from '../../utils/config';
import { generateIndexFile } from '../indexFile';

vi.mock('node:fs');

describe('generateIndexFile', () => {
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

    const files: Parameters<typeof generateIndexFile>[0]['files'] = {
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
        name: 'types.ts',
      }),
    };

    await generateIndexFile({ files });

    files.index.write();

    expect(writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining(path.resolve('index.ts')),
      expect.anything(),
    );
  });
});
