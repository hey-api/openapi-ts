import type { PyNode, PyNodeBase } from '../base';
import { PyNodeKind } from '../kinds';

export interface PyListExpression extends PyNodeBase {
  elements: ReadonlyArray<PyNode>;
  kind: PyNodeKind.ListExpression;
}

export function createListExpression(elements: ReadonlyArray<PyNode>): PyListExpression {
  return {
    elements,
    kind: PyNodeKind.ListExpression,
  };
}
