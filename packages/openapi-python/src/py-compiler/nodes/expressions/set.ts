import type { PyNodeBase } from '../base';
import type { PyExpression } from '../expression';
import { PyNodeKind } from '../kinds';

export interface PySetExpression extends PyNodeBase {
  elements: ReadonlyArray<PyExpression>;
  kind: PyNodeKind.SetExpression;
}

export function createSetExpression(elements: ReadonlyArray<PyExpression>): PySetExpression {
  return {
    elements,
    kind: PyNodeKind.SetExpression,
  };
}
