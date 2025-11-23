import type ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { TsDsl } from '../base';
import { TypeParamTsDsl } from '../type/param';

export abstract class TypeParamsMixin extends TsDsl {
  protected _generics?: Array<string | MaybeTsDsl<TypeParamTsDsl>>;

  /** Adds a single type parameter (e.g. `T` in `Array<T>`). */
  generic(...args: ConstructorParameters<typeof TypeParamTsDsl>): this {
    const g = new TypeParamTsDsl(...args);
    (this._generics ??= []).push(g);
    return this;
  }

  /** Adds type parameters (e.g. `Map<string, T>`). */
  generics(...args: ReadonlyArray<string | MaybeTsDsl<TypeParamTsDsl>>): this {
    (this._generics ??= []).push(...args);
    return this;
  }

  /** Returns the type parameters as an array of ts.TypeParameterDeclaration nodes. */
  protected $generics():
    | ReadonlyArray<ts.TypeParameterDeclaration>
    | undefined {
    return this._generics?.map((g) => {
      const node = typeof g === 'string' ? new TypeParamTsDsl(g) : g;
      return this.$node(node);
    });
  }
}
