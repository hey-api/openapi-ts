import type { PyComprehensionNode } from '../../comprehension';
import type { PyExpression } from '../../expression';
import { PyNodeKind } from '../../kinds';

export interface PyDictComprehension extends PyComprehensionNode {
  key: PyExpression;
  kind: PyNodeKind.DictComprehension;
  value: PyExpression;
}

export function createDictComprehension(
  key: PyExpression,
  value: PyExpression,
  target: PyExpression,
  iterable: PyExpression,
  ifs?: ReadonlyArray<PyExpression>,
  isAsync?: boolean,
): PyDictComprehension {
  return {
    ifs,
    isAsync,
    iterable,
    key,
    kind: PyNodeKind.DictComprehension,
    target,
    value,
  };
}
