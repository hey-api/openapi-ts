import ts from 'typescript';

import { unescapeName } from '~/utils/escape';

import type { AccessLevel } from './types';
import { createStringLiteral, syntaxKindKeyword } from './types';

export interface ImportExportItemObject<
  Name extends string | undefined = string | undefined,
  Alias extends string | undefined = undefined,
> {
  alias?: Alias;
  asType?: boolean;
  name: Name;
}

const printer = ts.createPrinter({
  newLine: ts.NewLineKind.LineFeed,
  removeComments: false,
});

export const createSourceFile = (sourceText: string): ts.SourceFile =>
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
    // if (getConfig().logs.level === 'debug') {
    //   console.warn('Could not decode value:', result);
    // }
    return result;
  }
}

export const createIdentifier = (
  args: string | { text: string },
): ts.Identifier =>
  ts.factory.createIdentifier(typeof args === 'string' ? args : args.text);

type Prefix = '!' | '-';

const prefixToOperator = (prefix: Prefix): ts.PrefixUnaryOperator => {
  switch (prefix) {
    case '!':
      return ts.SyntaxKind.ExclamationToken;
    case '-':
      return ts.SyntaxKind.MinusToken;
  }
};

export const createPrefixUnaryExpression = ({
  expression,
  prefix,
}: {
  expression: string | ts.Expression;
  prefix: Prefix | ts.PrefixUnaryOperator;
}): ts.PrefixUnaryExpression => {
  const operand =
    typeof expression === 'string' ? createIdentifier(expression) : expression;
  const operator =
    typeof prefix === 'string' ? prefixToOperator(prefix) : prefix;
  return ts.factory.createPrefixUnaryExpression(operator, operand);
};

export const createThis = (): ts.ThisExpression => ts.factory.createThis();

export type Modifier = AccessLevel | 'async' | 'export' | 'readonly' | 'static';

export const createModifier = ({ keyword }: { keyword: Modifier }) => {
  const kind = syntaxKindKeyword({ keyword });
  return ts.factory.createModifier(kind);
};

export const createPropertyDeclaration = ({
  initializer,
  modifiers,
  name,
  type,
}: {
  initializer?: ts.Expression;
  modifiers?: Modifier | ReadonlyArray<Modifier>;
  name: string | ts.PropertyName;
  type?: ts.TypeNode;
}) => {
  const mods = Array.isArray(modifiers) ? modifiers : [modifiers];
  return ts.factory.createPropertyDeclaration(
    modifiers ? mods.map((keyword) => createModifier({ keyword })) : undefined,
    name,
    undefined,
    type,
    initializer,
  );
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
    const nameNode = createIdentifier(name!);
    if (alias) {
      const aliasNode = createIdentifier(alias);
      return ts.factory.createExportSpecifier(asType, nameNode, aliasNode);
    }
    return ts.factory.createExportSpecifier(asType, undefined, nameNode);
  },
  import: ({ alias, asType = false, name }: ImportExportItemObject) => {
    const nameNode = createIdentifier(name!);
    if (alias) {
      const aliasNode = createIdentifier(alias);
      return ts.factory.createImportSpecifier(asType, nameNode, aliasNode);
    }
    return ts.factory.createImportSpecifier(asType, undefined, nameNode);
  },
  /**
   * Create a numeric expression, handling negative numbers.
   */
  number: (value: number) => {
    if (value < 0) {
      return createPrefixUnaryExpression({
        expression: ts.factory.createNumericLiteral(Math.abs(value)),
        prefix: '-',
      });
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
      return createIdentifier(text);
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
