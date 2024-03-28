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
            description: 'Should generate',
            name: 'v2',
            config: {
                client: 'fetch',
                enums: true,
                exportCore: true,
                exportModels: true,
                exportSchemas: true,
                exportServices: true,
                useOptions: true,
            } as UserConfig,
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
            description: 'Should generate',
            name: 'v3',
            config: {
                client: 'fetch',
                enums: true,
                exportCore: true,
                exportModels: true,
                exportSchemas: true,
                exportServices: true,
                useOptions: true,
            } as UserConfig,
        },
        {
            description: 'Should generate Date types',
            name: 'v3_date',
            config: {
                client: 'fetch',
                enums: true,
                exportCore: false,
                exportModels: '^ModelWithPattern',
                exportSchemas: true,
                exportServices: false,
                useOptions: true,
                useDateType: true,
            } as UserConfig,
        },
        {
            description: 'Should generate optional arguments',
            name: 'v3_options',
            config: {
                client: 'fetch',
                enums: true,
                exportCore: true,
                exportModels: '^ModelWithString',
                exportSchemas: false,
                exportServices: '^Defaults',
                useOptions: true,
                useDateType: true,
            } as UserConfig,
        },
        {
            description: 'Should generate a client',
            name: 'v3_client',
            config: {
                client: 'fetch',
                enums: true,
                exportCore: true,
                exportModels: true,
                exportSchemas: false,
                exportServices: true,
                useOptions: true,
                useDateType: true,
                name: 'ApiClient',
            } as UserConfig,
        },
        {
            description: 'Should generate legacy enums',
            name: 'v3_legacy_enums',
            config: {
                client: 'fetch',
                enums: false,
                exportCore: true,
                exportModels: true,
                exportSchemas: true,
                exportServices: true,
                useOptions: true,
                useLegacyEnums: true,
            } as UserConfig,
        },
        {
            description: 'Should generate an angular client',
            name: 'v3_angular',
            config: {
                client: 'angular',
                enums: false,
                exportCore: true,
                exportModels: true,
                exportSchemas: true,
                exportServices: true,
                useOptions: true,
            } as UserConfig,
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
