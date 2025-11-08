/* eslint-disable @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unsafe-declaration-merging */
import ts from 'typescript';

import type { MaybeTsDsl, WithString } from './base';
import { TsDsl } from './base';
import { AccessMixin, registerLazyAccessReturnFactory } from './mixins/access';
import { mixin } from './mixins/apply';

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

export interface ReturnTsDsl extends AccessMixin {}
mixin(ReturnTsDsl, AccessMixin);

registerLazyAccessReturnFactory((expr) => new ReturnTsDsl(expr));
