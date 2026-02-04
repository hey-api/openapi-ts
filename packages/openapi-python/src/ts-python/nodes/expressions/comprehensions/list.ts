import type { PyComprehensionNode } from '../../comprehension';
import type { PyExpression } from '../../expression';
import { PyNodeKind } from '../../kinds';

export interface PyListComprehension extends PyComprehensionNode {
  element: PyExpression;
  kind: PyNodeKind.ListComprehension;
}

export function createListComprehension(
  element: PyExpression,
  target: PyExpression,
  iterable: PyExpression,
  ifs?: ReadonlyArray<PyExpression>,
  isAsync?: boolean,
): PyListComprehension {
  return {
    element,
    ifs,
    isAsync,
    iterable,
    kind: PyNodeKind.ListComprehension,
    target,
  };
}
