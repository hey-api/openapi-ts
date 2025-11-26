import type { AnalysisContext, Symbol } from '@hey-api/codegen-core';
import { isSymbol } from '@hey-api/codegen-core';
import type ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { isTsDsl, TsDsl } from '../base';
import { AsMixin } from '../mixins/as';
import { ExprMixin } from '../mixins/expr';
import { OperatorMixin } from '../mixins/operator';
import { TypeExprMixin } from '../mixins/type-expr';

type Id = Symbol | string | MaybeTsDsl<ts.Expression>;

const Mixed = AsMixin(
  ExprMixin(OperatorMixin(TypeExprMixin(TsDsl<ts.Expression>))),
);

export class ExprTsDsl extends Mixed {
  protected _exprInput: Id;

  constructor(id: Id) {
    super();
    this._exprInput = id;
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    if (isSymbol(this._exprInput)) {
      ctx.addDependency(this._exprInput);
    } else if (isTsDsl(this._exprInput)) {
      this._exprInput.analyze(ctx);
    }
  }

  protected override _render() {
    return this.$node(this._exprInput);
  }
}
