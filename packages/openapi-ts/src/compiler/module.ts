import ts from 'typescript';

import { CONFIG } from './utils';

/**
 * Create export all declaration. Example: `export * from './y'`
 * @param module - module to export from.
 * @returns ts.ExportDeclaration
 */
export const createExportAllDeclaration = (module: string) =>
    ts.factory.createExportDeclaration(
        undefined,
        false,
        undefined,
        ts.factory.createStringLiteral(encodeURIComponent(module))
    );

type ImportItem = { name: string; isTypeOnly?: boolean } | string;

/**
 * Create a named export declaration. Example: `export { X } from './y'`.
 * @param items - the items to export.
 * @param module - module to export it from.
 * @returns ExportDeclaration
 */
export const createNamedExportDeclarations = (
    items: Array<ImportItem> | ImportItem,
    module: string
): ts.ExportDeclaration => {
    items = Array.isArray(items) ? items : [items];
    const isAllTypes = items.every(i => typeof i === 'object' && i.isTypeOnly);
    return ts.factory.createExportDeclaration(
        undefined,
        isAllTypes,
        ts.factory.createNamedExports(
            items.map(item => {
                const { name, isTypeOnly = undefined } = typeof item === 'string' ? { name: item } : item;
                return ts.factory.createExportSpecifier(
                    isAllTypes ? false : Boolean(isTypeOnly),
                    undefined,
                    encodeURIComponent(name)
                );
            })
        ),
        ts.factory.createStringLiteral(encodeURIComponent(module), CONFIG.useSingleQuotes)
    );
};

/**
 * Create a named import declaration. Example: `import { X } from './y'`.
 * @param items - the items to export.
 * @param module - module to export it from.
 * @returns ImportDeclaration
 */
export const createNamedImportDeclarations = (
    items: Array<ImportItem> | ImportItem,
    module: string
): ts.ImportDeclaration => {
    items = Array.isArray(items) ? items : [items];
    const isAllTypes = items.every(i => typeof i === 'object' && i.isTypeOnly);
    return ts.factory.createImportDeclaration(
        undefined,
        ts.factory.createImportClause(
            isAllTypes,
            undefined,
            ts.factory.createNamedImports(
                items.map(item => {
                    const { name, isTypeOnly = undefined } = typeof item === 'string' ? { name: item } : item;
                    return ts.factory.createImportSpecifier(
                        isAllTypes ? false : Boolean(isTypeOnly),
                        undefined,
                        ts.factory.createIdentifier(encodeURIComponent(name))
                    );
                })
            )
        ),
        ts.factory.createStringLiteral(encodeURIComponent(module), CONFIG.useSingleQuotes)
    );
};
