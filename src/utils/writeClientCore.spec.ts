import { EOL } from 'os';
import { resolve } from 'path';

import type { Client } from '../client/interfaces/Client';
import { HttpClient } from '../HttpClient';
import { Indent } from '../Indent';
import { writeFile } from './fileSystem';
import type { Templates } from './registerHandlebarTemplates';
import { writeClientCore } from './writeClientCore';

jest.mock('./fileSystem');

describe('writeClientCore', () => {
    let templates: Templates;
    beforeEach(() => {
        const _templates: Templates = {
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
        const client: Client = {
            models: [],
            server: 'http://localhost:8080',
            services: [],
            version: '1.0',
        };

        await writeClientCore(client, templates, '/', {
            httpClient: HttpClient.FETCH,
            indent: Indent.SPACE_4,
            input: '',
            output: '',
            serviceResponse: 'body',
        });

        expect(writeFile).toHaveBeenCalledWith(resolve('/', '/OpenAPI.ts'), `settings${EOL}`);
        expect(writeFile).toHaveBeenCalledWith(resolve('/', '/ApiError.ts'), `apiError${EOL}`);
        expect(writeFile).toHaveBeenCalledWith(resolve('/', '/ApiRequestOptions.ts'), `apiRequestOptions${EOL}`);
        expect(writeFile).toHaveBeenCalledWith(resolve('/', '/ApiResult.ts'), `apiResult${EOL}`);
        expect(writeFile).toHaveBeenCalledWith(resolve('/', '/CancelablePromise.ts'), `cancelablePromise${EOL}`);
        expect(writeFile).toHaveBeenCalledWith(resolve('/', '/request.ts'), `request${EOL}`);
        expect(writeFile).toHaveBeenCalledWith(resolve('/', '/types.ts'), `types${EOL}`);
    });

    it('uses client server value for base', async () => {
        const client: Client = {
            models: [],
            server: 'http://localhost:8080',
            services: [],
            version: '1.0',
        };

        await writeClientCore(client, templates, '/', {
            httpClient: HttpClient.FETCH,
            indent: Indent.SPACE_4,
            input: '',
            output: '',
            serviceResponse: 'body',
        });

        expect(templates.core.settings).toHaveBeenCalledWith({
            clientName: undefined,
            httpClient: 'fetch',
            httpRequest: 'FetchHttpRequest',
            server: 'http://localhost:8080',
            serviceResponse: 'body',
            version: '1.0',
        });
    });

    it('uses custom value for base', async () => {
        const client: Client = {
            models: [],
            server: 'http://localhost:8080',
            services: [],
            version: '1.0',
        };

        await writeClientCore(client, templates, '/', {
            base: 'foo',
            httpClient: HttpClient.FETCH,
            indent: Indent.SPACE_4,
            input: '',
            output: '',
            serviceResponse: 'body',
        });

        expect(templates.core.settings).toHaveBeenCalledWith({
            clientName: undefined,
            httpClient: 'fetch',
            httpRequest: 'FetchHttpRequest',
            server: 'foo',
            serviceResponse: 'body',
            version: '1.0',
        });
    });
});
