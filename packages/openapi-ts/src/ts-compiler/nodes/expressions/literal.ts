import type { TsNodeBase } from '../base';
import { TsNodeKind } from '../kinds';

export type TsLiteralValue = string | number | boolean | bigint | null;

export interface TsLiteral extends TsNodeBase {
  kind: TsNodeKind.Literal;
  value: TsLiteralValue;
}

export function createLiteral(
  value: TsLiteralValue,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): TsLiteral {
  return {
    kind: TsNodeKind.Literal,
    leadingComments,
    trailingComments,
    value,
  };
}
