import type { SyntaxNode } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { TsDsl } from '../base';
import { registerLazyAccessReturnFactory } from '../mixins/expr';

const Mixed = TsDsl<ts.ReturnStatement>;

export class ReturnTsDsl extends Mixed {
  protected _returnExpr?: string | MaybeTsDsl<ts.Expression>;

  constructor(expr?: string | MaybeTsDsl<ts.Expression>) {
    super();
    this._returnExpr = expr;
  }

  override traverse(visitor: (node: SyntaxNode) => void): void {
    super.traverse(visitor);
  }

  protected override _render() {
    return ts.factory.createReturnStatement(this.$node(this._returnExpr));
  }
}

registerLazyAccessReturnFactory((...args) => new ReturnTsDsl(...args));
