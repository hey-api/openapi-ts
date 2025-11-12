import type ts from 'typescript';

import type { MaybeTsDsl, TypeOfTsDsl, WithString } from '../base';
import { TypeTsDsl } from '../base';

export class TypeArgsMixin extends TypeTsDsl {
  protected _generics?: Array<WithString<MaybeTsDsl<TypeOfTsDsl<TypeTsDsl>>>>;

  /** Adds a single type argument (e.g. `string` in `Foo<string>`). */
  generic(arg: WithString<MaybeTsDsl<TypeOfTsDsl<TypeTsDsl>>>): this {
    (this._generics ??= []).push(arg);
    return this;
  }

  /** Adds type arguments (e.g. `Map<string, number>`). */
  generics(
    ...args: ReadonlyArray<WithString<MaybeTsDsl<TypeOfTsDsl<TypeTsDsl>>>>
  ): this {
    this._generics = [...args];
    return this;
  }

  /**
   * Returns the type arguments as an array of ts.TypeNode nodes.
   */
  protected $generics(): ReadonlyArray<ts.TypeNode> | undefined {
    return this.$type(this._generics);
  }

  $render(): ts.TypeNode {
    throw new Error('noop');
  }
}
