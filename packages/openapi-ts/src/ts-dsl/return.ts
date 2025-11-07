import ts from 'typescript';

import type { MaybeTsDsl, WithString } from './base';
import { TsDsl } from './base';

export class ReturnTsDsl extends TsDsl<ts.ReturnStatement> {
  private expr?: MaybeTsDsl<WithString>;

  constructor(expr?: MaybeTsDsl<WithString>) {
    super();
    this.expr = expr;
  }

  $render(): ts.ReturnStatement {
    const exprNode = this.$node(this.expr);
    return ts.factory.createReturnStatement(exprNode);
  }
}
