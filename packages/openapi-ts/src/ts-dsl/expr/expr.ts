import type { SyntaxNode } from '@hey-api/codegen-core';
import type ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { TsDsl } from '../base';
import { AsMixin } from '../mixins/as';
import { ExprMixin } from '../mixins/expr';
import { OperatorMixin } from '../mixins/operator';
import { TypeExprMixin } from '../mixins/type-expr';

const Mixed = AsMixin(
  ExprMixin(OperatorMixin(TypeExprMixin(TsDsl<ts.Expression>))),
);

export class ExprTsDsl extends Mixed {
  protected _exprInput: string | MaybeTsDsl<ts.Expression>;

  constructor(id: string | MaybeTsDsl<ts.Expression>) {
    super();
    this._exprInput = id;
  }

  traverse(visitor: (node: SyntaxNode) => void): void {
    console.log(visitor);
  }

  protected override _render() {
    return this.$node(this._exprInput);
  }
}
