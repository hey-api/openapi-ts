'use strict';

const generate = require('./scripts/generate');
const copy = require('./scripts/copy');
const compileWithBabel = require('./scripts/compileWithBabel');
const server = require('./scripts/server');
const browser = require('./scripts/browser');

describe('v2.babel', () => {
    beforeAll(async () => {
        await generate('v2/babel', 'v2', 'fetch', true, true);
        await copy('v2/babel');
        compileWithBabel('v2/babel');
        await server.start('v2/babel');
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

    it('supports complex params', async () => {
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
});
