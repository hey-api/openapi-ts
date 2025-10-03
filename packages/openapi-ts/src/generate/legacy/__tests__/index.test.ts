import fs from 'node:fs';
import path from 'node:path';

import type ts from 'typescript';
import { describe, expect, it, vi } from 'vitest';

import { setConfig } from '../../../utils/config';
import { GeneratedFile } from '../../file';
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
        watch: {
          enabled: false,
          interval: 1_000,
          timeout: 60_000,
        },
      },
      interactive: false,
      logs: {
        file: true,
        level: 'info',
        path: process.cwd(),
      },
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

    const files: Parameters<typeof generateIndexFile>[0]['files'] = {
      schemas: new GeneratedFile({
        dir: '/',
        id: 'schemas',
        name: 'schemas.ts',
      }),
      sdk: new GeneratedFile({
        dir: '/',
        id: 'sdk',
        name: 'sdk.ts',
      }),
      types: new GeneratedFile({
        dir: '/',
        id: 'types',
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
