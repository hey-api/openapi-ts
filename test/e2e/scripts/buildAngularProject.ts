import path from 'node:path';

import { sync } from 'cross-spawn';

export const buildAngularProject = (dir: string, name: string, output: string) => {
    const cwd = `./test/e2e/generated/${dir}/${name}/`;
    sync(
        'ng',
        [
            'build',
            '--output-path',
            output,
            '--optimization',
            'false',
            '--configuration',
            'development',
            '--source-map',
            'false',
        ],
        {
            cwd: path.resolve(cwd),
            stdio: 'inherit',
        }
    );
};
