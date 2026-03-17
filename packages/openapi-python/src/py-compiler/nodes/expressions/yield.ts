import type { PyNodeBase } from '../base';
import type { PyExpression } from '../expression';
import { PyNodeKind } from '../kinds';

export interface PyYieldExpression extends PyNodeBase {
  kind: PyNodeKind.YieldExpression;
  value?: PyExpression;
}

export function createYieldExpression(value?: PyExpression): PyYieldExpression {
  return {
    kind: PyNodeKind.YieldExpression,
    value,
  };
}
