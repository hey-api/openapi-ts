import type { AnalysisContext } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { TsDsl } from '../base';
import { OperatorMixin } from '../mixins/operator';
import { registerLazyAccessTypeOfExprFactory } from '../mixins/type-expr';

const Mixed = OperatorMixin(TsDsl<ts.TypeOfExpression>);

export class TypeOfExprTsDsl extends Mixed {
  readonly '~dsl' = 'TypeOfExprTsDsl';

  protected _expr: string | MaybeTsDsl<ts.Expression>;

  constructor(expr: string | MaybeTsDsl<ts.Expression>) {
    super();
    this._expr = expr;
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    ctx.analyze(this._expr);
  }

  override toAst() {
    return ts.factory.createTypeOfExpression(this.$node(this._expr));
  }
}

registerLazyAccessTypeOfExprFactory((...args) => new TypeOfExprTsDsl(...args));
