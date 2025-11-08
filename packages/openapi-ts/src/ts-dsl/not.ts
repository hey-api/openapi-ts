import ts from 'typescript';

import type { MaybeTsDsl, WithString } from './base';
import { TsDsl } from './base';

export class NotTsDsl extends TsDsl<ts.PrefixUnaryExpression> {
  private _notExpr: MaybeTsDsl<WithString>;

  constructor(expr: MaybeTsDsl<WithString>) {
    super();
    this._notExpr = expr;
  }

  $render(): ts.PrefixUnaryExpression {
    return ts.factory.createPrefixUnaryExpression(
      ts.SyntaxKind.ExclamationToken,
      this.$node(this._notExpr),
    );
  }
}
