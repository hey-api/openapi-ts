import type { AnalysisContext, AstContext, Node } from '@hey-api/codegen-core';
import type ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import type { BaseCtor, MixinCtor } from './types';

export type ValueExpr = string | MaybeTsDsl<ts.Expression>;

export interface ValueMethods extends Node {
  $value(ctx: AstContext): ts.Expression | undefined;
  /** Sets the initializer expression (e.g. `= expr`). */
  assign(expr: ValueExpr): this;
}

export function ValueMixin<T extends ts.Node, TBase extends BaseCtor<T>>(
  Base: TBase,
) {
  abstract class Value extends Base {
    protected value?: ValueExpr;

    override analyze(ctx: AnalysisContext): void {
      super.analyze(ctx);
      ctx.analyze(this.value);
    }

    protected assign(expr: ValueExpr): this {
      this.value = expr;
      return this;
    }

    protected $value(ctx: AstContext): ts.Expression | undefined {
      return this.$node(ctx, this.value);
    }
  }

  return Value as unknown as MixinCtor<TBase, ValueMethods>;
}
