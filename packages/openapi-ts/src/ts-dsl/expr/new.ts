import type { AnalysisContext, Symbol } from '@hey-api/codegen-core';
import { isSymbol } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { isTsDsl, TsDsl } from '../base';
import { ArgsMixin } from '../mixins/args';
import { ExprMixin } from '../mixins/expr';
import { TypeArgsMixin } from '../mixins/type-args';

export type NewExpr = Symbol | string | MaybeTsDsl<ts.Expression>;

const Mixed = ArgsMixin(ExprMixin(TypeArgsMixin(TsDsl<ts.NewExpression>)));

export class NewTsDsl extends Mixed {
  protected classExpr: NewExpr;

  constructor(classExpr: NewExpr, ...args: ReadonlyArray<NewExpr>) {
    super();
    this.classExpr = classExpr;
    this.args(...args);
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    if (isSymbol(this.classExpr)) {
      ctx.addDependency(this.classExpr);
    } else if (isTsDsl(this.classExpr)) {
      this.classExpr.analyze(ctx);
    }
  }

  protected override _render() {
    return ts.factory.createNewExpression(
      this.$node(this.classExpr),
      this.$generics(),
      this.$args(),
    );
  }
}
