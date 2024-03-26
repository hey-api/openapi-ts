import { mkdirSync, rmSync, writeFileSync } from 'node:fs';

import { describe, expect, it, vi } from 'vitest';

import { writeClient } from '../client';

vi.mock('node:fs');

describe('writeClient', () => {
    it('should write to filesystem', async () => {
        const client: Parameters<typeof writeClient>[0] = {
            server: 'http://localhost:8080',
            version: 'v1',
            models: [],
            services: [],
        };

        const templates: Parameters<typeof writeClient>[1] = {
            client: () => 'client',
            core: {
                apiError: () => 'apiError',
                apiRequestOptions: () => 'apiRequestOptions',
                apiResult: () => 'apiResult',
                baseHttpRequest: () => 'baseHttpRequest',
                cancelablePromise: () => 'cancelablePromise',
                httpRequest: () => 'httpRequest',
                request: () => 'request',
                settings: () => 'settings',
                types: () => 'types',
            },
            exports: {
                model: () => 'model',
                schema: () => 'schema',
                service: () => 'service',
            },
            index: () => 'index',
        };

        await writeClient(client, templates, {
            client: 'fetch',
            enums: true,
            exportCore: true,
            exportModels: true,
            exportSchemas: true,
            exportServices: true,
            format: true,
            input: '',
            lint: false,
            operationId: true,
            output: './dist',
            postfixModels: 'AppClient',
            postfixServices: 'Service',
            serviceResponse: 'body',
            useDateType: false,
            useLegacyEnums: false,
            useOptions: false,
            write: true,
        });

        expect(rmSync).toHaveBeenCalled();
        expect(mkdirSync).toHaveBeenCalled();
        expect(writeFileSync).toHaveBeenCalled();
    });
});
