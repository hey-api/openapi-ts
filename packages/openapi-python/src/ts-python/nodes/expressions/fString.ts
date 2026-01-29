import type { PyNodeBase } from '../base';
import type { PyExpression } from '../expression';
import { PyNodeKind } from '../kinds';

export interface PyFStringExpression extends PyNodeBase {
  kind: PyNodeKind.FStringExpression;
  parts: Array<string | PyExpression>;
}

export function createFStringExpression(
  parts: Array<string | PyExpression>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): PyFStringExpression {
  return {
    kind: PyNodeKind.FStringExpression,
    leadingComments,
    parts,
    trailingComments,
  };
}
