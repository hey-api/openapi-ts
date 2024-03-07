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
    it('should write to filesystem', async () => {
        const client: Client = {
            server: 'http://localhost:8080',
            version: '1.0',
            models: [],
            services: [],
        };

        const templates: Templates = {
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

        await writeClientCore(client, templates, '/', {
            httpClient: HttpClient.FETCH,
            indent: Indent.SPACE_4,
            input: '',
            output: '',
            serviceResponse: 'body',
        });

        expect(writeFile).toBeCalledWith(resolve('/', '/OpenAPI.ts'), `settings${EOL}`);
        expect(writeFile).toBeCalledWith(resolve('/', '/ApiError.ts'), `apiError${EOL}`);
        expect(writeFile).toBeCalledWith(resolve('/', '/ApiRequestOptions.ts'), `apiRequestOptions${EOL}`);
        expect(writeFile).toBeCalledWith(resolve('/', '/ApiResult.ts'), `apiResult${EOL}`);
        expect(writeFile).toBeCalledWith(resolve('/', '/CancelablePromise.ts'), `cancelablePromise${EOL}`);
        expect(writeFile).toBeCalledWith(resolve('/', '/request.ts'), `request${EOL}`);
        expect(writeFile).toBeCalledWith(resolve('/', '/types.ts'), `types${EOL}`);
    });
});
