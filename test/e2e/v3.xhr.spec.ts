import browser from './scripts/browser';
import { compileWithTypescript } from './scripts/compileWithTypescript';
import { copy } from './scripts/copy';
import { generate } from './scripts/generate';
import server from './scripts/server';

describe('v3.xhr', () => {
    beforeAll(async () => {
        await generate('v3/xhr', 'v3', 'xhr');
        await copy('v3/xhr');
        compileWithTypescript('v3/xhr');
        await server.start('v3/xhr');
        await browser.start();
    }, 30000);

    afterAll(async () => {
        await browser.stop();
        await server.stop();
    });

    it('requests token', async () => {
        await browser.exposeFunction('tokenRequest', jest.fn().mockResolvedValue('MY_TOKEN'));
        const result = await browser.evaluate(async () => {
            const { OpenAPI, SimpleService } = (window as any).api;
            OpenAPI.TOKEN = (window as any).tokenRequest;
            OpenAPI.USERNAME = undefined;
            OpenAPI.PASSWORD = undefined;
            return await SimpleService.getCallWithoutParametersAndResponse();
        });
        expect(result.headers.authorization).toBe('Bearer MY_TOKEN');
    });

    it('uses credentials', async () => {
        const result = await browser.evaluate(async () => {
            const { OpenAPI, SimpleService } = (window as any).api;
            OpenAPI.TOKEN = undefined;
            OpenAPI.USERNAME = 'username';
            OpenAPI.PASSWORD = 'password';
            return await SimpleService.getCallWithoutParametersAndResponse();
        });
        expect(result.headers.authorization).toBe('Basic dXNlcm5hbWU6cGFzc3dvcmQ=');
    });

    it('supports complex params', async () => {
        const result = await browser.evaluate(async () => {
            const { ComplexService } = (window as any).api;
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

    it('can abort the request', async () => {
        try {
            await browser.evaluate(async () => {
                const { SimpleService } = (window as any).api;
                const promise = SimpleService.getCallWithoutParametersAndResponse();
                setTimeout(() => {
                    promise.cancel();
                }, 10);
                await promise;
            });
        } catch (e) {
            expect((e as Error).message).toContain('The user aborted a request.');
        }
    });

    it('should throw known error (500)', async () => {
        const error = await browser.evaluate(async () => {
            try {
                const { ErrorService } = (window as any).api;
                await ErrorService.testErrorCode(500);
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
                const { ErrorService } = (window as any).api;
                await ErrorService.testErrorCode(409);
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
