import fs from 'node:fs';

import { Project } from '@hey-api/codegen-core';
import type ts from 'typescript';
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
      input: [
        {
          path: '',
          watch: {
            enabled: false,
            interval: 1_000,
            timeout: 60_000,
          },
        },
      ],
      interactive: false,
      logs: {
        file: true,
        level: 'info',
        path: process.cwd(),
      },
      name: 'AppClient',
      output: {
        clean: false,
        fileName: {
          case: 'preserve',
          name: '{{name}}',
          suffix: '.gen',
        },
        format: null,
        importFileExtension: undefined,
        indexFile: true,
        lint: null,
        path: '',
        tsConfig: null,
        tsConfigPath: null,
      },
      parser: {
        hooks: {},
        pagination: {
          keywords: [],
        },
        transforms: {
          enums: {
            case: 'preserve',
            enabled: false,
            mode: 'root',
            name: '',
          },
          propertiesRequiredByDefault: false,
          readWrite: {
            enabled: false,
            requests: {
              case: 'preserve',
              name: '',
            },
            responses: {
              case: 'preserve',
              name: '',
            },
          },
        },
        validate_EXPERIMENTAL: false,
      },
      pluginOrder: [
        '@hey-api/typescript',
        '@hey-api/schemas',
        'legacy/fetch',
        '@hey-api/sdk',
      ],
      plugins: {
        '@hey-api/schemas': {
          api: {
            getSelector: () => [],
          },
          config: {
            name: '@hey-api/schemas',
          },
          handler: () => {},
          name: '@hey-api/schemas',
          output: '',
        },
        '@hey-api/sdk': {
          api: {
            createOperationComment: () => undefined,
            getSelector: () => [],
          },
          config: {
            name: '@hey-api/sdk',
          },
          handler: () => {},
          name: '@hey-api/sdk',
          output: '',
        },
        '@hey-api/typescript': {
          api: {
            getSelector: () => [],
            schemaToType: () => ({}) as ts.TypeNode,
          },
          config: {
            enums: 'javascript',
            name: '@hey-api/typescript',
          },
          handler: () => {},
          name: '@hey-api/typescript',
          output: '',
        },
        'legacy/fetch': {
          config: {
            name: 'legacy/fetch',
          },
          handler: () => {},
          name: 'legacy/fetch',
          output: '',
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
        gen: new Project({
          renderers: {},
          root: '.tmp',
        }),
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
      input: [
        {
          path: '',
          watch: {
            enabled: false,
            interval: 1_000,
            timeout: 60_000,
          },
        },
      ],
      interactive: false,
      logs: {
        file: true,
        level: 'info',
        path: process.cwd(),
      },
      name: 'AppClient',
      output: {
        clean: false,
        fileName: {
          case: 'preserve',
          name: '{{name}}',
          suffix: '.gen',
        },
        format: null,
        importFileExtension: undefined,
        indexFile: true,
        lint: null,
        path: '',
        tsConfig: null,
        tsConfigPath: null,
      },
      parser: {
        hooks: {},
        pagination: {
          keywords: [],
        },
        transforms: {
          enums: {
            case: 'preserve',
            enabled: false,
            mode: 'root',
            name: '',
          },
          propertiesRequiredByDefault: false,
          readWrite: {
            enabled: false,
            requests: {
              case: 'preserve',
              name: '',
            },
            responses: {
              case: 'preserve',
              name: '',
            },
          },
        },
        validate_EXPERIMENTAL: false,
      },
      pluginOrder: [
        '@hey-api/typescript',
        '@hey-api/schemas',
        'legacy/fetch',
        '@hey-api/sdk',
      ],
      plugins: {
        '@hey-api/schemas': {
          api: {
            getSelector: () => [],
          },
          config: {
            name: '@hey-api/schemas',
            nameBuilder: nameFn,
          },
          handler: () => {},
          name: '@hey-api/schemas',
          output: '',
        },
        '@hey-api/sdk': {
          api: {
            createOperationComment: () => undefined,
            getSelector: () => [],
          },
          config: {
            name: '@hey-api/sdk',
          },
          handler: () => {},
          name: '@hey-api/sdk',
          output: '',
        },
        '@hey-api/typescript': {
          api: {
            getSelector: () => [],
            schemaToType: () => ({}) as ts.TypeNode,
          },
          config: {
            enums: 'javascript',
            name: '@hey-api/typescript',
          },
          handler: () => {},
          name: '@hey-api/typescript',
          output: '',
        },
        'legacy/fetch': {
          config: {
            name: 'legacy/fetch',
          },
          handler: () => {},
          name: 'legacy/fetch',
          output: '',
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
        gen: new Project({
          renderers: {},
          root: '.tmp',
        }),
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
