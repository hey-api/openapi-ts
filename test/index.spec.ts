import { readFileSync } from 'fs';
import { sync } from 'glob';

import { generate, HttpClient } from '../';

describe('v2', () => {
    it('should generate', async () => {
        await generate({
            input: './test/spec/v2.json',
            output: './test/generated/v2/',
            httpClient: HttpClient.FETCH,
            useOptions: false,
            useUnionTypes: false,
            autoformat: false,
            exportCore: true,
            exportSchemas: true,
            exportModels: true,
            exportServices: true,
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
            input: './test/spec/v3.json',
            output: './test/generated/v3/',
            httpClient: HttpClient.FETCH,
            useOptions: false,
            useUnionTypes: false,
            autoformat: false,
            exportCore: true,
            exportSchemas: true,
            exportModels: true,
            exportServices: true,
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
            useUnionTypes: false,
        });

        sync('./test/generated/v3_date/**/*.ts').forEach(file => {
            const content = readFileSync(file, 'utf8').toString();
            expect(content).toMatchSnapshot(file);
        });
    });
});
