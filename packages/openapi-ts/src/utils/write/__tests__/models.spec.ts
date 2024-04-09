import { writeFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it, vi } from 'vitest';

import { writeClientModels } from '../models';
import { openApi } from './models';

vi.mock('node:fs');

describe('writeClientModels', () => {
    it('writes to filesystem', async () => {
        const client: Parameters<typeof writeClientModels>[2] = {
            enumNames: [],
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
            server: 'http://localhost:8080',
            services: [],
            version: 'v1',
        };

        await writeClientModels(openApi, '/', client, {
            client: 'fetch',
            debug: false,
            enums: 'javascript',
            experimental: false,
            exportCore: true,
            exportModels: true,
            exportServices: true,
            format: false,
            dryRun: false,
            input: '',
            lint: false,
            name: 'AppClient',
            operationId: true,
            output: '',
            postfixServices: '',
            schemas: true,
            serviceResponse: 'body',
            useDateType: false,
            useOptions: true,
        });

        expect(writeFileSync).toHaveBeenCalledWith(path.resolve('/', '/models.ts'), expect.anything());
    });
});
