import type ts from 'typescript';

import type { MaybeTsDsl, TypeTsDsl } from '../base';
import type { TypeExprTsDsl } from '../type/expr';
import type { TypeQueryTsDsl } from '../type/query';
import type { TypeOfExprTsDsl } from '../typeof';

/**
 * Lazily register factory callbacks to avoid circular imports and
 * ensure predictable mixin application order.
 */

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

export class TypeExprMixin {
  /** Create a TypeExpr DSL node representing ReturnType<this>. */
  returnType(this: MaybeTsDsl<ts.Expression>): TypeExprTsDsl {
    return typeExprFactory!('ReturnType').generic(typeQueryFactory!(this));
  }

  /** Create a TypeOfExpr DSL node representing typeof this. */
  typeofExpr(this: string | MaybeTsDsl<ts.Expression>): TypeOfExprTsDsl {
    return typeOfExprFactory!(this);
  }

  /** Create a TypeQuery DSL node representing typeof this. */
  typeofType(
    this: string | MaybeTsDsl<TypeTsDsl | ts.Expression>,
  ): TypeQueryTsDsl {
    return typeQueryFactory!(this);
  }
}
