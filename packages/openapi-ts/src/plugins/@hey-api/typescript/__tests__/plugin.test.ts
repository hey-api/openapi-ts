import fs from 'node:fs';

import { describe, expect, it, vi } from 'vitest';

import { openApi } from '../../../../generate/__tests__/mocks';
import { TypeScriptFile } from '../../../../generate/files';
import type { Config } from '../../../../types/config';
import { setConfig } from '../../../../utils/config';
import { handlerLegacy } from '../plugin-legacy';

vi.mock('node:fs');

describe('generateLegacyTypes', () => {
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
      name: 'AppClient',
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

    const client: Parameters<typeof handlerLegacy>[0]['client'] = {
      config: {} as Config,
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
        name: 'types.ts',
      }),
    };

    await handlerLegacy({
      client,
      files,
      openApi,
      plugin: {
        exportFromIndex: false,
        name: '@hey-api/typescript',
        output: '',
      },
    });

    files.types.write();

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('types.gen.ts'),
      expect.anything(),
    );
  });
});
