import { writeFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it, vi } from 'vitest';

import { TypeScriptFile } from '../../../compiler';
import { setConfig } from '../../config';
import { processTypesAndEnums } from '../models';

vi.mock('node:fs');

describe('processTypesAndEnums', () => {
    it('writes to filesystem', async () => {
        setConfig({
            client: 'fetch',
            debug: false,
            dryRun: false,
            enums: 'javascript',
            exportCore: true,
            exportServices: true,
            format: false,
            input: '',
            lint: false,
            name: 'AppClient',
            operationId: true,
            output: '',
            postfixServices: '',
            schemas: true,
            serviceResponse: 'body',
            types: {},
            useDateType: false,
            useOptions: true,
        });

        const client: Parameters<typeof processTypesAndEnums>[0]['client'] = {
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

        const files = {
            enums: new TypeScriptFile({
                dir: '/',
                name: 'enums.ts',
            }),
            types: new TypeScriptFile({
                dir: '/',
                name: 'models.ts',
            }),
        };

        await processTypesAndEnums({
            client,
            files,
        });

        files.enums.write();
        files.types.write();

        expect(writeFileSync).toHaveBeenCalledWith(path.resolve('/models.gen.ts'), expect.anything());
    });
});
