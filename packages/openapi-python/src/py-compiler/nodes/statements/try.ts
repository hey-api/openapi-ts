import type { PyNodeBase } from '../base';
import { PyNodeKind } from '../kinds';
import type { PyStatement } from '../statement';
import { createBlock, type PyBlock } from './block';
import type { PyExceptClause } from './except';

export interface PyTryStatement extends PyNodeBase {
  elseBlock?: PyBlock;
  exceptClauses?: ReadonlyArray<PyExceptClause>;
  finallyBlock?: PyBlock;
  kind: PyNodeKind.TryStatement;
  tryBlock: PyBlock;
}

export function createTryStatement(
  tryBlock: ReadonlyArray<PyStatement>,
  exceptClauses?: ReadonlyArray<PyExceptClause>,
  elseBlock?: ReadonlyArray<PyStatement>,
  finallyBlock?: ReadonlyArray<PyStatement>,
): PyTryStatement {
  return {
    elseBlock: elseBlock ? createBlock(elseBlock) : undefined,
    exceptClauses,
    finallyBlock: finallyBlock ? createBlock(finallyBlock) : undefined,
    kind: PyNodeKind.TryStatement,
    tryBlock: createBlock(tryBlock),
  };
}
