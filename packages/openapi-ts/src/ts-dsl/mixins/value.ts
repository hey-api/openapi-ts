import type { ExprInput, MaybeTsDsl } from '../base';

export class ValueMixin {
  protected initializer?: MaybeTsDsl<ExprInput>;

  /** Sets the initializer expression (e.g. `= expr`). */
  assign<T extends this>(this: T, expr: MaybeTsDsl<ExprInput>): T {
    this.initializer = expr;
    return this;
  }
}
