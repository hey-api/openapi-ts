import type { AnalysisContext, Node, Symbol } from '@hey-api/codegen-core';
import { isSymbol } from '@hey-api/codegen-core';
import type ts from 'typescript';

import { isTsDsl, type MaybeTsDsl } from '../base';
import type { BaseCtor, MixinCtor } from './types';

type Arg = Symbol | string | MaybeTsDsl<ts.Expression>;

export interface ArgsMethods extends Node {
  /** Renders the arguments into an array of `Expression`s. */
  $args(): ReadonlyArray<ts.Expression>;
  /** Adds a single expression argument. */
  arg(arg: Arg | undefined): this;
  /** Adds one or more expression arguments. */
  args(...args: ReadonlyArray<Arg | undefined>): this;
}

/**
 * Adds `.arg()` and `.args()` for managing expression arguments in call-like nodes.
 */
export function ArgsMixin<T extends ts.Node, TBase extends BaseCtor<T>>(
  Base: TBase,
) {
  abstract class Args extends Base {
    protected _args: Array<Arg> = [];

    override analyze(ctx: AnalysisContext): void {
      super.analyze(ctx);
      for (const arg of this._args) {
        if (isSymbol(arg)) {
          ctx.addDependency(arg);
        } else if (isTsDsl(arg)) {
          arg.analyze(ctx);
        }
      }
    }

    protected arg(arg: Arg | undefined): this {
      if (arg !== undefined) this._args.push(arg);
      return this;
    }

    protected args(...args: ReadonlyArray<Arg | undefined>): this {
      this._args.push(
        ...args.filter((a): a is NonNullable<typeof a> => a !== undefined),
      );
      return this;
    }

    protected $args(): ReadonlyArray<ts.Expression> {
      return this.$node(this._args).map((arg) => this.$node(arg));
    }
  }

  return Args as unknown as MixinCtor<TBase, ArgsMethods>;
}
