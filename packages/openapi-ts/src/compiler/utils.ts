import ts from 'typescript';

import { getConfig } from '../utils/config';
import { unescapeName } from '../utils/escape';

export interface ImportExportItemObject {
  alias?: string;
  asType?: boolean;
  name: string;
}

export const CONFIG = {
  newLine: ts.NewLineKind.LineFeed,
  scriptKind: ts.ScriptKind.TS,
  scriptTarget: ts.ScriptTarget.ES2015,
  useSingleQuotes: true,
};

const printer = ts.createPrinter({ newLine: CONFIG.newLine });

export const createSourceFile = (sourceText: string) =>
  ts.createSourceFile(
    '',
    sourceText,
    CONFIG.scriptTarget,
    undefined,
    CONFIG.scriptKind,
  );

const blankSourceFile = createSourceFile('');

const unescapeUnicode = (value: string) =>
  value.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex: string) =>
    String.fromCharCode(Number.parseInt(hex, 16)),
  );

/**
 * Print a TypeScript node to a string.
 * @param node the node to print
 * @returns string
 */
export function tsNodeToString({
  node,
  unescape = false,
}: {
  node: ts.Node;
  unescape?: boolean;
}): string {
  const result = printer.printNode(
    ts.EmitHint.Unspecified,
    node,
    blankSourceFile,
  );

  if (!unescape) {
    return result;
  }

  try {
    /**
     * TypeScript Compiler API escapes unicode characters by default and there
     * is no way to disable this behavior
     * {@link https://github.com/microsoft/TypeScript/issues/36174}
     */
    return unescapeUnicode(result);
  } catch {
    if (getConfig().debug) {
      console.warn('Could not decode value:', result);
    }
    return result;
  }
}

/**
 * Convert a string to a TypeScript Node
 * @param value the string to convert.
 * @returns ts.Node
 */
export function stringToTsNodes(value: string): ts.Node {
  const file = createSourceFile(value);
  return file.statements[0];
}

/**
 * ots for openapi-ts are helpers to reduce repetition of basic TypeScript
 * factory functions.
 */
export const ots = {
  /**
   * Create a boolean expression based on value.
   */
  boolean: (value: boolean) =>
    value ? ts.factory.createTrue() : ts.factory.createFalse(),
  export: ({ alias, asType = false, name }: ImportExportItemObject) => {
    const nameNode = ts.factory.createIdentifier(name);
    if (alias) {
      const aliasNode = ts.factory.createIdentifier(alias);
      return ts.factory.createExportSpecifier(asType, nameNode, aliasNode);
    }
    return ts.factory.createExportSpecifier(asType, undefined, nameNode);
  },
  import: ({ alias, asType = false, name }: ImportExportItemObject) => {
    const nameNode = ts.factory.createIdentifier(name);
    if (alias) {
      const aliasNode = ts.factory.createIdentifier(alias);
      return ts.factory.createImportSpecifier(asType, nameNode, aliasNode);
    }
    return ts.factory.createImportSpecifier(asType, undefined, nameNode);
  },
  /**
   * Create a numeric expression, handling negative numbers.
   */
  number: (value: number) => {
    if (value < 0) {
      return ts.factory.createPrefixUnaryExpression(
        ts.SyntaxKind.MinusToken,
        ts.factory.createNumericLiteral(Math.abs(value)),
      );
    }
    return ts.factory.createNumericLiteral(value);
  },
  /**
   * Create a string literal. This handles strings that start with '`' or "'".
   */
  string: (value: string, unescape = false) => {
    let text = value;
    if (unescape) {
      text = unescapeName(text);
    }
    const hasBothQuotes = text.includes("'") && text.includes('"');
    const hasNewlines = text.includes('\n');
    const hasUnescapedBackticks = text.startsWith('`');
    const isBacktickEscaped = text.startsWith('\\`') && text.endsWith('\\`');
    if (
      (hasNewlines || hasBothQuotes || hasUnescapedBackticks) &&
      !isBacktickEscaped
    ) {
      text = `\`${text.replace(/(?<!\\)`/g, '\\`').replace(/\${/g, '\\${')}\``;
    }
    if (text.startsWith('`')) {
      return ts.factory.createIdentifier(text);
    }
    return ts.factory.createStringLiteral(
      text,
      text.includes("'") ? false : CONFIG.useSingleQuotes,
    );
  },
};

export const isType = <T>(value: T | undefined): value is T =>
  value !== undefined;

export type Comments = Array<string | null | false | undefined>;

export const addLeadingJSDocComment = (node: ts.Node, text: Comments) => {
  const comments = text.filter(Boolean);
  if (!comments.length) {
    return;
  }

  const jsdocTexts = comments.map((c, l) =>
    ts.factory.createJSDocText(`${c}${l !== comments.length ? '\n' : ''}`),
  );
  const jsdoc = ts.factory.createJSDocComment(
    ts.factory.createNodeArray(jsdocTexts),
  );
  const cleanedJsdoc = tsNodeToString({ node: jsdoc, unescape: true })
    .replace('/*', '')
    .replace('*  */', '');

  ts.addSyntheticLeadingComment(
    node,
    ts.SyntaxKind.MultiLineCommentTrivia,
    cleanedJsdoc,
    true,
  );
};
