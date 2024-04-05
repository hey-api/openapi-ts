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
    const r = printer.printNode(ts.EmitHint.Unspecified, node, blankSourceFile);
    return decodeURIComponent(r);
}
