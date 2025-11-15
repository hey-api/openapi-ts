import ts from 'typescript';

import type { MaybeArray } from './base';
import { TsDsl } from './base';

export class NoteTsDsl extends TsDsl<ts.Node> {
  private _lines: Array<string> = [];

  constructor(lines?: MaybeArray<string>, fn?: (d: NoteTsDsl) => void) {
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

    ts.addSyntheticLeadingComment(
      node,
      ts.SyntaxKind.MultiLineCommentTrivia,
      `\n${lines.join('\n')}\n`,
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
