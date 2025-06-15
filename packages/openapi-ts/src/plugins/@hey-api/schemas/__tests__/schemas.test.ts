import fs from 'node:fs';

import { describe, expect, it, vi } from 'vitest';

import { client, openApi } from '../../../../generate/__tests__/mocks';
import type { OpenApiV3Schema } from '../../../../openApi';
import type { Files } from '../../../../types/utils';
import { setConfig } from '../../../../utils/config';
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
          _handler: () => {},
          _handlerLegacy: () => {},
          config: {},
          name: '@hey-api/schemas',
        },
        '@hey-api/sdk': {
          _handler: () => {},
          _handlerLegacy: () => {},
          config: {},
          name: '@hey-api/sdk',
        },
        '@hey-api/typescript': {
          _handler: () => {},
          _handlerLegacy: () => {},
          config: {
            enums: 'javascript',
          },
          name: '@hey-api/typescript',
        },
        'legacy/fetch': {
          _handler: () => {},
          _handlerLegacy: () => {},
          _tags: ['client'],
          config: {},
          name: 'legacy/fetch',
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
      plugin: {
        config: {
          exportFromIndex: false,
        },
        name: '@hey-api/schemas',
        output: 'schemas',
      },
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
          _handler: () => {},
          _handlerLegacy: () => {},
          config: {
            nameBuilder: nameFn,
          },
          name: '@hey-api/schemas',
        },
        '@hey-api/sdk': {
          _handler: () => {},
          _handlerLegacy: () => {},
          config: {},
          name: '@hey-api/sdk',
        },
        '@hey-api/typescript': {
          _handler: () => {},
          _handlerLegacy: () => {},
          config: {
            enums: 'javascript',
          },
          name: '@hey-api/typescript',
        },
        'legacy/fetch': {
          _handler: () => {},
          _handlerLegacy: () => {},
          _tags: ['client'],
          config: {},
          name: 'legacy/fetch',
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
      plugin: {
        config: {
          exportFromIndex: false,
        },
        name: '@hey-api/schemas',
        output: 'schemas',
      },
    });

    files.schemas!.write();

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('schemas.gen.ts'),
      expect.anything(),
    );

    expect(nameFn).toHaveBeenCalledWith('foo', schema);
  });
});
