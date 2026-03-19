import type { PyNodeBase } from '../base';
import type { PyExpression } from '../expression';
import { PyNodeKind } from '../kinds';
import type { PyStatement } from '../statement';
import type { PyBlock } from '../statements/block';
import { createBlock } from '../statements/block';
import type { PyFunctionParameter } from './functionParameter';

export interface PyFunctionDeclaration extends PyNodeBase {
  body: PyBlock;
  decorators?: ReadonlyArray<PyExpression>;
  docstring?: string;
  kind: PyNodeKind.FunctionDeclaration;
  modifiers?: ReadonlyArray<PyExpression>;
  name: string;
  parameters: ReadonlyArray<PyFunctionParameter>;
  returnType?: PyExpression;
}

export function createFunctionDeclaration(
  name: string,
  parameters: ReadonlyArray<PyFunctionParameter>,
  returnType: PyExpression | undefined,
  body: ReadonlyArray<PyStatement>,
  decorators?: ReadonlyArray<PyExpression>,
  docstring?: string,
  modifiers?: ReadonlyArray<PyExpression>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): PyFunctionDeclaration {
  return {
    body: createBlock(body),
    decorators,
    docstring,
    kind: PyNodeKind.FunctionDeclaration,
    leadingComments,
    modifiers,
    name,
    parameters,
    returnType,
    trailingComments,
  };
}
