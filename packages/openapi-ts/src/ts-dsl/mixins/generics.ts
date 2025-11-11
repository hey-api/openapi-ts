import ts from 'typescript';

import type { MaybeTsDsl, TypeOfTsDsl } from '../base';
import { TsDsl } from '../base';
import { TypeParamTsDsl } from '../type/param';

export class GenericsMixin extends TsDsl {
  protected _generics?: Array<string | MaybeTsDsl<TypeOfTsDsl<TypeParamTsDsl>>>;

  /** Adds a single generic type argument (e.g. `T` in `Array<T>`). */
  generic(...args: ConstructorParameters<typeof TypeParamTsDsl>): this {
    const g = new TypeParamTsDsl(...args);
    (this._generics ??= []).push(g);
    return this;
  }

  /** Adds generic type arguments (e.g. `Map<string, T>`). */
  generics(
    ...args: ReadonlyArray<string | MaybeTsDsl<TypeOfTsDsl<TypeParamTsDsl>>>
  ): this {
    this._generics = [...args];
    return this;
  }

  protected $generics():
    | ReadonlyArray<TypeOfTsDsl<TypeParamTsDsl>>
    | undefined {
    return this._generics?.map((g) => {
      if (typeof g === 'string') {
        return ts.factory.createTypeParameterDeclaration(
          undefined,
          this.$expr(g),
          undefined,
          undefined,
        );
      }
      return this.$node(g);
    });
  }

  $render(): ts.Node {
    throw new Error('noop');
  }
}
