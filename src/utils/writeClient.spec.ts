import type { Client } from '../client/interfaces/Client';
import { HttpClient } from '../HttpClient';
import { Indent } from '../Indent';
import { mkdir, rmdir, writeFile } from './fileSystem';
import type { Templates } from './registerHandlebarTemplates';
import { writeClient } from './writeClient';

jest.mock('./fileSystem');

describe('writeClient', () => {
    it('should write to filesystem', async () => {
        const client: Client = {
            server: 'http://localhost:8080',
            version: 'v1',
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

        await writeClient(client, templates, {
            exportCore: true,
            exportModels: true,
            exportSchemas: true,
            exportServices: true,
            indent: Indent.SPACE_4,
            input: '',
            output: './dist',
            httpClient: HttpClient.FETCH,
            postfixModels: 'AppClient',
            postfixServices: 'Service',
            useDateType: false,
            useOptions: false,
            useUnionTypes: false,
        });

        expect(rmdir).toBeCalled();
        expect(mkdir).toBeCalled();
        expect(writeFile).toBeCalled();
    });
});
