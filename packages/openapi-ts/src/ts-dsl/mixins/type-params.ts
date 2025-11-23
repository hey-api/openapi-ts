import type { Symbol } from '@hey-api/codegen-core';
import type ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { TypeParamTsDsl } from '../type/param';
import type { BaseCtor, MixinCtor } from './types';

export interface TypeParamsMethods {
  /** Returns the type parameters as an array of ts.TypeParameterDeclaration nodes. */
  $generics(): ReadonlyArray<ts.TypeParameterDeclaration> | undefined;
  /** Adds a single type parameter (e.g. `T` in `Array<T>`). */
  generic(...args: ConstructorParameters<typeof TypeParamTsDsl>): this;
  /** Adds type parameters (e.g. `Map<string, T>`). */
  generics(
    ...args: ReadonlyArray<Symbol | string | MaybeTsDsl<TypeParamTsDsl>>
  ): this;
}

export function TypeParamsMixin<T extends ts.Node, TBase extends BaseCtor<T>>(
  Base: TBase,
) {
  abstract class TypeParams extends Base {
    protected _generics?: Array<MaybeTsDsl<TypeParamTsDsl>>;

    protected generic(
      ...args: ConstructorParameters<typeof TypeParamTsDsl>
    ): this {
      const g = new TypeParamTsDsl(...args).setParent(this);
      (this._generics ??= []).push(g);
      return this;
    }

    protected generics(
      ...args: ReadonlyArray<Symbol | string | MaybeTsDsl<TypeParamTsDsl>>
    ): this {
      for (let arg of args) {
        if (typeof arg !== 'object' || 'id' in arg) {
          arg = new TypeParamTsDsl(arg);
        }
        if (typeof arg === 'object' && 'setParent' in arg) {
          arg.setParent(this);
        }
        (this._generics ??= []).push(arg);
      }
      return this;
    }

    protected $generics():
      | ReadonlyArray<ts.TypeParameterDeclaration>
      | undefined {
      return this.$node(this._generics);
    }
  }

  return TypeParams as unknown as MixinCtor<TBase, TypeParamsMethods>;
}
