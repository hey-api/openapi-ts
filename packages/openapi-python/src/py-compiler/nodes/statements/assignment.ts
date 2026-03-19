import type { PyNodeBase } from '../base';
import type { PyExpression } from '../expression';
import { PyNodeKind } from '../kinds';

export interface PyAssignment extends PyNodeBase {
  kind: PyNodeKind.Assignment;
  target: PyExpression;
  type?: PyExpression;
  value?: PyExpression;
}

export function createAssignment(
  target: PyExpression,
  type?: PyExpression,
  value?: PyExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): PyAssignment {
  if (!type && !value) {
    throw new Error('Assignment requires at least type or value');
  }

  return {
    kind: PyNodeKind.Assignment,
    leadingComments,
    target,
    trailingComments,
    type,
    value,
  };
}
