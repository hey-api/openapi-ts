/* eslint-disable @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unsafe-declaration-merging */
import ts from 'typescript';

import type { MaybeTsDsl, WithString } from './base';
import { TsDsl } from './base';
import { mixin } from './mixins/apply';
import { ExprMixin, registerLazyAccessReturnFactory } from './mixins/expr';

export class ReturnTsDsl extends TsDsl<ts.ReturnStatement> {
  private _returnExpr?: MaybeTsDsl<WithString>;

  constructor(expr?: MaybeTsDsl<WithString>) {
    super();
    this._returnExpr = expr;
  }

  $render(): ts.ReturnStatement {
    return ts.factory.createReturnStatement(this.$node(this._returnExpr));
  }
}

export interface ReturnTsDsl extends ExprMixin {}
mixin(ReturnTsDsl, ExprMixin);

registerLazyAccessReturnFactory((expr) => new ReturnTsDsl(expr));
