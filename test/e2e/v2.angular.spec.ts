// import browser from './scripts/browser';
// import { compileWithTypescript } from './scripts/compileWithTypescript';
import browser from './scripts/browser';
import { buildAngularProject } from './scripts/buildAngularProject';
import { cleanup } from './scripts/cleanup';
import { copyAsset } from './scripts/copyAsset';
import { createAngularProject } from './scripts/createAngularProject';
import { generateClient } from './scripts/generateClient';
import server from './scripts/server';

describe('v2.angular', () => {
    beforeAll(async () => {
        cleanup('v2/angular');
        createAngularProject('v2/angular', 'app');
        await generateClient('v2/angular/app/src', 'v2', 'angular');
        copyAsset('main-angular.ts', 'v2/angular/app/src/main.ts');
        buildAngularProject('v2/angular', 'app', 'dist');
        await server.start('v2/angular/app/dist');
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
                SimpleService.getCallWithoutParametersAndResponse().subscribe(resolve);
            });
        });
        expect(result.headers.authorization).toBe('Bearer MY_TOKEN');
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

    it('should throw known error (500)', async () => {
        const error = await browser.evaluate(async () => {
            try {
                await new Promise<any>((resolve, reject) => {
                    const { ErrorService } = (window as any).api;
                    ErrorService.testErrorCode(500).subscribe(resolve, reject);
                });
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
                await new Promise<any>((resolve, reject) => {
                    const { ErrorService } = (window as any).api;
                    ErrorService.testErrorCode(409).subscribe(resolve, reject);
                });
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
