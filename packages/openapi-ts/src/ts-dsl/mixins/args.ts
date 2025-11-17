import type ts from 'typescript';

import type { MaybeTsDsl, WithString } from '../base';
import { TsDsl } from '../base';

/**
 * Adds `.arg()` and `.args()` for managing expression arguments in call-like nodes.
 */
export class ArgsMixin extends TsDsl {
  private _args?: Array<MaybeTsDsl<WithString>>;

  /** Adds a single expression argument. */
  arg(arg: MaybeTsDsl<WithString>): this {
    (this._args ??= []).push(arg);
    return this;
  }

  /** Adds one or more expression arguments. */
  args(...args: ReadonlyArray<MaybeTsDsl<WithString>>): this {
    (this._args ??= []).push(...args);
    return this;
  }

  /** Renders the arguments into an array of `Expression`s. */
  protected $args(): ReadonlyArray<ts.Expression> {
    if (!this._args) return [];
    return this.$node(this._args).map((arg) => this.$expr(arg));
  }

  $render(): ts.Node {
    throw new Error('noop');
  }
}
