import type { SyntaxNode } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeTsDsl, TypeTsDsl } from '../base';
import { TsDsl } from '../base';
import { AsMixin, registerLazyAccessAsFactory } from '../mixins/as';
import { ExprMixin } from '../mixins/expr';

const Mixed = AsMixin(ExprMixin(TsDsl<ts.AsExpression>));

export class AsTsDsl extends Mixed {
  protected expr: string | MaybeTsDsl<ts.Expression>;
  protected type: string | TypeTsDsl;

  constructor(
    expr: string | MaybeTsDsl<ts.Expression>,
    type: string | TypeTsDsl,
  ) {
    super();
    this.expr = expr;
    this.type = type;
  }

  override traverse(visitor: (node: SyntaxNode) => void): void {
    super.traverse(visitor);
  }

  protected override _render() {
    return ts.factory.createAsExpression(
      this.$node(this.expr),
      this.$type(this.type),
    );
  }
}

registerLazyAccessAsFactory((...args) => new AsTsDsl(...args));
