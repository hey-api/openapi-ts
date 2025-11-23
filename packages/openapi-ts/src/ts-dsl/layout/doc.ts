import type { SyntaxNode } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeArray } from '../base';
import { TsDsl } from '../base';
import { IdTsDsl } from '../expr/id';

export class DocTsDsl extends TsDsl<ts.Node> {
  protected _lines: Array<string> = [];

  constructor(lines?: MaybeArray<string>, fn?: (d: DocTsDsl) => void) {
    super();
    if (lines) {
      if (typeof lines === 'string') {
        this.add(lines);
      } else {
        this.add(...lines);
      }
    }
    fn?.(this);
  }

  add(...lines: ReadonlyArray<string>): this {
    this._lines.push(...lines);
    return this;
  }

  apply<T extends ts.Node>(node: T): T {
    const lines = this._lines.filter((line) => Boolean(line) || line === '');
    if (!lines.length) return node;

    const jsdocTexts = lines.map((line) =>
      ts.factory.createJSDocText(`${line}\n`),
    );

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

  /** Walk this node and its children with a visitor. */
  traverse(visitor: (node: SyntaxNode) => void): void {
    console.log(visitor);
  }

  $render(): ts.Node {
    // this class does not build a standalone node;
    // it modifies other nodes via `apply()`.
    // Return a dummy comment node for compliance.
    return this.$node(new IdTsDsl(''));
  }
}
