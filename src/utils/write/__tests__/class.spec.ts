import { HttpClient } from '../../../HttpClient';
import { writeFile } from '../../fileSystem';
import { writeClientClass } from '../class';

jest.mock('../../fileSystem');

describe('writeClientClass', () => {
    it('should write to filesystem', async () => {
        const client: Parameters<typeof writeClientClass>[0] = {
            server: 'http://localhost:8080',
            version: 'v1',
            models: [],
            services: [],
        };

        const templates: Parameters<typeof writeClientClass>[1] = {
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

        await writeClientClass(client, templates, './dist', {
            clientName: 'AppClient',
            enums: true,
            httpClient: HttpClient.FETCH,
            postfixServices: '',
        });

        expect(writeFile).toHaveBeenCalled();
    });
});
