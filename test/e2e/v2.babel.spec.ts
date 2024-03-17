import browser from './scripts/browser';
import { cleanup } from './scripts/cleanup';
import { compileWithBabel } from './scripts/compileWithBabel';
import { copyAsset } from './scripts/copyAsset';
import { generateClient } from './scripts/generateClient';
import server from './scripts/server';

describe('v2.babel', () => {
    beforeAll(async () => {
        cleanup('v2/babel');
        await generateClient('v2/babel', 'v2', 'fetch', true);
        copyAsset('index.html', 'v2/babel/index.html');
        copyAsset('main.ts', 'v2/babel/main.ts');
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
            // @ts-ignore
            const { OpenAPI, SimpleService } = window.api;
            // @ts-ignore
            OpenAPI.TOKEN = window.tokenRequest;
            return await SimpleService.getCallWithoutParametersAndResponse();
        });
        // @ts-ignore
        expect(result.headers.authorization).toBe('Bearer MY_TOKEN');
    });

    it('supports complex params', async () => {
        const result = await browser.evaluate(async () => {
            // @ts-ignore
            const { ComplexService } = window.api;
            return await ComplexService.complexTypes({
                parameterObject: {
                    first: {
                        second: {
                            third: 'Hello World!',
                        },
                    },
                },
            });
        });
        expect(result).toBeDefined();
    });
});

describe('v2.babel useOptions', () => {
    beforeAll(async () => {
        cleanup('v2/babel');
        await generateClient('v2/babel', 'v2', 'fetch', true);
        copyAsset('index.html', 'v2/babel/index.html');
        copyAsset('main.ts', 'v2/babel/main.ts');
        compileWithBabel('v2/babel');
        await server.start('v2/babel');
        await browser.start();
    }, 30000);

    afterAll(async () => {
        await browser.stop();
        await server.stop();
    });

    it('returns result body by default', async () => {
        const result = await browser.evaluate(async () => {
            // @ts-ignore
            const { SimpleService } = window.api;
            return await SimpleService.getCallWithoutParametersAndResponse();
        });
        // @ts-ignore
        expect(result.body).toBeUndefined();
    });

    it('returns result body', async () => {
        const result = await browser.evaluate(async () => {
            // @ts-ignore
            const { SimpleService } = window.api;
            return await SimpleService.getCallWithoutParametersAndResponse({
                _result: 'body',
            });
        });
        // @ts-ignore
        expect(result.body).toBeUndefined();
    });

    it('returns raw result', async () => {
        const result = await browser.evaluate(async () => {
            // @ts-ignore
            const { SimpleService } = window.api;
            return await SimpleService.getCallWithoutParametersAndResponse({
                _result: 'raw',
            });
        });
        // @ts-ignore
        expect(result.body).not.toBeUndefined();
    });
});
