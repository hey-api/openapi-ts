import ts from 'typescript';

import type { MaybeTsDsl, TypeTsDsl } from '../base';
import { TsDsl } from '../base';
import type { TypeOfExprTsDsl } from '../expr/typeof';
import type { TypeExprTsDsl } from '../type/expr';
import type { TypeIdxTsDsl } from '../type/idx';
import type { TypeOperatorTsDsl } from '../type/operator';
import type { TypeQueryTsDsl } from '../type/query';
import type { BaseCtor, MixinCtor } from './types';

type TypeExprFactory = (
  nameOrFn?: string | ((t: TypeExprTsDsl) => void),
  fn?: (t: TypeExprTsDsl) => void,
) => TypeExprTsDsl;
let typeExprFactory: TypeExprFactory | undefined;
/** Registers the TypeExpr DSL factory after its module has finished evaluating. */
export function registerLazyAccessTypeExprFactory(
  factory: TypeExprFactory,
): void {
  typeExprFactory = factory;
}

type TypeIdxFactory = (
  expr: MaybeTsDsl<TypeTsDsl>,
  index: string | number | MaybeTsDsl<ts.TypeNode>,
) => TypeIdxTsDsl;
let typeIdxFactory: TypeIdxFactory | undefined;
/** Registers the TypeIdxTsDsl DSL factory after its module has finished evaluating. */
export function registerLazyAccessTypeIdxFactory(
  factory: TypeIdxFactory,
): void {
  typeIdxFactory = factory;
}

type TypeOfExprFactory = (
  expr: string | MaybeTsDsl<ts.Expression>,
) => TypeOfExprTsDsl;
let typeOfExprFactory: TypeOfExprFactory | undefined;
/** Registers the TypeOfExpr DSL factory after its module has finished evaluating. */
export function registerLazyAccessTypeOfExprFactory(
  factory: TypeOfExprFactory,
): void {
  typeOfExprFactory = factory;
}

type TypeOperatorFactory = () => TypeOperatorTsDsl;
let typeOperatorFactory: TypeOperatorFactory | undefined;
/** Registers the TypeOperatorTsDsl DSL factory after its module has finished evaluating. */
export function registerLazyAccessTypeOperatorFactory(
  factory: TypeOperatorFactory,
): void {
  typeOperatorFactory = factory;
}

type TypeQueryFactory = (
  expr: string | MaybeTsDsl<TypeTsDsl | ts.Expression>,
) => TypeQueryTsDsl;
let typeQueryFactory: TypeQueryFactory | undefined;
/** Registers the TypeQuery DSL factory after its module has finished evaluating. */
export function registerLazyAccessTypeQueryFactory(
  factory: TypeQueryFactory,
): void {
  typeQueryFactory = factory;
}

export interface TypeExprMethods {
  /** Creates an indexed-access type (e.g. `Foo<T>[K]`). */
  idx(
    this: MaybeTsDsl<TypeTsDsl>,
    index: string | number | MaybeTsDsl<ts.TypeNode>,
  ): TypeIdxTsDsl;
  /** Shorthand: builds `keyof T`. */
  keyof(this: MaybeTsDsl<TypeTsDsl>): TypeOperatorTsDsl;
  /** Shorthand: builds `readonly T`. */
  readonly(this: MaybeTsDsl<TypeTsDsl>): TypeOperatorTsDsl;
  /** Create a TypeExpr DSL node representing ReturnType<this>. */
  returnType(this: MaybeTsDsl<ts.Expression>): TypeExprTsDsl;
  /**
   * Create a `typeof` operator that narrows its return type based on the receiver.
   *
   * - If `this` is a `TsDsl<ts.Expression>` → returns TypeOfExprTsDsl
   * - If `this` is a `TsDsl<TypeTsDsl>`     → returns TypeQueryTsDsl
   * - If `this` is a raw ts.Expression      → returns TypeOfExprTsDsl
   * - Otherwise                             → returns TypeQueryTsDsl
   */
  typeof<T extends MaybeTsDsl<TypeTsDsl | ts.Expression>>(
    this: T,
  ): T extends MaybeTsDsl<ts.Expression>
    ? TypeOfExprTsDsl
    : T extends MaybeTsDsl<TypeTsDsl>
      ? TypeQueryTsDsl
      : TypeQueryTsDsl | TypeOfExprTsDsl;
  /** Create a TypeOfExpr DSL node representing typeof this. */
  typeofExpr(this: MaybeTsDsl<ts.Expression>): TypeOfExprTsDsl;
  /** Create a TypeQuery DSL node representing typeof this. */
  typeofType(this: MaybeTsDsl<TypeTsDsl | ts.Expression>): TypeQueryTsDsl;
  /** Shorthand: builds `unique T`. */
  unique(this: MaybeTsDsl<TypeTsDsl>): TypeOperatorTsDsl;
}

export function TypeExprMixin<T extends ts.Node, TBase extends BaseCtor<T>>(
  Base: TBase,
) {
  abstract class TypeExpr extends Base {
    protected idx(
      this: MaybeTsDsl<TypeTsDsl>,
      index: string | number | MaybeTsDsl<ts.TypeNode>,
    ): TypeIdxTsDsl {
      return typeIdxFactory!(this, index);
    }

    protected keyof(this: MaybeTsDsl<TypeTsDsl>): TypeOperatorTsDsl {
      return typeOperatorFactory!().keyof(this);
    }

    protected readonly(this: MaybeTsDsl<TypeTsDsl>): TypeOperatorTsDsl {
      return typeOperatorFactory!().readonly(this);
    }

    protected returnType(this: MaybeTsDsl<ts.Expression>): TypeExprTsDsl {
      return typeExprFactory!('ReturnType').generic(typeQueryFactory!(this));
    }

    protected typeofExpr(this: MaybeTsDsl<ts.Expression>): TypeOfExprTsDsl {
      return typeOfExprFactory!(this);
    }

    protected typeofType(
      this: MaybeTsDsl<TypeTsDsl | ts.Expression>,
    ): TypeQueryTsDsl {
      return typeQueryFactory!(this);
    }

    protected typeof<T extends MaybeTsDsl<TypeTsDsl | ts.Expression>>(
      this: T,
    ): T extends MaybeTsDsl<ts.Expression>
      ? TypeOfExprTsDsl
      : T extends MaybeTsDsl<TypeTsDsl>
        ? TypeQueryTsDsl
        : TypeQueryTsDsl | TypeOfExprTsDsl {
      if (this instanceof TsDsl) {
        const node = this.$render();
        return ts.isExpression(node)
          ? (typeOfExprFactory!(this) as any)
          : (typeQueryFactory!(this) as any);
      }

      if (ts.isExpression(this as any)) {
        return typeOfExprFactory!(this as ts.Expression) as any;
      }

      return typeQueryFactory!(this) as any;
    }

    protected unique(this: MaybeTsDsl<TypeTsDsl>): TypeOperatorTsDsl {
      return typeOperatorFactory!().unique(this);
    }
  }

  return TypeExpr as unknown as MixinCtor<TBase, TypeExprMethods>;
}
