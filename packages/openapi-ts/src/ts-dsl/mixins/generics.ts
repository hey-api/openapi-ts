import ts from 'typescript';

import { type MaybeTsDsl, TsDsl } from '../base';
import { TypeParamTsDsl } from '../type/param';

export class GenericsMixin extends TsDsl {
  protected _generics?: Array<string | MaybeTsDsl<ts.TypeParameterDeclaration>>;

  /** Adds a single generic type argument (e.g. `T` in `Array<T>`). */
  generic(name: string, fn?: (t: TypeParamTsDsl) => void): this {
    const g = new TypeParamTsDsl(name, fn);
    (this._generics ??= []).push(g);
    return this;
  }

  /** Adds generic type arguments (e.g. `Map<string, T>`). */
  generics(
    ...args: ReadonlyArray<string | MaybeTsDsl<ts.TypeParameterDeclaration>>
  ): this {
    this._generics = [...args];
    return this;
  }

  protected $generics():
    | ReadonlyArray<ts.TypeParameterDeclaration>
    | undefined {
    console.log('hi')
    return this._generics?.map((g) => {
      if (typeof g === 'string') {
        return ts.factory.createTypeParameterDeclaration(
          undefined,
          ts.factory.createIdentifier(g),
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
