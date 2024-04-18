import { readFileSync } from 'node:fs'

import { sync } from 'glob'
import { describe, expect, it } from 'vitest'

import { createClient } from '../'
import type { UserConfig } from '../src/types/config'

const V2_SPEC_PATH = './test/spec/v2.json'
const V3_SPEC_PATH = './test/spec/v3.json'

const OUTPUT_PREFIX = './test/generated/'

const toOutputPath = (name: string) => `${OUTPUT_PREFIX}${name}/`
const toSnapshotPath = (file: string) =>
  `./__snapshots__/${file.replace(OUTPUT_PREFIX, '')}.snap`

describe('OpenAPI v2', () => {
  it.each([
    {
      config: {
        client: 'fetch',
        enums: 'javascript',
        exportCore: true,
        exportServices: true,
        input: '',
        output: '',
        schemas: true,
        types: true,
        useOptions: true
      } as UserConfig,
      description: 'generate fetch client',
      name: 'v2'
    }
  ])('$description', async ({ name, config }) => {
    const output = toOutputPath(name)
    await createClient({
      ...config,
      input: V2_SPEC_PATH,
      output
    })
    sync(`${output}**/*.ts`).forEach(file => {
      const content = readFileSync(file, 'utf8').toString()
      expect(content).toMatchFileSnapshot(toSnapshotPath(file))
    })
  })
})

    it.each([
        {
            config: {
                ...config,
            },
            description: 'generate fetch client',
            name: 'v3',
        },
        {
            config: {
                ...config,
                client: 'angular',
                enums: false,
                schemas: false,
            } as UserConfig,
            description: 'generate angular client',
            name: 'v3_angular',
        },
        {
            config: {
                ...config,
                client: 'node',
                enums: false,
                exportServices: false,
                schemas: false,
                types: false,
            } as UserConfig,
            description: 'generate node client',
            name: 'v3_node',
        },
        {
            config: {
                ...config,
                client: 'axios',
                enums: false,
                exportServices: false,
                schemas: false,
                types: false,
            } as UserConfig,
            description: 'generate axios client',
            name: 'v3_axios',
        },
        {
            config: {
                ...config,
                client: 'xhr',
                enums: false,
                exportServices: false,
                schemas: false,
                types: false,
            } as UserConfig,
            description: 'generate xhr client',
            name: 'v3_xhr',
        },
        {
            config: {
                ...config,
                exportCore: false,
                exportServices: false,
                schemas: false,
                types: '^ModelWithPattern',
                useDateType: true,
            } as UserConfig,
            description: 'generate Date types',
            name: 'v3_date',
        },
        {
            config: {
                ...config,
                exportServices: '^Defaults',
                schemas: false,
                types: '^ModelWithString',
                useDateType: true,
                useOptions: false,
            } as UserConfig,
            description: 'generate legacy positional arguments',
            name: 'v3_legacy_positional_args',
        },
        {
            config: {
                ...config,
                exportServices: '^Defaults',
                schemas: false,
                types: '^ModelWithString',
                useDateType: true,
            } as UserConfig,
            description: 'generate optional arguments',
            name: 'v3_options',
        },
        {
            config: {
                ...config,
                name: 'ApiClient',
                schemas: false,
                useDateType: true,
            } as UserConfig,
            description: 'generate client',
            name: 'v3_client',
        },
        {
            config: {
                ...config,
                enums: 'typescript',
                schemas: false,
            } as UserConfig,
            description: 'generate TypeScript enums',
            name: 'v3_enums_typescript',
        },
        {
            config: {
                ...config,
                enums: false,
                exportCore: false,
                exportServices: false,
                schemas: false,
            } as UserConfig,
            description: 'generate models',
            name: 'v3_models',
        },
        {
            config: {
                ...config,
                enums: false,
                exportCore: false,
                exportServices: false,
                schemas: false,
                types: {
                    include: '^(camelCaseCommentWithBreaks|ArrayWithProperties)',
                    name: 'PascalCase',
                },
            } as UserConfig,
            description: 'generate pascalcase types',
            name: 'v3_pascalcase',
        },
        {
            config: {
                ...config,
                enums: false,
                exportCore: false,
                exportServices: false,
                schemas: true,
                types: false,
            } as UserConfig,
            description: 'generate JSON Schemas',
            name: 'v3_schemas_json',
        },
    ])('$description', async ({ name, config }) => {
        const output = toOutputPath(name);
        await createClient({
            ...config,
            input: V3_SPEC_PATH,
            output,
        });
        sync(`${output}**/*.ts`).forEach(file => {
            const content = readFileSync(file, 'utf8').toString();
            expect(content).toMatchFileSnapshot(toSnapshotPath(file));
        });
    });
});
