import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { cleanup } from './scripts/cleanup';
import { compileWithTypescript } from './scripts/compileWithTypescript';
import { generateClient } from './scripts/generateClient';
import server from './scripts/server';

describe('v2.axios', () => {
    beforeAll(async () => {
        cleanup('v2/axios');
        await generateClient('v2/axios', 'v2', 'axios');
        compileWithTypescript('v2/axios');
        await server.start('v2/axios');
    }, 30000);

    afterAll(async () => {
        await server.stop();
    });

    it('requests token', async () => {
        const { OpenAPI, SimpleService } = require('./generated/v2/axios/index.js');
        const tokenRequest = vi.fn().mockResolvedValue('MY_TOKEN');
        OpenAPI.TOKEN = tokenRequest;
        const result = await SimpleService.getCallWithoutParametersAndResponse();
        expect(tokenRequest.mock.calls.length).toBe(1);
        expect(result.headers.authorization).toBe('Bearer MY_TOKEN');
    });

    it('supports complex params', async () => {
        const { ComplexService } = require('./generated/v2/axios/index.js');
        const result = await ComplexService.complexTypes({
            first: {
                second: {
                    third: 'Hello World!',
                },
            },
        });
        expect(result).toBeDefined();
    });
});

describe('v2.axios useOptions', () => {
    beforeAll(async () => {
        cleanup('v2/axios');
        await generateClient('v2/axios', 'v2', 'axios', true);
        compileWithTypescript('v2/axios');
        await server.start('v2/axios');
    }, 30000);

    afterAll(async () => {
        await server.stop();
    });

    it('returns result body by default', async () => {
        const { SimpleService } = require('./generated/v2/axios/index.js');
        const result = await SimpleService.getCallWithoutParametersAndResponse();
        expect(result.body).toBeUndefined();
    });

    it('returns result body', async () => {
        const { SimpleService } = require('./generated/v2/axios/index.js');
        const result = await SimpleService.getCallWithoutParametersAndResponse({
            _result: 'body',
        });
        expect(result.body).toBeUndefined();
    });

    it('returns raw result', async () => {
        const { SimpleService } = require('./generated/v2/axios/index.js');
        const result = await SimpleService.getCallWithoutParametersAndResponse({
            _result: 'raw',
        });
        expect(result.body).not.toBeUndefined();
    });
});
