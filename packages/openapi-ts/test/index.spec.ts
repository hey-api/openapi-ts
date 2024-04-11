import { readFileSync } from 'node:fs';

import { sync } from 'glob';
import { describe, expect, it } from 'vitest';

import { createClient, UserConfig } from '../';

const V2_SPEC_PATH = './test/spec/v2.json';
const V3_SPEC_PATH = './test/spec/v3.json';

const OUTPUT_PREFIX = './test/generated/';

const toOutputPath = (name: string) => `${OUTPUT_PREFIX}${name}/`;
const toSnapshotPath = (file: string) => `./__snapshots__/${file.replace(OUTPUT_PREFIX, '')}.snap`;

describe('OpenAPI v2', () => {
    it.each([
        {
            config: {
                client: 'fetch',
                enums: 'javascript',
                exportCore: true,
                exportModels: true,
                exportServices: true,
                input: '',
                output: '',
                schemas: true,
                useOptions: true,
            } as UserConfig,
            description: 'generate fetch client',
            name: 'v2',
        },
    ])('$description', async ({ name, config }) => {
        const output = toOutputPath(name);
        await createClient({
            ...config,
            input: V2_SPEC_PATH,
            output,
        });
        sync(`${output}**/*.ts`).forEach(file => {
            const content = readFileSync(file, 'utf8').toString();
            expect(content).toMatchFileSnapshot(toSnapshotPath(file));
        });
    });
});

describe('OpenAPI v3', () => {
    it.each([
        {
            config: {
                client: 'fetch',
                enums: 'javascript',
                exportCore: true,
                exportModels: true,
                exportServices: true,
                input: '',
                output: '',
                schemas: true,
                useOptions: true,
            } as UserConfig,
            description: 'generate fetch client',
            name: 'v3',
        },
        {
            config: {
                client: 'angular',
                enums: false,
                exportCore: true,
                exportModels: true,
                exportServices: true,
                input: '',
                output: '',
                schemas: true,
                useOptions: true,
            } as UserConfig,
            description: 'generate angular client',
            name: 'v3_angular',
        },
        {
            config: {
                client: 'node',
                enums: false,
                exportCore: true,
                exportModels: false,
                exportServices: false,
                input: '',
                output: '',
                schemas: false,
                useOptions: true,
            } as UserConfig,
            description: 'generate node client',
            name: 'v3_node',
        },
        {
            config: {
                client: 'axios',
                enums: false,
                exportCore: true,
                exportModels: false,
                exportServices: false,
                input: '',
                output: '',
                schemas: false,
                useOptions: true,
            } as UserConfig,
            description: 'generate axios client',
            name: 'v3_axios',
        },
        {
            config: {
                client: 'xhr',
                enums: false,
                exportCore: true,
                exportModels: false,
                exportServices: false,
                input: '',
                output: '',
                schemas: false,
                useOptions: true,
            } as UserConfig,
            description: 'generate xhr client',
            name: 'v3_xhr',
        },
        {
            config: {
                client: 'fetch',
                enums: 'javascript',
                exportCore: false,
                exportModels: '^ModelWithPattern',
                exportServices: false,
                input: '',
                output: '',
                schemas: true,
                useDateType: true,
                useOptions: true,
            } as UserConfig,
            description: 'generate Date types',
            name: 'v3_date',
        },
        {
            config: {
                client: 'fetch',
                enums: 'javascript',
                exportCore: true,
                exportModels: '^ModelWithString',
                exportServices: '^Defaults',
                input: '',
                output: '',
                schemas: false,
                useDateType: true,
                useOptions: false,
            } as UserConfig,
            description: 'generate legacy positional arguments',
            name: 'v3_legacy_positional_args',
        },
        {
            config: {
                client: 'fetch',
                enums: 'javascript',
                exportCore: true,
                exportModels: '^ModelWithString',
                exportServices: '^Defaults',
                input: '',
                output: '',
                schemas: false,
                useDateType: true,
                useOptions: true,
            } as UserConfig,
            description: 'generate optional arguments',
            name: 'v3_options',
        },
        {
            config: {
                client: 'fetch',
                enums: 'javascript',
                exportCore: true,
                exportModels: true,
                exportServices: true,
                input: '',
                name: 'ApiClient',
                output: '',
                schemas: false,
                useDateType: true,
                useOptions: true,
            } as UserConfig,
            description: 'generate client',
            name: 'v3_client',
        },
        {
            config: {
                client: 'fetch',
                enums: 'typescript',
                exportCore: true,
                exportModels: true,
                exportServices: true,
                input: '',
                output: '',
                schemas: true,
                useOptions: true,
            } as UserConfig,
            description: 'generate TypeScript enums',
            name: 'v3_enums_typescript',
        },
        {
            config: {
                client: 'fetch',
                exportCore: false,
                exportModels: true,
                exportServices: false,
                input: '',
                output: '',
                schemas: false,
            } as UserConfig,
            description: 'generate models',
            name: 'v3_models',
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
