import type { MaybeTsDsl, WithString } from '../base';
import { BinaryTsDsl } from '../binary';

export class OperatorMixin {
  /** Logical AND — `this && expr` */
  and(this: MaybeTsDsl<WithString>, expr: MaybeTsDsl<WithString>) {
    return new BinaryTsDsl(this, '&&', expr);
  }
  /** Nullish coalescing — `this ?? expr` */
  coalesce(this: MaybeTsDsl<WithString>, expr: MaybeTsDsl<WithString>) {
    return new BinaryTsDsl(this, '??', expr);
  }
  /** Division — `this / expr` */
  div(this: MaybeTsDsl<WithString>, expr: MaybeTsDsl<WithString>) {
    return new BinaryTsDsl(this, '/', expr);
  }
  /** Strict equality — `this === expr` */
  eq(this: MaybeTsDsl<WithString>, expr: MaybeTsDsl<WithString>) {
    return new BinaryTsDsl(this, '===', expr);
  }
  /** Greater than — `this > expr` */
  gt(this: MaybeTsDsl<WithString>, expr: MaybeTsDsl<WithString>) {
    return new BinaryTsDsl(this, '>', expr);
  }
  /** Greater than or equal — `this >= expr` */
  gte(this: MaybeTsDsl<WithString>, expr: MaybeTsDsl<WithString>) {
    return new BinaryTsDsl(this, '>=', expr);
  }
  /** Loose equality — `this == expr` */
  looseEq(this: MaybeTsDsl<WithString>, expr: MaybeTsDsl<WithString>) {
    return new BinaryTsDsl(this, '==', expr);
  }
  /** Loose inequality — `this != expr` */
  looseNeq(this: MaybeTsDsl<WithString>, expr: MaybeTsDsl<WithString>) {
    return new BinaryTsDsl(this, '!=', expr);
  }
  /** Less than — `this < expr` */
  lt(this: MaybeTsDsl<WithString>, expr: MaybeTsDsl<WithString>) {
    return new BinaryTsDsl(this, '<', expr);
  }
  /** Less than or equal — `this <= expr` */
  lte(this: MaybeTsDsl<WithString>, expr: MaybeTsDsl<WithString>) {
    return new BinaryTsDsl(this, '<=', expr);
  }
  /** Subtraction — `this - expr` */
  minus(this: MaybeTsDsl<WithString>, expr: MaybeTsDsl<WithString>) {
    return new BinaryTsDsl(this, '-', expr);
  }
  /** Strict inequality — `this !== expr` */
  neq(this: MaybeTsDsl<WithString>, expr: MaybeTsDsl<WithString>) {
    return new BinaryTsDsl(this, '!==', expr);
  }
  /** Logical OR — `this || expr` */
  or(this: MaybeTsDsl<WithString>, expr: MaybeTsDsl<WithString>) {
    return new BinaryTsDsl(this, '||', expr);
  }
  /** Addition — `this + expr` */
  plus(this: MaybeTsDsl<WithString>, expr: MaybeTsDsl<WithString>) {
    return new BinaryTsDsl(this, '+', expr);
  }
  /** Multiplication — `this * expr` */
  times(this: MaybeTsDsl<WithString>, expr: MaybeTsDsl<WithString>) {
    return new BinaryTsDsl(this, '*', expr);
  }
}
