/* eslint-disable @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unsafe-declaration-merging */
import ts from 'typescript';

import type { MaybeTsDsl } from './base';
import { TsDsl } from './base';
import { mixin } from './mixins/apply';
import { ExprMixin, registerLazyAccessAwaitFactory } from './mixins/expr';

export class AwaitTsDsl extends TsDsl<ts.AwaitExpression> {
  private _awaitExpr: string | MaybeTsDsl<ts.Expression>;

  constructor(expr: string | MaybeTsDsl<ts.Expression>) {
    super();
    this._awaitExpr = expr;
  }

  $render(): ts.AwaitExpression {
    return ts.factory.createAwaitExpression(this.$node(this._awaitExpr));
  }
}

export interface AwaitTsDsl extends ExprMixin {}
mixin(AwaitTsDsl, ExprMixin);

registerLazyAccessAwaitFactory((...args) => new AwaitTsDsl(...args));
