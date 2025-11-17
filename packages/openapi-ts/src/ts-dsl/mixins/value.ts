import type ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { TsDsl } from '../base';

export class ValueMixin extends TsDsl {
  private value?: string | MaybeTsDsl<ts.Expression>;

  /** Sets the initializer expression (e.g. `= expr`). */
  assign<T extends this>(this: T, expr: string | MaybeTsDsl<ts.Expression>): T {
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
