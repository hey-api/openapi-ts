import type ts from 'typescript';

import type { MaybeTsDsl, TypeTsDsl } from '../base';
import type { BaseCtor, MixinCtor } from './types';

export interface TypeArgsMethods {
  /** Returns the type arguments as an array of ts.TypeNode nodes. */
  $generics(): ReadonlyArray<ts.TypeNode> | undefined;
  /** Adds a single type argument (e.g. `string` in `Foo<string>`). */
  generic(arg: string | MaybeTsDsl<TypeTsDsl>): this;
  /** Adds type arguments (e.g. `Map<string, number>`). */
  generics(...args: ReadonlyArray<string | MaybeTsDsl<TypeTsDsl>>): this;
}

export function TypeArgsMixin<T extends ts.Node, TBase extends BaseCtor<T>>(
  Base: TBase,
) {
  abstract class TypeArgs extends Base {
    protected _generics?: Array<string | MaybeTsDsl<TypeTsDsl>>;

    protected generic(arg: string | MaybeTsDsl<TypeTsDsl>): this {
      (this._generics ??= []).push(arg);
      return this;
    }

    protected generics(
      ...args: ReadonlyArray<string | MaybeTsDsl<TypeTsDsl>>
    ): this {
      (this._generics ??= []).push(...args);
      return this;
    }

    protected $generics(): ReadonlyArray<ts.TypeNode> | undefined {
      return this.$type(this._generics);
    }
  }

  return TypeArgs as unknown as MixinCtor<TBase, TypeArgsMethods>;
}
