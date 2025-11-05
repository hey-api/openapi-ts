import type ts from 'typescript';

import type { ExprInput, MaybeTsDsl, TsDsl } from '../base';
import { BinaryTsDsl } from '../binary';

export class OperatorMixin {
  /** Logical AND — `this && expr` */
  and(this: TsDsl<ts.Expression>, expr: MaybeTsDsl<ExprInput>) {
    return new BinaryTsDsl(this, '&&', expr);
  }
  /** Nullish coalescing — `this ?? expr` */
  coalesce(this: TsDsl<ts.Expression>, expr: MaybeTsDsl<ExprInput>) {
    return new BinaryTsDsl(this, '??', expr);
  }
  /** Division — `this / expr` */
  div(this: TsDsl<ts.Expression>, expr: MaybeTsDsl<ExprInput>) {
    return new BinaryTsDsl(this, '/', expr);
  }
  /** Strict equality — `this === expr` */
  eq(this: TsDsl<ts.Expression>, expr: MaybeTsDsl<ExprInput>) {
    return new BinaryTsDsl(this, '===', expr);
  }
  /** Greater than — `this > expr` */
  gt(this: TsDsl<ts.Expression>, expr: MaybeTsDsl<ExprInput>) {
    return new BinaryTsDsl(this, '>', expr);
  }
  /** Greater than or equal — `this >= expr` */
  gte(this: TsDsl<ts.Expression>, expr: MaybeTsDsl<ExprInput>) {
    return new BinaryTsDsl(this, '>=', expr);
  }
  /** Loose equality — `this == expr` */
  looseEq(this: TsDsl<ts.Expression>, expr: MaybeTsDsl<ExprInput>) {
    return new BinaryTsDsl(this, '==', expr);
  }
  /** Loose inequality — `this != expr` */
  looseNeq(this: TsDsl<ts.Expression>, expr: MaybeTsDsl<ExprInput>) {
    return new BinaryTsDsl(this, '!=', expr);
  }
  /** Less than — `this < expr` */
  lt(this: TsDsl<ts.Expression>, expr: MaybeTsDsl<ExprInput>) {
    return new BinaryTsDsl(this, '<', expr);
  }
  /** Less than or equal — `this <= expr` */
  lte(this: TsDsl<ts.Expression>, expr: MaybeTsDsl<ExprInput>) {
    return new BinaryTsDsl(this, '<=', expr);
  }
  /** Subtraction — `this - expr` */
  minus(this: TsDsl<ts.Expression>, expr: MaybeTsDsl<ExprInput>) {
    return new BinaryTsDsl(this, '-', expr);
  }
  /** Strict inequality — `this !== expr` */
  neq(this: TsDsl<ts.Expression>, expr: MaybeTsDsl<ExprInput>) {
    return new BinaryTsDsl(this, '!==', expr);
  }
  /** Logical OR — `this || expr` */
  or(this: TsDsl<ts.Expression>, expr: MaybeTsDsl<ExprInput>) {
    return new BinaryTsDsl(this, '||', expr);
  }
  /** Addition — `this + expr` */
  plus(this: TsDsl<ts.Expression>, expr: MaybeTsDsl<ExprInput>) {
    return new BinaryTsDsl(this, '+', expr);
  }
  /** Multiplication — `this * expr` */
  times(this: TsDsl<ts.Expression>, expr: MaybeTsDsl<ExprInput>) {
    return new BinaryTsDsl(this, '*', expr);
  }
}
