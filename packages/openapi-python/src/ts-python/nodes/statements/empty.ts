import type { PyNodeBase } from '../base';
import { PyNodeKind } from '../kinds';

export interface PyEmptyStatement extends PyNodeBase {
  kind: PyNodeKind.EmptyStatement;
}

export function createEmptyStatement(): PyEmptyStatement {
  return {
    kind: PyNodeKind.EmptyStatement,
  };
}
