import type { PyNodeBase } from '../base';
import { PyNodeKind } from '../kinds';

export type LiteralValue = string | number | boolean | null;

export interface PyLiteral extends PyNodeBase {
  kind: PyNodeKind.Literal;
  value: LiteralValue;
}

export function createLiteral(
  value: LiteralValue,
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
