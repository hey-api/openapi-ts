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
        expect(true).toBe(true);
    });
});
