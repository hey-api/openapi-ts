import type ts from 'typescript';

import { type MaybeTsDsl, TsDsl, type WithString } from '../base';

export class ValueMixin extends TsDsl {
  private value?: MaybeTsDsl<WithString>;

  /** Sets the initializer expression (e.g. `= expr`). */
  assign<T extends this>(this: T, expr: MaybeTsDsl<WithString>): T {
    this.value = expr;
    return this;
  }

  protected $value(): ts.Expression | undefined {
    return this.$node(this.value);
  }

  $render(): ts.Node {
    throw new Error('noop');
  }
}
