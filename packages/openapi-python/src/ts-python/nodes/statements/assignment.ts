import type { PyNodeBase } from '../base';
import type { PyExpression } from '../expression';
import { PyNodeKind } from '../kinds';

export interface PyAssignment extends PyNodeBase {
  annotation?: PyExpression;
  kind: PyNodeKind.Assignment;
  target: PyExpression;
  value?: PyExpression;
}

export function createAssignment(
  target: PyExpression,
  annotation?: PyExpression,
  value?: PyExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): PyAssignment {
  if (!annotation && !value) {
    throw new Error('Assignment requires at least annotation or value');
  }

  return {
    annotation,
    kind: PyNodeKind.Assignment,
    leadingComments,
    target,
    trailingComments,
    value,
  };
}
