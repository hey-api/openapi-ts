import { type PathOrFileDescriptor, writeFileSync } from 'node:fs';

import ts from 'typescript';

import * as module from './module';
import * as types from './types';
import { tsNodeToString } from './utils';

export type { Comments } from './utils';
export type { Node } from 'typescript';

export class TypeScriptFile {
    private _imports: Array<ts.Node> = [];
    private _items: Array<ts.Node | string> = [];

    public addNamedImport(...params: Parameters<typeof module.createNamedImportDeclarations>): void {
        this._imports.push(compiler.import.named(...params));
    }

    public add(...nodes: Array<ts.Node | string>): void {
        this._items.push(...nodes);
    }

    public toString(seperator: string = '\n') {
        const values: string[] = [];
        if (this._imports.length) {
            values.push(this._imports.map(v => tsNodeToString(v)).join('\n'));
        }
        values.push(...this._items.map(v => (typeof v === 'string' ? v : tsNodeToString(v))))
        return values.join(seperator);
    }

    public write(file: PathOrFileDescriptor, seperator: string = '\n') {
        if (!this._items.length) {
            return;
        }
        writeFileSync(file, this.toString(seperator));
    }
}

export const compiler = {
    export: {
        all: module.createExportAllDeclaration,
        asConst: module.createExportVariableAsConst,
        named: module.createNamedExportDeclarations,
    },
    import: {
        named: module.createNamedImportDeclarations,
    },
    typedef: {
        alias: types.createTypeAliasDeclaration,
    },
    types: {
        array: types.createArrayType,
        enum: types.createEnumDeclaration,
        object: types.createObjectType,
    },
};
