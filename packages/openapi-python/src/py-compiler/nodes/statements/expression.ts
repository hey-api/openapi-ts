import type { PyNodeBase } from '../base';
import type { PyExpression } from '../expression';
import { PyNodeKind } from '../kinds';

export interface PyExpressionStatement extends PyNodeBase {
  expression: PyExpression;
  kind: PyNodeKind.ExpressionStatement;
}

export function createExpressionStatement(expression: PyExpression): PyExpressionStatement {
  return {
    expression,
    kind: PyNodeKind.ExpressionStatement,
  };
}
