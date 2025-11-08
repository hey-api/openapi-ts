import ts from 'typescript';

import type { MaybeTsDsl, WithString } from './base';
import { TsDsl } from './base';

export class NotTsDsl extends TsDsl<ts.PrefixUnaryExpression> {
  private exprInput: MaybeTsDsl<WithString>;

  constructor(expr: MaybeTsDsl<WithString>) {
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
