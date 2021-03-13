'use strict';

const generate = require('./scripts/generate');
const compileWithTypescript = require('./scripts/compileWithTypescript');
const server = require('./scripts/server');

describe('v3.node', () => {

    beforeAll(async () => {
        await generate('v3/node', 'v3', 'node');
        compileWithTypescript('v3/node');
        await server.start('v3/node');
    }, 30000);

    afterAll(async () => {
        await server.stop();
    });

    it('requests token', async () => {
        const { OpenAPI, SimpleService } = require('./generated/v3/node/index.js');
        const tokenRequest = jest.fn().mockResolvedValue('MY_TOKEN')
        OpenAPI.TOKEN = tokenRequest;
        OpenAPI.USERNAME = undefined;
        OpenAPI.PASSWORD = undefined;
        const result = await SimpleService.getCallWithoutParametersAndResponse();
        expect(tokenRequest.mock.calls.length).toBe(1);
        expect(result.headers.authorization).toBe('Bearer MY_TOKEN');
    });

    it('uses credentials', async () => {
        const { OpenAPI, SimpleService } = require('./generated/v3/node/index.js');
        OpenAPI.TOKEN = undefined;
        OpenAPI.USERNAME = 'username';
        OpenAPI.PASSWORD = 'password';
        const result = await SimpleService.getCallWithoutParametersAndResponse();
        expect(result.headers.authorization).toBe('Basic dXNlcm5hbWU6cGFzc3dvcmQ=');
    });

    it('complexService', async () => {
        const { ComplexService } = require('./generated/v3/node/index.js');
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
        const { SimpleService } = require('./generated/v3/node/index.js');
        const promise = await SimpleService.getCallWithoutParametersAndResponse();
        setTimeout(() => {
            promise.cancel();
        }, 10);
        const result = await promise;
        expect(result).toBeDefined();
    });

});
