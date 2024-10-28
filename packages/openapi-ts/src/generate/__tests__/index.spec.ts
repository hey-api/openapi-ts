import { writeFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it, vi } from 'vitest';

import { setConfig } from '../../utils/config';
import { TypeScriptFile } from '../files';
import { generateIndexFile } from '../indexFile';

vi.mock('node:fs');

describe('generateIndexFile', () => {
  it('writes to filesystem', async () => {
    setConfig({
      client: {
        name: 'legacy/fetch',
      },
      configFile: '',
      debug: false,
      dryRun: false,
      experimentalParser: false,
      exportCore: true,
      input: '',
      output: {
        path: '',
      },
      pluginOrder: ['@hey-api/types', '@hey-api/schemas', '@hey-api/services'],
      plugins: {
        '@hey-api/schemas': {
          _handler: () => {},
          _handlerLegacy: () => {},
          name: '@hey-api/schemas',
        },
        '@hey-api/services': {
          _handler: () => {},
          _handlerLegacy: () => {},
          name: '@hey-api/services',
        },
        '@hey-api/types': {
          _handler: () => {},
          _handlerLegacy: () => {},
          enums: 'javascript',
          name: '@hey-api/types',
        },
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

    generateIndexFile({ files });

    files.index.write();

    expect(writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining(path.resolve('index.ts')),
      expect.anything(),
    );
  });
});
