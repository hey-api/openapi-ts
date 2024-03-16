import { resolve } from 'path';

import type { Service } from '../client/interfaces/Service';
import { HttpClient } from '../HttpClient';
import { writeFile } from './fileSystem';
import type { Templates } from './registerHandlebarTemplates';
import { writeClientServices } from './writeClientServices';

jest.mock('./fileSystem');

describe('writeClientServices', () => {
    it('should write to filesystem', async () => {
        const services: Service[] = [
            {
                $refs: [],
                imports: [],
                name: 'User',
                operations: [],
            },
        ];

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

        await writeClientServices(services, templates, '/', {
            httpClient: HttpClient.FETCH,
            input: '',
            output: '',
            postfixServices: 'Service',
            serviceResponse: 'body',
            useOptions: false,
        });

        expect(writeFile).toHaveBeenCalledWith(resolve('/', '/UserService.ts'), 'service');
    });
});
