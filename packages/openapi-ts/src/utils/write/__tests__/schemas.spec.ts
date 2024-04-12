import { writeFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it, vi } from 'vitest';

import { setConfig } from '../../config';
import { writeSchemas } from '../schemas';
import { openApi } from './models';

vi.mock('node:fs');

describe('writeSchemas', () => {
    it('writes to filesystem', async () => {
        setConfig({
            client: 'fetch',
            debug: false,
            dryRun: false,
            enums: 'javascript',
            exportCore: true,
            exportModels: true,
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
            useDateType: false,
            useOptions: true,
        });

        if ('openapi' in openApi) {
            openApi.components = {
                schemas: {
                    foo: {
                        type: 'object',
                    },
                },
            };
        }

        await writeSchemas(openApi, '/');

        expect(writeFileSync).toHaveBeenCalledWith(path.resolve('/', '/schemas.gen.ts'), expect.anything());
    });
});
