import type { PyNodeBase } from '../base';
import type { PyExpression } from '../expression';
import { PyNodeKind } from '../kinds';

export interface PySubscriptExpression extends PyNodeBase {
  kind: PyNodeKind.SubscriptExpression;
  slice: PyExpression;
  value: PyExpression;
}

export function createSubscriptExpression(
  value: PyExpression,
  slice: PyExpression,
): PySubscriptExpression {
  return {
    kind: PyNodeKind.SubscriptExpression,
    slice,
    value,
  };
}
