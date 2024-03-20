import { writeFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it, vi } from 'vitest';

import { writeClientIndex } from '../index';

vi.mock('node:fs');

describe('writeClientIndex', () => {
    it('should write to filesystem', async () => {
        const client: Parameters<typeof writeClientIndex>[0] = {
            server: 'http://localhost:8080',
            version: '1.0',
            models: [],
            services: [],
        };

        const templates: Parameters<typeof writeClientIndex>[1] = {
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

        await writeClientIndex(client, templates, '/', {
            enums: true,
            exportCore: true,
            exportServices: true,
            exportModels: true,
            exportSchemas: true,
            postfixServices: 'Service',
            postfixModels: '',
        });

        expect(writeFileSync).toHaveBeenCalledWith(path.resolve('/', '/index.ts'), 'index');
    });
});
