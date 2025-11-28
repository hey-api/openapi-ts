import type { AnalysisContext, Node } from '@hey-api/codegen-core';
import type ts from 'typescript';

import type { MaybeTsDsl, TsDsl, TypeTsDsl } from '../base';
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

export interface TypeExprMethods extends Node {
  /** Creates an indexed-access type (e.g. `Foo<T>[K]`). */
  idx(
    this: MaybeTsDsl<TypeTsDsl>,
    index: string | number | MaybeTsDsl<ts.TypeNode>,
  ): TypeIdxTsDsl;
  /** Shorthand: builds `keyof T`. */
  keyof(this: MaybeTsDsl<TypeTsDsl>): TypeOperatorTsDsl;
  /** Shorthand: builds `readonly T`. */
  readonly(this: MaybeTsDsl<TypeTsDsl>): TypeOperatorTsDsl;
  /** Create a TypeExpr node representing ReturnType<this>. */
  returnType(this: MaybeTsDsl<ts.Expression>): TypeExprTsDsl;
  /** Create a TypeOfExpr node representing typeof this. */
  typeofExpr(this: MaybeTsDsl<ts.Expression>): TypeOfExprTsDsl;
  /** Create a TypeQuery node representing typeof this. */
  typeofType(this: MaybeTsDsl<TypeTsDsl | ts.Expression>): TypeQueryTsDsl;
  /** Shorthand: builds `unique T`. */
  unique(this: MaybeTsDsl<TypeTsDsl>): TypeOperatorTsDsl;
}

export function TypeExprMixin<T extends ts.Node, TBase extends BaseCtor<T>>(
  Base: TBase,
) {
  abstract class TypeExpr extends Base {
    override analyze(ctx: AnalysisContext): void {
      super.analyze(ctx);
    }

    protected idx(
      this: TypeTsDsl,
      index: string | number | MaybeTsDsl<ts.TypeNode>,
    ): TypeIdxTsDsl {
      return typeIdxFactory!(this, index);
    }

    protected keyof(this: TypeTsDsl): TypeOperatorTsDsl {
      return typeOperatorFactory!().keyof(this);
    }

    protected readonly(this: TypeTsDsl): TypeOperatorTsDsl {
      return typeOperatorFactory!().readonly(this);
    }

    protected returnType(this: TsDsl<ts.Expression>): TypeExprTsDsl {
      return typeExprFactory!('ReturnType').generic(typeQueryFactory!(this));
    }

    protected typeofExpr(this: TsDsl<ts.Expression>): TypeOfExprTsDsl {
      return typeOfExprFactory!(this);
    }

    protected typeofType(
      this: TypeTsDsl | TsDsl<ts.Expression>,
    ): TypeQueryTsDsl {
      return typeQueryFactory!(this);
    }

    protected unique(this: TypeTsDsl): TypeOperatorTsDsl {
      return typeOperatorFactory!().unique(this);
    }
  }

  return TypeExpr as unknown as MixinCtor<TBase, TypeExprMethods>;
}
