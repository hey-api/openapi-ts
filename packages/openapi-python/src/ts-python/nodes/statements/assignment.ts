import type { PyNodeBase } from '../base';
import type { PyExpression } from '../expression';
import { PyNodeKind } from '../kinds';

export interface PyAssignment extends PyNodeBase {
  kind: PyNodeKind.Assignment;
  target: PyExpression;
  value: PyExpression;
}

export function createAssignment(
  target: PyExpression,
  value: PyExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): PyAssignment {
  return {
    kind: PyNodeKind.Assignment,
    leadingComments,
    target,
    trailingComments,
    value,
  };
}
