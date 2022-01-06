import { copyFileSync } from 'fs';

export const copy = (dir: string) => {
    copyFileSync('./test/e2e/assets/script.js', `./test/e2e/generated/${dir}/script.js`);
};
