import ts from 'typescript';

import type { MaybeTsDsl, WithString } from './base';
import { TsDsl } from './base';

export class AwaitTsDsl extends TsDsl<ts.AwaitExpression> {
  private exprNode: MaybeTsDsl<WithString>;

  constructor(expr: MaybeTsDsl<WithString>) {
    super();
    this.exprNode = expr;
  }

  $render(): ts.AwaitExpression {
    const expr = this.$node(this.exprNode);
    return ts.factory.createAwaitExpression(expr);
  }
}
