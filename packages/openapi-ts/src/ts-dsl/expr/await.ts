import type { AnalysisContext, Ref, Symbol } from '@hey-api/codegen-core';
import { ref } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { TsDsl } from '../base';
import { ExprMixin, setAwaitFactory } from '../mixins/expr';

export type AwaitExpr = Symbol | string | MaybeTsDsl<ts.Expression>;
export type AwaitCtor = (expr: AwaitExpr) => AwaitTsDsl;

const Mixed = ExprMixin(TsDsl<ts.AwaitExpression>);

export class AwaitTsDsl extends Mixed {
  readonly '~dsl' = 'AwaitTsDsl';

  protected _awaitExpr: Ref<AwaitExpr>;

  constructor(expr: AwaitExpr) {
    super();
    this._awaitExpr = ref(expr);
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    ctx.analyze(this._awaitExpr);
  }

  override toAst() {
    return ts.factory.createAwaitExpression(this.$node(this._awaitExpr));
  }
}

setAwaitFactory((...args) => new AwaitTsDsl(...args));
