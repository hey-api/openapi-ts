import type { SyntaxNode } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { TypeTsDsl } from '../base';
import { registerLazyAccessTypeOperatorFactory } from '../mixins/type-expr';

type Op =
  | ts.SyntaxKind.KeyOfKeyword
  | ts.SyntaxKind.ReadonlyKeyword
  | ts.SyntaxKind.UniqueKeyword;
type Type = string | MaybeTsDsl<ts.TypeNode>;

const Mixed = TypeTsDsl<ts.TypeOperatorNode>;

/**
 * Builds a TypeScript `TypeOperatorNode`, such as:
 *
 * - `keyof T`
 * - `readonly U`
 * - `unique V`
 *
 * This DSL provides both a generic `.operator()` API and convenient
 * shorthand methods (`.keyof()`, `.readonly()`, `.unique()`).
 *
 * The node will throw during render if required fields are missing.
 */
export class TypeOperatorTsDsl extends Mixed {
  protected _op?: Op;
  protected _type?: Type;

  /** Shorthand: builds `keyof T`. */
  keyof(type: Type): this {
    this.operator(ts.SyntaxKind.KeyOfKeyword);
    this.type(type);
    return this;
  }

  /** Sets the operator explicitly. */
  operator(op: Op): this {
    this._op = op;
    return this;
  }

  /** Shorthand: builds `readonly T`. */
  readonly(type: Type): this {
    this.operator(ts.SyntaxKind.ReadonlyKeyword);
    this.type(type);
    return this;
  }

  traverse(visitor: (node: SyntaxNode) => void): void {
    console.log(visitor);
  }

  /** Sets the target type of the operator. */
  type(type: Type): this {
    this._type = type;
    return this;
  }

  /** Shorthand: builds `unique T`. */
  unique(type: Type): this {
    this.operator(ts.SyntaxKind.UniqueKeyword);
    this.type(type);
    return this;
  }

  protected override _render() {
    this.$validate();
    return ts.factory.createTypeOperatorNode(this._op, this.$type(this._type));
  }

  /** Throws if required fields are not set. */
  $validate(): asserts this is this & {
    _op: Op;
    _type: Type;
  } {
    const missing = this.missingRequiredCalls();
    if (missing.length === 0) return;
    throw new Error(`Type operator missing ${missing.join(' and ')}`);
  }

  private missingRequiredCalls(): ReadonlyArray<string> {
    const missing: Array<string> = [];
    if (!this._op) missing.push('.operator()');
    if (!this._type) missing.push('.\u200Btype()');
    return missing;
  }
}

registerLazyAccessTypeOperatorFactory(
  (...args) => new TypeOperatorTsDsl(...args),
);
