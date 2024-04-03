import { writeFileSync } from 'node:fs';

import { describe, expect, it, vi } from 'vitest';

import { writeClientClass } from '../class';
import { mockTemplates } from './mocks';

vi.mock('node:fs');

describe('writeClientClass', () => {
    it('should write to filesystem', async () => {
        const client: Parameters<typeof writeClientClass>[0] = {
            server: 'http://localhost:8080',
            version: 'v1',
            models: [],
            services: [],
        };

        await writeClientClass(client, mockTemplates, './dist', {
            client: 'fetch',
            debug: false,
            enums: 'javascript',
            experimental: false,
            exportCore: true,
            exportModels: true,
            exportSchemas: true,
            exportServices: true,
            format: false,
            input: '',
            lint: false,
            name: 'AppClient',
            operationId: true,
            output: '',
            postfixModels: '',
            postfixServices: '',
            serviceResponse: 'body',
            useDateType: false,
            useOptions: true,
            write: true,
        });

        expect(writeFileSync).toHaveBeenCalled();
    });
});
