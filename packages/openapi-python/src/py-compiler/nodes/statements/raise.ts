import type { PyNodeBase } from '../base';
import type { PyExpression } from '../expression';
import { PyNodeKind } from '../kinds';

export interface PyRaiseStatement extends PyNodeBase {
  expression?: PyExpression;
  kind: PyNodeKind.RaiseStatement;
}

export function createRaiseStatement(expression?: PyExpression): PyRaiseStatement {
  return {
    expression,
    kind: PyNodeKind.RaiseStatement,
  };
}
