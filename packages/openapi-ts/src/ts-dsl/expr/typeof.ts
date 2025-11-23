/* eslint-disable @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unsafe-declaration-merging */
import type { SyntaxNode } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { TsDsl } from '../base';
import { mixin } from '../mixins/apply';
import { OperatorMixin } from '../mixins/operator';
import { registerLazyAccessTypeOfExprFactory } from '../mixins/type-expr';

export class TypeOfExprTsDsl extends TsDsl<ts.TypeOfExpression> {
  protected _expr: string | MaybeTsDsl<ts.Expression>;

  constructor(expr: string | MaybeTsDsl<ts.Expression>) {
    super();
    this._expr = expr;
  }

  /** Walk this node and its children with a visitor. */
  traverse(visitor: (node: SyntaxNode) => void): void {
    console.log(visitor);
  }

  $render(): ts.TypeOfExpression {
    return ts.factory.createTypeOfExpression(this.$node(this._expr));
  }
}

export interface TypeOfExprTsDsl extends OperatorMixin {}
mixin(TypeOfExprTsDsl, OperatorMixin);

registerLazyAccessTypeOfExprFactory((...args) => new TypeOfExprTsDsl(...args));
