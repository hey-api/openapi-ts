import { EOL } from 'os';
import { resolve } from 'path';

import type { Model } from '../client/interfaces/Model';
import { HttpClient } from '../HttpClient';
import { Indent } from '../Indent';
import { writeFile } from './fileSystem';
import type { Templates } from './registerHandlebarTemplates';
import { writeClientSchemas } from './writeClientSchemas';

jest.mock('./fileSystem');

describe('writeClientSchemas', () => {
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

        await writeClientSchemas(models, templates, '/', HttpClient.FETCH, Indent.SPACE_4);

        expect(writeFile).toBeCalledWith(resolve('/', '/$User.ts'), `schema${EOL}`);
    });
});
