/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
import type { SyntaxNode } from '@hey-api/codegen-core';
import type ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { TsDsl } from '../base';
import { mixin } from '../mixins/apply';
import { AsMixin } from '../mixins/as';
import { ExprMixin } from '../mixins/expr';
import { OperatorMixin } from '../mixins/operator';
import { TypeExprMixin } from '../mixins/type-expr';

export class ExprTsDsl extends TsDsl<ts.Expression> {
  protected _exprInput: string | MaybeTsDsl<ts.Expression>;

  constructor(id: string | MaybeTsDsl<ts.Expression>) {
    super();
    this._exprInput = id;
  }

  /** Walk this node and its children with a visitor. */
  traverse(visitor: (node: SyntaxNode) => void): void {
    console.log(visitor);
  }

  $render(): ts.Expression {
    return this.$node(this._exprInput);
  }
}

export interface ExprTsDsl
  extends AsMixin,
    ExprMixin,
    OperatorMixin,
    TypeExprMixin {}
mixin(ExprTsDsl, AsMixin, ExprMixin, OperatorMixin, TypeExprMixin);
