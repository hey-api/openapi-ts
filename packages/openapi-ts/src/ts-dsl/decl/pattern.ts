import type { SyntaxNode } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeArray } from '../base';
import { TsDsl } from '../base';
import { IdTsDsl } from '../expr/id';
import { TokenTsDsl } from '../token';

/**
 * Builds binding patterns (e.g. `{ foo, bar }`, `[a, b, ...rest]`).
 */
export class PatternTsDsl extends TsDsl<ts.BindingName> {
  protected pattern?:
    | { kind: 'array'; values: ReadonlyArray<string> }
    | { kind: 'object'; values: Record<string, string> };
  protected _spread?: string;

  /** Defines an array pattern (e.g. `[a, b, c]`). */
  array(...props: ReadonlyArray<string> | [ReadonlyArray<string>]): this {
    const values =
      props[0] instanceof Array
        ? [...props[0]]
        : (props as ReadonlyArray<string>);
    this.pattern = { kind: 'array', values };
    return this;
  }

  /** Defines an object pattern (e.g. `{ a, b: alias }`). */
  object(
    ...props: ReadonlyArray<MaybeArray<string> | Record<string, string>>
  ): this {
    const entries: Record<string, string> = {};
    for (const p of props) {
      if (typeof p === 'string') entries[p] = p;
      else if (p instanceof Array) for (const n of p) entries[n] = n;
      else Object.assign(entries, p);
    }
    this.pattern = { kind: 'object', values: entries };
    return this;
  }

  /** Adds a spread element (e.g. `...rest`, `...options`, `...args`). */
  spread(name: string): this {
    this._spread = name;
    return this;
  }

  /** Walk this node and its children with a visitor. */
  traverse(visitor: (node: SyntaxNode) => void): void {
    console.log(visitor);
  }

  /** Builds and returns a BindingName (ObjectBindingPattern, ArrayBindingPattern, or Identifier). */
  $render(): ts.BindingName {
    if (!this.pattern) {
      throw new Error('PatternTsDsl requires object() or array() pattern');
    }

    if (this.pattern.kind === 'object') {
      const elements = Object.entries(this.pattern.values).map(
        ([key, alias]) =>
          key === alias
            ? ts.factory.createBindingElement(
                undefined,
                undefined,
                key,
                undefined,
              )
            : ts.factory.createBindingElement(undefined, key, alias, undefined),
      );
      const spread = this.createSpread();
      if (spread) elements.push(spread);
      return ts.factory.createObjectBindingPattern(elements);
    }

    if (this.pattern.kind === 'array') {
      const elements = this.pattern.values.map((p) =>
        ts.factory.createBindingElement(undefined, undefined, p, undefined),
      );
      const spread = this.createSpread();
      if (spread) elements.push(spread);
      return ts.factory.createArrayBindingPattern(elements);
    }

    throw new Error('PatternTsDsl requires object() or array() pattern');
  }

  private createSpread(): ts.BindingElement | undefined {
    return this._spread
      ? ts.factory.createBindingElement(
          this.$node(new TokenTsDsl().spread()),
          undefined,
          this.$node(new IdTsDsl(this._spread)),
        )
      : undefined;
  }
}
