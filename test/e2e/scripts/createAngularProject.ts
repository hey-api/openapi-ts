import { sync } from 'cross-spawn';
import { mkdirSync, rmSync } from 'fs';
import { resolve as resolvePath } from 'path';

export const createAngularProject = (dir: string, name: string) => {
    const cwd = `./test/e2e/generated/${dir}/`;
    mkdirSync(cwd, {
        recursive: true,
    });
    sync(
        'ng',
        [
            'new',
            name,
            '--minimal',
            'true',
            '--style',
            'css',
            '--inline-style',
            'true',
            '--inline-template',
            'true',
            '--routing',
            'false',
            '--ssr',
            'false',
            '--skip-tests',
            'true',
            '--skip-install',
            'true',
            '--skip-git',
            'true',
            '--commit',
            'false',
            '--force',
        ],
        {
            cwd: resolvePath(cwd),
            stdio: 'inherit',
        }
    );
    rmSync(`${cwd}/${name}/src/app/`, {
        recursive: true,
    });
};
