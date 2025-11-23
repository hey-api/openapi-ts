import type { SyntaxNode } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { TsDsl } from '../base';

const Mixed = TsDsl<ts.PrefixUnaryExpression>;

export class PrefixTsDsl extends Mixed {
  protected _expr?: string | MaybeTsDsl<ts.Expression>;
  protected _op?: ts.PrefixUnaryOperator;

  constructor(
    expr?: string | MaybeTsDsl<ts.Expression>,
    op?: ts.PrefixUnaryOperator,
  ) {
    super();
    this._expr = expr;
    this._op = op;
  }

  /** Sets the operand (the expression being prefixed). */
  expr(expr: string | MaybeTsDsl<ts.Expression>): this {
    this._expr = expr;
    return this;
  }

  /** Sets the operator to MinusToken for negation (`-`). */
  neg(): this {
    this._op = ts.SyntaxKind.MinusToken;
    return this;
  }

  /** Sets the operator to ExclamationToken for logical NOT (`!`). */
  not(): this {
    this._op = ts.SyntaxKind.ExclamationToken;
    return this;
  }

  /** Sets the operator (e.g. `ts.SyntaxKind.ExclamationToken` for `!`). */
  op(op: ts.PrefixUnaryOperator): this {
    this._op = op;
    return this;
  }

  traverse(visitor: (node: SyntaxNode) => void): void {
    console.log(visitor);
  }

  protected override _render() {
    if (!this._expr) {
      throw new Error('Missing expression for prefix unary expression');
    }
    if (!this._op) {
      throw new Error('Missing operator for prefix unary expression');
    }
    return ts.factory.createPrefixUnaryExpression(
      this._op,
      this.$node(this._expr),
    );
  }
}
