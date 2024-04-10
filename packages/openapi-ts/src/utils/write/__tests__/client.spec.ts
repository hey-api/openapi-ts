import { mkdirSync, rmSync, writeFileSync } from 'node:fs';

import { describe, expect, it, vi } from 'vitest';

import { setConfig } from '../../config';
import { writeClient } from '../client';
import { mockTemplates } from './mocks';
import { openApi } from './models';

vi.mock('node:fs');

describe('writeClient', () => {
    it('writes to filesystem', async () => {
        setConfig({
            client: 'fetch',
            debug: false,
            dryRun: false,
            enums: 'javascript',
            experimental: false,
            exportCore: true,
            exportModels: true,
            exportServices: true,
            format: true,
            input: '',
            lint: false,
            operationId: true,
            output: './dist',
            postfixServices: 'Service',
            schemas: true,
            serviceResponse: 'body',
            useDateType: false,
            useOptions: false,
        });

        const client: Parameters<typeof writeClient>[1] = {
            enumNames: [],
            models: [],
            server: 'http://localhost:8080',
            services: [],
            version: 'v1',
        };

        await writeClient(openApi, client, mockTemplates);

        expect(rmSync).toHaveBeenCalled();
        expect(mkdirSync).toHaveBeenCalled();
        expect(writeFileSync).toHaveBeenCalled();
    });
});
