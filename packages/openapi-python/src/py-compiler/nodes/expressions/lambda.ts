import type { PyNodeBase } from '../base';
import type { PyFunctionParameter } from '../declarations/functionParameter';
import type { PyExpression } from '../expression';
import { PyNodeKind } from '../kinds';

export interface PyLambdaExpression extends PyNodeBase {
  expression: PyExpression;
  kind: PyNodeKind.LambdaExpression;
  parameters: ReadonlyArray<PyFunctionParameter>;
}

export function createLambdaExpression(
  parameters: ReadonlyArray<PyFunctionParameter>,
  expression: PyExpression,
): PyLambdaExpression {
  return {
    expression,
    kind: PyNodeKind.LambdaExpression,
    parameters,
  };
}
