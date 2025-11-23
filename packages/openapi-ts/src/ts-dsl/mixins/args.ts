import type ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import type { BaseCtor, MixinCtor } from './types';

export interface ArgsMethods {
  /** Renders the arguments into an array of `Expression`s. */
  $args(): ReadonlyArray<ts.Expression>;
  /** Adds a single expression argument. */
  arg(arg: string | MaybeTsDsl<ts.Expression>): this;
  /** Adds one or more expression arguments. */
  args(...args: ReadonlyArray<string | MaybeTsDsl<ts.Expression>>): this;
}

/**
 * Adds `.arg()` and `.args()` for managing expression arguments in call-like nodes.
 */
export function ArgsMixin<T extends ts.Node, TBase extends BaseCtor<T>>(
  Base: TBase,
) {
  abstract class Args extends Base {
    protected _args: Array<string | MaybeTsDsl<ts.Expression>> = [];

    protected arg(arg: string | MaybeTsDsl<ts.Expression>): this {
      this._args.push(arg);
      return this;
    }

    protected args(
      ...args: ReadonlyArray<string | MaybeTsDsl<ts.Expression>>
    ): this {
      this._args.push(...args);
      return this;
    }

    protected $args(): ReadonlyArray<ts.Expression> {
      return this.$node(this._args).map((arg) => this.$maybeId(arg));
    }
  }

  return Args as unknown as MixinCtor<TBase, ArgsMethods>;
}
