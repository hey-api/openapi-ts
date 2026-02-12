import type { PyNodeBase } from '../base';
import type { PyExpression } from '../expression';
import { PyNodeKind } from '../kinds';

export interface PyDictExpression extends PyNodeBase {
  entries: ReadonlyArray<{
    key: PyExpression;
    value: PyExpression;
  }>;
  kind: PyNodeKind.DictExpression;
}

export function createDictExpression(
  entries: ReadonlyArray<{ key: PyExpression; value: PyExpression }>,
): PyDictExpression {
  return {
    entries,
    kind: PyNodeKind.DictExpression,
  };
}
