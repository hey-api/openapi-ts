'use strict';

const glob = require('glob');
const fs = require('fs');
const babel = require('@babel/core');

function compileWithBabel(dir) {
    glob.sync(`./test/e2e/generated/${dir}/**/*.ts`).forEach(file => {
        try {
            const content = fs.readFileSync(file, 'utf8').toString();
            const result = babel.transformSync(content, {
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
            const out = file.replace(/\.ts$/, '.js');
            fs.writeFileSync(out, result.code);
        } catch (error) {
            console.error(error);
        }
    });
}

module.exports = compileWithBabel;
