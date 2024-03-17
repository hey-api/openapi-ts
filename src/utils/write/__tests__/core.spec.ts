import { resolve } from 'path';

import { HttpClient } from '../../../HttpClient';
import { writeFile } from '../../fileSystem';
import { writeClientCore } from '../core';

jest.mock('../../fileSystem');

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
            httpClient: HttpClient.FETCH,
            input: '',
            output: '',
            serviceResponse: 'body',
        };

        await writeClientCore(client, templates, '/', config);

        expect(writeFile).toHaveBeenCalledWith(resolve('/', '/OpenAPI.ts'), 'settings');
        expect(writeFile).toHaveBeenCalledWith(resolve('/', '/ApiError.ts'), 'apiError');
        expect(writeFile).toHaveBeenCalledWith(resolve('/', '/ApiRequestOptions.ts'), 'apiRequestOptions');
        expect(writeFile).toHaveBeenCalledWith(resolve('/', '/ApiResult.ts'), 'apiResult');
        expect(writeFile).toHaveBeenCalledWith(resolve('/', '/CancelablePromise.ts'), 'cancelablePromise');
        expect(writeFile).toHaveBeenCalledWith(resolve('/', '/request.ts'), 'request');
        expect(writeFile).toHaveBeenCalledWith(resolve('/', '/types.ts'), 'types');
    });

    it('uses client server value for base', async () => {
        const client: Parameters<typeof writeClientCore>[0] = {
            models: [],
            server: 'http://localhost:8080',
            services: [],
            version: '1.0',
        };

        const config: Parameters<typeof writeClientCore>[3] = {
            httpClient: HttpClient.FETCH,
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
            httpClient: HttpClient.FETCH,
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
