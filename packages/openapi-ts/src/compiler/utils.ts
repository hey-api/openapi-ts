import ts from 'typescript';

export const CONFIG = {
    newLine: ts.NewLineKind.LineFeed,
    scriptKind: ts.ScriptKind.TS,
    scriptTarget: ts.ScriptTarget.ES2015,
    useSingleQuotes: true,
};

const printer = ts.createPrinter({ newLine: CONFIG.newLine });
const blankSourceFile = ts.createSourceFile('', '', CONFIG.scriptTarget, undefined, CONFIG.scriptKind);

/**
 * Print a typescript node to a string.
 * @param node - the node to print.
 * @returns string
 */
export function toString(node: ts.Node): string {
    const r = printer.printNode(ts.EmitHint.Unspecified, node, blankSourceFile);
    return decodeURIComponent(r);
}

// ots for openapi-ts is helpers to reduce repetition of basic ts factory functions.
export const ots = {
    export: (name: string, isTypeOnly?: boolean) =>
        ts.factory.createExportSpecifier(
            isTypeOnly ?? false,
            undefined,
            ts.factory.createIdentifier(encodeURIComponent(name))
        ),
    import: (name: string, isTypeOnly?: boolean) =>
        ts.factory.createImportSpecifier(
            isTypeOnly ?? false,
            undefined,
            ts.factory.createIdentifier(encodeURIComponent(name))
        ),
    string: (text: string) => ts.factory.createStringLiteral(encodeURIComponent(text), CONFIG.useSingleQuotes),
};
