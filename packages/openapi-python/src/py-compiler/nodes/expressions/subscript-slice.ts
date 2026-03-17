import type { PyNodeBase } from '../base';
import type { PyExpression } from '../expression';
import { PyNodeKind } from '../kinds';

export interface PySubscriptSlice extends PyNodeBase {
  elements: ReadonlyArray<PyExpression>;
  kind: PyNodeKind.SubscriptSlice;
}

export function createSubscriptSlice(elements: ReadonlyArray<PyExpression>): PySubscriptSlice {
  return {
    elements,
    kind: PyNodeKind.SubscriptSlice,
  };
}
