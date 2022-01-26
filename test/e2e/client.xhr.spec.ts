import browser from './scripts/browser';
import { compileWithTypescript } from './scripts/compileWithTypescript';
import { copy } from './scripts/copy';
import { generate } from './scripts/generate';
import server from './scripts/server';

describe('v3.xhr', () => {
    beforeAll(async () => {
        await generate('client/xhr', 'v3', 'xhr', false, false, 'AppClient');
        await copy('index.html', 'client/xhr/index.html');
        await copy('main.ts', 'client/xhr/main.ts');
        compileWithTypescript('client/xhr');
        await server.start('client/xhr');
        await browser.start();
    }, 30000);

    afterAll(async () => {
        await browser.stop();
        await server.stop();
    });

    it('requests token', async () => {
        await browser.exposeFunction('tokenRequest', jest.fn().mockResolvedValue('MY_TOKEN'));
        const result = await browser.evaluate(async () => {
            const { AppClient } = (window as any).api;
            const client = new AppClient({
                TOKEN: (window as any).tokenRequest,
                USERNAME: undefined,
                PASSWORD: undefined,
            });
            return await client.simple.getCallWithoutParametersAndResponse();
        });
        expect(result.headers.authorization).toBe('Bearer MY_TOKEN');
    });

    it('uses credentials', async () => {
        const result = await browser.evaluate(async () => {
            const { AppClient } = (window as any).api;
            const client = new AppClient({
                TOKEN: undefined,
                USERNAME: 'username',
                PASSWORD: 'password',
            });
            return await client.simple.getCallWithoutParametersAndResponse();
        });
        expect(result.headers.authorization).toBe('Basic dXNlcm5hbWU6cGFzc3dvcmQ=');
    });

    it('supports complex params', async () => {
        const result = await browser.evaluate(async () => {
            const { AppClient } = (window as any).api;
            const client = new AppClient();
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

    it('can abort the request', async () => {
        let error;
        try {
            await browser.evaluate(async () => {
                const { AppClient } = (window as any).api;
                const client = new AppClient();
                const promise = client.simple.getCallWithoutParametersAndResponse();
                setTimeout(() => {
                    promise.cancel();
                }, 10);
                await promise;
            });
        } catch (e) {
            error = (e as Error).message;
        }
        expect(error).toContain('CancelError: Request aborted');
    });

    it('should throw known error (500)', async () => {
        const error = await browser.evaluate(async () => {
            try {
                const { AppClient } = (window as any).api;
                const client = new AppClient();
                await client.error.testErrorCode(500);
            } catch (e) {
                const error = e as any;
                return JSON.stringify({
                    name: error.name,
                    message: error.message,
                    url: error.url,
                    status: error.status,
                    statusText: error.statusText,
                    body: error.body,
                });
            }
            return;
        });
        expect(error).toBe(
            JSON.stringify({
                name: 'ApiError',
                message: 'Custom message: Internal Server Error',
                url: 'http://localhost:3000/base/api/v1.0/error?status=500',
                status: 500,
                statusText: 'Internal Server Error',
                body: 'Internal Server Error',
            })
        );
    });

    it('should throw unknown error (409)', async () => {
        const error = await browser.evaluate(async () => {
            try {
                const { AppClient } = (window as any).api;
                const client = new AppClient();
                await client.error.testErrorCode(409);
            } catch (e) {
                const error = e as any;
                return JSON.stringify({
                    name: error.name,
                    message: error.message,
                    url: error.url,
                    status: error.status,
                    statusText: error.statusText,
                    body: error.body,
                });
            }
            return;
        });
        expect(error).toBe(
            JSON.stringify({
                name: 'ApiError',
                message: 'Generic Error',
                url: 'http://localhost:3000/base/api/v1.0/error?status=409',
                status: 409,
                statusText: 'Conflict',
                body: 'Conflict',
            })
        );
    });
});
