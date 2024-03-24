import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import browser from './scripts/browser';
import { cleanup } from './scripts/cleanup';
import { compileWithTypescript } from './scripts/compileWithTypescript';
import { copyAsset } from './scripts/copyAsset';
import { generateClient } from './scripts/generateClient';
import server from './scripts/server';

describe('v2.xhr', () => {
    beforeAll(async () => {
        cleanup('v2/xhr');
        await generateClient('v2/xhr', 'v2', 'xhr');
        copyAsset('index.html', 'v2/xhr/index.html');
        copyAsset('main.ts', 'v2/xhr/main.ts');
        compileWithTypescript('v2/xhr');
        await server.start('v2/xhr');
        await browser.start();
    }, 40000);

    afterAll(async () => {
        await browser.stop();
        await server.stop();
    });

    it('requests token', async () => {
        await browser.exposeFunction('tokenRequest', vi.fn().mockResolvedValue('MY_TOKEN'));
        const result = await browser.evaluate(async () => {
            // @ts-ignore
            const { OpenAPI, SimpleService } = window.api;
            // @ts-ignore
            OpenAPI.TOKEN = window.tokenRequest;
            return await SimpleService.getCallWithoutParametersAndResponse();
        });
        // @ts-ignore
        expect(result.headers.authorization).toBe('Bearer MY_TOKEN');
    });

    it('supports complex params', async () => {
        const result = await browser.evaluate(async () => {
            // @ts-ignore
            const { ComplexService } = window.api;
            return await ComplexService.complexTypes({
                first: {
                    second: {
                        third: 'Hello World!',
                    },
                },
            });
        });
        expect(result).toBeDefined();
    });
});

describe('v2.xhr useOptions', () => {
    beforeAll(async () => {
        cleanup('v2/xhr');
        await generateClient('v2/xhr', 'v2', 'xhr', true);
        copyAsset('index.html', 'v2/xhr/index.html');
        copyAsset('main.ts', 'v2/xhr/main.ts');
        compileWithTypescript('v2/xhr');
        await server.start('v2/xhr');
        await browser.start();
    }, 40000);

    afterAll(async () => {
        await browser.stop();
        await server.stop();
    });

    it('returns result body by default', async () => {
        const result = await browser.evaluate(async () => {
            // @ts-ignore
            const { SimpleService } = window.api;
            return await SimpleService.getCallWithoutParametersAndResponse();
        });
        // @ts-ignore
        expect(result.body).toBeUndefined();
    });

    it('returns result body', async () => {
        const result = await browser.evaluate(async () => {
            // @ts-ignore
            const { SimpleService } = window.api;
            return await SimpleService.getCallWithoutParametersAndResponse({
                _result: 'body',
            });
        });
        // @ts-ignore
        expect(result.body).toBeUndefined();
    });

    it('returns raw result', async ({ skip }) => {
        skip();
        const result = await browser.evaluate(async () => {
            // @ts-ignore
            const { SimpleService } = window.api;
            return await SimpleService.getCallWithoutParametersAndResponse({
                _result: 'raw',
            });
        });
        // @ts-ignore
        expect(result.body).toBeDefined();
    });
});
