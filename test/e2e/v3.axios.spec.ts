import { cleanup } from './scripts/cleanup';
import { compileWithTypescript } from './scripts/compileWithTypescript';
import { generateClient } from './scripts/generateClient';
import server from './scripts/server';

describe('v3.axios', () => {
    beforeAll(async () => {
        cleanup('v3/axios');
        await generateClient('v3/axios', 'v3', 'axios');
        compileWithTypescript('v3/axios');
        await server.start('v3/axios');
    }, 30000);

    afterAll(async () => {
        await server.stop();
    });

    it('requests token', async () => {
        const { OpenAPI, SimpleService } = require('./generated/v3/axios/index.js');
        const tokenRequest = jest.fn().mockResolvedValue('MY_TOKEN');
        OpenAPI.TOKEN = tokenRequest;
        OpenAPI.USERNAME = undefined;
        OpenAPI.PASSWORD = undefined;
        const result = await SimpleService.getCallWithoutParametersAndResponse();
        expect(tokenRequest.mock.calls.length).toBe(1);
        expect(result.headers.authorization).toBe('Bearer MY_TOKEN');
    });

    it('uses credentials', async () => {
        const { OpenAPI, SimpleService } = require('./generated/v3/axios/index.js');
        OpenAPI.TOKEN = undefined;
        OpenAPI.USERNAME = 'username';
        OpenAPI.PASSWORD = 'password';
        const result = await SimpleService.getCallWithoutParametersAndResponse();
        expect(result.headers.authorization).toBe('Basic dXNlcm5hbWU6cGFzc3dvcmQ=');
    });

    it('supports complex params', async () => {
        const { ComplexService } = require('./generated/v3/axios/index.js');
        const result = await ComplexService.complexTypes({
            first: {
                second: {
                    third: 'Hello World!',
                },
            },
        });
        expect(result).toBeDefined();
    });

    it('supports form data', async () => {
        const { ParametersService } = require('./generated/v3/axios/index.js');
        const result = await ParametersService.callWithParameters(
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
            const { SimpleService } = require('./generated/v3/axios/index.js');
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
            const { ErrorService } = require('./generated/v3/axios/index.js');
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
            const { ErrorService } = require('./generated/v3/axios/index.js');
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

    it('it should parse query params', async () => {
        const { ParametersService } = require('./generated/v3/axios/index.js');
        const result = (await ParametersService.postCallWithOptionalParam({
            page: 0,
            size: 1,
            sort: ['location'],
        })) as Promise<any>;
        expect((result as any).query).toStrictEqual({ parameter: { page: '0', size: '1', sort: 'location' } });
    });
});

describe('v3.axios serviceResponse.body', () => {
    beforeAll(async () => {
        cleanup('v3/axios_body');
        await generateClient('v3/axios_body', 'v3', undefined, undefined, undefined, undefined, {
            input: '',
            output: '',
            httpClient: 'axios',
            serviceResponse: 'body',
            useOptions: true,
        });
        compileWithTypescript('v3/axios_body');
        await server.start('v3/axios_body');
    }, 30000);

    afterAll(async () => {
        await server.stop();
    });

    it('returns response body by default', async () => {
        const { SimpleService } = require('./generated/v3/axios_body/index.js');
        const result = await SimpleService.getCallWithoutParametersAndResponse();
        expect(result.body).toBeUndefined();
    });
});

describe('v3.axios serviceResponse.generics', () => {
    beforeAll(async () => {
        cleanup('v3/axios_generics');
        await generateClient('v3/axios_generics', 'v3', undefined, undefined, undefined, undefined, {
            input: '',
            output: '',
            httpClient: 'axios',
            serviceResponse: 'generics',
            useOptions: true,
        });
        compileWithTypescript('v3/axios_generics');
        await server.start('v3/axios_generics');
    }, 30000);

    afterAll(async () => {
        await server.stop();
    });

    it('returns response body by default', async () => {
        const { SimpleService } = require('./generated/v3/axios_generics/index.js');
        const result = await SimpleService.getCallWithoutParametersAndResponse();
        expect(result.body).toBeUndefined();
    });

    it('returns response body', async () => {
        const { SimpleService } = require('./generated/v3/axios_generics/index.js');
        const result = await SimpleService.getCallWithoutParametersAndResponse({
            _result: 'body',
        });
        expect(result.body).toBeUndefined();
    });

    it('returns response', async () => {
        const { SimpleService } = require('./generated/v3/axios_generics/index.js');
        const result = await SimpleService.getCallWithoutParametersAndResponse({
            _result: 'raw',
        });
        expect(result.body).not.toBeUndefined();
    });
});

describe('v3.axios serviceResponse.response', () => {
    beforeAll(async () => {
        cleanup('v3/axios_response');
        await generateClient('v3/axios_response', 'v3', undefined, undefined, undefined, undefined, {
            input: '',
            output: '',
            httpClient: 'axios',
            serviceResponse: 'response',
            useOptions: true,
        });
        compileWithTypescript('v3/axios_response');
        await server.start('v3/axios_response');
    }, 30000);

    afterAll(async () => {
        await server.stop();
    });

    it('returns response by default', async () => {
        const { SimpleService } = require('./generated/v3/axios_response/index.js');
        const result = await SimpleService.getCallWithoutParametersAndResponse();
        expect(result.body).not.toBeUndefined();
    });

    it('returns headers in response', async () => {
        const { HeaderService } = require('./generated/v3/axios_response/index.js');
        const result = await HeaderService.getCallWithHeadersAndContent({ foo: 'foo' });
        expect(result.headers['x-expires-after']).toStrictEqual('Wed, 14 Jun 2017 07:00:00 GMT');
        expect(result.headers['x-rate-limit']).toStrictEqual('10');
    });
});
