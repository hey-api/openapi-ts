import type { PyNode, PyNodeBase } from '../base';
import type { PyExpression } from '../expression';
import { PyNodeKind } from '../kinds';
import type { PyStatement } from '../statement';
import type { PyBlock } from '../statements/block';
import { createBlock } from '../statements/block';

export interface PyClassDeclaration extends PyNodeBase {
  baseClasses?: ReadonlyArray<PyNode>;
  body: PyBlock;
  decorators?: ReadonlyArray<PyExpression>;
  docstring?: string;
  kind: PyNodeKind.ClassDeclaration;
  name: string;
}

export function createClassDeclaration(
  name: string,
  body: ReadonlyArray<PyStatement>,
  decorators?: ReadonlyArray<PyExpression>,
  baseClasses?: ReadonlyArray<PyNode>,
  docstring?: string,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): PyClassDeclaration {
  return {
    baseClasses,
    body: createBlock(body),
    decorators,
    docstring,
    kind: PyNodeKind.ClassDeclaration,
    leadingComments,
    name,
    trailingComments,
  };
}
