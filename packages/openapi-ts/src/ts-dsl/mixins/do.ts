import type ts from 'typescript';

import type { MaybeTsDsl, WithStatement } from '../base';
import { TsDsl } from '../base';

/**
 * Adds `.do()` for appending statements or expressions to a body.
 */
export class DoMixin extends TsDsl {
  private _do?: Array<MaybeTsDsl<WithStatement>>;

  /** Adds one or more expressions/statements to the body. */
  do(...items: ReadonlyArray<MaybeTsDsl<WithStatement>>): this {
    (this._do ??= []).push(...items);
    return this;
  }

  /** Renders the collected `.do()` calls into an array of `Statement` nodes. */
  protected $do(): ReadonlyArray<ts.Statement> {
    if (!this._do) return [];
    return this.$stmt(this._do);
  }

  $render(): ts.Node {
    throw new Error('noop');
  }
}
