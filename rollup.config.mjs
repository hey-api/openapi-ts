import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import { readFileSync } from 'fs';
import handlebars from 'handlebars';
import { dirname, extname, resolve } from 'path';

const { precompile } = handlebars;

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
                    useDateType: true,
                },
            });
            return `export default ${templateSpec};`;
        }
        return null;
    },
});

const getPlugins = () => {
    const plugins = [
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
    external: ['camelcase', 'commander', 'fs-extra', 'handlebars', '@apidevtools/json-schema-ref-parser'],
    plugins: getPlugins(),
};
