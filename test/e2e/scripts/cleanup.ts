import { rmSync } from 'fs';

export const cleanup = (dir: string) => {
    rmSync(`./test/e2e/generated/${dir}/`, {
        force: true,
        recursive: true,
    });
};
