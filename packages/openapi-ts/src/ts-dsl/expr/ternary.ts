import type { AnalysisContext, AstContext } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { TsDsl } from '../base';

const Mixed = TsDsl<ts.ConditionalExpression>;

export class TernaryTsDsl extends Mixed {
  readonly '~dsl' = 'TernaryTsDsl';

  protected _condition?: string | MaybeTsDsl<ts.Expression>;
  protected _then?: string | MaybeTsDsl<ts.Expression>;
  protected _else?: string | MaybeTsDsl<ts.Expression>;

  constructor(condition?: string | MaybeTsDsl<ts.Expression>) {
    super();
    if (condition) this.condition(condition);
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    ctx.analyze(this._condition);
    ctx.analyze(this._then);
    ctx.analyze(this._else);
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

  override toAst(ctx: AstContext) {
    if (!this._condition) throw new Error('Missing condition in ternary');
    if (!this._then) throw new Error('Missing then expression in ternary');
    if (!this._else) throw new Error('Missing else expression in ternary');

    return ts.factory.createConditionalExpression(
      this.$node(ctx, this._condition),
      undefined,
      this.$node(ctx, this._then),
      undefined,
      this.$node(ctx, this._else),
    );
  }
}
