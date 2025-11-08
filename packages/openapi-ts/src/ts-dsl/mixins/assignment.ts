import type { MaybeTsDsl, WithString } from '../base';
import { BinaryTsDsl } from '../binary';

export class AssignmentMixin {
  /** Creates an assignment expression (e.g. `this = expr`). */
  assign(
    this: MaybeTsDsl<WithString>,
    expr: MaybeTsDsl<WithString>,
  ): BinaryTsDsl {
    return new BinaryTsDsl(this, '=', expr);
  }
}
