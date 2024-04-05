import * as module from './module';
import { toString } from './utils';

export default {
    export: {
        all: (...params: Parameters<typeof module.createExportAllDeclaration>): string =>
            toString(module.createExportAllDeclaration(...params)),
        named: (...params: Parameters<typeof module.createNamedExportDeclarations>): string =>
            toString(module.createNamedExportDeclarations(...params)),
    },
    import: {
        named: (...params: Parameters<typeof module.createNamedImportDeclarations>): string =>
            toString(module.createNamedImportDeclarations(...params)),
    },
};
