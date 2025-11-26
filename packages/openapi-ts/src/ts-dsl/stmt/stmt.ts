import type { AnalysisContext } from '@hey-api/codegen-core';
import ts from 'typescript';

import { isTsDsl, TsDsl } from '../base';

const Mixed = TsDsl<ts.Statement>;

export class StmtTsDsl extends Mixed {
  protected _inner: ts.Expression | ts.Statement | TsDsl<any>;

  constructor(inner: ts.Expression | ts.Statement | TsDsl<any>) {
    super();
    this._inner = inner;
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    if (isTsDsl(this._inner)) this._inner.analyze(ctx);
  }

  protected override _render() {
    const node = this.$node(this._inner);
    return ts.isStatement(node)
      ? node
      : ts.factory.createExpressionStatement(node);
  }
}
