import type { PyNodeBase } from '../base';
import type { PyExpression } from '../expression';
import { PyNodeKind } from '../kinds';

export interface PyFunctionParameter extends PyNodeBase {
  defaultValue?: PyExpression;
  kind: PyNodeKind.FunctionParameter;
  name: string;
  type?: PyExpression;
}

export function createFunctionParameter(
  name: string,
  type?: PyExpression,
  defaultValue?: PyExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): PyFunctionParameter {
  return {
    defaultValue,
    kind: PyNodeKind.FunctionParameter,
    leadingComments,
    name,
    trailingComments,
    type,
  };
}
