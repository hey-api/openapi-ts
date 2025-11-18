/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
import ts from 'typescript';

import type { MaybeTsDsl, TypeTsDsl } from '../base';
import { TsDsl } from '../base';
import { mixin } from '../mixins/apply';
import { AsMixin, registerLazyAccessAsFactory } from '../mixins/as';
import { ExprMixin } from '../mixins/expr';

export class AsTsDsl extends TsDsl<ts.AsExpression> {
  protected expr: string | MaybeTsDsl<ts.Expression>;
  protected type: string | TypeTsDsl;

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

export interface AsTsDsl extends AsMixin, ExprMixin {}
mixin(AsTsDsl, AsMixin, ExprMixin);

registerLazyAccessAsFactory((...args) => new AsTsDsl(...args));
