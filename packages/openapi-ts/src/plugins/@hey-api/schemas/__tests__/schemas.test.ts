import fs from 'node:fs';

import { describe, expect, it, vi } from 'vitest';

import { client, openApi } from '../../../../generate/__tests__/mocks';
import type { OpenApiV3Schema } from '../../../../openApi';
import type { Files } from '../../../../types/utils';
import { setConfig } from '../../../../utils/config';
import { PluginInstance } from '../../../shared/utils/instance';
import { handlerLegacy } from '../plugin-legacy';

vi.mock('node:fs');

describe('generateLegacySchemas', () => {
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
        name: '@hey-api/schemas',
        output: 'schemas',
      }),
    });

    files.schemas!.write();

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('schemas.gen.ts'),
      expect.anything(),
    );
  });

  it('uses custom schema name', async () => {
    const nameFn = vi.fn().mockReturnValue('customName');

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
          config: {
            nameBuilder: nameFn,
          },
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
        name: '@hey-api/schemas',
        output: 'schemas',
      }),
    });

    files.schemas!.write();

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('schemas.gen.ts'),
      expect.anything(),
    );

    expect(nameFn).toHaveBeenCalledWith('foo', schema);
  });
});
