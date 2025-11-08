/* eslint-disable @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unsafe-declaration-merging */
import ts from 'typescript';

import type { MaybeTsDsl, WithString } from './base';
import { TsDsl } from './base';
import { AccessMixin, registerLazyAccessAwaitFactory } from './mixins/access';
import { mixin } from './mixins/apply';

export class AwaitTsDsl extends TsDsl<ts.AwaitExpression> {
  private _awaitExpr: MaybeTsDsl<WithString>;

  constructor(expr: MaybeTsDsl<WithString>) {
    super();
    this._awaitExpr = expr;
  }

  $render(): ts.AwaitExpression {
    return ts.factory.createAwaitExpression(this.$node(this._awaitExpr));
  }
}

export interface AwaitTsDsl extends AccessMixin {}
mixin(AwaitTsDsl, AccessMixin);

registerLazyAccessAwaitFactory((expr) => new AwaitTsDsl(expr));
