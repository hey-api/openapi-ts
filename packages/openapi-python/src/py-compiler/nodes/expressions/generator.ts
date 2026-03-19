import type { PyNodeBase } from '../base';
import type { PyExpression } from '../expression';
import { PyNodeKind } from '../kinds';

export interface PyGeneratorExpression extends PyNodeBase {
  element: PyExpression;
  ifs?: ReadonlyArray<PyExpression>;
  isAsync?: boolean;
  iterable: PyExpression;
  kind: PyNodeKind.GeneratorExpression;
  target: PyExpression;
}

export function createGeneratorExpression(
  element: PyExpression,
  target: PyExpression,
  iterable: PyExpression,
  ifs?: ReadonlyArray<PyExpression>,
  isAsync?: boolean,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): PyGeneratorExpression {
  return {
    element,
    ifs,
    isAsync,
    iterable,
    kind: PyNodeKind.GeneratorExpression,
    leadingComments,
    target,
    trailingComments,
  };
}
