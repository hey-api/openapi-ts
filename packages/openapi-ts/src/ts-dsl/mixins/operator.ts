import type ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { BinaryTsDsl } from '../expr/binary';

type This = string | MaybeTsDsl<ts.Expression>;
type Expr = string | MaybeTsDsl<ts.Expression>;

export class OperatorMixin {
  /** Logical AND — `this && expr` */
  and(this: This, expr: Expr): BinaryTsDsl {
    return new BinaryTsDsl(this).and(expr);
  }

  /** Creates an assignment expression (e.g. `this = expr`). */
  assign(this: This, expr: Expr): BinaryTsDsl {
    return new BinaryTsDsl(this, '=', expr);
  }

  /** Nullish coalescing — `this ?? expr` */
  coalesce(this: This, expr: Expr): BinaryTsDsl {
    return new BinaryTsDsl(this).coalesce(expr);
  }

  /** Division — `this / expr` */
  div(this: This, expr: Expr): BinaryTsDsl {
    return new BinaryTsDsl(this).div(expr);
  }

  /** Strict equality — `this === expr` */
  eq(this: This, expr: Expr): BinaryTsDsl {
    return new BinaryTsDsl(this).eq(expr);
  }

  /** Greater than — `this > expr` */
  gt(this: This, expr: Expr): BinaryTsDsl {
    return new BinaryTsDsl(this).gt(expr);
  }

  /** Greater than or equal — `this >= expr` */
  gte(this: This, expr: Expr): BinaryTsDsl {
    return new BinaryTsDsl(this).gte(expr);
  }

  /** Loose equality — `this == expr` */
  looseEq(this: This, expr: Expr): BinaryTsDsl {
    return new BinaryTsDsl(this).looseEq(expr);
  }

  /** Loose inequality — `this != expr` */
  looseNeq(this: This, expr: Expr): BinaryTsDsl {
    return new BinaryTsDsl(this).looseNeq(expr);
  }

  /** Less than — `this < expr` */
  lt(this: This, expr: Expr): BinaryTsDsl {
    return new BinaryTsDsl(this).lt(expr);
  }

  /** Less than or equal — `this <= expr` */
  lte(this: This, expr: Expr): BinaryTsDsl {
    return new BinaryTsDsl(this).lte(expr);
  }

  /** Subtraction — `this - expr` */
  minus(this: This, expr: Expr): BinaryTsDsl {
    return new BinaryTsDsl(this).minus(expr);
  }

  /** Strict inequality — `this !== expr` */
  neq(this: This, expr: Expr): BinaryTsDsl {
    return new BinaryTsDsl(this).neq(expr);
  }

  /** Logical OR — `this || expr` */
  or(this: This, expr: Expr): BinaryTsDsl {
    return new BinaryTsDsl(this).or(expr);
  }

  /** Addition — `this + expr` */
  plus(this: This, expr: Expr): BinaryTsDsl {
    return new BinaryTsDsl(this).plus(expr);
  }

  /** Multiplication — `this * expr` */
  times(this: This, expr: Expr): BinaryTsDsl {
    return new BinaryTsDsl(this).times(expr);
  }
}
