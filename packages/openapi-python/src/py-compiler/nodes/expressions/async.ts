import type { PyNodeBase } from '../base';
import type { PyExpression } from '../expression';
import { PyNodeKind } from '../kinds';

export interface PyAsyncExpression extends PyNodeBase {
  expression: PyExpression;
  kind: PyNodeKind.AsyncExpression;
}

export function createAsyncExpression(expression: PyExpression): PyAsyncExpression {
  return {
    expression,
    kind: PyNodeKind.AsyncExpression,
  };
}
