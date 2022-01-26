import browser from './scripts/browser';
import { compileWithBabel } from './scripts/compileWithBabel';
import { copy } from './scripts/copy';
import { generate } from './scripts/generate';
import server from './scripts/server';

describe('v3.babel', () => {
    beforeAll(async () => {
        await generate('client/babel', 'v3', 'fetch', true, true, 'AppClient');
        await copy('index.html', 'client/babel/index.html');
        await copy('main.ts', 'client/babel/main.ts');
        compileWithBabel('client/babel');
        await server.start('client/babel');
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
});
