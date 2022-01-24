import { compileWithTypescript } from './scripts/compileWithTypescript';
import { generate } from './scripts/generate';
import server from './scripts/server';

describe('v2.node', () => {
    beforeAll(async () => {
        await generate('v2/node', 'v2', 'node');
        compileWithTypescript('v2/node');
        await server.start('v2/node');
    }, 30000);

    afterAll(async () => {
        await server.stop();
    });

    it('requests token', async () => {
        const { OpenAPI, SimpleService } = require('./generated/v2/node/index.js');
        const tokenRequest = jest.fn().mockResolvedValue('MY_TOKEN');
        OpenAPI.TOKEN = tokenRequest;
        const result = await SimpleService.getCallWithoutParametersAndResponse();
        expect(tokenRequest.mock.calls.length).toBe(1);
        expect(result.headers.authorization).toBe('Bearer MY_TOKEN');
    });

    it('supports complex params', async () => {
        const { ComplexService } = require('./generated/v2/node/index.js');
        const result = await ComplexService.complexTypes({
            first: {
                second: {
                    third: 'Hello World!',
                },
            },
        });
        expect(result).toBeDefined();
    });

    it('can abort the request', async () => {
        let error;
        try {
            const { SimpleService } = require('./generated/v2/node/index.js');
            const promise = SimpleService.getCallWithoutParametersAndResponse();
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
            const { ErrorService } = require('./generated/v2/node/index.js');
            await ErrorService.testErrorCode(500);
        } catch (e) {
            const err = e as any;
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
                body: 'Internal Server Error',
            })
        );
    });

    it('should throw unknown error (409)', async () => {
        let error;
        try {
            const { ErrorService } = require('./generated/v2/node/index.js');
            await ErrorService.testErrorCode(409);
        } catch (e) {
            const err = e as any;
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
                message: 'Generic Error',
                url: 'http://localhost:3000/base/api/v1.0/error?status=409',
                status: 409,
                statusText: 'Conflict',
                body: 'Conflict',
            })
        );
    });
});
