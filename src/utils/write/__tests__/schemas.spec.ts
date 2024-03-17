import { resolve } from 'path';

import { writeFile } from '../../fileSystem';
import { writeClientSchemas } from '../schemas';

jest.mock('../../fileSystem');

describe('writeClientSchemas', () => {
    it('should write to filesystem', async () => {
        const client: Parameters<typeof writeClientSchemas>[0] = {
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

        const templates: Parameters<typeof writeClientSchemas>[1] = {
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

        await writeClientSchemas(client, templates, '/', {
            client: 'fetch',
            enums: true,
        });

        expect(writeFile).toHaveBeenCalledWith(resolve('/', '/$User.ts'), 'schema');
    });
});
