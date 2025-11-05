import type ts from 'typescript';

import type { ExprInput, MaybeTsDsl, TsDsl } from '../base';
import { BinaryTsDsl } from '../binary';

export class AssignmentMixin {
  /** Creates an assignment expression (e.g. `this = expr`). */
  assign(this: TsDsl<ts.Expression>, expr: MaybeTsDsl<ExprInput>): BinaryTsDsl {
    return new BinaryTsDsl(this, '=', expr);
  }
}
