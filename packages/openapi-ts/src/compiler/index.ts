import { type PathOrFileDescriptor, writeFileSync } from 'node:fs';

import ts from 'typescript';

import * as module from './module';
import * as types from './types';
import { tsNodeToString } from './utils';

export class TypeScriptFile extends Array<ts.Node> {
    public write(file: PathOrFileDescriptor, seperator: string = '\n') {
        const items = this.map(i => tsNodeToString(i));
        writeFileSync(file, items.join(seperator));
    }
}

export default {
    export: {
        all: module.createExportAllDeclaration,
        asConst: module.createExportVariableAsConst,
        named: module.createNamedExportDeclarations,
    },
    import: {
        named: module.createNamedImportDeclarations,
    },
    types: {
        array: types.createArrayType,
        object: types.createObjectType,
    },
};
