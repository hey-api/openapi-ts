import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import handlebars from 'handlebars';
import type { Plugin, RollupOptions } from 'rollup';
import { defineConfig } from 'rollup';

/**
 * Custom plugin to parse handlebar imports and precompile
 * the template on the fly. This reduces runtime by about
 * half on large projects.
 */
function handlebarsPlugin(): Plugin {
    return {
        name: 'handlebars',
        resolveId: (file: any, importer: any) => {
            if (path.extname(file) === '.hbs') {
                return path.resolve(path.dirname(importer), file);
            }
            return null;
        },
        load: (file: any) => {
            if (path.extname(file) === '.hbs') {
                const template = readFileSync(file, 'utf8').toString().trim();
                const templateSpec = handlebars.precompile(template, {
                    knownHelpers: {
                        camelCase: true,
                        dataParameters: true,
                        debugThis: true,
                        enumKey: true,
                        enumName: true,
                        enumUnionType: true,
                        enumValue: true,
                        equals: true,
                        escapeComment: true,
                        escapeDescription: true,
                        escapeNewline: true,
                        exactArray: true,
                        ifdef: true,
                        ifOperationDataOptional: true,
                        intersection: true,
                        modelImports: true,
                        modelsExports: true,
                        modelUnionType: true,
                        nameOperationDataType: true,
                        notEquals: true,
                        operationDataType: true,
                        useDateType: true,
                    },
                    knownHelpersOnly: true,
                    noEscape: true,
                    preventIndent: true,
                    strict: true,
                });
                return `export default ${templateSpec};`;
            }
            return null;
        },
    };
}

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url)).toString());

function createConfig(isProduction: boolean) {
    return defineConfig({
        external: [...Object.keys(pkg.dependencies)],
        input: path.resolve(__dirname, 'src/node/index.ts'),
        output: {
            file: path.resolve(__dirname, 'dist/node/index.js'),
            format: 'esm',
        },
        plugins: [
            nodeResolve({ preferBuiltins: true }),
            typescript({
                declaration: false,
                tsconfig: path.resolve(__dirname, 'src/node/tsconfig.json'),
            }),
            commonjs({
                extensions: ['.js'],
                sourceMap: false,
            }),
            json(),
            handlebarsPlugin(),
            isProduction && terser(),
        ],
    });
}

export default (commandLineArgs: any): RollupOptions[] => {
    const isDev = commandLineArgs.watch;
    const isProduction = !isDev;
    return defineConfig([createConfig(isProduction)]);
};
