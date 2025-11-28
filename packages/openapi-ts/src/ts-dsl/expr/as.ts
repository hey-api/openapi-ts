import type { AnalysisContext, Symbol } from '@hey-api/codegen-core';
import { isSymbol } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeTsDsl, TypeTsDsl } from '../base';
import { isTsDsl, TsDsl } from '../base';
import { AsMixin, setAsFactory } from '../mixins/as';
import { ExprMixin } from '../mixins/expr';

export type AsExpr = Symbol | string | MaybeTsDsl<ts.Expression>;
export type AsType = Symbol | string | TypeTsDsl;
export type AsCtor = (expr: AsExpr, type: AsType) => AsTsDsl;

const Mixed = AsMixin(ExprMixin(TsDsl<ts.AsExpression>));

export class AsTsDsl extends Mixed {
  protected expr: AsExpr;
  protected type: AsType;

  constructor(expr: AsExpr, type: AsType) {
    super();
    this.expr = expr;
    this.type = type;
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    if (isSymbol(this.expr)) {
      ctx.addDependency(this.expr);
    } else if (isTsDsl(this.expr)) {
      this.expr.analyze(ctx);
    }
    if (isSymbol(this.type)) {
      ctx.addDependency(this.type);
    } else if (isTsDsl(this.type)) {
      this.type.analyze(ctx);
    }
  }

  protected override _render() {
    return ts.factory.createAsExpression(
      this.$node(this.expr),
      this.$type(this.type),
    );
  }
}

setAsFactory((...args) => new AsTsDsl(...args));
