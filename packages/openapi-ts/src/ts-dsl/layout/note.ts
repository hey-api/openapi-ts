import type { AnalysisContext } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeArray } from '../base';
import { TsDsl } from '../base';
import { IdTsDsl } from '../expr/id';

export class NoteTsDsl extends TsDsl<ts.Node> {
  readonly '~dsl' = 'NoteTsDsl';

  protected _lines: Array<string> = [];

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

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
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

  override toAst(): ts.Node {
    // this class does not build a standalone node;
    // it modifies other nodes via `apply()`.
    // Return a dummy comment node for compliance.
    return this.$node(new IdTsDsl(''));
  }
}
