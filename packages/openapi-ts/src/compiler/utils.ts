import ts from 'typescript';

import { unescapeName } from '../utils/escape';

export const CONFIG = {
    newLine: ts.NewLineKind.LineFeed,
    scriptKind: ts.ScriptKind.TS,
    scriptTarget: ts.ScriptTarget.ES2015,
    useSingleQuotes: true,
};

const printer = ts.createPrinter({ newLine: CONFIG.newLine });

export const createSourceFile = (sourceText: string) =>
    ts.createSourceFile('', sourceText, CONFIG.scriptTarget, undefined, CONFIG.scriptKind);

const blankSourceFile = createSourceFile('');

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
        }
        return ts.factory.createNumericLiteral(value);
    },
    // Create a string literal. This handles strings that start with '`' or "'".
    string: (value: string, unescape = false) => {
        if (unescape) {
            value = unescapeName(value);
        }
        const text = encodeURIComponent(value);
        if (value.startsWith('`')) {
            return ts.factory.createIdentifier(text);
        }
        return ts.factory.createStringLiteral(text, value.includes("'") ? false : CONFIG.useSingleQuotes);
    },
};

export const isType = <T>(value: T | undefined): value is T => value !== undefined;

export const addLeadingJSDocComment = (
    node: ts.Node | undefined,
    text: Array<string | null | false | undefined>,
    hasTrailingNewLine: boolean = true
): string => {
    // if node is falsy, assume string mode
    if (node) {
        ts.addSyntheticLeadingComment(
            node,
            ts.SyntaxKind.MultiLineCommentTrivia,
            ['*', ...text, ' '].filter(Boolean).join('\n'),
            hasTrailingNewLine
        );
        return '';
    }

    const result = ['/**', ...text, ' */'].filter(Boolean).join('\n');
    return hasTrailingNewLine ? `${result}\n` : result;
};
