import type { AnalysisContext, Ref, Symbol } from '@hey-api/codegen-core';
import { ref } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { TsDsl } from '../base';
import { ArgsMixin } from '../mixins/args';
import { ExprMixin } from '../mixins/expr';
import { TypeArgsMixin } from '../mixins/type-args';

export type NewExpr = Symbol | string | MaybeTsDsl<ts.Expression>;

const Mixed = ArgsMixin(ExprMixin(TypeArgsMixin(TsDsl<ts.NewExpression>)));

export class NewTsDsl extends Mixed {
  readonly '~dsl' = 'NewTsDsl';

  protected classExpr: Ref<NewExpr>;

  constructor(classExpr: NewExpr, ...args: ReadonlyArray<NewExpr>) {
    super();
    this.classExpr = ref(classExpr);
    this.args(...args);
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    ctx.analyze(this.classExpr);
  }

  override toAst() {
    return ts.factory.createNewExpression(
      this.$node(this.classExpr),
      this.$generics(),
      this.$args(),
    );
  }
}
