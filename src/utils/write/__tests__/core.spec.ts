import { writeFileSync } from 'node:fs';
import path from 'node:path';

import { writeClientCore } from '../core';

jest.mock('node:fs');

describe('writeClientCore', () => {
    let templates: Parameters<typeof writeClientCore>[1];
    beforeEach(() => {
        const _templates: Parameters<typeof writeClientCore>[1] = {
            client: () => 'client',
            core: {
                apiError: () => 'apiError',
                apiRequestOptions: () => 'apiRequestOptions',
                apiResult: () => 'apiResult',
                baseHttpRequest: () => 'baseHttpRequest',
                cancelablePromise: () => 'cancelablePromise',
                httpRequest: () => 'httpRequest',
                request: () => 'request',
                settings: jest.fn().mockReturnValue('settings'),
                types: () => 'types',
            },
            exports: {
                model: () => 'model',
                schema: () => 'schema',
                service: () => 'service',
            },
            index: () => 'index',
        };
        templates = _templates;
    });

    it('should write to filesystem', async () => {
        const client: Parameters<typeof writeClientCore>[0] = {
            models: [],
            server: 'http://localhost:8080',
            services: [],
            version: '1.0',
        };

        const config: Parameters<typeof writeClientCore>[3] = {
            client: 'fetch',
            input: '',
            output: '',
            serviceResponse: 'body',
        };

        await writeClientCore(client, templates, '/', config);

        expect(writeFileSync).toHaveBeenCalledWith(path.resolve('/', '/OpenAPI.ts'), 'settings');
        expect(writeFileSync).toHaveBeenCalledWith(path.resolve('/', '/ApiError.ts'), 'apiError');
        expect(writeFileSync).toHaveBeenCalledWith(path.resolve('/', '/ApiRequestOptions.ts'), 'apiRequestOptions');
        expect(writeFileSync).toHaveBeenCalledWith(path.resolve('/', '/ApiResult.ts'), 'apiResult');
        expect(writeFileSync).toHaveBeenCalledWith(path.resolve('/', '/CancelablePromise.ts'), 'cancelablePromise');
        expect(writeFileSync).toHaveBeenCalledWith(path.resolve('/', '/request.ts'), 'request');
        expect(writeFileSync).toHaveBeenCalledWith(path.resolve('/', '/types.ts'), 'types');
    });

    it('uses client server value for base', async () => {
        const client: Parameters<typeof writeClientCore>[0] = {
            models: [],
            server: 'http://localhost:8080',
            services: [],
            version: '1.0',
        };

        const config: Parameters<typeof writeClientCore>[3] = {
            client: 'fetch',
            input: '',
            output: '',
            serviceResponse: 'body',
        };

        await writeClientCore(client, templates, '/', config);

        expect(templates.core.settings).toHaveBeenCalledWith({
            $config: config,
            httpRequest: 'FetchHttpRequest',
            server: 'http://localhost:8080',
            version: '1.0',
        });
    });

    it('uses custom value for base', async () => {
        const client: Parameters<typeof writeClientCore>[0] = {
            models: [],
            server: 'http://localhost:8080',
            services: [],
            version: '1.0',
        };

        const config: Parameters<typeof writeClientCore>[3] = {
            base: 'foo',
            client: 'fetch',
            input: '',
            output: '',
            serviceResponse: 'body',
        };

        await writeClientCore(client, templates, '/', config);

        expect(templates.core.settings).toHaveBeenCalledWith({
            $config: config,
            httpRequest: 'FetchHttpRequest',
            server: 'foo',
            version: '1.0',
        });
    });
});
