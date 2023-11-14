import browser from './scripts/browser';
import { buildAngularProject } from './scripts/buildAngularProject';
import { cleanup } from './scripts/cleanup';
import { copyAsset } from './scripts/copyAsset';
import { createAngularProject } from './scripts/createAngularProject';
import { generateClient } from './scripts/generateClient';
import server from './scripts/server';

describe('client.angular', () => {
    beforeAll(async () => {
        cleanup('client/angular');
        createAngularProject('client/angular', 'app');
        await generateClient('client/angular/app/src', 'v3', 'angular', false, false, 'ApiModule');
        copyAsset('main-angular-module.ts', 'client/angular/app/src/main.ts');
        buildAngularProject('client/angular', 'app', 'dist');
        await server.start('client/angular/app/dist/browser');
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
                const { SimpleService } = (window as any).api;
                SimpleService.httpRequest.config.TOKEN = (window as any).tokenRequest;
                SimpleService.httpRequest.config.USERNAME = undefined;
                SimpleService.httpRequest.config.PASSWORD = undefined;
                SimpleService.getCallWithoutParametersAndResponse().subscribe(resolve);
            });
        });
        expect(result.headers.authorization).toBe('Bearer MY_TOKEN');
    });

    it('uses credentials', async () => {
        const result = await browser.evaluate(async () => {
            return await new Promise<any>(resolve => {
                const { SimpleService } = (window as any).api;
                SimpleService.httpRequest.config.TOKEN = undefined;
                SimpleService.httpRequest.config.USERNAME = 'username';
                SimpleService.httpRequest.config.PASSWORD = 'password';
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

    it('should throw known error (500)', async () => {
        const error = await browser.evaluate(async () => {
            return await new Promise<any>(resolve => {
                const { ErrorService } = (window as any).api;
                ErrorService.testErrorCode(500).subscribe({
                    error: (e: any) => {
                        resolve(
                            JSON.stringify({
                                name: e.name,
                                message: e.message,
                                url: e.url,
                                status: e.status,
                                statusText: e.statusText,
                                body: e.body,
                            })
                        );
                    },
                });
            });
        });
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
        const error = await browser.evaluate(async () => {
            return await new Promise<any>(resolve => {
                const { ErrorService } = (window as any).api;
                ErrorService.testErrorCode(409).subscribe({
                    error: (e: any) => {
                        resolve(
                            JSON.stringify({
                                name: e.name,
                                message: e.message,
                                url: e.url,
                                status: e.status,
                                statusText: e.statusText,
                                body: e.body,
                            })
                        );
                    },
                });
            });
        });

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
});
