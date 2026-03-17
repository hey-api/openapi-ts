import type { PyNodeBase } from '../base';
import type { PyExpression } from '../expression';
import { PyNodeKind } from '../kinds';

export interface PyFunctionParameter extends PyNodeBase {
  annotation?: PyExpression;
  defaultValue?: PyExpression;
  kind: PyNodeKind.FunctionParameter;
  name: string;
}

export function createFunctionParameter(
  name: string,
  annotation?: PyExpression,
  defaultValue?: PyExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): PyFunctionParameter {
  return {
    annotation,
    defaultValue,
    kind: PyNodeKind.FunctionParameter,
    leadingComments,
    name,
    trailingComments,
  };
}
