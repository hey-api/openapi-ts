import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import type { RollupOptions } from 'rollup';
import { defineConfig } from 'rollup';

import { handlebarsPlugin } from './handlebars';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url)).toString());

function createConfig(isProduction: boolean) {
    return defineConfig({
        external: [...Object.keys(pkg.dependencies)],
        input: path.resolve(__dirname, 'src/index.ts'),
        output: {
            file: path.resolve(__dirname, 'dist/index.js'),
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
