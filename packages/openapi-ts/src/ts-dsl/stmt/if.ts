import type { AnalysisContext } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { TsDsl } from '../base';
import type { DoExpr } from '../mixins/do';
import { DoMixin } from '../mixins/do';
import { BlockTsDsl } from './block';

export type IfCondition = string | MaybeTsDsl<ts.Expression>;

const Mixed = DoMixin(TsDsl<ts.IfStatement>);

export class IfTsDsl extends Mixed {
  readonly '~dsl' = 'IfTsDsl';

  protected _condition?: IfCondition;
  protected _else?: Array<DoExpr>;

  constructor(condition?: IfCondition) {
    super();
    if (condition) this.condition(condition);
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    ctx.analyze(this._condition);
    if (this._else) {
      ctx.pushScope();
      try {
        for (const stmt of this._else) {
          ctx.analyze(stmt);
        }
      } finally {
        ctx.popScope();
      }
    }
  }

  condition(condition: IfCondition): this {
    this._condition = condition;
    return this;
  }

  otherwise(...items: Array<DoExpr>): this {
    this._else = items;
    return this;
  }

  override toAst() {
    if (!this._condition) throw new Error('Missing condition in if');
    if (!this._do) throw new Error('Missing then block in if');

    return ts.factory.createIfStatement(
      this.$node(this._condition),
      this.$node(new BlockTsDsl(...this._do)),
      this._else ? this.$node(new BlockTsDsl(this._else)) : undefined,
    );
  }
}
