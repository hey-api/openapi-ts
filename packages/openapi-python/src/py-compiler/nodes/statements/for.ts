import type { PyNodeBase } from '../base';
import type { PyExpression } from '../expression';
import { PyNodeKind } from '../kinds';
import type { PyStatement } from '../statement';
import type { PyBlock } from './block';
import { createBlock } from './block';

export interface PyForStatement extends PyNodeBase {
  body: PyBlock;
  elseBlock?: PyBlock;
  iterable: PyExpression;
  kind: PyNodeKind.ForStatement;
  target: PyExpression;
}

export function createForStatement(
  target: PyExpression,
  iterable: PyExpression,
  body: ReadonlyArray<PyStatement>,
  elseBlock?: ReadonlyArray<PyStatement>,
): PyForStatement {
  return {
    body: createBlock(body),
    elseBlock: elseBlock ? createBlock(elseBlock) : undefined,
    iterable,
    kind: PyNodeKind.ForStatement,
    target,
  };
}
