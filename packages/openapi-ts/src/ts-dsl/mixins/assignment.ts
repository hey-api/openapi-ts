import type ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { BinaryTsDsl } from '../binary';

export class AssignmentMixin {
  /** Creates an assignment expression (e.g. `this = expr`). */
  assign(
    this: string | MaybeTsDsl<ts.Expression>,
    expr: string | MaybeTsDsl<ts.Expression>,
  ): BinaryTsDsl {
    return new BinaryTsDsl(this, '=', expr);
  }
}
