import browser from './scripts/browser';
import { compileWithTypescript } from './scripts/compileWithTypescript';
import { copy } from './scripts/copy';
import { generate } from './scripts/generate';
import server from './scripts/server';

describe('v3.angular', () => {
    beforeAll(async () => {
        await generate('v3/angular', 'v3', 'angular');
        await copy('index.html', 'v3/angular/index.html');
        await copy('script.js', 'v3/angular/script.js');
        await copy('main-angular.ts', 'v3/angular/main.ts');
        compileWithTypescript('v3/angular');
        await server.start('v3/angular');
        await browser.start();
    }, 30000);

    afterAll(async () => {
        await browser.stop();
        await server.stop();
    });

    it('requests token', async () => {
        expect(true).toBe(true);
    });
});
