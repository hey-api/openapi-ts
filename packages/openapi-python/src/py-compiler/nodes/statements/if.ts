import type { PyNodeBase } from '../base';
import type { PyExpression } from '../expression';
import { PyNodeKind } from '../kinds';
import type { PyStatement } from '../statement';
import { createBlock, type PyBlock } from './block';

export interface PyIfStatement extends PyNodeBase {
  condition: PyExpression;
  elseBlock?: PyBlock | PyIfStatement;
  kind: PyNodeKind.IfStatement;
  thenBlock: PyBlock;
}

export function createIfStatement(
  condition: PyExpression,
  thenBlock: ReadonlyArray<PyStatement>,
  elseBlock?: ReadonlyArray<PyStatement> | PyIfStatement,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): PyIfStatement {
  return {
    condition,
    elseBlock: elseBlock instanceof Array ? createBlock(elseBlock) : elseBlock,
    kind: PyNodeKind.IfStatement,
    leadingComments,
    thenBlock: createBlock(thenBlock),
    trailingComments,
  };
}
