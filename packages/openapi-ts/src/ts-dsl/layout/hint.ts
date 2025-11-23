import type { SyntaxNode } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeArray } from '../base';
import { TsDsl } from '../base';
import { IdTsDsl } from '../expr/id';

export class HintTsDsl extends TsDsl<ts.Node> {
  protected _lines: Array<string> = [];

  constructor(lines?: MaybeArray<string>, fn?: (d: HintTsDsl) => void) {
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

    for (const line of lines) {
      ts.addSyntheticLeadingComment(
        node,
        ts.SyntaxKind.SingleLineCommentTrivia,
        ` ${line}`,
        false,
      );
    }

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
