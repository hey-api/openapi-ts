import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { readFileSync } from 'fs';
import { precompile } from 'handlebars';
import { dirname, extname, resolve } from 'path';
import externals from 'rollup-plugin-node-externals';
import { terser } from 'rollup-plugin-terser';

/**
 * Custom plugin to parse handlebar imports and precompile
 * the template on the fly. This reduces runtime by about
 * half on large projects.
 */
const handlebarsPlugin = () => ({
    resolveId: (file, importer) => {
        if (extname(file) === '.hbs') {
            return resolve(dirname(importer), file);
        }
        return null;
    },
    load: file => {
        if (extname(file) === '.hbs') {
            const template = readFileSync(file, 'utf8').toString().trim();
            const templateSpec = precompile(template, {
                strict: true,
                noEscape: true,
                preventIndent: true,
                knownHelpersOnly: true,
                knownHelpers: {
                    equals: true,
                    notEquals: true,
                    containsSpaces: true,
                    union: true,
                    intersection: true,
                    enumerator: true,
                    escapeComment: true,
                    escapeDescription: true,
                    camelCase: true,
                },
            });
            return `export default ${templateSpec};`;
        }
        return null;
    },
});

const getPlugins = () => {
    const plugins = [
        externals({
            deps: true,
        }),
        nodeResolve(),
        commonjs({
            sourceMap: false,
        }),
        handlebarsPlugin(),
        typescript({
            module: 'esnext',
        }),
    ];
    if (process.env.NODE_ENV === 'development') {
        return plugins;
    }
    return [...plugins, terser()];
};

export default {
    input: './src/index.ts',
    output: {
        exports: 'named',
        file: './dist/index.js',
        format: 'cjs',
    },
    plugins: getPlugins(),
};
