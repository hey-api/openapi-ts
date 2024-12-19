import ts from 'typescript';

import { getConfig } from '../utils/config';
import { unescapeName } from '../utils/escape';
import { createStringLiteral } from './types';

export interface ImportExportItemObject {
  alias?: string;
  asType?: boolean;
  name: string;
}

const printer = ts.createPrinter({
  newLine: ts.NewLineKind.LineFeed,
  removeComments: false,
});

export const createSourceFile = (sourceText: string) =>
  ts.createSourceFile(
    '',
    sourceText,
    ts.ScriptTarget.ESNext,
    false,
    ts.ScriptKind.TS,
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
    if (getConfig().logs.level === 'debug') {
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
  return file.statements[0]!;
}

export const createIdentifier = ({ text }: { text: string }) => {
  const identifier = ts.factory.createIdentifier(text);
  return identifier;
};

/**
 * ots for @hey-api/openapi-ts are helpers to reduce repetition of basic TypeScript
 * factory functions.
 */
export const ots = {
  /**
   * Create a boolean expression based on value.
   */
  boolean: (value: boolean) =>
    value ? ts.factory.createTrue() : ts.factory.createFalse(),
  export: ({ alias, asType = false, name }: ImportExportItemObject) => {
    const nameNode = createIdentifier({ text: name });
    if (alias) {
      const aliasNode = createIdentifier({ text: alias });
      return ts.factory.createExportSpecifier(asType, nameNode, aliasNode);
    }
    return ts.factory.createExportSpecifier(asType, undefined, nameNode);
  },
  import: ({ alias, asType = false, name }: ImportExportItemObject) => {
    const nameNode = createIdentifier({ text: name });
    if (alias) {
      const aliasNode = createIdentifier({ text: alias });
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
      return createIdentifier({ text });
    }
    return createStringLiteral({ text });
  },
};

export const isTsNode = (node: any): node is ts.Expression =>
  node !== null &&
  typeof node === 'object' &&
  typeof node.kind === 'number' &&
  typeof node.flags === 'number' &&
  typeof node.pos === 'number' &&
  typeof node.end === 'number';

export const isType = <T>(value: T | undefined): value is T =>
  value !== undefined;

type CommentLines = Array<string | null | false | undefined>;
type CommentObject = {
  jsdoc?: boolean;
  lines: CommentLines;
};
export type Comments = CommentLines | Array<CommentObject>;

const processCommentObject = ({
  commentObject,
  node,
}: {
  commentObject: CommentObject;
  node: ts.Node;
}) => {
  const lines = commentObject.lines.filter(
    (line) => Boolean(line) || line === '',
  ) as string[];
  if (!lines.length) {
    return;
  }

  if (!commentObject.jsdoc) {
    for (const line of lines) {
      ts.addSyntheticLeadingComment(
        node,
        ts.SyntaxKind.SingleLineCommentTrivia,
        ` ${line}`,
        true,
      );
    }
    return;
  }

  const jsdocTexts = lines.map((line, index) => {
    let text = line;
    if (index !== lines.length) {
      text = `${text}\n`;
    }
    const jsdocText = ts.factory.createJSDocText(text);
    return jsdocText;
  });

  const jsdoc = ts.factory.createJSDocComment(
    ts.factory.createNodeArray(jsdocTexts),
    undefined,
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

export const addLeadingComments = ({
  comments = [],
  node,
}: {
  comments?: Comments;
  node: ts.Node;
}) => {
  const isObjectStyle = Boolean(
    comments.find((comment) => typeof comment === 'object' && comment),
  );

  let commentObjects = comments as Array<CommentObject>;
  if (!isObjectStyle) {
    commentObjects = [
      {
        jsdoc: true,
        lines: comments as CommentLines,
      },
    ];
  }

  for (const commentObject of commentObjects) {
    processCommentObject({
      commentObject,
      node,
    });
  }
};
