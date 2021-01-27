'use strict';

const commonjs = require('@rollup/plugin-commonjs');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const { terser } = require('rollup-plugin-terser');
const typescript = require('rollup-plugin-typescript2');
const handlebars = require('handlebars');
const path = require('path');
const fs = require('fs');

const pkg = require('./package.json');
const external = Object.keys(pkg.dependencies);

/**
 * Custom plugin to parse handlebar imports and precompile
 * the template on the fly. This reduces runtime by about
 * half on large projects.
 */
const handlebarsPlugin = () => ({
    resolveId: (file, importer) => {
        if (path.extname(file) === '.hbs') {
            return path.resolve(path.dirname(importer), file);
        }
        return null;
    },
    load: (file) => {
        if (path.extname(file) === '.hbs') {
            const template = fs.readFileSync(file, 'utf8').toString().trim();
            const templateSpec = handlebars.precompile(template, {
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
                },
            });
            return `export default ${templateSpec};`;
        }
        return null;
    }
});

const getPlugins = () => {
    const plugins = [
        handlebarsPlugin(),
        typescript(),
        nodeResolve(),
        commonjs(),
    ]
    if (process.env.NODE_ENV === 'development') {
        return plugins;
    }
    return [...plugins, terser()];
}

module.exports = {
    input: './src/index.ts',
    output: {
        file: './dist/index.js',
        format: 'cjs',
    },
    external: [
        'fs',
        'os',
        'util',
        'path',
        'http',
        'https',
        'handlebars/runtime',
        ...external,
    ],
    plugins: getPlugins(),
};
