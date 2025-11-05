import ts from 'typescript';

import type { ExprInput, MaybeTsDsl } from './base';
import { TsDsl } from './base';

export class ReturnTsDsl extends TsDsl<ts.ReturnStatement> {
  private expr?: MaybeTsDsl<ExprInput>;

  constructor(expr?: MaybeTsDsl<ExprInput>) {
    super();
    this.expr = expr;
  }

  $render(): ts.ReturnStatement {
    const exprNode = this.$node(this.expr);
    return ts.factory.createReturnStatement(exprNode);
  }
}
