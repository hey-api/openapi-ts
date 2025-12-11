import type { AnalysisContext, Ref, Symbol } from '@hey-api/codegen-core';
import { ref } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { TsDsl } from '../base';
import { setReturnFactory } from '../mixins/expr';

export type ReturnExpr = Symbol | string | MaybeTsDsl<ts.Expression>;
export type ReturnCtor = (expr?: ReturnExpr) => ReturnTsDsl;

const Mixed = TsDsl<ts.ReturnStatement>;

export class ReturnTsDsl extends Mixed {
  readonly '~dsl' = 'ReturnTsDsl';

  protected _returnExpr?: Ref<ReturnExpr>;

  constructor(expr?: ReturnExpr) {
    super();
    if (expr) this._returnExpr = ref(expr);
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    ctx.analyze(this._returnExpr);
  }

  override toAst() {
    return ts.factory.createReturnStatement(this.$node(this._returnExpr));
  }
}

setReturnFactory((...args) => new ReturnTsDsl(...args));
