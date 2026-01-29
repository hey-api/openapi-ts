import type { PyNodeBase } from '../base';
import { PyNodeKind } from '../kinds';

export interface PyContinueStatement extends PyNodeBase {
  kind: PyNodeKind.ContinueStatement;
}

export function createContinueStatement(): PyContinueStatement {
  return {
    kind: PyNodeKind.ContinueStatement,
  };
}
