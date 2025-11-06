import ts from 'typescript';

import { TsDsl } from './base';

export class DescribeTsDsl extends TsDsl {
  private _lines: Array<string> = [];

  constructor(
    lines?: string | ReadonlyArray<string>,
    fn?: (d: DescribeTsDsl) => void,
  ) {
    super();
    if (lines) {
      if (typeof lines === 'string') {
        this.add(lines);
      } else {
        this.add(...lines);
      }
    }
    if (fn) fn(this);
  }

  add(...lines: ReadonlyArray<string>): this {
    this._lines.push(...lines);
    return this;
  }

  apply<T extends ts.Node>(node: T): T {
    const lines = this._lines.filter((line) => Boolean(line) || line === '');
    if (!lines.length) return node;

    const jsdocTexts = lines.map((line, index) => {
      let text = line;
      if (index !== lines.length) {
        text = `${text}\n`;
      }
      return ts.factory.createJSDocText(text);
    });

    const jsdoc = ts.factory.createJSDocComment(
      ts.factory.createNodeArray(jsdocTexts),
      undefined,
    );

    const cleanedJsdoc = ts
      .createPrinter()
      .printNode(
        ts.EmitHint.Unspecified,
        jsdoc,
        node.getSourceFile?.() ??
          ts.createSourceFile('', '', ts.ScriptTarget.Latest),
      )
      .replace('/*', '')
      .replace('*  */', '');

    ts.addSyntheticLeadingComment(
      node,
      ts.SyntaxKind.MultiLineCommentTrivia,
      cleanedJsdoc,
      true,
    );

    return node;
  }

  $render(): ts.Node {
    // this class does not build a standalone node;
    // it modifies other nodes via `apply()`.
    // Return a dummy comment node for compliance.
    return ts.factory.createIdentifier('');
  }
}
