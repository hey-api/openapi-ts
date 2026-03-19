import type { PyNodeBase } from '../base';
import type { PyExpression } from '../expression';
import { PyNodeKind } from '../kinds';

export interface PyAwaitExpression extends PyNodeBase {
  expression: PyExpression;
  kind: PyNodeKind.AwaitExpression;
}

export function createAwaitExpression(expression: PyExpression): PyAwaitExpression {
  return {
    expression,
    kind: PyNodeKind.AwaitExpression,
  };
}
