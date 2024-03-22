import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { cleanup } from './scripts/cleanup';
import { compileWithTypescript } from './scripts/compileWithTypescript';
import { generateClient } from './scripts/generateClient';
import server from './scripts/server';

describe('client.node-experimental', () => {
    beforeAll(async () => {
        cleanup('client/node-experimental');
        await generateClient('client/node-experimental', 'v3', 'node-experimental', false, 'ApiClient');
        compileWithTypescript('client/node-experimental');
        await server.start('client/node-experimental');
    }, 30000);

    afterAll(async () => {
        await server.stop();
    });

    it('requests token', async () => {
        const { ApiClient } = await import('./generated/client/node-experimental/index.js');
        const tokenRequest = vi.fn().mockResolvedValue('MY_TOKEN');
        const client = new ApiClient({
            TOKEN: tokenRequest,
            USERNAME: undefined,
            PASSWORD: undefined,
        });
        const result = await client.simple.getCallWithoutParametersAndResponse();
        expect(tokenRequest.mock.calls.length).toBe(1);
        // @ts-ignore
        expect(result.headers.authorization).toBe('Bearer MY_TOKEN');
    });

    it('uses credentials', async () => {
        const { ApiClient } = await import('./generated/client/node-experimental/index.js');
        const client = new ApiClient({
            TOKEN: undefined,
            USERNAME: 'username',
            PASSWORD: 'password',
        });
        const result = await client.simple.getCallWithoutParametersAndResponse();
        // @ts-ignore
        expect(result.headers.authorization).toBe('Basic dXNlcm5hbWU6cGFzc3dvcmQ=');
    });

    it('supports complex params', async () => {
        const { ApiClient } = await import('./generated/client/node-experimental/index.js');
        const client = new ApiClient();
        // @ts-ignore
        const result = await client.complex.complexTypes({
            first: {
                second: {
                    third: 'Hello World!',
                },
            },
        });
        expect(result).toBeDefined();
    });

    it('support form data', async () => {
        const { ApiClient } = await import('./generated/client/node-experimental/index.js');
        const client = new ApiClient();
        // @ts-ignore
        const result = await client.parameters.callWithParameters(
            'valueHeader',
            'valueQuery',
            'valueForm',
            'valueCookie',
            'valuePath',
            {
                prop: 'valueBody',
            }
        );
        expect(result).toBeDefined();
    });

    it('can abort the request', async () => {
        let error;
        try {
            const { ApiClient } = await import('./generated/client/node-experimental/index.js');
            const client = new ApiClient();
            const promise = client.simple.getCallWithoutParametersAndResponse();
            setTimeout(() => {
                promise.cancel();
            }, 10);
            await promise;
        } catch (e) {
            error = (e as Error).message;
        }
        expect(error).toContain('Request aborted');
    });

    it('should throw known error (500)', async () => {
        let error;
        try {
            const { ApiClient } = await import('./generated/client/node-experimental/index.js');
            const client = new ApiClient();
            await client.error.testErrorCode(500);
        } catch (err) {
            error = JSON.stringify({
                name: err.name,
                message: err.message,
                url: err.url,
                status: err.status,
                statusText: err.statusText,
                body: err.body,
            });
        }
        expect(error).toBe(
            JSON.stringify({
                name: 'ApiError',
                message: 'Custom message: Internal Server Error',
                url: 'http://localhost:3000/base/api/v1.0/error?status=500',
                status: 500,
                statusText: 'Internal Server Error',
                body: {
                    status: 500,
                    message: 'hello world',
                },
            })
        );
    });

    it('should throw unknown error (409)', async () => {
        let error;
        try {
            const { ApiClient } = await import('./generated/client/node-experimental/index.js');
            const client = new ApiClient();
            await client.error.testErrorCode(409);
        } catch (err) {
            error = JSON.stringify({
                name: err.name,
                message: err.message,
                url: err.url,
                status: err.status,
                statusText: err.statusText,
                body: err.body,
            });
        }
        expect(error).toBe(
            JSON.stringify({
                name: 'ApiError',
                message:
                    'Generic Error: status: 409; status text: Conflict; body: {\n  "status": 409,\n  "message": "hello world"\n}',
                url: 'http://localhost:3000/base/api/v1.0/error?status=409',
                status: 409,
                statusText: 'Conflict',
                body: {
                    status: 409,
                    message: 'hello world',
                },
            })
        );
    });
});
