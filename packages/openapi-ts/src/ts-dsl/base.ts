// TODO: symbol should be protected, but needs to be public to satisfy types
import type { AnalysisContext, Node } from '@hey-api/codegen-core';
import { Symbol } from '@hey-api/codegen-core';
import { debug } from '@hey-api/codegen-core';
import ts from 'typescript';

export type MaybeArray<T> = T | ReadonlyArray<T>;

export interface ITsDsl<T extends ts.Node = ts.Node> extends Node {
  /** Render this node into a concrete TypeScript AST. */
  $render(): T;
}

export const tsDslBrand = globalThis.Symbol('ts-dsl');

export abstract class TsDsl<T extends ts.Node = ts.Node> implements ITsDsl<T> {
  /** Render this node into a concrete TypeScript AST. */
  protected abstract _render(): T;

  readonly '~brand': symbol = tsDslBrand;

  parent?: Node;

  symbol?: Symbol;

  /** Conditionally applies a callback to this builder. */
  $if<T extends TsDsl, V, R extends TsDsl = T>(
    this: T,
    value: V,
    ifTrue: (self: T, v: Exclude<V, false | null | undefined>) => R | void,
    ifFalse?: (self: T, v: Extract<V, false | null | undefined>) => R | void,
  ): R | T;
  $if<T extends TsDsl, V, R extends TsDsl = T>(
    this: T,
    value: V,
    ifTrue: (v: Exclude<V, false | null | undefined>) => R | void,
    ifFalse?: (v: Extract<V, false | null | undefined>) => R | void,
  ): R | T;
  $if<T extends TsDsl, V, R extends TsDsl = T>(
    this: T,
    value: V,
    ifTrue: () => R | void,
    ifFalse?: () => R | void,
  ): R | T;
  $if<T extends TsDsl, V, R extends TsDsl = T>(
    this: T,
    value: V,
    ifTrue: any,
    ifFalse?: any,
  ): R | T {
    if (value) {
      // Try calling with (self, value), then (value), then ()
      let result: R | void | undefined;
      try {
        result = ifTrue?.(this, value as Exclude<V, false | null | undefined>);
      } catch {
        // ignore and try other signatures
      }
      if (result === undefined) {
        try {
          result = ifTrue?.(value as Exclude<V, false | null | undefined>);
        } catch {
          // ignore and try zero-arg
        }
      }
      if (result === undefined) {
        try {
          result = ifTrue?.();
        } catch {
          // swallow
        }
      }
      return (result ?? this) as R | T;
    }
    if (ifFalse) {
      let result: R | void | undefined;
      try {
        result = ifFalse?.(this, value as Extract<V, false | null | undefined>);
      } catch {
        // ignore
      }
      if (result === undefined) {
        try {
          result = ifFalse?.(value as Extract<V, false | null | undefined>);
        } catch {
          // ignore
        }
      }
      if (result === undefined) {
        try {
          result = ifFalse?.();
        } catch {
          // ignore
        }
      }
      return (result ?? this) as R | T;
    }
    return this;
  }

  /** Render this node into a concrete TypeScript AST. */
  $render(): T {
    if (!this.parent) {
      this._validate();
    }
    return this._render();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  analyze(_: AnalysisContext): void {
    // noop
  }

  protected $maybeId<T extends string | ts.Expression>(
    expr: T,
  ): T extends string ? ts.Identifier : T {
    return (
      typeof expr === 'string' ? ts.factory.createIdentifier(expr) : expr
    ) as T extends string ? ts.Identifier : T;
  }

  protected $node<I>(value: I): NodeOfMaybe<I> {
    if (value === undefined) {
      return undefined as NodeOfMaybe<I>;
    }
    if (value instanceof Symbol) {
      return this.$maybeId(value.finalName) as NodeOfMaybe<I>;
    }
    if (typeof value === 'string') {
      return this.$maybeId(value) as NodeOfMaybe<I>;
    }
    if (value instanceof Array) {
      return value.map((item) => this.unwrap(item)) as NodeOfMaybe<I>;
    }
    return this.unwrap(value as any) as NodeOfMaybe<I>;
  }

  protected $type<I>(
    value: I,
    args?: ReadonlyArray<ts.TypeNode>,
  ): TypeOfMaybe<I> {
    if (value === undefined) {
      return undefined as TypeOfMaybe<I>;
    }
    if (value instanceof Symbol) {
      return ts.factory.createTypeReferenceNode(
        value.finalName,
        args,
      ) as TypeOfMaybe<I>;
    }
    if (typeof value === 'string') {
      return ts.factory.createTypeReferenceNode(value, args) as TypeOfMaybe<I>;
    }
    if (typeof value === 'boolean') {
      const literal = value
        ? ts.factory.createTrue()
        : ts.factory.createFalse();
      return ts.factory.createLiteralTypeNode(literal) as TypeOfMaybe<I>;
    }
    if (typeof value === 'number') {
      return ts.factory.createLiteralTypeNode(
        ts.factory.createNumericLiteral(value),
      ) as TypeOfMaybe<I>;
    }
    if (value instanceof Array) {
      return value.map((item) => this.$type(item, args)) as TypeOfMaybe<I>;
    }
    return this.unwrap(value as any) as TypeOfMaybe<I>;
  }

  /** Unwraps nested nodes into raw TypeScript AST. */
  protected unwrap<I>(value: I): I extends TsDsl<infer N> ? N : I {
    return (isTsDsl(value) ? value._render() : value) as I extends TsDsl<
      infer N
    >
      ? N
      : I;
  }

  /** Validate invariants. */
  protected _validate(): void {
    if (this.symbol && this.symbol.canonical !== this.symbol) {
      const message = `${this.constructor.name}: node is holding a non-canonical (stub) symbol`;
      debug(message, 'dsl');
      throw new Error(message);
    }
  }
}

type NodeOfMaybe<I> = undefined extends I
  ? NodeOf<NonNullable<I>> | undefined
  : NodeOf<I>;

type NodeOf<I> =
  I extends ReadonlyArray<infer U>
    ? ReadonlyArray<U extends TsDsl<infer N> ? N : U>
    : I extends string
      ? ts.Expression
      : I extends TsDsl<infer N>
        ? N
        : I extends ts.Node
          ? I
          : never;

export type MaybeTsDsl<T> =
  T extends TsDsl<infer U>
    ? U | TsDsl<U>
    : T extends ts.Node
      ? T | TsDsl<T>
      : never;

export abstract class TypeTsDsl<
  T extends
    | ts.LiteralTypeNode
    | ts.QualifiedName
    | ts.TypeElement
    | ts.TypeNode
    | ts.TypeParameterDeclaration = ts.TypeNode,
> extends TsDsl<T> {}

type TypeOfMaybe<I> = undefined extends I
  ? TypeOf<NonNullable<I>> | undefined
  : TypeOf<I>;

type TypeOf<I> =
  I extends ReadonlyArray<infer U>
    ? ReadonlyArray<TypeOf<U>>
    : I extends string
      ? ts.TypeNode
      : I extends boolean
        ? ts.LiteralTypeNode
        : I extends TsDsl<infer N>
          ? N
          : I extends ts.TypeNode
            ? I
            : never;

export function isTsDsl(value: unknown): value is TsDsl {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const obj = value as { '~brand'?: unknown };
  return obj['~brand'] === tsDslBrand && Object.hasOwn(obj, '~brand');
}
