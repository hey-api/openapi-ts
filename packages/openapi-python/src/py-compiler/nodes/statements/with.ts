import type { PyNodeBase } from '../base';
import type { PyExpression } from '../expression';
import { PyNodeKind } from '../kinds';
import type { PyStatement } from '../statement';
import { createBlock, type PyBlock } from './block';
import type { PyWithItem } from './withItem';

export interface PyWithStatement extends PyNodeBase {
  body: PyBlock;
  items: ReadonlyArray<PyWithItem>;
  kind: PyNodeKind.WithStatement;
  modifiers?: ReadonlyArray<PyExpression>;
}

export function createWithStatement(
  items: ReadonlyArray<PyWithItem>,
  body: ReadonlyArray<PyStatement>,
  modifiers?: ReadonlyArray<PyExpression>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): PyWithStatement {
  return {
    body: createBlock(body),
    items,
    kind: PyNodeKind.WithStatement,
    leadingComments,
    modifiers,
    trailingComments,
  };
}
