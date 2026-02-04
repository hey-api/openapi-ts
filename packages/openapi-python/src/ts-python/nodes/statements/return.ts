import type { PyNodeBase } from '../base';
import type { PyExpression } from '../expression';
import { PyNodeKind } from '../kinds';

export interface PyReturnStatement extends PyNodeBase {
  expression?: PyExpression;
  kind: PyNodeKind.ReturnStatement;
}

export function createReturnStatement(expression?: PyExpression): PyReturnStatement {
  return {
    expression,
    kind: PyNodeKind.ReturnStatement,
  };
}
