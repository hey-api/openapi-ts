import { resolve } from 'path';

import { writeFile } from '../../fileSystem';
import { writeClientServices } from '../services';

jest.mock('../../fileSystem');

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
            input: '',
            output: '',
            postfixServices: 'Service',
            serviceResponse: 'body',
            useOptions: false,
        });

        expect(writeFile).toHaveBeenCalledWith(resolve('/', '/UserService.ts'), 'service');
    });
});
