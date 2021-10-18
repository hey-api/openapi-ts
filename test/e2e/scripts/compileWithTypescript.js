'use strict';

const ts = require('typescript');
const path = require('path');
const os = require('os');

function compileWithTypescript(dir) {
    const baseDir = `./test/e2e/generated/${dir}/`;
    const tsconfig = {
        compilerOptions: {
            target: 'es2017',
            module: 'es6',
            moduleResolution: 'node',
            lib: ['es6', 'es2017', 'dom'],
            declaration: false,
            declarationMap: false,
            sourceMap: false,
            noImplicitReturns: true,
            noImplicitThis: true,
            noImplicitAny: true,
            strict: true,
            strictNullChecks: true,
            strictFunctionTypes: true,
            allowSyntheticDefaultImports: true,
            skipLibCheck: true,
        },
        include: ['./index.ts'],
    };

    // Compile files to JavaScript (ES6 modules)
    const configFile = ts.parseConfigFileTextToJson('tsconfig.json', JSON.stringify(tsconfig));
    const configFileResult = ts.parseJsonConfigFileContent(configFile.config, ts.sys, path.resolve(process.cwd(), baseDir), undefined, 'tsconfig.json');
    const compilerHost = ts.createCompilerHost(configFileResult.options);
    const compiler = ts.createProgram(configFileResult.fileNames, configFileResult.options, compilerHost);
    const result = compiler.emit();

    // Show errors or warnings (if any)
    const diagnostics = ts.getPreEmitDiagnostics(compiler).concat(result.diagnostics);
    if (diagnostics.length) {
        const message = ts.formatDiagnosticsWithColorAndContext(diagnostics, {
            getCurrentDirectory: () => ts.sys.getCurrentDirectory(),
            getCanonicalFileName: f => f,
            getNewLine: () => os.EOL,
        });
        console.log(message);
    }
}

module.exports = compileWithTypescript;
