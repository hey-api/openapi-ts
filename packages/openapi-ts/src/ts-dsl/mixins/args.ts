import type ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { TsDsl } from '../base';

/**
 * Adds `.arg()` and `.args()` for managing expression arguments in call-like nodes.
 */
export abstract class ArgsMixin extends TsDsl {
  protected _args?: Array<string | MaybeTsDsl<ts.Expression>>;

  /** Adds a single expression argument. */
  arg(arg: string | MaybeTsDsl<ts.Expression>): this {
    (this._args ??= []).push(arg);
    return this;
  }

  /** Adds one or more expression arguments. */
  args(...args: ReadonlyArray<string | MaybeTsDsl<ts.Expression>>): this {
    (this._args ??= []).push(...args);
    return this;
  }

  /** Renders the arguments into an array of `Expression`s. */
  protected $args(): ReadonlyArray<ts.Expression> {
    if (!this._args) return [];
    return this.$node(this._args).map((arg) => this.$maybeId(arg));
  }
}
