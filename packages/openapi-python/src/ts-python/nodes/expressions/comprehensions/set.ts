import type { PyComprehensionNode } from '../../comprehension';
import type { PyExpression } from '../../expression';
import { PyNodeKind } from '../../kinds';

export interface PySetComprehension extends PyComprehensionNode {
  element: PyExpression;
  kind: PyNodeKind.SetComprehension;
}

export function createSetComprehension(
  element: PyExpression,
  target: PyExpression,
  iterable: PyExpression,
  ifs?: ReadonlyArray<PyExpression>,
  isAsync?: boolean,
): PySetComprehension {
  return {
    element,
    ifs,
    isAsync,
    iterable,
    kind: PyNodeKind.SetComprehension,
    target,
  };
}
