import { type PathOrFileDescriptor, writeFileSync } from 'node:fs';

import ts from 'typescript';

import * as module from './module';
import { tsNodeToString } from './utils';

export class TypeScriptFile extends Array<ts.Node> {
    public write(file: PathOrFileDescriptor) {
        const items = this.map(i => tsNodeToString(i));
        writeFileSync(file, items.join('\n'));
    }
}

export default {
    export: {
        all: module.createExportAllDeclaration,
        named: module.createNamedExportDeclarations,
    },
    import: {
        named: module.createNamedImportDeclarations,
    },
};
