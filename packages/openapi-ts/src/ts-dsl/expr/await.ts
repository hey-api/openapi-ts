import type { SyntaxNode } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { TsDsl } from '../base';
import { ExprMixin, registerLazyAccessAwaitFactory } from '../mixins/expr';

const Mixed = ExprMixin(TsDsl<ts.AwaitExpression>);

export class AwaitTsDsl extends Mixed {
  protected _awaitExpr: string | MaybeTsDsl<ts.Expression>;

  constructor(expr: string | MaybeTsDsl<ts.Expression>) {
    super();
    this._awaitExpr = expr;
  }

  override traverse(visitor: (node: SyntaxNode) => void): void {
    super.traverse(visitor);
  }

  protected override _render() {
    return ts.factory.createAwaitExpression(this.$node(this._awaitExpr));
  }
}

registerLazyAccessAwaitFactory((...args) => new AwaitTsDsl(...args));
