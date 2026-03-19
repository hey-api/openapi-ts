import type { PyNodeBase } from '../base';
import { PyNodeKind } from '../kinds';

export type PyLiteralValue = string | number | boolean | null;

export interface PyLiteral extends PyNodeBase {
  kind: PyNodeKind.Literal;
  value: PyLiteralValue;
}

export function createLiteral(
  value: PyLiteralValue,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): PyLiteral {
  return {
    kind: PyNodeKind.Literal,
    leadingComments,
    trailingComments,
    value,
  };
}
