import { writeFileSync } from 'node:fs';

import { describe, expect, it, vi } from 'vitest';

import { writeClientServices } from '../services';
import { mockTemplates } from './mocks';

vi.mock('node:fs');

describe('writeClientServices', () => {
    it('should write to filesystem', async () => {
        const client: Parameters<typeof writeClientServices>[0] = {
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

        await writeClientServices(client, mockTemplates, '/', {
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
            postfixModels: '',
            postfixServices: 'Service',
            serviceResponse: 'body',
            useDateType: false,
            useOptions: false,
            write: true,
        });

        expect(writeFileSync).toHaveBeenCalled();
    });
});
