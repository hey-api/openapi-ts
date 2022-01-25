import { copyFileSync } from 'fs';

export const copy = (fileNameIn: string, fileNameOut: string) => {
    copyFileSync(`./test/e2e/assets/${fileNameIn}`, `./test/e2e/generated/${fileNameOut}`);
};
