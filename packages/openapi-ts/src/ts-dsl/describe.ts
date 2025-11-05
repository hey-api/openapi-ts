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
    if (!this._lines.length) return node;
    const content = `*\n * ${this._lines.join('\n * ')}\n `;
    return ts.addSyntheticLeadingComment(
      node,
      ts.SyntaxKind.MultiLineCommentTrivia,
      content,
      true,
    );
  }

  $render(): ts.Node {
    // this class does not build a standalone node;
    // it modifies other nodes via `apply()`.
    // Return a dummy comment node for compliance.
    return ts.factory.createIdentifier('');
  }
}
