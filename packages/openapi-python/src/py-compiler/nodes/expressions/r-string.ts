import type { PyNodeBase } from '../base';
import { PyNodeKind } from '../kinds';

export interface PyRStringExpression extends PyNodeBase {
  kind: PyNodeKind.RStringExpression;
  value: string;
}

export function createRStringExpression(
  value: string,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): PyRStringExpression {
  return {
    kind: PyNodeKind.RStringExpression,
    leadingComments,
    trailingComments,
    value,
  };
}
