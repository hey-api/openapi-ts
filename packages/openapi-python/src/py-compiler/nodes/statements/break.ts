import type { PyNodeBase } from '../base';
import { PyNodeKind } from '../kinds';

export interface PyBreakStatement extends PyNodeBase {
  kind: PyNodeKind.BreakStatement;
}

export function createBreakStatement(): PyBreakStatement {
  return {
    kind: PyNodeKind.BreakStatement,
  };
}
