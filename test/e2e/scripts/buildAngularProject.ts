import { sync } from 'cross-spawn';
import { resolve as resolvePath } from 'path';

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
            cwd: resolvePath(cwd),
            stdio: 'inherit',
        }
    );
};
