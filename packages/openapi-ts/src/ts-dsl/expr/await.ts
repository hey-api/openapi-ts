import type { AnalysisContext, Symbol } from '@hey-api/codegen-core';
import { isSymbol } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { isTsDsl, TsDsl } from '../base';
import { ExprMixin, setAwaitFactory } from '../mixins/expr';

export type AwaitExpr = Symbol | string | MaybeTsDsl<ts.Expression>;
export type AwaitCtor = (expr: AwaitExpr) => AwaitTsDsl;

const Mixed = ExprMixin(TsDsl<ts.AwaitExpression>);

export class AwaitTsDsl extends Mixed {
  protected _awaitExpr: AwaitExpr;

  constructor(expr: AwaitExpr) {
    super();
    this._awaitExpr = expr;
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    if (isSymbol(this._awaitExpr)) {
      ctx.addDependency(this._awaitExpr);
    } else if (isTsDsl(this._awaitExpr)) {
      this._awaitExpr.analyze(ctx);
    }
  }

  protected override _render() {
    return ts.factory.createAwaitExpression(this.$node(this._awaitExpr));
  }
}

setAwaitFactory((...args) => new AwaitTsDsl(...args));
