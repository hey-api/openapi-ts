import type { AnalysisContext, Node } from '@hey-api/codegen-core';

import type { py } from '../../ts-python';
import type { MaybePyDsl } from '../base';
import type { BaseCtor, MixinCtor } from './types';

export type ValueExpr = string | MaybePyDsl<py.Expression>;

export interface ValueMethods extends Node {
  $value(): py.Expression | undefined;
  /** Sets the initializer expression (e.g. `= expr`). */
  assign(expr: ValueExpr): this;
}

export function ValueMixin<T extends py.Node, TBase extends BaseCtor<T>>(Base: TBase) {
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

    protected $value(): py.Expression | undefined {
      return this.$node(this.value);
    }
  }

  return Value as unknown as MixinCtor<TBase, ValueMethods>;
}
