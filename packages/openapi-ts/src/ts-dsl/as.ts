/* eslint-disable @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unsafe-declaration-merging */
import ts from 'typescript';

import type { MaybeTsDsl, TypeTsDsl } from './base';
import { TsDsl } from './base';
import { mixin } from './mixins/apply';
import { ExprMixin, registerLazyAccessAsFactory } from './mixins/expr';

export class AsTsDsl extends TsDsl<ts.AsExpression> {
  private expr: string | MaybeTsDsl<ts.Expression>;
  private type: string | TypeTsDsl;

  constructor(
    expr: string | MaybeTsDsl<ts.Expression>,
    type: string | TypeTsDsl,
  ) {
    super();
    this.expr = expr;
    this.type = type;
  }

  $render() {
    return ts.factory.createAsExpression(
      this.$node(this.expr),
      this.$type(this.type),
    );
  }
}

export interface AsTsDsl extends ExprMixin {}
mixin(AsTsDsl, ExprMixin);

registerLazyAccessAsFactory((expr, type) => new AsTsDsl(expr, type));
