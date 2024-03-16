import { resolve } from 'path';

import type { Model } from '../client/interfaces/Model';
import { HttpClient } from '../HttpClient';
import { writeFile } from './fileSystem';
import type { Templates } from './registerHandlebarTemplates';
import { writeClientModels } from './writeClientModels';

jest.mock('./fileSystem');

describe('writeClientModels', () => {
    it('should write to filesystem', async () => {
        const models: Model[] = [
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

        await writeClientModels(models, templates, '/', {
            httpClient: HttpClient.FETCH,
            useDateType: false,
        });

        expect(writeFile).toHaveBeenCalledWith(resolve('/', '/User.ts'), 'model');
    });
});
