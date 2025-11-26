import type { AnalysisContext, Symbol } from '@hey-api/codegen-core';
import { isSymbol } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { isTsDsl, TsDsl } from '../base';
import { setReturnFactory } from '../mixins/expr';

export type ReturnExpr = Symbol | string | MaybeTsDsl<ts.Expression>;
export type ReturnCtor = (expr?: ReturnExpr) => ReturnTsDsl;

const Mixed = TsDsl<ts.ReturnStatement>;

export class ReturnTsDsl extends Mixed {
  protected _returnExpr?: ReturnExpr;

  constructor(expr?: ReturnExpr) {
    super();
    this._returnExpr = expr;
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    if (isSymbol(this._returnExpr)) {
      ctx.addDependency(this._returnExpr);
    } else if (isTsDsl(this._returnExpr)) {
      this._returnExpr.analyze(ctx);
    }
  }

  protected override _render() {
    return ts.factory.createReturnStatement(this.$node(this._returnExpr));
  }
}

setReturnFactory((...args) => new ReturnTsDsl(...args));
