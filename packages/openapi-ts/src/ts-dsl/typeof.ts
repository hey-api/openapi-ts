/* eslint-disable @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unsafe-declaration-merging */
import ts from 'typescript';

import type { MaybeTsDsl, WithString } from './base';
import { TsDsl } from './base';
import { mixin } from './mixins/apply';
import { OperatorMixin } from './mixins/operator';

export class TypeOfExprTsDsl extends TsDsl<ts.TypeOfExpression> {
  private _expr: MaybeTsDsl<WithString>;

  constructor(expr: MaybeTsDsl<WithString>) {
    super();
    this._expr = expr;
  }

  $render(): ts.TypeOfExpression {
    return ts.factory.createTypeOfExpression(this.$node(this._expr));
  }
}

export interface TypeOfExprTsDsl extends OperatorMixin {}
mixin(TypeOfExprTsDsl, OperatorMixin);
