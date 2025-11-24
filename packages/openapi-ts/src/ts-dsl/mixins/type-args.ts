import type { Symbol, SyntaxNode } from '@hey-api/codegen-core';
import type ts from 'typescript';

import type { MaybeTsDsl, TypeTsDsl } from '../base';
import { TsDsl } from '../base';
import type { BaseCtor, MixinCtor } from './types';

export interface TypeArgsMethods extends SyntaxNode {
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
    protected _generics: Array<string | MaybeTsDsl<TypeTsDsl>> = [];

    protected generic(arg: string | MaybeTsDsl<TypeTsDsl>): this {
      if (arg instanceof TsDsl) arg.setParent(this);
      this._generics.push(arg);
      return this;
    }

    protected generics(
      ...args: ReadonlyArray<string | MaybeTsDsl<TypeTsDsl>>
    ): this {
      for (const arg of args) {
        if (arg instanceof TsDsl) arg.setParent(this);
        this._generics.push(arg);
      }
      return this;
    }

    protected $generics(): ReadonlyArray<ts.TypeNode> | undefined {
      return this.$type(this._generics);
    }

    override collectSymbols(out: Set<Symbol>): void {
      super.collectSymbols(out);
      for (const g of this._generics) {
        if (g instanceof TsDsl) g.collectSymbols(out);
      }
    }

    override traverse(visitor: (node: SyntaxNode) => void): void {
      super.traverse(visitor);
      for (const g of this._generics) {
        if (g instanceof TsDsl) g.traverse(visitor);
      }
    }
  }

  return TypeArgs as unknown as MixinCtor<TBase, TypeArgsMethods>;
}
