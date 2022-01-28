import browser from './scripts/browser';
import { cleanup } from './scripts/cleanup';
import { compileWithBabel } from './scripts/compileWithBabel';
import { copyAsset } from './scripts/copyAsset';
import { generateClient } from './scripts/generateClient';
import server from './scripts/server';

describe('v2.babel', () => {
    beforeAll(async () => {
        cleanup('v2/babel');
        await generateClient('v2/babel', 'v2', 'fetch', true, true);
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
            const { OpenAPI, SimpleService } = (window as any).api;
            OpenAPI.TOKEN = (window as any).tokenRequest;
            return await SimpleService.getCallWithoutParametersAndResponse();
        });
        expect(result.headers.authorization).toBe('Bearer MY_TOKEN');
    });

    it('supports complex params', async () => {
        const result = await browser.evaluate(async () => {
            const { ComplexService } = (window as any).api;
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
