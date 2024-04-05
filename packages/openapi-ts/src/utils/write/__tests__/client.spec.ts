import { mkdirSync, rmSync, writeFileSync } from 'node:fs';

import { describe, expect, it, vi } from 'vitest';

import { writeClient } from '../client';
import { mockTemplates } from './mocks';

vi.mock('node:fs');

describe('writeClient', () => {
    it('should write to filesystem', async () => {
        const client: Parameters<typeof writeClient>[0] = {
            enumNames: [],
            models: [],
            server: 'http://localhost:8080',
            services: [],
            version: 'v1',
        };

        await writeClient(client, mockTemplates, {
            client: 'fetch',
            debug: false,
            enums: 'javascript',
            experimental: false,
            exportCore: true,
            exportModels: true,
            exportSchemas: true,
            exportServices: true,
            format: true,
            input: '',
            lint: false,
            operationId: true,
            output: './dist',
            postfixServices: 'Service',
            serviceResponse: 'body',
            useDateType: false,
            useOptions: false,
            write: true,
        });

        expect(rmSync).toHaveBeenCalled();
        expect(mkdirSync).toHaveBeenCalled();
        expect(writeFileSync).toHaveBeenCalled();
    });
});
