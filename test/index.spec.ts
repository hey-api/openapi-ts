import { readFileSync } from 'fs';
import { sync } from 'glob';

import { generate, HttpClient } from '../';

describe('v2', () => {
    it('should generate', async () => {
        await generate({
            autoformat: false,
            exportCore: true,
            exportModels: true,
            exportSchemas: true,
            exportServices: true,
            httpClient: HttpClient.FETCH,
            input: './test/spec/v2.json',
            output: './test/generated/v2/',
            useOptions: false,
        });

        sync('./test/generated/v2/**/*.ts').forEach(file => {
            const content = readFileSync(file, 'utf8').toString();
            expect(content).toMatchSnapshot(file);
        });
    });
});

describe('v3', () => {
    it('should generate', async () => {
        await generate({
            autoformat: false,
            exportCore: true,
            exportModels: true,
            exportSchemas: true,
            exportServices: true,
            httpClient: HttpClient.FETCH,
            input: './test/spec/v3.json',
            output: './test/generated/v3/',
            useOptions: false,
        });

        sync('./test/generated/v3/**/*.ts').forEach(file => {
            const content = readFileSync(file, 'utf8').toString();
            expect(content).toMatchSnapshot(file);
        });
    });

    it('should generate Date types', async () => {
        await generate({
            autoformat: false,
            exportCore: false,
            exportModels: '^ModelWithPattern',
            exportSchemas: true,
            exportServices: false,
            httpClient: HttpClient.FETCH,
            input: './test/spec/v3.json',
            output: './test/generated/v3_date/',
            useDateType: true,
            useOptions: false,
        });

        sync('./test/generated/v3_date/**/*.ts').forEach(file => {
            const content = readFileSync(file, 'utf8').toString();
            expect(content).toMatchSnapshot(file);
        });
    });

    it('should generate optional argument', async () => {
        await generate({
            autoformat: false,
            exportCore: true,
            exportModels: '^ModelWithString',
            exportSchemas: false,
            exportServices: '^Defaults',
            httpClient: HttpClient.FETCH,
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
