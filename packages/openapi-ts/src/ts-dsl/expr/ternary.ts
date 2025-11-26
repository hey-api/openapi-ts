import type { AnalysisContext } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { isTsDsl, TsDsl } from '../base';

const Mixed = TsDsl<ts.ConditionalExpression>;

export class TernaryTsDsl extends Mixed {
  protected _condition?: string | MaybeTsDsl<ts.Expression>;
  protected _then?: string | MaybeTsDsl<ts.Expression>;
  protected _else?: string | MaybeTsDsl<ts.Expression>;

  constructor(condition?: string | MaybeTsDsl<ts.Expression>) {
    super();
    if (condition) this.condition(condition);
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    if (isTsDsl(this._condition)) this._condition.analyze(ctx);
    if (isTsDsl(this._then)) this._then.analyze(ctx);
    if (isTsDsl(this._else)) this._else.analyze(ctx);
  }

  condition(condition: string | MaybeTsDsl<ts.Expression>) {
    this._condition = condition;
    return this;
  }

  do(expr: string | MaybeTsDsl<ts.Expression>) {
    this._then = expr;
    return this;
  }

  otherwise(expr: string | MaybeTsDsl<ts.Expression>) {
    this._else = expr;
    return this;
  }

  protected override _render() {
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
