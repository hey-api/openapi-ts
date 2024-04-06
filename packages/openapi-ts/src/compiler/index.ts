import { type PathOrFileDescriptor, writeFileSync } from 'node:fs';

import ts from 'typescript';

import * as module from './module';
import * as types from './types';
import { tsNodeToString } from './utils';

export class TypeScriptFile extends Array<ts.Node> {
    public override toString(seperator: string = '\n') {
        return this.map(v => tsNodeToString(v)).join(seperator);
    }

    public write(file: PathOrFileDescriptor, seperator: string = '\n') {
        writeFileSync(file, this.toString(seperator));
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
