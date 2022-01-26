import browser from './scripts/browser';
import { compileWithTypescript } from './scripts/compileWithTypescript';
import { copy } from './scripts/copy';
import { generate } from './scripts/generate';
import server from './scripts/server';
import {createAngularProject} from "./scripts/createAngularProject";

describe('v2.angular', () => {
    beforeAll(async () => {
        await generate('v2/angular', 'v2', 'angular');
        // await copy('index.html', 'v2/angular/index.html');
        // await copy('main-angular.ts', 'v2/angular/main.ts');
        // compileWithTypescript('v2/angular');
        await createAngularProject('v2/angular/');
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
