import fs from 'node:fs';

import { Project } from '@hey-api/codegen-core';
import type ts from 'typescript';
import { describe, expect, it, vi } from 'vitest';

import { openApi } from '~/generate/__tests__/mocks';
import { GeneratedFile } from '~/generate/file';
import { PluginInstance } from '~/plugins/shared/utils/instance';
import type { Config } from '~/types/config';
import { setConfig } from '~/utils/config';

import { handlerLegacy } from '../plugin-legacy';

vi.mock('node:fs');

describe('generateLegacyTypes', () => {
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
            selector: () => [],
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
            selector: () => [],
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
            schemaToType: () => ({}) as ts.TypeNode,
            selector: () => [],
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
      types: new GeneratedFile({
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
        context: {
          config: {
            // @ts-expect-error
            parser: {
              hooks: {},
            },
          },
        },
        dependencies: [],
        gen: new Project({
          renderers: {},
          root: '.tmp',
        }),
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
