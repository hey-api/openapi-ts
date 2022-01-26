import { spawn } from 'cross-spawn';
import { resolve as resolvePath } from 'path';

export const createAngularProject = async (dir: string) => {
    return new Promise<void>((resolve, reject) => {
        const child = spawn('ng', [
            'new',
            'test',
            '--minimal true',
            '--style css',
            '--inline-style true',
            '--inline-template true',
            '--routing false',
            '--skip-install true',
            '--skip-tests true',
            '--commit false',
            '--force',
        ], {
            cwd: resolvePath(dir)
        });

        child.stdout.on('data', console.log);
        child.stderr.on('data', console.error);

        child.on('exit', code => {
            if (code !== 0) {
                reject(code);
            } else {
                resolve();
            }
        });
    });
};
