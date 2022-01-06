import { transformSync } from '@babel/core';
import { readFileSync, writeFileSync } from 'fs';
import { sync } from 'glob';

export const compileWithBabel = (dir: string) => {
    sync(`./test/e2e/generated/${dir}/**/*.ts`).forEach(file => {
        try {
            const content = readFileSync(file, 'utf8').toString();
            const result = transformSync(content, {
                filename: file,
                presets: [
                    [
                        '@babel/preset-env',
                        {
                            modules: false,
                            targets: {
                                node: true,
                            },
                        },
                    ],
                    [
                        '@babel/preset-typescript',
                        {
                            onlyRemoveTypeImports: true,
                        },
                    ],
                ],
            });
            if (result?.code) {
                const out = file.replace(/\.ts$/, '.js');
                writeFileSync(out, result.code);
            }
        } catch (error) {
            console.error(error);
        }
    });
};
