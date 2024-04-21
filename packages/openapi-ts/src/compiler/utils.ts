import ts from 'typescript';

import { getConfig } from '../utils/config';
import { unescapeName } from '../utils/escape';

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

/**
 * Print a typescript node to a string.
 * @param node - the node to print.
 * @returns string
 */
export function tsNodeToString(node: ts.Node): string {
  const result = printer.printNode(
    ts.EmitHint.Unspecified,
    node,
    blankSourceFile,
  );
  try {
    return decodeURIComponent(result);
  } catch {
    if (getConfig().debug) {
      console.warn('Could not decode value:', result);
    }
    return result;
  }
}

/**
 * Convert a string to a TypeScript Node
 * @param s - the string to convert.
 * @returns ts.Node
 */
export function stringToTsNodes(s: string): ts.Node {
  const file = createSourceFile(s);
  return file.statements[0];
}

// ots for openapi-ts is helpers to reduce repetition of basic ts factory functions.
export const ots = {
  // Create a boolean expression based on value.
  boolean: (value: boolean) =>
    value ? ts.factory.createTrue() : ts.factory.createFalse(),
  export: (name: string, isTypeOnly?: boolean, alias?: string) => {
    const n = ts.factory.createIdentifier(encodeURIComponent(name));
    return ts.factory.createExportSpecifier(
      isTypeOnly ?? false,
      alias ? n : undefined,
      alias ? ts.factory.createIdentifier(encodeURIComponent(alias)) : n,
    );
  },
  import: (name: string, isTypeOnly?: boolean, alias?: string) => {
    const n = ts.factory.createIdentifier(encodeURIComponent(name));
    return ts.factory.createImportSpecifier(
      isTypeOnly ?? false,
      alias ? n : undefined,
      alias ? ts.factory.createIdentifier(encodeURIComponent(alias)) : n,
    );
  },
  // Create a numeric expression, handling negative numbers.
  number: (value: number) => {
    if (value < 0) {
      return ts.factory.createPrefixUnaryExpression(
        ts.SyntaxKind.MinusToken,
        ts.factory.createNumericLiteral(Math.abs(value)),
      );
    }
    return ts.factory.createNumericLiteral(value);
  },
  // Create a string literal. This handles strings that start with '`' or "'".
  string: (value: string, unescape = false) => {
    if (unescape) {
      value = unescapeName(value);
    }
    const hasBothQuotes = value.includes("'") && value.includes('"');
    const hasNewlines = value.includes('\n');
    const hasUnescapedBackticks = value.startsWith('`');
    const isBacktickEscaped = value.startsWith('\\`') && value.endsWith('\\`');
    if (
      (hasNewlines || hasBothQuotes || hasUnescapedBackticks) &&
      !isBacktickEscaped
    ) {
      value = `\`${value.replace(/(?<!\\)`/g, '\\`').replace(/\${/g, '\\${')}\``;
    }
    const text = encodeURIComponent(value);
    if (value.startsWith('`')) {
      return ts.factory.createIdentifier(text);
    }
    return ts.factory.createStringLiteral(
      text,
      value.includes("'") ? false : CONFIG.useSingleQuotes,
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
  const cleanedJsdoc = tsNodeToString(jsdoc)
    .replace('/*', '')
    .replace('*  */', '');

  ts.addSyntheticLeadingComment(
    node,
    ts.SyntaxKind.MultiLineCommentTrivia,
    cleanedJsdoc,
    true,
  );
};
