import type { SyntaxNode } from '@hey-api/codegen-core';
import type ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import type { BaseCtor, MixinCtor } from './types';

export interface ValueMethods extends SyntaxNode {
  $value(): ts.Expression | undefined;
  /** Sets the initializer expression (e.g. `= expr`). */
  assign(expr: string | MaybeTsDsl<ts.Expression>): this;
}

export function ValueMixin<T extends ts.Node, TBase extends BaseCtor<T>>(
  Base: TBase,
) {
  abstract class Value extends Base {
    protected value?: string | MaybeTsDsl<ts.Expression>;

    protected assign(expr: string | MaybeTsDsl<ts.Expression>): this {
      this.value = expr;
      return this;
    }

    protected $value(): ts.Expression | undefined {
      return this.$node(this.value);
    }
  }

  return Value as unknown as MixinCtor<TBase, ValueMethods>;
}
