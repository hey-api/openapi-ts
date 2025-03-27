import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it, vi } from 'vitest';

import { setConfig } from '../../utils/config';
import { TypeScriptFile } from '../files';
import { generateIndexFile } from '../indexFile';

vi.mock('node:fs');

describe('generateIndexFile', () => {
  it('writes to filesystem', async () => {
    setConfig({
      configFile: '',
      dryRun: false,
      experimentalParser: false,
      exportCore: true,
      input: {
        path: '',
      },
      logs: {
        file: true,
        level: 'info',
        path: process.cwd(),
      },
      output: {
        path: '',
      },
      pluginOrder: [
        '@hey-api/typescript',
        '@hey-api/schemas',
        'legacy/fetch',
        '@hey-api/sdk',
      ],
      plugins: {
        '@hey-api/schemas': {
          _handler: () => {},
          _handlerLegacy: () => {},
          name: '@hey-api/schemas',
        },
        '@hey-api/sdk': {
          _handler: () => {},
          _handlerLegacy: () => {},
          name: '@hey-api/sdk',
        },
        '@hey-api/typescript': {
          _handler: () => {},
          _handlerLegacy: () => {},
          enums: 'javascript',
          name: '@hey-api/typescript',
        },
        'legacy/fetch': {
          _handler: () => {},
          _handlerLegacy: () => {},
          _tags: ['client'],
          name: 'legacy/fetch',
        },
      },
      useOptions: true,
      watch: {
        enabled: false,
        interval: 1_000,
        timeout: 60_000,
      },
    });

    const files: Parameters<typeof generateIndexFile>[0]['files'] = {
      schemas: new TypeScriptFile({
        dir: '/',
        name: 'schemas.ts',
      }),
      sdk: new TypeScriptFile({
        dir: '/',
        name: 'sdk.ts',
      }),
      types: new TypeScriptFile({
        dir: '/',
        name: 'types.ts',
      }),
    };

    generateIndexFile({ files });

    files.index!.write();

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining(path.resolve('index.ts')),
      expect.anything(),
    );
  });
});
