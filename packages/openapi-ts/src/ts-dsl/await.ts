import ts from 'typescript';

import type { ExprInput, MaybeTsDsl } from './base';
import { TsDsl } from './base';

export class AwaitTsDsl extends TsDsl<ts.AwaitExpression> {
  private exprNode: MaybeTsDsl<ExprInput>;

  constructor(expr: MaybeTsDsl<ExprInput>) {
    super();
    this.exprNode = expr;
  }

  $render(): ts.AwaitExpression {
    const expr = this.$node(this.exprNode);
    return ts.factory.createAwaitExpression(expr);
  }
}
