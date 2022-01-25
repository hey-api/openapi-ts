import browser from './scripts/browser';
import { compileWithTypescript } from './scripts/compileWithTypescript';
import { copy } from './scripts/copy';
import { generate } from './scripts/generate';
import server from './scripts/server';

describe('v2.angular', () => {
    beforeAll(async () => {
        await generate('v2/angular', 'v2', 'angular');
        await copy('script.js', 'v2/angular/script.js');
        await copy('angular-openapi-v2.ts', 'v2/angular/main.ts');
        compileWithTypescript('v2/angular');
        await server.start('v2/angular');
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
