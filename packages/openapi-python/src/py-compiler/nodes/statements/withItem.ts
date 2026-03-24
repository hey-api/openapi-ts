import type { PyNodeBase } from '../base';
import type { PyExpression } from '../expression';
import { PyNodeKind } from '../kinds';

export interface PyWithItem extends PyNodeBase {
  alias?: PyExpression;
  contextExpr: PyExpression;
  kind: PyNodeKind.WithItem;
}

export function createWithItem(
  contextExpr: PyExpression,
  alias?: PyExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): PyWithItem {
  return {
    alias,
    contextExpr,
    kind: PyNodeKind.WithItem,
    leadingComments,
    trailingComments,
  };
}
