import ts from 'typescript';

import type { ExprInput, MaybeTsDsl } from './base';
import { TsDsl } from './base';

export class NotTsDsl extends TsDsl<ts.PrefixUnaryExpression> {
  private exprInput: MaybeTsDsl<ExprInput>;

  constructor(expr: MaybeTsDsl<ExprInput>) {
    super();
    this.exprInput = expr;
  }

  $render(): ts.PrefixUnaryExpression {
    const expression = this.$node(this.exprInput);
    return ts.factory.createPrefixUnaryExpression(
      ts.SyntaxKind.ExclamationToken,
      expression,
    );
  }
}
