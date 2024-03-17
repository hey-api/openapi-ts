import { resolve } from 'path';

import { HttpClient } from '../../../HttpClient';
import { writeClientModels } from '../models';
import { writeFile } from './../../fileSystem';

jest.mock('../../fileSystem');

describe('writeClientModels', () => {
    it('should write to filesystem', async () => {
        const client: Parameters<typeof writeClientModels>[0] = {
            server: 'http://localhost:8080',
            version: 'v1',
            models: [
                {
                    $refs: [],
                    base: 'User',
                    description: null,
                    enum: [],
                    enums: [],
                    export: 'interface',
                    imports: [],
                    isDefinition: true,
                    isNullable: false,
                    isReadOnly: false,
                    isRequired: false,
                    link: null,
                    name: 'User',
                    properties: [],
                    template: null,
                    type: 'User',
                },
            ],
            services: [],
        };

        const templates: Parameters<typeof writeClientModels>[1] = {
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

        await writeClientModels(client, templates, '/', {
            enums: true,
            httpClient: HttpClient.FETCH,
            useDateType: false,
        });

        expect(writeFile).toHaveBeenCalledWith(resolve('/', '/User.ts'), 'model');
    });
});
