import type ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { BinaryTsDsl } from '../binary';

export class OperatorMixin {
  /** Logical AND — `this && expr` */
  and(
    this: string | MaybeTsDsl<ts.Expression>,
    expr: string | MaybeTsDsl<ts.Expression>,
  ) {
    return new BinaryTsDsl(this, '&&', expr);
  }
  /** Nullish coalescing — `this ?? expr` */
  coalesce(
    this: string | MaybeTsDsl<ts.Expression>,
    expr: string | MaybeTsDsl<ts.Expression>,
  ) {
    return new BinaryTsDsl(this, '??', expr);
  }
  /** Division — `this / expr` */
  div(
    this: string | MaybeTsDsl<ts.Expression>,
    expr: string | MaybeTsDsl<ts.Expression>,
  ) {
    return new BinaryTsDsl(this, '/', expr);
  }
  /** Strict equality — `this === expr` */
  eq(
    this: string | MaybeTsDsl<ts.Expression>,
    expr: string | MaybeTsDsl<ts.Expression>,
  ) {
    return new BinaryTsDsl(this, '===', expr);
  }
  /** Greater than — `this > expr` */
  gt(
    this: string | MaybeTsDsl<ts.Expression>,
    expr: string | MaybeTsDsl<ts.Expression>,
  ) {
    return new BinaryTsDsl(this, '>', expr);
  }
  /** Greater than or equal — `this >= expr` */
  gte(
    this: string | MaybeTsDsl<ts.Expression>,
    expr: string | MaybeTsDsl<ts.Expression>,
  ) {
    return new BinaryTsDsl(this, '>=', expr);
  }
  /** Loose equality — `this == expr` */
  looseEq(
    this: string | MaybeTsDsl<ts.Expression>,
    expr: string | MaybeTsDsl<ts.Expression>,
  ) {
    return new BinaryTsDsl(this, '==', expr);
  }
  /** Loose inequality — `this != expr` */
  looseNeq(
    this: string | MaybeTsDsl<ts.Expression>,
    expr: string | MaybeTsDsl<ts.Expression>,
  ) {
    return new BinaryTsDsl(this, '!=', expr);
  }
  /** Less than — `this < expr` */
  lt(
    this: string | MaybeTsDsl<ts.Expression>,
    expr: string | MaybeTsDsl<ts.Expression>,
  ) {
    return new BinaryTsDsl(this, '<', expr);
  }
  /** Less than or equal — `this <= expr` */
  lte(
    this: string | MaybeTsDsl<ts.Expression>,
    expr: string | MaybeTsDsl<ts.Expression>,
  ) {
    return new BinaryTsDsl(this, '<=', expr);
  }
  /** Subtraction — `this - expr` */
  minus(
    this: string | MaybeTsDsl<ts.Expression>,
    expr: string | MaybeTsDsl<ts.Expression>,
  ) {
    return new BinaryTsDsl(this, '-', expr);
  }
  /** Strict inequality — `this !== expr` */
  neq(
    this: string | MaybeTsDsl<ts.Expression>,
    expr: string | MaybeTsDsl<ts.Expression>,
  ) {
    return new BinaryTsDsl(this, '!==', expr);
  }
  /** Logical OR — `this || expr` */
  or(
    this: string | MaybeTsDsl<ts.Expression>,
    expr: string | MaybeTsDsl<ts.Expression>,
  ) {
    return new BinaryTsDsl(this, '||', expr);
  }
  /** Addition — `this + expr` */
  plus(
    this: string | MaybeTsDsl<ts.Expression>,
    expr: string | MaybeTsDsl<ts.Expression>,
  ) {
    return new BinaryTsDsl(this, '+', expr);
  }
  /** Multiplication — `this * expr` */
  times(
    this: string | MaybeTsDsl<ts.Expression>,
    expr: string | MaybeTsDsl<ts.Expression>,
  ) {
    return new BinaryTsDsl(this, '*', expr);
  }
}
