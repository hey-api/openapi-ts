import { writeFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it, vi } from 'vitest';

import { writeClientServices } from '../services';

vi.mock('node:fs');

describe('writeClientServices', () => {
    it('should write to filesystem', async () => {
        const client: Parameters<typeof writeClientServices>[0] = {
            server: 'http://localhost:8080',
            version: 'v1',
            models: [],
            services: [
                {
                    $refs: [],
                    imports: [],
                    name: 'User',
                    operations: [],
                },
            ],
        };

        const templates: Parameters<typeof writeClientServices>[1] = {
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

        await writeClientServices(client, templates, '/', {
            client: 'fetch',
            enums: false,
            exportCore: true,
            exportModels: true,
            exportSchemas: true,
            exportServices: true,
            format: false,
            input: '',
            lint: false,
            operationId: true,
            output: '',
            postfixModels: '',
            postfixServices: 'Service',
            serviceResponse: 'body',
            useDateType: false,
            useOptions: false,
            write: true,
        });

        expect(writeFileSync).toHaveBeenCalledWith(path.resolve('/', '/UserService.ts'), 'service');
    });
});
