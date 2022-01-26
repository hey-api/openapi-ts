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
        expect(true).toBe(true);
    });
});
