import { writeFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it, vi } from 'vitest';

import { writeClientIndex } from '../index';
import { mockTemplates } from './mocks';

vi.mock('node:fs');

describe('writeClientIndex', () => {
    it('should write to filesystem', async () => {
        const client: Parameters<typeof writeClientIndex>[0] = {
            server: 'http://localhost:8080',
            version: '1.0',
            models: [],
            services: [],
        };

        await writeClientIndex(client, mockTemplates, '/', {
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
            operationId: true,
            output: '',
            postfixModels: '',
            postfixServices: 'Service',
            serviceResponse: 'body',
            useDateType: false,
            useOptions: true,
            write: true,
        });

        expect(writeFileSync).toHaveBeenCalledWith(path.resolve('/', '/index.ts'), 'index');
    });
});
