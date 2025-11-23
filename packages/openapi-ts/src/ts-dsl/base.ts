// TODO: symbol should be protected, but needs to be public to satisfy types
import type { Symbol, SyntaxNode } from '@hey-api/codegen-core';
import ts from 'typescript';

export type MaybeArray<T> = T | ReadonlyArray<T>;

export interface ITsDsl<T extends ts.Node = ts.Node> extends SyntaxNode {
  /** Render this DSL node into a concrete TypeScript AST node. */
  $render(): T;
}

export type Constructor<T = ITsDsl> = new (...args: ReadonlyArray<any>) => T;

export abstract class TsDsl<T extends ts.Node = ts.Node> implements ITsDsl<T> {
  /** Walk this node and its children with a visitor. */
  abstract traverse(visitor: (node: SyntaxNode) => void): void;

  /** Render this DSL node into a concrete TypeScript AST node. */
  abstract $render(): T;

  /** Parent DSL node in the constructed syntax tree. */
  protected parent?: TsDsl<any>;

  /** The codegen symbol associated with this node. */
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

  /** Returns all locally declared names within this node. */
  getLocalNames(): Iterable<string> {
    return [];
  }

  /** Returns all symbols referenced by this node (directly or through children). */
  getSymbols(): Iterable<Symbol> {
    return [];
  }

  /** Rewrites internal identifier nodes after final name resolution. */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  rewriteIdentifiers(_map: Map<string, string>): void {
    // noop
  }

  /** Assigns the parent DSL node, enforcing a single-parent invariant. */
  setParent(parent: TsDsl<any>): this {
    if (this.parent && this.parent !== parent) {
      throw new Error(
        `DSL node already has a parent (${this.parent.constructor.name}); cannot reassign to ${parent.constructor.name}.`,
      );
    }
    this.parent = parent;
    return this;
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
    if (typeof value === 'string') {
      return ts.factory.createIdentifier(value) as NodeOfMaybe<I>;
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

  /** Returns the root symbol associated with this DSL subtree. */
  protected getRootSymbol(): Symbol | undefined {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let n: TsDsl<any> | undefined = this;
    while (n) {
      if (n.symbol) return n.symbol;
      n = n.parent;
    }
    return undefined;
  }

  /** Unwraps nested DSL nodes into raw TypeScript AST nodes. */
  protected unwrap<I>(value: I): I extends TsDsl<infer N> ? N : I {
    return (
      value instanceof TsDsl ? value.$render() : value
    ) as I extends TsDsl<infer N> ? N : I;
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
