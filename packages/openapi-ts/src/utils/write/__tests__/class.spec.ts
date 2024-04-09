import { writeFileSync } from 'node:fs';

import { describe, expect, it, vi } from 'vitest';

import { writeClientClass } from '../class';
import { mockTemplates } from './mocks';
import { openApi } from './models';

vi.mock('node:fs');

describe('writeClientClass', () => {
    it('writes to filesystem', async () => {
        const client: Parameters<typeof writeClientClass>[2] = {
            enumNames: [],
            models: [],
            server: 'http://localhost:8080',
            services: [],
            version: 'v1',
        };

        await writeClientClass(
            openApi,
            './dist',
            client,
            {
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
            },
            mockTemplates
        );

        expect(writeFileSync).toHaveBeenCalled();
    });
});
