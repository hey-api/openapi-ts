import type { PyNodeBase } from '../base';
import type { PyExpression } from '../expression';
import type { PyIdentifier } from '../expressions/identifier';
import { PyNodeKind } from '../kinds';
import type { PyStatement } from '../statement';
import { createBlock, type PyBlock } from './block';

export interface PyExceptClause extends PyNodeBase {
  block: PyBlock;
  exceptionName?: PyIdentifier;
  exceptionType?: PyExpression;
  kind: PyNodeKind.ExceptClause;
}

export function createExceptClause(
  block: ReadonlyArray<PyStatement>,
  exceptionType?: PyExpression,
  exceptionName?: PyIdentifier,
): PyExceptClause {
  return {
    block: createBlock(block),
    exceptionName,
    exceptionType,
    kind: PyNodeKind.ExceptClause,
  };
}
