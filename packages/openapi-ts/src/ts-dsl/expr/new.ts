import type { SyntaxNode } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { TsDsl } from '../base';
import { ArgsMixin } from '../mixins/args';
import { ExprMixin } from '../mixins/expr';
import { TypeArgsMixin } from '../mixins/type-args';

const Mixed = ArgsMixin(ExprMixin(TypeArgsMixin(TsDsl<ts.NewExpression>)));

export class NewTsDsl extends Mixed {
  protected classExpr: string | MaybeTsDsl<ts.Expression>;

  constructor(
    classExpr: string | MaybeTsDsl<ts.Expression>,
    ...args: ReadonlyArray<string | MaybeTsDsl<ts.Expression>>
  ) {
    super();
    this.classExpr = classExpr;
    this.args(...args);
  }

  override traverse(visitor: (node: SyntaxNode) => void): void {
    super.traverse(visitor);
  }

  protected override _render() {
    return ts.factory.createNewExpression(
      this.$node(this.classExpr),
      this.$generics(),
      this.$args(),
    );
  }
}
