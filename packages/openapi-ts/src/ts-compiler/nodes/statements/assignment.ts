import type { TsNodeBase } from '../base';
import type { TsExpression } from '../expression';
import { TsNodeKind } from '../kinds';

export interface TsAssignment extends TsNodeBase {
  kind: TsNodeKind.Assignment;
  target: TsExpression;
  type?: TsExpression;
  value?: TsExpression;
}

export function createAssignment(
  target: TsExpression,
  type?: TsExpression,
  value?: TsExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): TsAssignment {
  if (!type && !value) {
    throw new Error('Assignment requires at least type or value');
  }

  return {
    kind: TsNodeKind.Assignment,
    leadingComments,
    target,
    trailingComments,
    type,
    value,
  };
}
