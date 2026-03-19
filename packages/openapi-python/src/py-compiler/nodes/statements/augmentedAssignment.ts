import type { PyNodeBase } from '../base';
import type { PyExpression } from '../expression';
import { PyNodeKind } from '../kinds';

export type PyAugmentedOperator =
  | '+='
  | '-='
  | '*='
  | '/='
  | '//='
  | '%='
  | '**='
  | '&='
  | '|='
  | '^='
  | '>>='
  | '<<=';

export interface PyAugmentedAssignment extends PyNodeBase {
  kind: PyNodeKind.AugmentedAssignment;
  operator: PyAugmentedOperator;
  target: PyExpression;
  value: PyExpression;
}

export function createAugmentedAssignment(
  target: PyExpression,
  operator: PyAugmentedOperator,
  value: PyExpression,
): PyAugmentedAssignment {
  return {
    kind: PyNodeKind.AugmentedAssignment,
    operator,
    target,
    value,
  };
}
