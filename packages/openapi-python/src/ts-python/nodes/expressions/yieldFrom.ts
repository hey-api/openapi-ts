import type { PyNodeBase } from '../base';
import type { PyExpression } from '../expression';
import { PyNodeKind } from '../kinds';

export interface PyYieldFromExpression extends PyNodeBase {
  expression: PyExpression;
  kind: PyNodeKind.YieldFromExpression;
}

export function createYieldFromExpression(expression: PyExpression): PyYieldFromExpression {
  return {
    expression,
    kind: PyNodeKind.YieldFromExpression,
  };
}
