import { writeFileSync } from 'node:fs';

import { describe, expect, it, vi } from 'vitest';

import { writeClientServices } from '../services';
import { mockTemplates } from './mocks';
import { openApi } from './models';

vi.mock('node:fs');

describe('writeClientServices', () => {
    it('should write to filesystem', async () => {
        const client: Parameters<typeof writeClientServices>[2] = {
            enumNames: [],
            models: [],
            server: 'http://localhost:8080',
            services: [
                {
                    $refs: [],
                    imports: [],
                    name: 'User',
                    operations: [],
                },
            ],
            version: 'v1',
        };

        await writeClientServices(
            openApi,
            '/',
            client,
            {
                client: 'fetch',
                debug: false,
                enums: false,
                experimental: false,
                exportCore: true,
                exportModels: true,
                exportSchemas: true,
                exportServices: true,
                format: false,
                input: '',
                lint: false,
                operationId: true,
                output: '',
                postfixServices: 'Service',
                serviceResponse: 'body',
                useDateType: false,
                useOptions: false,
                write: true,
            },
            mockTemplates
        );

        expect(writeFileSync).toHaveBeenCalled();
    });
});
