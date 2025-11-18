import type ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { TsDsl } from '../base';
import { StmtTsDsl } from '../stmt/stmt';

/**
 * Adds `.do()` for appending statements or expressions to a body.
 */
export class DoMixin extends TsDsl {
  protected _do?: Array<MaybeTsDsl<ts.Expression | ts.Statement>>;

  /** Adds one or more expressions/statements to the body. */
  do(...items: ReadonlyArray<MaybeTsDsl<ts.Expression | ts.Statement>>): this {
    (this._do ??= []).push(...items);
    return this;
  }

  /** Renders the collected `.do()` calls into an array of `Statement` nodes. */
  protected $do(): ReadonlyArray<ts.Statement> {
    if (!this._do) return [];
    return this.$node(this._do.map((item) => new StmtTsDsl(item)));
  }

  $render(): ts.Node {
    throw new Error('noop');
  }
}
