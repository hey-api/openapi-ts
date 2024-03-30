import { writeFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it, vi } from 'vitest';

import { writeClientServices } from '../services';
import { mockTemplates } from './mocks';

vi.mock('node:fs');

describe('writeClientServices', () => {
    it('should write to filesystem', async () => {
        const client: Parameters<typeof writeClientServices>[0] = {
            server: 'http://localhost:8080',
            version: 'v1',
            models: [],
            services: [
                {
                    $refs: [],
                    imports: [],
                    name: 'User',
                    operations: [],
                },
            ],
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

        expect(writeFileSync).toHaveBeenCalledWith(path.resolve('/', '/UserService.ts'), 'service');
    });
});
