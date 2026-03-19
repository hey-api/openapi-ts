import type { PyNodeBase } from '../base';
import type { PyExpression } from '../expression';
import { PyNodeKind } from '../kinds';

export interface PyTupleExpression extends PyNodeBase {
  elements: ReadonlyArray<PyExpression>;
  kind: PyNodeKind.TupleExpression;
}

export function createTupleExpression(elements: ReadonlyArray<PyExpression>): PyTupleExpression {
  return {
    elements,
    kind: PyNodeKind.TupleExpression,
  };
}
