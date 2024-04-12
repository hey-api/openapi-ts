import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { cleanup } from './scripts/cleanup';
import { compileWithTypescript } from './scripts/compileWithTypescript';
import { generateClient } from './scripts/generateClient';
import server from './scripts/server';

describe('client.xhr', () => {
    beforeAll(async () => {
        cleanup('client/xhr');
        await generateClient('client/xhr', 'v3', 'xhr', false, 'ApiClient');
        compileWithTypescript('client/xhr');
        await server.start('client/xhr');
    }, 40000);

    afterAll(async () => {
        await server.stop();
    });

    it('requests token', async () => {
        await browser.exposeFunction('tokenRequest', vi.fn().mockResolvedValue('MY_TOKEN'));
        const result = await browser.evaluate(async () => {
            // @ts-ignore
            const { ApiClient } = window.api;
            const client = new ApiClient({
                PASSWORD: undefined,
                // @ts-ignore
                TOKEN: window.tokenRequest,
                USERNAME: undefined,
            });
            return await client.simple.getCallWithoutParametersAndResponse();
        });
        // @ts-ignore
        expect(result.headers.authorization).toBe('Bearer MY_TOKEN');
    });

    it('uses credentials', async () => {
        const result = await browser.evaluate(async () => {
            // @ts-ignore
            const { ApiClient } = window.api;
            const client = new ApiClient({
                PASSWORD: 'password',
                TOKEN: undefined,
                USERNAME: 'username',
            });
            return await client.simple.getCallWithoutParametersAndResponse();
        });
        // @ts-ignore
        expect(result.headers.authorization).toBe('Basic dXNlcm5hbWU6cGFzc3dvcmQ=');
    });

    it('supports complex params', async () => {
        const result = await browser.evaluate(async () => {
            // @ts-ignore
            const { ApiClient } = window.api;
            const client = new ApiClient();
            return await client.complex.complexTypes({
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
            const { ApiClient } = window.api;
            const client = new ApiClient();
            return await client.parameters.callWithParameters(
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
                const { ApiClient } = window.api;
                const client = new ApiClient();
                const promise = client.simple.getCallWithoutParametersAndResponse();
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
                const { ApiClient } = window.api;
                const client = new ApiClient();
                await client.error.testErrorCode(500);
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
                const { ApiClient } = window.api;
                const client = new ApiClient();
                await client.error.testErrorCode(599);
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
});
