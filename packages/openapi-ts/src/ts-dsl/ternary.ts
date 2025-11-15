import ts from 'typescript';

import type { MaybeTsDsl, WithString } from './base';
import { TsDsl } from './base';

export class TernaryTsDsl extends TsDsl<ts.ConditionalExpression> {
  private _condition?: MaybeTsDsl<WithString>;
  private _then?: MaybeTsDsl<WithString>;
  private _else?: MaybeTsDsl<WithString>;

  constructor(condition?: MaybeTsDsl<WithString>) {
    super();
    if (condition) this.condition(condition);
  }

  condition(condition: MaybeTsDsl<WithString>) {
    this._condition = condition;
    return this;
  }

  do(expr: MaybeTsDsl<WithString>) {
    this._then = expr;
    return this;
  }

  otherwise(expr: MaybeTsDsl<WithString>) {
    this._else = expr;
    return this;
  }

  $render(): ts.ConditionalExpression {
    if (!this._condition) throw new Error('Missing condition in ternary');
    if (!this._then) throw new Error('Missing then expression in ternary');
    if (!this._else) throw new Error('Missing else expression in ternary');

    return ts.factory.createConditionalExpression(
      this.$node(this._condition),
      undefined,
      this.$node(this._then),
      undefined,
      this.$node(this._else),
    );
  }
}
