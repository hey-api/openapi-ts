import fs from 'node:fs';

import { describe, expect, it, vi } from 'vitest';

import { openApi } from '../../../../generate/__tests__/mocks';
import { TypeScriptFile } from '../../../../generate/files';
import type { Config } from '../../../../types/config';
import { setConfig } from '../../../../utils/config';
import { PluginInstance } from '../../../shared/utils/instance';
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
        validate_EXPERIMENTAL: false,
        watch: {
          enabled: false,
          interval: 1_000,
          timeout: 60_000,
        },
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
          config: {},
          handler: () => {},
          handlerLegacy: () => {},
          name: '@hey-api/schemas',
        },
        '@hey-api/sdk': {
          config: {},
          handler: () => {},
          handlerLegacy: () => {},
          name: '@hey-api/sdk',
        },
        '@hey-api/typescript': {
          config: {
            enums: 'javascript',
          },
          handler: () => {},
          handlerLegacy: () => {},
          name: '@hey-api/typescript',
        },
        'legacy/fetch': {
          config: {},
          handler: () => {},
          handlerLegacy: () => {},
          name: 'legacy/fetch',
          tags: ['client'],
        },
      },
      useOptions: true,
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
        id: 'types',
        name: 'types.ts',
      }),
    };

    await handlerLegacy({
      client,
      files,
      openApi,
      plugin: new PluginInstance({
        config: {
          exportFromIndex: false,
        },
        context: {} as any,
        dependencies: [],
        handler: () => {},
        name: '@hey-api/typescript',
        output: '',
      }),
    });

    files.types.write();

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('types.gen.ts'),
      expect.anything(),
    );
  });
});
