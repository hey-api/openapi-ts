import type { SyntaxNode } from '@hey-api/codegen-core';
import ts from 'typescript';

import { TsDsl } from '../base';

const Mixed = TsDsl<ts.Statement>;

export class StmtTsDsl extends Mixed {
  protected _inner: ts.Expression | ts.Statement | TsDsl<any>;

  constructor(inner: ts.Expression | ts.Statement | TsDsl<any>) {
    super();
    this._inner = inner;
  }

  override traverse(visitor: (node: SyntaxNode) => void): void {
    super.traverse(visitor);
  }

  protected override _render() {
    const node = this.$node(this._inner);
    return ts.isStatement(node)
      ? node
      : ts.factory.createExpressionStatement(node);
  }
}
