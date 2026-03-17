import type { PyNodeBase } from '../base';
import { PyNodeKind } from '../kinds';
import type { PyStatement } from '../statement';

export interface PyBlock extends PyNodeBase {
  kind: PyNodeKind.Block;
  statements: ReadonlyArray<PyStatement>;
}

export function createBlock(
  statements: ReadonlyArray<PyStatement>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): PyBlock {
  return {
    kind: PyNodeKind.Block,
    leadingComments,
    statements,
    trailingComments,
  };
}
