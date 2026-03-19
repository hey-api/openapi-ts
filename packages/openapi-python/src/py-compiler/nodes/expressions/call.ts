import type { PyNodeBase } from '../base';
import type { PyExpression } from '../expression';
import { PyNodeKind } from '../kinds';

export interface PyCallExpression extends PyNodeBase {
  args: ReadonlyArray<PyExpression>;
  callee: PyExpression;
  kind: PyNodeKind.CallExpression;
}

export function createCallExpression(
  callee: PyExpression,
  args: ReadonlyArray<PyExpression>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): PyCallExpression {
  return {
    args,
    callee,
    kind: PyNodeKind.CallExpression,
    leadingComments,
    trailingComments,
  };
}
