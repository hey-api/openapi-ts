import type {
  AnalysisContext,
  AstContext,
  Ref,
  Symbol,
} from '@hey-api/codegen-core';
import { ref } from '@hey-api/codegen-core';
import type ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { TsDsl } from '../base';
import { AsMixin } from '../mixins/as';
import { ExprMixin } from '../mixins/expr';
import { OperatorMixin } from '../mixins/operator';
import { TypeExprMixin } from '../mixins/type-expr';

type Id = Symbol | string | MaybeTsDsl<ts.Expression>;

const Mixed = AsMixin(
  ExprMixin(OperatorMixin(TypeExprMixin(TsDsl<ts.Expression>))),
);

export class ExprTsDsl extends Mixed {
  readonly '~dsl' = 'ExprTsDsl';

  protected _exprInput: Ref<Id>;

  constructor(id: Id) {
    super();
    this._exprInput = ref(id);
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    ctx.analyze(this._exprInput);
  }

  override toAst(ctx: AstContext) {
    return this.$node(ctx, this._exprInput);
  }
}
