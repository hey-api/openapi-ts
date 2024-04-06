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
export function tsNodeToString(node: ts.Node): string {
    const result = printer.printNode(ts.EmitHint.Unspecified, node, blankSourceFile);
    return decodeURIComponent(result);
}

// ots for openapi-ts is helpers to reduce repetition of basic ts factory functions.
export const ots = {
    // Create a boolean expression based on value.
    boolean: (value: boolean) => (value ? ts.factory.createTrue() : ts.factory.createFalse()),
    export: (name: string, isTypeOnly?: boolean, alias?: string) => {
        const n = ts.factory.createIdentifier(encodeURIComponent(name));
        return ts.factory.createExportSpecifier(
            isTypeOnly ?? false,
            alias ? n : undefined,
            alias ? ts.factory.createIdentifier(encodeURIComponent(alias)) : n
        );
    },
    import: (name: string, isTypeOnly?: boolean, alias?: string) => {
        const n = ts.factory.createIdentifier(encodeURIComponent(name));
        return ts.factory.createImportSpecifier(
            isTypeOnly ?? false,
            alias ? n : undefined,
            alias ? ts.factory.createIdentifier(encodeURIComponent(alias)) : n
        );
    },
    // Create a numeric expression, handling negative numbers.
    number: (value: number) => {
        if (value < 0) {
            return ts.factory.createPrefixUnaryExpression(
                ts.SyntaxKind.MinusToken,
                ts.factory.createNumericLiteral(Math.abs(value))
            );
        } else {
            return ts.factory.createNumericLiteral(value);
        }
    },
    // Create a string literal. This handles strings that start with '`' or "'".
    string: (value: string) => {
        if (value.startsWith('`')) {
            return ts.factory.createIdentifier(encodeURIComponent(value));
        } else {
            return ts.factory.createStringLiteral(
                encodeURIComponent(value),
                value.includes("'") ? false : CONFIG.useSingleQuotes
            );
        }
    },
};

export const isType = <T>(value: T | undefined): value is T => value !== undefined;
