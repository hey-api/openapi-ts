import { readFileSync } from 'node:fs';

import { sync } from 'glob';
import { describe, expect, it } from 'vitest';

import { createClient } from '../';

describe('v2', () => {
    it('should generate', async () => {
        await createClient({
            client: 'fetch',
            enums: true,
            exportCore: true,
            exportModels: true,
            exportSchemas: true,
            exportServices: true,
            input: './test/spec/v2.json',
            output: './test/generated/v2/',
            useOptions: true,
        });

        sync('./test/generated/v2/**/*.ts').forEach(file => {
            const content = readFileSync(file, 'utf8').toString();
            expect(content).toMatchSnapshot(file);
        });
    });
});

describe('v3', () => {
    it('should generate', async () => {
        await createClient({
            client: 'fetch',
            enums: true,
            exportCore: true,
            exportModels: true,
            exportSchemas: true,
            exportServices: true,
            input: './test/spec/v3.json',
            output: './test/generated/v3/',
            useOptions: true,
        });

        sync('./test/generated/v3/**/*.ts').forEach(file => {
            const content = readFileSync(file, 'utf8').toString();
            expect(content).toMatchSnapshot(file);
        });
    });

    it('should generate Date types', async () => {
        await createClient({
            client: 'fetch',
            enums: true,
            exportCore: false,
            exportModels: '^ModelWithPattern',
            exportSchemas: true,
            exportServices: false,
            input: './test/spec/v3.json',
            output: './test/generated/v3_date/',
            useDateType: true,
            useOptions: true,
        });

        sync('./test/generated/v3_date/**/*.ts').forEach(file => {
            const content = readFileSync(file, 'utf8').toString();
            expect(content).toMatchSnapshot(file);
        });
    });

    it('should generate optional argument', async () => {
        await createClient({
            client: 'fetch',
            enums: true,
            exportCore: true,
            exportModels: '^ModelWithString',
            exportSchemas: false,
            exportServices: '^Defaults',
            input: './test/spec/v3.json',
            output: './test/generated/v3_options/',
            useDateType: true,
            useOptions: true,
        });

        sync('./test/generated/v3_options/**/*.ts').forEach(file => {
            const content = readFileSync(file, 'utf8').toString();
            expect(content).toMatchSnapshot(file);
        });
    });
});
