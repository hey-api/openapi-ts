import type { PyNodeBase } from '../base';
import type { PyExpression } from '../expression';
import { PyNodeKind } from '../kinds';
import type { PyStatement } from '../statement';
import type { PyBlock } from './block';
import { createBlock } from './block';

export interface PyWhileStatement extends PyNodeBase {
  body: PyBlock;
  condition: PyExpression;
  elseBlock?: PyBlock;
  kind: PyNodeKind.WhileStatement;
}

export function createWhileStatement(
  condition: PyExpression,
  body: ReadonlyArray<PyStatement>,
  elseBlock?: ReadonlyArray<PyStatement>,
): PyWhileStatement {
  return {
    body: createBlock(body),
    condition,
    elseBlock: elseBlock ? createBlock(elseBlock) : undefined,
    kind: PyNodeKind.WhileStatement,
  };
}
