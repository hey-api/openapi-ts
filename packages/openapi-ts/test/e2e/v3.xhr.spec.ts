import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { cleanup } from './scripts/cleanup';
import { compileWithTypescript } from './scripts/compileWithTypescript';
import { generateClient } from './scripts/generateClient';
import server from './scripts/server';

describe('v3.xhr', () => {
    beforeAll(async () => {
        cleanup('v3/xhr');
        await generateClient('v3/xhr', 'v3', 'xhr');
        compileWithTypescript('v3/xhr');
        await server.start('v3/xhr');
    }, 40000);

    afterAll(async () => {
        await server.stop();
    });

    it('requests token', async () => {
        await browser.exposeFunction('tokenRequest', vi.fn().mockResolvedValue('MY_TOKEN'));
        const result = await browser.evaluate(async () => {
            // @ts-ignore
            const { OpenAPI, SimpleService } = window.api;
            // @ts-ignore
            OpenAPI.TOKEN = window.tokenRequest;
            OpenAPI.USERNAME = undefined;
            OpenAPI.PASSWORD = undefined;
            return await SimpleService.getCallWithoutParametersAndResponse();
        });
        // @ts-ignore
        expect(result.headers.authorization).toBe('Bearer MY_TOKEN');
    });

    it('uses credentials', async () => {
        const result = await browser.evaluate(async () => {
            // @ts-ignore
            const { OpenAPI, SimpleService } = window.api;
            OpenAPI.TOKEN = undefined;
            OpenAPI.USERNAME = 'username';
            OpenAPI.PASSWORD = 'password';
            return await SimpleService.getCallWithoutParametersAndResponse();
        });
        // @ts-ignore
        expect(result.headers.authorization).toBe('Basic dXNlcm5hbWU6cGFzc3dvcmQ=');
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

    it('support form data', async () => {
        const result = await browser.evaluate(async () => {
            // @ts-ignore
            const { ParametersService } = window.api;
            return await ParametersService.callWithParameters(
                'valueHeader',
                'valueQuery',
                'valueForm',
                'valueCookie',
                'valuePath',
                {
                    prop: 'valueBody',
                }
            );
        });
        expect(result).toBeDefined();
    });

    it('can abort the request', async () => {
        let error;
        try {
            await browser.evaluate(async () => {
                // @ts-ignore
                const { SimpleService } = window.api;
                const promise = SimpleService.getCallWithoutParametersAndResponse();
                setTimeout(() => {
                    promise.cancel();
                }, 10);
                await promise;
            });
        } catch (e) {
            error = (e as Error).message;
        }
        expect(error).toContain('Request aborted');
    });

    it('should throw known error (500)', async () => {
        const error = await browser.evaluate(async () => {
            try {
                // @ts-ignore
                const { ErrorService } = window.api;
                await ErrorService.testErrorCode(500);
            } catch (error) {
                return JSON.stringify({
                    body: error.body,
                    message: error.message,
                    name: error.name,
                    status: error.status,
                    statusText: error.statusText,
                    url: error.url,
                });
            }
            return;
        });
        expect(error).toBe(
            JSON.stringify({
                body: {
                    message: 'hello world',
                    status: 500,
                },
                message: 'Custom message: Internal Server Error',
                name: 'ApiError',
                status: 500,
                statusText: 'Internal Server Error',
                url: 'http://localhost:3000/base/api/v1.0/error?status=500',
            })
        );
    });

    it('should throw unknown error (599)', async () => {
        const error = await browser.evaluate(async () => {
            try {
                // @ts-ignore
                const { ErrorService } = window.api;
                await ErrorService.testErrorCode(599);
            } catch (error) {
                return JSON.stringify({
                    body: error.body,
                    message: error.message,
                    name: error.name,
                    status: error.status,
                    statusText: error.statusText,
                    url: error.url,
                });
            }
            return;
        });
        expect(error).toBe(
            JSON.stringify({
                body: {
                    message: 'hello world',
                    status: 599,
                },
                message:
                    'Generic Error: status: 599; status text: unknown; body: {\n  "message": "hello world",\n  "status": 599\n}',
                name: 'ApiError',
                status: 599,
                statusText: 'unknown',
                url: 'http://localhost:3000/base/api/v1.0/error?status=599',
            })
        );
    });

    it('it should parse query params', async () => {
        const result = await browser.evaluate(async () => {
            // @ts-ignore
            const { ParametersService } = window.api;
            return await ParametersService.postCallWithOptionalParam({
                page: 0,
                size: 1,
                sort: ['location'],
            });
        });
        // @ts-ignore
        expect(result.query).toStrictEqual({ parameter: { page: '0', size: '1', sort: 'location' } });
    });
});

describe('v3.xhr useOptions', () => {
    beforeAll(async () => {
        cleanup('v3/xhr');
        await generateClient('v3/xhr', 'v3', 'xhr', true);
        compileWithTypescript('v3/xhr');
        await server.start('v3/xhr');
    }, 40000);

    afterAll(async () => {
        await server.stop();
    });

    it('returns result body by default', async () => {
        const { SimpleService } = await import('./generated/v3/xhr/index.js');
        const result = await SimpleService.getCallWithoutParametersAndResponse();
        // @ts-ignore
        expect(result.body).toBeUndefined();
    });

    it('returns result body', async () => {
        const { SimpleService } = await import('./generated/v3/xhr/index.js');
        // @ts-ignore
        const result = await SimpleService.getCallWithoutParametersAndResponse({
            _result: 'body',
        });
        // @ts-ignore
        expect(result.body).toBeUndefined();
    });

    it('returns raw result', async ({ skip }) => {
        skip();
        const { SimpleService } = await import('./generated/v3/xhr/index.js');
        // @ts-ignore
        const result = await SimpleService.getCallWithoutParametersAndResponse({
            _result: 'raw',
        });
        // @ts-ignore
        expect(result.body).toBeDefined();
    });
});
