import type { AnalysisContext, Node, Symbol } from '@hey-api/codegen-core';
import { isSymbol } from '@hey-api/codegen-core';
import type ts from 'typescript';

import type { MaybeTsDsl, TypeTsDsl } from '../base';
import { isTsDsl } from '../base';
import type { BaseCtor, MixinCtor } from './types';

type Arg = Symbol | string | MaybeTsDsl<TypeTsDsl>;

export interface TypeArgsMethods extends Node {
  /** Returns the type arguments as an array of ts.TypeNode nodes. */
  $generics(): ReadonlyArray<ts.TypeNode> | undefined;
  /** Adds a single type argument (e.g. `string` in `Foo<string>`). */
  generic(arg: Arg): this;
  /** Adds type arguments (e.g. `Map<string, number>`). */
  generics(...args: ReadonlyArray<Arg>): this;
}

export function TypeArgsMixin<T extends ts.Node, TBase extends BaseCtor<T>>(
  Base: TBase,
) {
  abstract class TypeArgs extends Base {
    protected _generics: Array<Arg> = [];

    override analyze(ctx: AnalysisContext): void {
      super.analyze(ctx);
      for (const g of this._generics) {
        if (isSymbol(g)) {
          ctx.addDependency(g);
        } else if (isTsDsl(g)) {
          g.analyze(ctx);
        }
      }
    }

    protected generic(arg: Arg): this {
      this._generics.push(arg);
      return this;
    }

    protected generics(...args: ReadonlyArray<Arg>): this {
      this._generics.push(...args);
      return this;
    }

    protected $generics(): ReadonlyArray<ts.TypeNode> | undefined {
      return this.$type(this._generics);
    }
  }

  return TypeArgs as unknown as MixinCtor<TBase, TypeArgsMethods>;
}
