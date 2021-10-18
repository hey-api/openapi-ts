'use strict';

const generate = require('./scripts/generate');
const copy = require('./scripts/copy');
const compileWithTypescript = require('./scripts/compileWithTypescript');
const server = require('./scripts/server');
const browser = require('./scripts/browser');

describe('v2.xhr', () => {
    beforeAll(async () => {
        await generate('v2/xhr', 'v2', 'xhr');
        await copy('v2/xhr');
        compileWithTypescript('v2/xhr');
        await server.start('v2/xhr');
        await browser.start();
    }, 30000);

    afterAll(async () => {
        await browser.stop();
        await server.stop();
    });

    it('requests token', async () => {
        await browser.exposeFunction('tokenRequest', jest.fn().mockResolvedValue('MY_TOKEN'));
        const result = await browser.evaluate(async () => {
            const { OpenAPI, SimpleService } = window.api;
            OpenAPI.TOKEN = window.tokenRequest;
            return await SimpleService.getCallWithoutParametersAndResponse();
        });
        expect(result.headers.authorization).toBe('Bearer MY_TOKEN');
    });

    it('complexService', async () => {
        const result = await browser.evaluate(async () => {
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

    it('can abort the request', async () => {
        try {
            await browser.evaluate(async () => {
                const { SimpleService } = window.api;
                const promise = SimpleService.getCallWithoutParametersAndResponse();
                setTimeout(() => {
                    promise.cancel();
                }, 10);
                await promise;
            });
        } catch (e) {
            expect(e.message).toContain('The user aborted a request.');
        }
    });
});
