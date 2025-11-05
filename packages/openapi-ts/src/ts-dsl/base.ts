import ts from 'typescript';

export type ExprInput<T = ts.Expression> = T | string;

export type TypeInput = string | boolean | MaybeTsDsl<ts.TypeNode>;

export interface ITsDsl<T extends ts.Node = ts.Node> {
  $render(): T;
}

export abstract class TsDsl<T extends ts.Node = ts.Node> implements ITsDsl<T> {
  abstract $render(): T;

  protected $expr<T>(expr: ExprInput<T>): T {
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
  ): R | T {
    if (value) {
      const result = ifTrue(
        this,
        value as Exclude<V, false | null | undefined>,
      );
      return result ?? this;
    }
    if (ifFalse) {
      const result = ifFalse(
        this,
        value as Extract<V, false | null | undefined>,
      );
      return result ?? this;
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
    if (input instanceof Array) {
      return input.map((item) => this._render(item)) as NodeOfMaybe<I>;
    }
    return this._render(input as any) as NodeOfMaybe<I>;
  }

  protected $stmt(
    input:
      | MaybeTsDsl<ExprInput<ts.Statement | ts.Expression>>
      | ReadonlyArray<MaybeTsDsl<ExprInput<ts.Statement | ts.Expression>>>,
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

  protected $type<I>(type: I): TypeOfMaybe<I> {
    if (type === undefined) {
      return undefined as TypeOfMaybe<I>;
    }
    if (typeof type === 'string') {
      return ts.factory.createTypeReferenceNode(
        type,
      ) as unknown as TypeOfMaybe<I>;
    }
    if (typeof type === 'boolean') {
      const literal = type ? ts.factory.createTrue() : ts.factory.createFalse();
      return ts.factory.createLiteralTypeNode(literal) as TypeOfMaybe<I>;
    }
    return this._render(type as any) as TypeOfMaybe<I>;
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
      : I extends TsDsl<infer N>
        ? N
        : I extends ts.Node
          ? I
          : never;

type TypeOfMaybe<I> = undefined extends I
  ? TypeOf<NonNullable<I>> | undefined
  : TypeOf<I>;

type TypeOf<I> = I extends string
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
