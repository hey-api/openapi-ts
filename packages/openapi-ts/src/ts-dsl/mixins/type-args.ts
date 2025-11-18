import type ts from 'typescript';

import type { MaybeTsDsl, TypeTsDsl } from '../base';
import { TsDsl } from '../base';

export class TypeArgsMixin extends TsDsl {
  protected _generics?: Array<string | MaybeTsDsl<TypeTsDsl>>;

  /** Adds a single type argument (e.g. `string` in `Foo<string>`). */
  generic(arg: string | MaybeTsDsl<TypeTsDsl>): this {
    (this._generics ??= []).push(arg);
    return this;
  }

  /** Adds type arguments (e.g. `Map<string, number>`). */
  generics(...args: ReadonlyArray<string | MaybeTsDsl<TypeTsDsl>>): this {
    (this._generics ??= []).push(...args);
    return this;
  }

  /** Returns the type arguments as an array of ts.TypeNode nodes. */
  protected $generics(): ReadonlyArray<ts.TypeNode> | undefined {
    return this.$type(this._generics);
  }

  $render(): ts.Node {
    throw new Error('noop');
  }
}
