import ts from 'typescript';

export type MaybeArray<T> = T | ReadonlyArray<T>;

export type WithStatement<T = ts.Expression> = T | ts.Statement;

export type WithString<T = ts.Expression> = T | string;

export interface ITsDsl<T extends ts.Node = ts.Node> {
  $render(): T;
}

export abstract class TsDsl<T extends ts.Node = ts.Node> implements ITsDsl<T> {
  abstract $render(): T;

  protected $expr<T>(expr: WithString<T>): T {
    return typeof expr === 'string'
      ? (ts.factory.createIdentifier(expr) as T)
      : expr;
  }

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

  protected $node<I>(input: I): NodeOfMaybe<I> {
    if (input === undefined) {
      return undefined as NodeOfMaybe<I>;
    }
    if (typeof input === 'string') {
      return this.$expr(input) as NodeOfMaybe<I>;
    }
    if (typeof input === 'boolean') {
      return (
        input ? ts.factory.createTrue() : ts.factory.createFalse()
      ) as NodeOfMaybe<I>;
    }
    if (input instanceof Array) {
      return input.map((item) => this._render(item)) as NodeOfMaybe<I>;
    }
    return this._render(input as any) as NodeOfMaybe<I>;
  }

  protected $stmt(
    input: MaybeArray<MaybeTsDsl<WithString<WithStatement>>>,
  ): ReadonlyArray<ts.Statement> {
    const arr = input instanceof Array ? input : [input];
    return arr.map((item) => {
      const node =
        typeof item === 'string'
          ? ts.factory.createIdentifier(item)
          : this._render(item as any);
      return ts.isExpression(node)
        ? ts.factory.createExpressionStatement(node)
        : (node as ts.Statement);
    });
  }

  protected $type<I>(
    input: I,
    args?: ReadonlyArray<ts.TypeNode>,
  ): TypeOfMaybe<I> {
    if (input === undefined) {
      return undefined as TypeOfMaybe<I>;
    }
    if (typeof input === 'string') {
      return ts.factory.createTypeReferenceNode(input, args) as TypeOfMaybe<I>;
    }
    if (typeof input === 'boolean') {
      const literal = input
        ? ts.factory.createTrue()
        : ts.factory.createFalse();
      return ts.factory.createLiteralTypeNode(literal) as TypeOfMaybe<I>;
    }
    if (input instanceof Array) {
      return input.map((item) => this.$type(item, args)) as TypeOfMaybe<I>;
    }
    return this._render(input as any) as TypeOfMaybe<I>;
  }

  private _render<T extends ts.Node>(value: MaybeTsDsl<T>): T {
    return (value instanceof TsDsl ? value.$render() : value) as T;
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
      : I extends boolean
        ? ts.Expression
        : I extends TsDsl<infer N>
          ? N
          : I extends ts.Node
            ? I
            : never;

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

export type MaybeTsDsl<T> =
  // if T includes string in the union
  string extends T
    ? Exclude<T, string> extends ts.Node
      ? string | Exclude<T, string> | TsDsl<Exclude<T, string>>
      : string
    : // otherwise only node or DSL
      T extends ts.Node
      ? T | TsDsl<T>
      : never;

export type TypeOfTsDsl<T> = T extends TsDsl<infer U> ? U : never;
