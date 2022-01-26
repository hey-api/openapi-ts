import browser from './scripts/browser';
import { buildAngularProject } from './scripts/buildAngularProject';
import { cleanup } from './scripts/cleanup';
import { copyAsset } from './scripts/copyAsset';
import { createAngularProject } from './scripts/createAngularProject';
import { generateClient } from './scripts/generateClient';
import server from './scripts/server';

describe('v3.angular', () => {
    beforeAll(async () => {
        cleanup('v3/angular');
        createAngularProject('v3/angular', 'app');
        await generateClient('v3/angular/app/src', 'v3', 'angular');
        copyAsset('main-angular.ts', 'v3/angular/app/src/main.ts');
        buildAngularProject('v3/angular', 'app', 'dist');
        await server.start('v2/angular/dist');
        await browser.start();
    }, 30000);

    afterAll(async () => {
        await browser.stop();
        await server.stop();
    });

    it('requests token', async () => {
        await browser.exposeFunction('tokenRequest', jest.fn().mockResolvedValue('MY_TOKEN'));
        const result = await browser.evaluate(async () => {
            return await new Promise<any>(resolve => {
                const { OpenAPI, SimpleService } = (window as any).api;
                OpenAPI.TOKEN = (window as any).tokenRequest;
                OpenAPI.USERNAME = undefined;
                OpenAPI.PASSWORD = undefined;
                SimpleService.getCallWithoutParametersAndResponse().subscribe(resolve);
            });
        });
        expect(result.headers.authorization).toBe('Bearer MY_TOKEN');
    });

    it('uses credentials', async () => {
        const result = await browser.evaluate(async () => {
            return await new Promise<any>(resolve => {
                const { OpenAPI, SimpleService } = (window as any).api;
                OpenAPI.TOKEN = undefined;
                OpenAPI.USERNAME = 'username';
                OpenAPI.PASSWORD = 'password';
                SimpleService.getCallWithoutParametersAndResponse().subscribe(resolve);
            });
        });
        expect(result.headers.authorization).toBe('Basic dXNlcm5hbWU6cGFzc3dvcmQ=');
    });

    it('supports complex params', async () => {
        const result = await browser.evaluate(async () => {
            return await new Promise<any>(resolve => {
                const { ComplexService } = (window as any).api;
                ComplexService.complexTypes({
                    first: {
                        second: {
                            third: 'Hello World!',
                        },
                    },
                }).subscribe(resolve);
            });
        });
        expect(result).toBeDefined();
    });

    it('support form data', async () => {
        const result = await browser.evaluate(async () => {
            return await new Promise<any>(resolve => {
                const { ParametersService } = (window as any).api;
                ParametersService.callWithParameters(
                    'valueHeader',
                    'valueQuery',
                    'valueForm',
                    'valueCookie',
                    'valuePath',
                    {
                        prop: 'valueBody',
                    }
                ).subscribe(resolve);
            });
        });
        expect(result).toBeDefined();
    });
});
