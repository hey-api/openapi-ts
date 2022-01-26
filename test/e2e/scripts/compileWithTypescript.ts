import { EOL } from 'os';
import { resolve } from 'path';
import {
    createCompilerHost,
    createProgram,
    formatDiagnosticsWithColorAndContext,
    getPreEmitDiagnostics,
    parseConfigFileTextToJson,
    parseJsonConfigFileContent,
    sys,
} from 'typescript';

export const compileWithTypescript = (dir: string) => {
    const cwd = `./test/e2e/generated/${dir}/`;
    const tsconfig = {
        compilerOptions: {
            target: 'es2020',
            module: 'es2020',
            moduleResolution: 'node',
            lib: ['es2020', 'dom'],
            declaration: false,
            declarationMap: false,
            sourceMap: false,
            noImplicitReturns: true,
            noImplicitThis: true,
            noImplicitAny: true,
            strict: true,
            skipLibCheck: true,
            allowSyntheticDefaultImports: true,
            experimentalDecorators: true,
        },
        include: ['**/*.ts'],
    };

    // Compile files to JavaScript (ES6 modules)
    const configFile = parseConfigFileTextToJson('tsconfig.json', JSON.stringify(tsconfig));
    const configFileResult = parseJsonConfigFileContent(
        configFile.config,
        sys,
        resolve(process.cwd(), cwd),
        undefined,
        'tsconfig.json'
    );
    const compilerHost = createCompilerHost(configFileResult.options);
    const compiler = createProgram(configFileResult.fileNames, configFileResult.options, compilerHost);
    const result = compiler.emit();

    // Show errors or warnings (if any)
    const diagnostics = getPreEmitDiagnostics(compiler).concat(result.diagnostics);
    if (diagnostics.length) {
        const message = formatDiagnosticsWithColorAndContext(diagnostics, {
            getCurrentDirectory: () => sys.getCurrentDirectory(),
            getCanonicalFileName: f => f,
            getNewLine: () => EOL,
        });
        console.log(message);
    }
};
